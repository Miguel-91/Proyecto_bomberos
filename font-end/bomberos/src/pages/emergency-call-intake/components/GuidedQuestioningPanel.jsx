import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const COMMON_QUESTIONS = [
  '¿Cuál es la dirección exacta de la emergencia?',
  '¿Hay personas heridas o atrapadas?',
  '¿Cuántas personas están involucradas?',
];

const QUESTIONS_BY_TYPE = {
  fire: ['¿Qué se está quemando (vivienda, comercio, vehículo, maleza)?', '¿Hay personas dentro del inmueble?', '¿El fuego se está propagando a construcciones vecinas?'],
  medical: ['¿La persona está consciente?', '¿Respira con normalidad?', '¿Tiene alguna enfermedad conocida o toma medicamentos?'],
  traffic: ['¿Cuántos vehículos están involucrados?', '¿Hay personas atrapadas dentro de los vehículos?', '¿Hay derrame de combustible?'],
  rescue: ['¿Dónde se encuentra la persona (barranco, altura, agua)?', '¿Puede comunicarse con la persona?', '¿El acceso al lugar es seguro?'],
  hazmat: ['¿Qué sustancia está involucrada?', '¿Hay olor fuerte o nube visible?', '¿Se ha evacuado la zona?'],
  natural: ['¿Qué tipo de evento ocurrió (deslave, inundación, sismo)?', '¿Hay estructuras colapsadas?', '¿Hay vías de acceso bloqueadas?'],
};

const GuidedQuestioningPanel = ({ emergencyType, responses = [], onResponseChange, onNextQuestion }) => {
  const [answer, setAnswer] = useState('');
  const questions = [...COMMON_QUESTIONS, ...(QUESTIONS_BY_TYPE?.[emergencyType] || [])];
  const currentIndex = responses?.length;
  const currentQuestion = questions?.[currentIndex];

  const handleSubmit = () => {
    if (!answer?.trim() || !currentQuestion) return;
    const response = { question: currentQuestion, answer: answer?.trim() };
    onResponseChange([...responses, response]);
    onNextQuestion(response);
    setAnswer('');
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Interrogatorio Guiado</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.min(currentIndex, questions?.length)} / {questions?.length}
        </span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full mb-4">
        <div
          className="h-2 bg-primary rounded-full transition-all"
          style={{ width: `${(Math.min(currentIndex, questions?.length) / questions?.length) * 100}%` }}
        />
      </div>

      {currentQuestion ? (
        <div className="space-y-3">
          <p className="font-medium text-foreground">{currentQuestion}</p>
          <div className="flex space-x-2">
            <input
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Respuesta del llamante..."
              value={answer}
              onChange={(e) => setAnswer(e?.target?.value)}
              onKeyDown={(e) => e?.key === 'Enter' && handleSubmit()}
            />
            <Button onClick={handleSubmit} iconName="ArrowRight" iconPosition="right" disabled={!answer?.trim()}>
              Siguiente
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 p-3 rounded-md bg-success/10 text-success text-sm">
          <Icon name="CheckCircle" size={18} />
          <span>Interrogatorio completado</span>
        </div>
      )}

      {responses?.length > 0 && (
        <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {responses?.map((r, i) => (
            <li key={i} className="text-sm border-l-2 border-primary pl-3">
              <div className="text-muted-foreground">{r?.question}</div>
              <div className="text-foreground">{r?.answer}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuidedQuestioningPanel;
