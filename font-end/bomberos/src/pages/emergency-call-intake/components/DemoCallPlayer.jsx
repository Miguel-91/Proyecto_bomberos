import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { DEMO_CALLS, getDemoCall } from '../../../utils/demoCalls';
import { getEmergencyType, getPriority } from '../../../utils/emergencyData';

// Muestra la etiqueta en español si el valor es un código conocido
const typeLabel = (v) => getEmergencyType(v)?.label || v;
const priorityLabel = (v) => (['critical', 'high', 'medium', 'low'].includes(v) ? getPriority(v)?.label : v);

/**
 * Simulador de llamadas para demostraciones.
 * Envía cada frase palabra por palabra como "transcripción parcial" y luego como frase final,
 * igual que lo hace el reconocimiento de voz real, así se ve el llenado en vivo.
 * Opcionalmente lee la llamada en voz alta (síntesis de voz del navegador).
 */
const MS_PER_WORD = 170;
const PAUSE_BETWEEN_LINES = 700;

const DemoCallPlayer = ({ onInterimTranscript, onFinalTranscript, onStart, disabled = false }) => {
  const [selectedId, setSelectedId] = useState(DEMO_CALLS?.[0]?.id);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speakAloud, setSpeakAloud] = useState(false);
  const timersRef = useRef([]);

  const selected = getDemoCall(selectedId);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => () => {
    clearTimers();
    try { window.speechSynthesis?.cancel(); } catch { /* sin síntesis */ }
  }, []);

  const stop = () => {
    clearTimers();
    try { window.speechSynthesis?.cancel(); } catch { /* sin síntesis */ }
    setPlaying(false);
  };

  const speak = (text, speaker) => {
    if (!speakAloud || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-MX';
    u.rate = 1.1;
    u.pitch = speaker === 'Operador' ? 0.9 : 1.15;
    window.speechSynthesis.speak(u);
  };

  const play = () => {
    if (!selected) return;
    stop();
    onStart?.(selected);
    setPlaying(true);
    setProgress(0);

    let t = 300;
    selected.lines.forEach((line, index) => {
      const words = line.text.split(/\s+/);
      const at = (ms, fn) => timersRef.current.push(setTimeout(fn, ms));

      at(t, () => speak(line.text, line.speaker));
      words.forEach((_, w) => {
        t += MS_PER_WORD;
        const partial = words.slice(0, w + 1).join(' ');
        at(t, () => onInterimTranscript?.(partial, line.speaker, { volume: line.volume || 0 }));
      });
      t += 250;
      at(t, () => {
        onFinalTranscript?.(line.text, line.speaker, { volume: line.volume || 0 });
        setProgress(Math.round(((index + 1) / selected.lines.length) * 100));
      });
      t += PAUSE_BETWEEN_LINES;
    });
    timersRef.current.push(setTimeout(() => setPlaying(false), t));
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="PlayCircle" size={18} className="text-primary" />
          <h4 className="font-semibold text-foreground">Simulador de llamada</h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Modo demostración</span>
      </div>

      <p className="text-xs text-muted-foreground mb-2">
        Reproduce una llamada de ejemplo por el mismo proceso que la voz real (incluye el volumen simulado de la voz).
        Útil si el micrófono o internet fallan.
      </p>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e?.target?.value)}
        disabled={playing}
        className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm mb-2"
      >
        {DEMO_CALLS?.map((c) => <option key={c?.id} value={c?.id}>{c?.title}</option>)}
      </select>

      {selected && (
        <div className="text-xs text-muted-foreground mb-2">
          <p>{selected?.description}</p>
          <p className="mt-1">
            Se espera: <strong className="text-foreground">{typeLabel(selected?.expected?.type)}</strong>,
            prioridad <strong className="text-foreground">{priorityLabel(selected?.expected?.priority)}</strong>,
            llamante <strong className="text-foreground">{selected?.expected?.emotion}</strong>.
          </p>
        </div>
      )}

      <label className="flex items-center space-x-2 text-xs text-foreground mb-3">
        <input type="checkbox" checked={speakAloud} onChange={() => setSpeakAloud(!speakAloud)} />
        <span>Leer la llamada en voz alta</span>
      </label>

      {playing && (
        <div className="h-1.5 w-full rounded-full bg-muted mb-3 overflow-hidden">
          <div className="h-1.5 bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {!playing ? (
        <Button variant="outline" size="sm" fullWidth iconName="Play" onClick={play} disabled={disabled}>
          Reproducir llamada de ejemplo
        </Button>
      ) : (
        <Button variant="outline" size="sm" fullWidth iconName="Square" onClick={stop}>
          Detener simulación
        </Button>
      )}
      {disabled && (
        <p className="mt-2 text-[11px] text-muted-foreground">Detenga el micrófono para usar el simulador.</p>
      )}
    </div>
  );
};

export default DemoCallPlayer;
