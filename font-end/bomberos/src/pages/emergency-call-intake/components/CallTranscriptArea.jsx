import React, { useEffect, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const speakerStyles = {
  caller: 'bg-muted text-foreground',
  ai: 'bg-primary/10 text-foreground',
  operator: 'bg-success/10 text-foreground',
};

const CallTranscriptArea = ({ transcript = [], isRecording, onToggleRecording }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [transcript]);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="FileAudio" size={18} className="text-primary" />
          <h4 className="font-semibold text-foreground">Transcripción</h4>
        </div>
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          size="xs"
          iconName={isRecording ? 'Square' : 'Mic'}
          onClick={onToggleRecording}
        >
          {isRecording ? 'Detener' : 'Grabar'}
        </Button>
      </div>

      {isRecording && (
        <div className="flex items-center space-x-2 text-xs text-destructive mb-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
          <span>Grabando llamada</span>
        </div>
      )}

      <div className="h-64 overflow-y-auto space-y-2 pr-1">
        {transcript?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center pt-20">
            La transcripción aparecerá aquí durante la llamada.
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
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default CallTranscriptArea;
