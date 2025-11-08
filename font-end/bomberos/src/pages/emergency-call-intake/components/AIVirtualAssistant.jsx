import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import openai from '../../../utils/openaiClient';

const AIVirtualAssistant = ({ 
  callTranscript, 
  onEmergencyDetected, 
  onQuestionGenerated,
  isActive = false 
}) => {
  const [aiStatus, setAiStatus] = useState('standby'); // standby, analyzing, ready, error
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [emergencyType, setEmergencyType] = useState(null);
  const [processingLogs, setProcessingLogs] = useState([]);

  // Mock AI analysis when active
  useEffect(() => {
    if (isActive && callTranscript?.length > 0) {
      analyzeCallTranscript();
    }
  }, [isActive, callTranscript]);

  const analyzeCallTranscript = async () => {
    setAiStatus('analyzing');
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis (in real implementation, this would call OpenAI)
      const mockAnalysis = {
        emergencyType: 'fire',
        confidence: 87,
        priority: 'high',
        keyInfo: [
          'Incendio reportado en estructura residencial',
          'Ubicación confirmada: Calle Mayor 123',
          'Evacuación completada según el llamante',
          'Fuego en expansión reportado'
        ],
        suggestedQuestions: [
          '¿Hay alguna persona o mascota que aún pueda estar dentro?',
          '¿El fuego está afectando a edificios adyacentes?',
          '¿Hay vehículos de emergencia que puedan acceder fácilmente?',
          '¿Huele a gas o productos químicos?'
        ],
        recommendedUnits: 2,
        estimatedResponseTime: '8-12 minutos'
      };

      setCurrentAnalysis(mockAnalysis);
      setConfidence(mockAnalysis?.confidence);
      setSuggestedQuestions(mockAnalysis?.suggestedQuestions);
      setEmergencyType(mockAnalysis?.emergencyType);
      setAiStatus('ready');

      // Add processing log
      addProcessingLog('Análisis completado', 'success');
      
      // Notify parent component
      onEmergencyDetected?.(mockAnalysis);
      
    } catch (error) {
      setAiStatus('error');
      addProcessingLog('Error en análisis de IA', 'error');
      console.error('Error analyzing call transcript:', error);
    }
  };

  const analyzeWithOpenAI = async (transcript) => {
    try {
      const response = await openai?.chat?.completions?.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente virtual especializado en emergencias. Analiza la transcripción de llamada de emergencia y proporciona:
            1. Tipo de emergencia detectada
            2. Nivel de prioridad (critical/high/medium/low)
            3. Información clave extraída
            4. Preguntas de seguimiento recomendadas
            5. Unidades sugeridas para envío
            6. Tiempo estimado de respuesta`
          },
          {
            role: 'user',
            content: `Analiza esta transcripción de llamada de emergencia: ${transcript?.map(t => `${t?.speaker}: ${t?.message}`)?.join('\n')}`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'emergency_analysis',
            schema: {
              type: 'object',
              properties: {
                emergencyType: { type: 'string' },
                priority: { type: 'string' },
                confidence: { type: 'number' },
                keyInfo: { type: 'array', items: { type: 'string' } },
                suggestedQuestions: { type: 'array', items: { type: 'string' } },
                recommendedUnits: { type: 'number' },
                estimatedResponseTime: { type: 'string' }
              },
              required: ['emergencyType', 'priority', 'confidence', 'keyInfo', 'suggestedQuestions'],
              additionalProperties: false,
            },
          },
        },
        reasoning_effort: 'high',
        verbosity: 'medium',
      });

      return JSON.parse(response?.choices?.[0]?.message?.content);
    } catch (error) {
      console.error('Error with OpenAI analysis:', error);
      throw error;
    }
  };

  const generateFollowUpQuestion = async (context) => {
    setAiStatus('analyzing');
    
    try {
      // Mock question generation
      const questions = [
        '¿Puede describir el humo que observa? ¿Es negro, blanco o gris?',
        '¿Escucha algún sonido de explosión o estallidos?',
        '¿Hay algún olor químico particular?',
        '¿Las llamas son visibles desde la calle?'
      ];
      
      const randomQuestion = questions?.[Math.floor(Math.random() * questions?.length)];
      
      addProcessingLog(`Pregunta generada: ${randomQuestion}`, 'info');
      onQuestionGenerated?.(randomQuestion);
      setAiStatus('ready');
      
    } catch (error) {
      setAiStatus('error');
      addProcessingLog('Error generando pregunta', 'error');
    }
  };

  const addProcessingLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date()?.toLocaleTimeString('es-ES'),
      message,
      type // info, success, warning, error
    };
    
    setProcessingLogs(prev => [newLog, ...prev]?.slice(0, 10)); // Keep last 10 logs
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzing': return 'text-blue-500 bg-blue-50';
      case 'ready': return 'text-green-500 bg-green-50';
      case 'error': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzing': return 'Loader2';
      case 'ready': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'Bot';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon 
            name={getStatusIcon(aiStatus)} 
            size={20} 
            className={`${
              aiStatus === 'analyzing' ? 'animate-spin text-primary' : 'text-primary'
            }`} 
          />
          <h3 className="text-lg font-semibold text-foreground">Asistente Virtual IA</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(aiStatus)}`}>
          {aiStatus === 'analyzing' ? 'Analizando...' :
           aiStatus === 'ready' ? 'Listo' :
           aiStatus === 'error' ? 'Error' : 'En Espera'}
        </div>
      </div>

      {/* AI Analysis Results */}
      {currentAnalysis && (
        <div className="space-y-4 mb-6">
          {/* Emergency Detection */}
          <div className="bg-primary/10 border border-primary/20 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon name="Target" size={16} className="text-primary" />
                <span className="font-medium text-foreground">Detección de Emergencia</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-muted-foreground">Confianza:</div>
                <div className="text-sm font-bold text-primary">{confidence}%</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Tipo Detectado</div>
                <div className="font-semibold text-foreground capitalize">
                  {emergencyType === 'fire' ? 'Incendio' : emergencyType}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Prioridad</div>
                <div className={`font-semibold ${
                  currentAnalysis?.priority === 'high' ? 'text-orange-500' : 'text-foreground'
                }`}>
                  {currentAnalysis?.priority === 'high' ? 'Alta' : currentAnalysis?.priority}
                </div>
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="bg-muted/30 rounded-md p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Info" size={16} className="text-muted-foreground" />
              <span className="font-medium text-foreground">Información Clave</span>
            </div>
            <ul className="space-y-1">
              {currentAnalysis?.keyInfo?.map((info, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Suggested Questions */}
      {suggestedQuestions?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="MessageCircle" size={16} className="text-primary" />
              <span className="font-medium text-foreground">Preguntas Sugeridas</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateFollowUpQuestion()}
              iconName="RefreshCw"
            >
              Generar Nueva
            </Button>
          </div>
          
          <div className="space-y-2">
            {suggestedQuestions?.slice(0, 3)?.map((question, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-md p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onQuestionGenerated?.(question)}
              >
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-foreground flex-1">{question}</p>
                  <Icon name="Send" size={14} className="text-muted-foreground mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Logs */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Activity" size={16} className="text-muted-foreground" />
          <span className="font-medium text-foreground">Registro de Procesamiento</span>
        </div>
        
        <div className="bg-muted/20 rounded-md p-3 max-h-32 overflow-y-auto">
          {processingLogs?.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-2">
              Sin actividad reciente
            </div>
          ) : (
            <div className="space-y-1">
              {processingLogs?.map((log) => (
                <div key={log?.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">[{log?.timestamp}]</span>
                    <span className={getLogColor(log?.type)}>{log?.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2 mt-4">
        <Button
          variant="default"
          size="sm"
          onClick={analyzeCallTranscript}
          disabled={aiStatus === 'analyzing'}
          iconName="Zap"
          className="flex-1"
        >
          {aiStatus === 'analyzing' ? 'Analizando...' : 'Analizar Llamada'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateFollowUpQuestion()}
          iconName="MessageSquare"
        >
          Generar Pregunta
        </Button>
      </div>
    </div>
  );
};

export default AIVirtualAssistant;