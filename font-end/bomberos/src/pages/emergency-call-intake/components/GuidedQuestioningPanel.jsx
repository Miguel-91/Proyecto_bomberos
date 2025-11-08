import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';

const GuidedQuestioningPanel = ({ emergencyType, responses, onResponseChange, onNextQuestion }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const questionSets = {
    incendio: [
      { id: 1, question: '¿Hay personas atrapadas en el lugar?', type: 'boolean' },
      { id: 2, question: '¿Qué tipo de estructura está en llamas?', type: 'text', options: ['Casa', 'Edificio', 'Vehículo', 'Forestal'] },
      { id: 3, question: '¿El fuego se está propagando?', type: 'boolean' },
      { id: 4, question: '¿Hay materiales peligrosos cerca?', type: 'boolean' },
      { id: 5, question: '¿Cuánto tiempo lleva el incendio?', type: 'text' }
    ],
    rescate: [
      { id: 1, question: '¿Cuántas personas necesitan rescate?', type: 'number' },
      { id: 2, question: '¿Cuál es la situación de las víctimas?', type: 'text' },
      { id: 3, question: '¿Es necesario equipo especial?', type: 'boolean' },
      { id: 4, question: '¿Hay riesgo de colapso o más daño?', type: 'boolean' }
    ],
    accidente: [
      { id: 1, question: '¿Cuántos vehículos están involucrados?', type: 'number' },
      { id: 2, question: '¿Hay personas heridas?', type: 'boolean' },
      { id: 3, question: '¿Hay vehículos en llamas o con fuga de combustible?', type: 'boolean' },
      { id: 4, question: '¿Está bloqueada la vía?', type: 'boolean' }
    ],
    medica: [
      { id: 1, question: '¿La persona está consciente?', type: 'boolean' },
      { id: 2, question: '¿Está respirando normalmente?', type: 'boolean' },
      { id: 3, question: '¿Hay sangrado?', type: 'boolean' },
      { id: 4, question: 'Describe los síntomas principales', type: 'text' }
    ],
    default: [
      { id: 1, question: '¿Puede describir la situación actual?', type: 'text' },
      { id: 2, question: '¿Hay personas en peligro inmediato?', type: 'boolean' },
      { id: 3, question: '¿Qué tipo de ayuda necesita?', type: 'text' }
    ]
  };

  const getCurrentQuestions = () => {
    return questionSets[emergencyType] || questionSets.default;
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() && currentQuestion.type !== 'boolean') return;

    const newResponse = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentAnswer,
      timestamp: new Date().toISOString()
    };

    const updatedResponses = [...responses, newResponse];
    onResponseChange(updatedResponses);
    onNextQuestion(newResponse);

    setCurrentAnswer('');

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Load previous answer if exists
      const previousResponse = responses[currentQuestionIndex - 1];
      if (previousResponse) {
        setCurrentAnswer(previousResponse.answer);
      }
    }
  };

  const renderAnswerInput = () => {
    switch (currentQuestion?.type) {
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <Button
              variant={currentAnswer === 'Sí' ? 'default' : 'outline'}
              onClick={() => setCurrentAnswer('Sí')}
              className="flex-1"
            >
              ✓ Sí
            </Button>
            <Button
              variant={currentAnswer === 'No' ? 'destructive' : 'outline'}
              onClick={() => setCurrentAnswer('No')}
              className="flex-1"
            >
              ✗ No
            </Button>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground"
            placeholder="Ingrese un número"
          />
        );

      default:
        if (currentQuestion?.options) {
          return (
            <select
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">Seleccione una opción</option>
              {currentQuestion.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }

        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground resize-none"
            rows={3}
            placeholder="Escriba su respuesta..."
          />
        );
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Cuestionario Guiado
        </h2>
        <span className="text-sm text-muted-foreground">
          Pregunta {currentQuestionIndex + 1} de {currentQuestions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="space-y-4">
          <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
            <p className="text-lg font-medium text-foreground">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Input */}
          <div>
            {renderAnswerInput()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              ← Anterior
            </Button>
            <Button
              variant="default"
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer}
              className="flex-1"
            >
              {currentQuestionIndex < currentQuestions.length - 1 ? 'Siguiente →' : 'Finalizar'}
            </Button>
          </div>
        </div>
      )}

      {/* Responses Summary */}
      {responses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Respuestas Registradas</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {responses.map((response, index) => (
              <div key={index} className="text-xs bg-muted/50 rounded p-2">
                <span className="text-muted-foreground">{response.question}:</span>{' '}
                <span className="text-foreground font-medium">{response.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedQuestioningPanel;
