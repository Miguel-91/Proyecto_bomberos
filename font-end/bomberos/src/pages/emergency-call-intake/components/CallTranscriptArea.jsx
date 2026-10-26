import React, { useEffect, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getEmergencyType, getPriority } from '../../../utils/emergencyData';

// Colores por estado emocional del llamante
const EMOTION_STYLES = {
  calm: { box: 'bg-success/10 border-success/30 text-success', bar: 'bg-success', icon: 'Smile' },
  nervous: { box: 'bg-primary/10 border-primary/30 text-primary', bar: 'bg-primary', icon: 'Meh' },
  agitated: { box: 'bg-warning/10 border-warning/30 text-warning', bar: 'bg-warning', icon: 'Frown' },
  panic: { box: 'bg-destructive/10 border-destructive/30 text-destructive', bar: 'bg-destructive', icon: 'AlertTriangle' },
};

// Resumen de la llamada: tipo de emergencia, prioridad y si el llamante está alterado
const CallAnalysisSummary = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="mb-3 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Cuando el llamante hable, aquí aparecerá el tipo de emergencia, la prioridad y si la llamada está alterada.
      </div>
    );
  }
  const type = analysis?.type ? getEmergencyType(analysis?.type) : null;
  const priority = getPriority(analysis?.priority);
  const emotion = analysis?.emotion;
  const style = EMOTION_STYLES?.[emotion?.value] || EMOTION_STYLES.calm;

  return (
    <div className="mb-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border p-2">
          <p className="text-[11px] text-muted-foreground">Tipo de emergencia</p>
          <div className="flex items-center space-x-1 font-semibold text-sm text-foreground">
            <Icon name={type?.icon || 'HelpCircle'} size={14} />
            <span>{type?.label || 'Sin identificar'}</span>
          </div>
          {type && <p className="text-[11px] text-muted-foreground">{analysis?.confidence}% confianza</p>}
        </div>
        <div className="rounded-md border border-border p-2">
          <p className="text-[11px] text-muted-foreground">Prioridad</p>
          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${priority?.className}`}>
            {priority?.label}
          </span>
        </div>
      </div>

      {emotion && (
        <div className={`rounded-md border p-2 ${style.box}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm font-semibold">
              <Icon name={style.icon} size={16} />
              <span>Llamante: {emotion?.label}</span>
            </div>
            <span className="text-[11px] font-medium">{emotion?.score}/100</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-background/60 overflow-hidden">
            <div className={`h-1.5 ${style.bar} transition-all duration-300`} style={{ width: `${Math.max(4, emotion?.score)}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-foreground">{emotion?.description}</p>
          {emotion?.signals?.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-[11px] text-foreground/80">
              {emotion?.signals?.map((s) => <li key={s}>{s}</li>)}
            </ul>
          )}
        </div>
      )}

      {analysis?.keyFacts?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {analysis?.keyFacts?.map((f) => (
            <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{f}</span>
          ))}
        </div>
      )}

      {analysis?.onlyOperator && (
        <p className="text-[11px] text-warning">
          Todo se está guardando como "Operador". Seleccione "Llamante" en el micrófono cuando hable la persona que reporta.
        </p>
      )}
    </div>
  );
};

const speakerStyles = {
  caller: 'bg-muted text-foreground',
  ai: 'bg-primary/10 text-foreground',
  operator: 'bg-success/10 text-foreground',
};

const CallTranscriptArea = ({ transcript = [], isRecording, onToggleRecording, analysis = null, liveText = '' }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [transcript, liveText]);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="FileAudio" size={18} className="text-primary" />
          <h4 className="font-semibold text-foreground">Transcripción</h4>
        </div>
        {onToggleRecording && (
          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            size="xs"
            iconName={isRecording ? 'Square' : 'Mic'}
            onClick={onToggleRecording}
          >
            {isRecording ? 'Detener' : 'Grabar'}
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center space-x-2 text-xs text-destructive mb-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
          <span>Transcribiendo llamada</span>
        </div>
      )}

      <CallAnalysisSummary analysis={analysis} />

      <div className="h-64 overflow-y-auto space-y-2 pr-1">
        {transcript?.length === 0 && !liveText ? (
          <p className="text-sm text-muted-foreground text-center pt-20">
            Active el micrófono para transcribir la llamada.
          </p>
        ) : (
          transcript?.map((entry) => (
            <div key={entry?.id} className={`p-2 rounded-md text-sm ${speakerStyles?.[entry?.type] || speakerStyles.caller}`}>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="font-medium">{entry?.speaker}</span>
                <span>{entry?.timestamp}</span>
              </div>
              <p>{entry?.message}</p>
            </div>
          ))
        )}
        {liveText && (
          <div className="p-2 rounded-md text-sm border border-dashed border-primary/40 bg-primary/5">
            <div className="flex items-center space-x-1 text-xs text-primary mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Hablando…</span>
            </div>
            <p className="italic text-foreground">{liveText}</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default CallTranscriptArea;
