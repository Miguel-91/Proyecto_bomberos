import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SpeechRecognitionApi = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

// Tipo de conexión según el nombre que Windows/Chrome da al dispositivo
const getConnectionType = (label = '') => {
  if (/bluetooth|hands-?free|manos libres|airpods|buds|\bbt\b|headset/i.test(label)) return { label: 'Bluetooth', icon: 'Bluetooth' };
  if (/usb|headphone|auricular|aud[ií]fono|jack|line in|externo|external/i.test(label)) return { label: 'Cable', icon: 'Cable' };
  return { label: 'Integrado', icon: 'Laptop' };
};

const AUTO_KEY = 'emergencyMicAutoActivate';

// Mensajes claros para cada error del reconocimiento de voz
const SPEECH_ERRORS = {
  'not-allowed': 'Permiso de micrófono denegado. Haga clic en el candado de la barra de direcciones, active "Micrófono" y recargue la página.',
  'service-not-allowed': 'El navegador o el perfil bloquea la transcripción de voz. Si usa un perfil administrado (por ejemplo "Centro educativo"), pruebe con un perfil personal de Chrome o con Microsoft Edge.',
  'audio-capture': 'No se detecta ningún micrófono. Conéctelo o revíselo en Windows: Configuración → Sistema → Sonido → Entrada.',
  network: 'La transcripción necesita conexión a internet (Chrome envía el audio al servicio de voz de Google).',
};
const FATAL_ERRORS = ['not-allowed', 'service-not-allowed', 'audio-capture', 'network'];
const LANGS = ['es-GT', 'es-MX', 'es-ES'];

const MicrophoneTranscriber = ({ onFinalTranscript, onListeningChange }) => {
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speaker, setSpeaker] = useState('Llamante');
  const [level, setLevel] = useState(0);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [autoActivate, setAutoActivate] = useState(() => {
    try { return localStorage.getItem(AUTO_KEY) !== 'false'; } catch { return true; }
  });
  const [manualText, setManualText] = useState('');
  const [noResultHint, setNoResultHint] = useState(false);
  const langIndexRef = useRef(0);
  const lastResultRef = useRef(0);

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const speakerRef = useRef(speaker);
  const knownDeviceIds = useRef(new Set());
  const audioRef = useRef({ stream: null, context: null, frame: null });

  const onFinalRef = useRef(onFinalTranscript);
  const onListeningChangeRef = useRef(onListeningChange);

  speakerRef.current = speaker;
  onFinalRef.current = onFinalTranscript;
  onListeningChangeRef.current = onListeningChange;

  const stopLevelMeter = () => {
    const { stream, context, frame } = audioRef.current;
    if (frame) cancelAnimationFrame(frame);
    stream?.getTracks()?.forEach((t) => t.stop());
    context?.close()?.catch(() => {});
    audioRef.current = { stream: null, context: null, frame: null };
    setLevel(0);
  };

  // Medidor de volumen del micrófono seleccionado
  const startLevelMeter = async (deviceId) => {
    stopLevelMeter();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    });
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      const rms = Math.sqrt(data.reduce((acc, v) => acc + ((v - 128) / 128) ** 2, 0) / data.length);
      setLevel(Math.min(100, Math.round(rms * 400)));
      audioRef.current.frame = requestAnimationFrame(tick);
    };
    audioRef.current = { stream, context, frame: requestAnimationFrame(tick) };
  };

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
    stopLevelMeter();
    setIsListening(false);
    setInterimText('');
    onListeningChange?.(false);
  }, [onListeningChange]);

  const startListening = useCallback(async (deviceId) => {
    setError(null);
    if (!SpeechRecognitionApi) {
      setError('Este navegador no permite transcribir voz. Use Google Chrome o Microsoft Edge.');
      return;
    }
    try {
      await startLevelMeter(deviceId);
    } catch {
      setError('No se pudo acceder al micrófono. Revise que el navegador tenga permiso.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionApi();
      recognition.lang = LANGS[langIndexRef.current];
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let interim = '';
        lastResultRef.current = Date.now();
        setNoResultHint(false);
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            if (text) onFinalRef.current?.(text, speakerRef.current);
          } else {
            interim += result[0].transcript;
          }
        }
        setInterimText(interim);
      };
      recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return; // silencio: se reinicia solo
        if (event.error === 'language-not-supported' && langIndexRef.current < LANGS.length - 1) {
          langIndexRef.current += 1;
          recognition.lang = LANGS[langIndexRef.current];
          return; // onend lo reinicia con el siguiente idioma
        }
        setError(SPEECH_ERRORS[event.error] || `Error de transcripción: ${event.error}`);
        if (FATAL_ERRORS.includes(event.error)) {
          // Detener para no quedar reintentando sin fin
          listeningRef.current = false;
          stopLevelMeter();
          setIsListening(false);
          setInterimText('');
          onListeningChangeRef.current?.(false);
        }
      };
      // Chrome detiene el reconocimiento tras un silencio; se reinicia mientras siga activo
      recognition.onend = () => {
        if (listeningRef.current) {
          setTimeout(() => {
            if (!listeningRef.current) return;
            try { recognition.start(); } catch { /* ya iniciado */ }
          }, 250);
        }
      };
      recognitionRef.current = recognition;
    }

    listeningRef.current = true;
    lastResultRef.current = Date.now();
    setNoResultHint(false);
    try { recognitionRef.current.start(); } catch { /* ya iniciado */ }
    setIsListening(true);
    onListeningChange?.(true);
  }, [onListeningChange]);

  const refreshDevices = useCallback(async () => {
    const all = await navigator.mediaDevices?.enumerateDevices?.() || [];
    const inputs = all?.filter((d) => d?.kind === 'audioinput' && d?.deviceId !== 'communications');
    setDevices(inputs);
    setHasPermission(inputs?.some((d) => d?.label));
    return inputs;
  }, []);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      const inputs = await refreshDevices();
      inputs?.forEach((d) => knownDeviceIds.current.add(d?.deviceId));
      if (!selectedId && inputs?.length) setSelectedId(inputs?.[0]?.deviceId);
    } catch {
      setError('Permiso de micrófono denegado. Actívelo en el candado de la barra de direcciones.');
    }
  };

  // Lista inicial de micrófonos
  useEffect(() => {
    refreshDevices().then((inputs) => {
      inputs?.forEach((d) => knownDeviceIds.current.add(d?.deviceId));
      if (inputs?.length) setSelectedId(inputs?.[0]?.deviceId);
    });
    return () => {
      listeningRef.current = false;
      recognitionRef.current?.abort();
      stopLevelMeter();
    };
  }, [refreshDevices]);

  // Detecta micrófonos conectados por cable o Bluetooth y los activa automáticamente
  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.addEventListener) return undefined;
    const handleDeviceChange = async () => {
      const inputs = await refreshDevices();
      const added = inputs?.find((d) => d?.deviceId && d?.deviceId !== 'default' && !knownDeviceIds.current.has(d?.deviceId));
      inputs?.forEach((d) => knownDeviceIds.current.add(d?.deviceId));
      if (!added) return;
      const connection = getConnectionType(added?.label);
      setSelectedId(added?.deviceId);
      setNotice(`Micrófono detectado (${connection.label}): ${added?.label || 'nuevo dispositivo'}`);
      if (autoActivate) startListening(added?.deviceId);
    };
    mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  }, [autoActivate, refreshDevices, startListening]);

  // Si se escucha sonido pero no llega texto, avisar sobre el micrófono predeterminado de Windows
  useEffect(() => {
    if (!isListening) return undefined;
    const timer = setInterval(() => {
      if (Date.now() - lastResultRef.current > 10000) setNoResultHint(true);
    }, 2000);
    return () => clearInterval(timer);
  }, [isListening]);

  const toggleAutoActivate = () => {
    const next = !autoActivate;
    setAutoActivate(next);
    try { localStorage.setItem(AUTO_KEY, String(next)); } catch { /* sin almacenamiento */ }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    const text = manualText.trim();
    if (!text) return;
    onFinalRef.current?.(text, speakerRef.current);
    setManualText('');
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedId(deviceId);
    if (isListening) startListening(deviceId);
  };

  const selectedDevice = devices?.find((d) => d?.deviceId === selectedId);
  const connection = getConnectionType(selectedDevice?.label);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Mic" size={18} className="text-primary" />
          <h4 className="font-semibold text-foreground">Micrófono y Transcripción</h4>
        </div>
        {isListening && (
          <span className="flex items-center space-x-1 text-xs text-destructive font-medium">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
            <span>Escuchando</span>
          </span>
        )}
      </div>

      {!SpeechRecognitionApi && (
        <p className="text-xs text-warning mb-3">
          Este navegador no soporta transcripción de voz. Use Google Chrome o Microsoft Edge.
        </p>
      )}

      {!hasPermission ? (
        <Button variant="outline" size="sm" fullWidth iconName="Mic" onClick={requestPermission}>
          Permitir acceso al micrófono
        </Button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Dispositivo de entrada</label>
            <div className="flex items-center space-x-2 mt-1">
              <select
                className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={selectedId}
                onChange={(e) => handleDeviceSelect(e?.target?.value)}
              >
                {devices?.map((d) => (
                  <option key={d?.deviceId} value={d?.deviceId}>
                    {d?.label || 'Micrófono'} ({getConnectionType(d?.label).label})
                  </option>
                ))}
              </select>
              <span className="flex items-center space-x-1 text-xs text-muted-foreground" title="Tipo de conexión">
                <Icon name={connection.icon} size={14} />
                <span>{connection.label}</span>
              </span>
            </div>
          </div>

          <label className="flex items-center space-x-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={autoActivate} onChange={toggleAutoActivate} className="h-4 w-4" />
            <span>Activar automáticamente al conectar un micrófono (cable o Bluetooth)</span>
          </label>

          {/* Who is speaking */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">Quién habla:</span>
            {['Llamante', 'Operador']?.map((s) => (
              <button
                key={s}
                onClick={() => setSpeaker(s)}
                className={`px-2 py-1 rounded-full border ${speaker === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Volume meter */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-2 bg-success transition-all duration-75" style={{ width: `${level}%` }} />
          </div>

          <Button
            variant={isListening ? 'destructive' : 'success'}
            size="sm"
            fullWidth
            iconName={isListening ? 'MicOff' : 'Mic'}
            onClick={() => (isListening ? stopListening() : startListening(selectedId))}
            disabled={!SpeechRecognitionApi}
          >
            {isListening ? 'Detener transcripción' : 'Activar micrófono y transcribir'}
          </Button>

          {interimText && (
            <p className="text-sm italic text-muted-foreground border-l-2 border-primary pl-2">{interimText}…</p>
          )}

          {selectedId && selectedId !== 'default' && (
            <p className="text-[11px] text-muted-foreground">
              Nota: la transcripción de Chrome/Edge usa el <strong>micrófono predeterminado de Windows</strong>.
              Si no transcribe, ponga este dispositivo como predeterminado en Windows (Configuración → Sistema → Sonido → Entrada).
            </p>
          )}

          {isListening && noResultHint && (
            <div className="flex items-start space-x-2 text-xs text-warning bg-warning/10 rounded p-2">
              <Icon name="AlertTriangle" size={14} />
              <span>
                No se ha recibido texto en los últimos segundos. Hable más cerca del micrófono, revise que sea el
                micrófono predeterminado de Windows y que haya conexión a internet.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Respaldo: escribir lo que dice el llamante (también sirve para probar el auto-llenado) */}
      <form onSubmit={handleManualSubmit} className="mt-3 flex items-center space-x-2">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e?.target?.value)}
          placeholder="O escriba lo que dice el llamante y presione Enter"
          className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <Button type="submit" variant="outline" size="sm" disabled={!manualText.trim()}>
          Agregar
        </Button>
      </form>

      {notice && (
        <div className="mt-3 flex items-start space-x-2 text-xs text-primary">
          <Icon name="Info" size={14} />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-start space-x-2 text-xs text-destructive">
          <Icon name="AlertCircle" size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default MicrophoneTranscriber;
