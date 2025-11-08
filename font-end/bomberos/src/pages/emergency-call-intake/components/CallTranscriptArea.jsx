import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Button from '../../../components/ui/Button';

const CallTranscriptArea = ({ transcript, isRecording, onToggleRecording, onTranscriptUpdate }) => {
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const transcriptEndRef = useRef(null);

  const {
    transcript: liveTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Auto-scroll to bottom when new transcript entries are added
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Handle voice transcription
  useEffect(() => {
    if (liveTranscript && onTranscriptUpdate) {
      // Auto-analyze and extract information from transcript
      if (autoFillEnabled) {
        analyzeTranscriptForData(liveTranscript);
      }
    }
  }, [liveTranscript, autoFillEnabled]);

  const analyzeTranscriptForData = (text) => {
    // Simple pattern matching to extract information
    const patterns = {
      phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      address: /(?:calle|avenida|av\.?|boulevard|pasaje)\s+[a-záéíóúñ\s\d]+(?:\s+\d+)?/gi,
      name: /(?:me llamo|mi nombre es|soy)\s+([a-záéíóúñ\s]+)/gi
    };

    const extractedData = {};

    // Extract phone
    const phoneMatch = text.match(patterns.phone);
    if (phoneMatch) {
      extractedData.phone = phoneMatch[0];
    }

    // Extract address
    const addressMatch = text.match(patterns.address);
    if (addressMatch) {
      extractedData.address = addressMatch[0];
    }

    // Extract name
    const nameMatch = patterns.name.exec(text);
    if (nameMatch && nameMatch[1]) {
      extractedData.name = nameMatch[1].trim();
    }

    if (Object.keys(extractedData).length > 0) {
      onTranscriptUpdate && onTranscriptUpdate(extractedData);
    }
  };

  const handleStartRecording = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'es-ES' });
    onToggleRecording && onToggleRecording(true);
  };

  const handleStopRecording = () => {
    SpeechRecognition.stopListening();
    onToggleRecording && onToggleRecording(false);
  };

  const handleSaveTranscript = () => {
    if (liveTranscript) {
      const newEntry = {
        id: transcript.length + 1,
        timestamp: new Date().toLocaleTimeString('es-ES'),
        speaker: 'Llamante',
        message: liveTranscript,
        type: 'caller'
      };

      // Add to transcript array
      const updatedTranscript = [...transcript, newEntry];
      onTranscriptUpdate && onTranscriptUpdate({ transcript: updatedTranscript });

      // Reset the live transcript
      resetTranscript();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Transcripción de Llamada</h3>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Su navegador no soporta reconocimiento de voz. Por favor use Chrome, Edge o Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Transcripción de Llamada</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${listening ? 'bg-red-500 animate-pulse' : 'bg-muted'}`}></div>
          <span className="text-sm text-muted-foreground">
            {listening ? 'Grabando' : 'Detenido'}
          </span>
        </div>
      </div>

      {/* Live Transcript Display */}
      {listening && liveTranscript && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">🎤</span>
            <div className="flex-1">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Transcripción en vivo:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{liveTranscript}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-2 mb-4">
        {!listening ? (
          <Button
            variant="default"
            onClick={handleStartRecording}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            🎤 Iniciar Grabación
          </Button>
        ) : (
          <>
            <Button
              variant="destructive"
              onClick={handleStopRecording}
              className="flex-1"
            >
              ⏹️ Detener
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveTranscript}
              disabled={!liveTranscript}
            >
              💾 Guardar
            </Button>
          </>
        )}
      </div>

      {/* Auto-fill Toggle */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded mb-4">
        <div>
          <span className="text-xs font-medium text-foreground">Auto-completar formularios</span>
          <p className="text-[10px] text-muted-foreground">
            Extrae automáticamente nombre, teléfono y dirección del audio
          </p>
        </div>
        <button
          onClick={() => setAutoFillEnabled(!autoFillEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            autoFillEnabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              autoFillEnabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Transcript History */}
      <div className="bg-muted/30 rounded-md p-3 max-h-64 overflow-y-auto">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Historial de Transcripción</h4>

        {transcript && transcript.length > 0 ? (
          <div className="space-y-2">
            {transcript.map((entry, index) => (
              <div
                key={entry.id || index}
                className={`p-2 rounded text-xs ${
                  entry.type === 'caller'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                    : entry.type === 'ai'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500'
                    : 'bg-gray-50 dark:bg-gray-800/20 border-l-2 border-gray-500'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] text-muted-foreground min-w-[50px]">
                    {entry.timestamp}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{entry.speaker}:</span>{' '}
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No hay transcripción disponible aún. Inicie la grabación para comenzar.
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
        <p className="text-xs text-green-800 dark:text-green-200">
          💡 <strong>Tip:</strong> Hable claramente cerca del micrófono. El sistema extraerá automáticamente
          el nombre, teléfono y dirección de la conversación para llenar los formularios.
        </p>
      </div>
    </div>
  );
};

export default CallTranscriptArea;
