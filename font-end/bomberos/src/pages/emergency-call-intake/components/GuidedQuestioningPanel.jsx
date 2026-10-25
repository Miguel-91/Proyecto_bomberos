import React from 'react';
import Icon from '../../../components/AppIcon';

export const ADDRESS_QUESTION = '¿Cuál es la dirección exacta de la emergencia?';
export const INJURED_QUESTION = '¿Hay personas heridas o atrapadas?';
export const PEOPLE_QUESTION = '¿Cuántas personas están involucradas?';

const COMMON_QUESTIONS = [ADDRESS_QUESTION, INJURED_QUESTION, PEOPLE_QUESTION];

const QUESTIONS_BY_TYPE = {
  fire: ['¿Qué se está quemando (vivienda, comercio, vehículo, maleza)?', '¿Hay personas dentro del inmueble?', '¿El fuego se está propagando a construcciones vecinas?'],
  medical: ['¿La persona está consciente?', '¿Respira con normalidad?', '¿Tiene alguna enfermedad conocida o toma medicamentos?'],
  traffic: ['¿Cuántos vehículos están involucrados?', '¿Hay personas atrapadas dentro de los vehículos?', '¿Hay derrame de combustible?'],
  rescue: ['¿Dónde se encuentra la persona (barranco, altura, agua)?', '¿Puede comunicarse con la persona?', '¿El acceso al lugar es seguro?'],
  hazmat: ['¿Qué sustancia está involucrada?', '¿Hay olor fuerte o nube visible?', '¿Se ha evacuado la zona?'],
  natural: ['¿Qué tipo de evento ocurrió (deslave, inundación, sismo)?', '¿Hay estructuras colapsadas?', '¿Hay vías de acceso bloqueadas?'],
};

// responses: [{ question, answer, source: 'auto' | 'manual' }]
const GuidedQuestioningPanel = ({ emergencyType, responses = [], onResponseChange }) => {
  const questions = [...COMMON_QUESTIONS, ...(QUESTIONS_BY_TYPE?.[emergencyType] || [])];
  const getResponse = (question) => responses?.find((r) => r?.question === question);
  const answered = questions?.filter((q) => getResponse(q)?.answer?.trim())?.length;

  const handleChange = (question, answer) => {
    const others = responses?.filter((r) => r?.question !== question);
    onResponseChange(answer ? [...others, { question, answer, source: 'manual' }] : others);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Interrogatorio Guiado</h3>
        </div>
        <span className="text-sm text-muted-foreground">{answered} / {questions?.length}</span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full mb-4">
        <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${(answered / questions?.length) * 100}%` }} />
      </div>

      <div className="space-y-3">
        {questions?.map((question) => {
          const response = getResponse(question);
          return (
            <div key={question}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">{question}</label>
                {response?.source === 'auto' && (
                  <span className="flex items-center space-x-1 text-xs text-primary">
                    <Icon name="Sparkles" size={12} />
                    <span>De la llamada</span>
                  </span>
                )}
              </div>
              <input
                className={`mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  response?.source === 'auto' ? 'border-primary/50' : 'border-input'
                }`}
                placeholder="Respuesta del llamante..."
                value={response?.answer || ''}
                onChange={(e) => handleChange(question, e?.target?.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuidedQuestioningPanel;
