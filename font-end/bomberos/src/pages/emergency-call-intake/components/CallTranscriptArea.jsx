import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../../../components/ui/Button';
import { extractCallData } from '../../../utils/voiceExtractor';

/**
 * Transcripción de la llamada con la Web Speech API del navegador (Chrome / Edge).
 * - Transcribe en vivo y guarda automáticamente cada frase en el historial.
 * - Analiza TODO lo dicho en la llamada y llena nombre, teléfono, dirección,
 *   tipo de emergencia y prioridad.
 * - Muestra claramente cualquier error (permiso de micrófono, sin internet, etc.).
 */

const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const ERROR_MESSAGES = {
  'not-allowed':
    'El navegador bloqueó el micrófono. Haz clic en el candado 🔒 junto a la dirección (localhost:4028), activa "Micrófono" y recarga la página.',
  'service-not-allowed':
    'El reconocimiento de voz está bloqueado en este navegador o perfil. Si usas un perfil administrado (por ejemplo, "Centro educativo"), prueba con un perfil personal de Chrome o con Microsoft Edge.',
  'audio-capture':
    'No se encontró ningún micrófono. Conecta uno o revisa en Windows: Configuración → Privacidad → Micrófono.',
  network:
    'Sin conexión con el servicio de voz. Chrome necesita internet para transcribir. Revisa tu conexión y vuelve a intentar.',
  'language-not-supported': 'El idioma no está disponible; se cambió a español (España).',
};

const CallTranscriptArea = ({ transcript = [], isRecording, onToggleRecording, onTranscriptUpdate }) => {
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [detected, setDetected] = useState({});
  const [manualText, setManualText] = useState('');

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const langRef = useRef('es-GT');
  const transcriptRef = useRef(transcript);
  const lastSentRef = useRef({});
  const autoFillRef = useRef(autoFillEnabled);
  const onUpdateRef = useRef(onTranscriptUpdate);
  const transcriptEndRef = useRef(null);

  // Mantener referencias actualizadas (los eventos del micrófono usan estas refs)
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { autoFillRef.current = autoFillEnabled; }, [autoFillEnabled]);
  useEffect(() => { onUpdateRef.current = onTranscriptUpdate; }, [onTranscriptUpdate]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [transcript, interimText]);

  // --- Análisis de toda la llamada -----------------------------------------
  const analyze = useCallback((entries, extra = '') => {
    const fullText = [
      ...entries.filter((e) => e.type === 'caller').map((e) => e.message),
      extra,
    ].join('. ');
    const data = extractCallData(fullText);
    setDetected(data);
    if (!autoFillRef.current) return;

    // Enviar solo lo que cambió desde la última vez (así no se pisan correcciones manuales)
    const changed = {};
    Object.keys(data).forEach((k) => {
      if (JSON.stringify(data[k]) !== JSON.stringify(lastSentRef.current[k])) changed[k] = data[k];
    });
    if (Object.keys(changed).length) {
      lastSentRef.current = { ...lastSentRef.current, ...changed };
      onUpdateRef.current && onUpdateRef.current({ ...changed, fullText });
    }
  }, []);

  const addCallerEntry = useCallback((text, speaker = 'Llamante') => {
    const clean = text.trim();
    if (!clean) return;
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString('es-GT'),
      speaker,
      message: clean.charAt(0).toUpperCase() + clean.slice(1),
      type: 'caller',
    };
    const updated = [...transcriptRef.current, entry];
    transcriptRef.current = updated;
    onUpdateRef.current && onUpdateRef.current({ transcript: updated });
    analyze(updated);
  }, [analyze]);

  // --- Control del micrófono -------------------------------------------------
  const createRecognition = useCallback(() => {
    const rec = new SpeechRecognitionAPI();
    rec.lang = langRef.current;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setListening(true);
      setError('');
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          addCallerEntry(res[0].transcript);
        } else {
          interim += res[0].transcript;
        }
      }
      setInterimText(interim);
      // Analizar también lo que se está diciendo en este momento
      if (interim) analyze(transcriptRef.current, interim);
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return; // silencio: se reinicia solo
      if (event.error === 'language-not-supported' && langRef.current !== 'es-ES') {
        langRef.current = 'es-ES';
        setError(ERROR_MESSAGES['language-not-supported']);
        return; // onend reiniciará con el nuevo idioma
      }
      shouldListenRef.current = false;
      setError(ERROR_MESSAGES[event.error] || `Error del reconocimiento de voz: ${event.error}`);
    };

    rec.onend = () => {
      setInterimText('');
      // Chrome corta la escucha tras unos segundos de silencio: reiniciar si seguimos grabando
      if (shouldListenRef.current) {
        try {
          recognitionRef.current = createRecognition();
          recognitionRef.current.start();
          return;
        } catch (e) {
          /* se detiene abajo */
        }
      }
      setListening(false);
      onToggleRecording && onToggleRecording(false);
    };

    return rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCallerEntry, analyze]);

  const handleStartRecording = async () => {
    setError('');
    if (!SpeechRecognitionAPI) return;

    // Pedir permiso del micrófono explícitamente para mostrar un error claro
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      setError(e?.name === 'NotFoundError' ? ERROR_MESSAGES['audio-capture'] : ERROR_MESSAGES['not-allowed']);
      return;
    }

    try {
      shouldListenRef.current = true;
      recognitionRef.current = createRecognition();
      recognitionRef.current.start();
      onToggleRecording && onToggleRecording(true);
    } catch (e) {
      shouldListenRef.current = false;
      setError(`No se pudo iniciar el micrófono: ${e?.message || e}`);
    }
  };

  const handleStopRecording = () => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.stop(); } catch (e) { /* ya detenido */ }
    setListening(false);
    onToggleRecording && onToggleRecording(false);
  };

  // Detener el micrófono si se sale de la pantalla
  useEffect(() => () => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.abort(); } catch (e) { /* nada */ }
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    addCallerEntry(manualText, 'Llamante (texto)');
    setManualText('');
  };

  const handleClear = () => {
    if (!window.confirm('¿Borrar la transcripción de esta llamada?')) return;
    transcriptRef.current = [];
    lastSentRef.current = {};
    setDetected({});
    onUpdateRef.current && onUpdateRef.current({ transcript: [] });
  };

  const handleReapply = () => {
    lastSentRef.current = {};
    analyze(transcriptRef.current);
  };

  // --- Render ---------------------------------------------------------------
  const priorityLabel = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };
  const detectedRows = [
    ['Nombre', detected.name],
    ['Teléfono', detected.phone],
    ['Dirección', detected.address],
    ['Emergencia', detected.emergencyLabel && `${detected.emergencyLabel} (${detected.confidence}%)`],
    ['Prioridad', priorityLabel[detected.priority]],
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Transcripción de Llamada</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${listening ? 'bg-red-500 animate-pulse' : 'bg-muted'}`} />
          <span className="text-sm text-muted-foreground">{listening ? 'Escuchando' : 'Detenido'}</span>
        </div>
      </div>

      {!SpeechRecognitionAPI && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
          ⚠️ Este navegador no tiene reconocimiento de voz. Usa <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>.
          Mientras tanto puedes escribir lo que dice el llamante en el cuadro de abajo.
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800 flex justify-between gap-2">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-red-600 font-bold" aria-label="Cerrar">×</button>
        </div>
      )}

      {/* Controles */}
      <div className="flex space-x-2 mb-4">
        {!listening ? (
          <Button
            variant="default"
            onClick={handleStartRecording}
            disabled={!SpeechRecognitionAPI}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            🎤 Iniciar Grabación
          </Button>
        ) : (
          <Button variant="destructive" onClick={handleStopRecording} className="flex-1">
            ⏹️ Detener
          </Button>
        )}
        <Button variant="outline" onClick={handleClear} disabled={!transcript.length} title="Borrar transcripción">
          🗑️
        </Button>
      </div>

      {/* Texto en vivo */}
      {listening && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded min-h-[56px]">
          <p className="text-xs text-blue-600 font-medium mb-1">🎤 Transcripción en vivo:</p>
          <p className="text-sm text-blue-800">{interimText || <span className="italic opacity-70">Hable ahora…</span>}</p>
        </div>
      )}

      {/* Auto-completar */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded mb-3">
        <div>
          <span className="text-xs font-medium text-foreground">Auto-completar formularios</span>
          <p className="text-[10px] text-muted-foreground">
            Llena nombre, teléfono, dirección, tipo de emergencia y prioridad
          </p>
        </div>
        <button
          onClick={() => setAutoFillEnabled(!autoFillEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoFillEnabled ? 'bg-primary' : 'bg-muted'}`}
          aria-label="Activar o desactivar auto-completar"
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoFillEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Datos detectados */}
      <div className="mb-4 p-3 rounded border border-border text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-foreground uppercase">Datos detectados</span>
          <button onClick={handleReapply} className="text-primary hover:underline" disabled={!transcript.length}>
            Volver a llenar
          </button>
        </div>
        {detectedRows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-0.5">
            <span className="text-muted-foreground">{label}:</span>
            <span className={value ? 'text-green-700 font-medium text-right' : 'text-muted-foreground'}>{value || '—'}</span>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div className="bg-muted/30 rounded-md p-3 max-h-64 overflow-y-auto">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Historial de Transcripción</h4>
        {transcript.length > 0 ? (
          <div className="space-y-2">
            {transcript.map((entry, index) => (
              <div
                key={entry.id || index}
                className={`p-2 rounded text-xs ${
                  entry.type === 'caller'
                    ? 'bg-blue-50 border-l-2 border-blue-500'
                    : entry.type === 'ai'
                      ? 'bg-purple-50 border-l-2 border-purple-500'
                      : 'bg-gray-50 border-l-2 border-gray-500'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] text-muted-foreground min-w-[50px]">{entry.timestamp}</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{entry.speaker}:</span>{' '}
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No hay transcripción aún. Presione "Iniciar Grabación" y hable.
          </p>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Entrada manual (respaldo y pruebas) */}
      <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="O escriba lo que dice el llamante y presione Enter"
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" variant="outline" size="sm" disabled={!manualText.trim()}>
          Agregar
        </Button>
      </form>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-xs text-green-800">
          💡 <strong>Ejemplo:</strong> "Mi nombre es Carlos Pérez, hay un incendio en la calle del Arco número 12,
          Antigua Guatemala, mi teléfono es 5512 3456".
        </p>
      </div>
    </div>
  );
};

export default CallTranscriptArea;
