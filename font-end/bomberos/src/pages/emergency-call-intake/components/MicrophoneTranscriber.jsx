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
  const [autoActivate, setAutoActivate] = useState(() => localStorage.getItem(AUTO_KEY) !== 'false');

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const speakerRef = useRef(speaker);
  const knownDeviceIds = useRef(new Set());
  const audioRef = useRef({ stream: null, context: null, frame: null });

  const onFinalRef = useRef(onFinalTranscript);

  speakerRef.current = speaker;
  onFinalRef.current = onFinalTranscript;

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
      recognition.lang = 'es-GT';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let interim = '';
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
        if (event.error === 'not-allowed') setError('Permiso de micrófono denegado.');
        else if (event.error === 'network') setError('La transcripción necesita conexión a internet.');
      };
      // Chrome detiene el reconocimiento tras un silencio; se reinicia mientras siga activo
      recognition.onend = () => {
        if (listeningRef.current) {
          try { recognition.start(); } catch { /* ya iniciado */ }
        }
      };
      recognitionRef.current = recognition;
    }

    listeningRef.current = true;
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

  const toggleAutoActivate = () => {
    const next = !autoActivate;
    setAutoActivate(next);
    localStorage.setItem(AUTO_KEY, String(next));
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
        </div>
      )}

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
