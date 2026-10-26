import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { getEmergencyType, getPriority } from '../../utils/emergencyData';
import { analyzeTranscript, analyzeEmotion } from '../../utils/callAnalyzer';
import { getCurrentUser } from '../../utils/auth';
import { useIncidents } from '../../utils/dataStore';

// Import components
import CallerInformationForm from './components/CallerInformationForm';
import EmergencyClassification from './components/EmergencyClassification';
import GuidedQuestioningPanel, { ADDRESS_QUESTION, INJURED_QUESTION, PEOPLE_QUESTION } from './components/GuidedQuestioningPanel';
import CallTranscriptArea from './components/CallTranscriptArea';
import QuickActionButtons from './components/QuickActionButtons';
import LocationMapping from './components/LocationMapping';
import IncomingCallsQueue from './components/IncomingCallsQueue';
import AIVirtualAssistant from './components/AIVirtualAssistant';
import CallManagementPanel from './components/CallManagementPanel';
import EmergencyProtocolGuide from './components/EmergencyProtocolGuide';
import MicrophoneTranscriber from './components/MicrophoneTranscriber';
import TicketPanel from './components/TicketPanel';

const EMPTY_CALLER = { name: '', phone: '', address: '', additionalInfo: '', callStatus: 'En línea' };

const EMPTY_CLASSIFICATION = {
  type: '',
  priority: '',
  aiConfidence: 0,
  aiSuggestion: 'Esperando transcripción',
  manualOverride: false,
  estimatedUnits: '-',
  estimatedTime: '-',
  riskLevel: '-',
  resourcesNeeded: 'Estándar'
};

const DISPATCH_LABELS = {
  'fire-engine': 'Autobomba',
  ambulance: 'Ambulancia',
  rescue: 'Unidad de rescate',
  'water-tanker': 'Cisterna',
};

// Agrega o reemplaza una respuesta automática sin pisar lo que escribió el operador
const upsertAutoResponse = (responses, question, answer) => {
  const existing = responses?.find((r) => r?.question === question);
  if (!answer || existing?.source === 'manual') return responses;
  return [...responses?.filter((r) => r?.question !== question), { question, answer, source: 'auto' }];
};

const EmergencyCallIntake = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { incidents, createIncident, changeStatus, finalizeIncident } = useIncidents();

  const [viewMode, setViewMode] = useState('active-call'); // 'queue', 'active-call', 'ai-assistant'
  const [callStatus, setCallStatus] = useState('active');
  const [callDuration, setCallDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [aiAssistantActive, setAiAssistantActive] = useState(true);

  const [callerInfo, setCallerInfo] = useState(EMPTY_CALLER);
  const [addressIsAuto, setAddressIsAuto] = useState(false);
  const [classification, setClassification] = useState(EMPTY_CLASSIFICATION);
  const [questionResponses, setQuestionResponses] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [location, setLocation] = useState(null);
  const [keyFacts, setKeyFacts] = useState([]);
  const [ticketId, setTicketId] = useState(null);
  // Análisis en vivo para el panel de transcripción (tipo, prioridad y estado del llamante)
  const [callAnalysis, setCallAnalysis] = useState(null);
  const [liveText, setLiveText] = useState('');
  const lastInterimRef = useRef(0);

  const transcriptRef = useRef([]);
  // Campos que llenó la voz automáticamente (se pueden seguir actualizando)
  const autoFieldsRef = useRef(new Set());
  const ticket = incidents?.find((i) => i?.id === ticketId);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const addTranscriptEntry = (message, speaker, type, volume = 0) => {
    const entry = {
      id: transcriptRef.current.length + 1,
      timestamp: new Date()?.toLocaleTimeString('es-GT'),
      speaker,
      message,
      type,
      volume
    };
    transcriptRef.current = [...transcriptRef.current, entry];
    setTranscript(transcriptRef.current);
  };

  // Llena clasificación, dirección e interrogatorio a partir de lo que se dijo en la llamada
  const applyAnalysis = (analysis) => {
    if (!analysis) return;

    setClassification((prev) => (prev?.manualOverride || !analysis?.type ? prev : {
      ...prev,
      type: analysis?.type,
      priority: analysis?.priority,
      aiConfidence: analysis?.confidence,
      aiSuggestion: analysis?.typeLabel,
      estimatedUnits: analysis?.estimatedUnits,
      estimatedTime: analysis?.estimatedTime,
      riskLevel: analysis?.riskLevel,
    }));

    // Nombre, teléfono, dirección e información adicional: se llenan si están vacíos
    // o si los llenó la voz antes (no se reemplaza lo que escribió el operador)
    const autoValues = {
      name: analysis?.name,
      phone: analysis?.phone,
      address: analysis?.address,
      additionalInfo: analysis?.summary,
    };
    const filled = {};
    Object.entries(autoValues).forEach(([field, value]) => {
      if (!value) return;
      const current = callerInfo?.[field];
      if (!current?.trim() || autoFieldsRef.current.has(field)) filled[field] = value;
    });
    if (Object.keys(filled).length) {
      Object.keys(filled).forEach((f) => autoFieldsRef.current.add(f));
      setCallerInfo((prev) => ({ ...prev, ...filled }));
      if (filled.address) {
        setAddressIsAuto(true);
        setLocation({ address: filled.address, validated: false });
      }
    }

    let injuredAnswer = null;
    if (analysis?.trapped && analysis?.injured) injuredAnswer = 'Sí, hay personas heridas y atrapadas';
    else if (analysis?.trapped) injuredAnswer = 'Sí, hay personas atrapadas';
    else if (analysis?.injured) injuredAnswer = 'Sí, hay personas heridas';

    setQuestionResponses((prev) => {
      let next = upsertAutoResponse(prev, ADDRESS_QUESTION, analysis?.address);
      next = upsertAutoResponse(next, INJURED_QUESTION, injuredAnswer);
      next = upsertAutoResponse(next, PEOPLE_QUESTION, analysis?.people ? String(analysis?.people) : null);
      return next;
    });

    setKeyFacts(analysis?.keyFacts || []);
  };

  // Analiza todo lo dicho por el llamante (+ lo que está diciendo en este momento)
  const analyzeCall = (extraText = '', extraVolume = 0) => {
    const callerLines = transcriptRef.current?.filter((t) => t?.type === 'caller');
    const source = callerLines?.length ? callerLines : transcriptRef.current;
    const fullText = [...(source?.map((t) => t?.message) || []), extraText]?.filter(Boolean)?.join('. ');
    if (!fullText?.trim()) return;
    const analysis = analyzeTranscript(fullText);
    // El estado emocional pesa más lo último que se dijo
    const recent = source?.slice(-3);
    const recentText = [...(recent?.map((t) => t?.message) || []), extraText]?.filter(Boolean)?.join('. ');
    const volume = Math.max(extraVolume, ...(recent?.map((t) => t?.volume || 0) || [0]));
    const emotion = analyzeEmotion(`${fullText}. ${recentText}`, { volume });
    applyAnalysis(analysis);
    setCallAnalysis({ ...analysis, emotion, onlyOperator: transcriptRef.current?.length > 0 && !callerLines?.length });
  };

  const handleFinalTranscript = (text, speaker, meta = {}) => {
    addTranscriptEntry(text, speaker, speaker === 'Operador' ? 'operator' : 'caller', meta?.volume || 0);
    setLiveText('');
    analyzeCall();
  };

  // Llenado en vivo mientras la persona habla (máximo ~3 veces por segundo)
  const handleInterimTranscript = (text, speaker, meta = {}) => {
    setLiveText(text);
    const now = Date.now();
    if (now - lastInterimRef.current < 350) return;
    lastInterimRef.current = now;
    analyzeCall(text, meta?.volume || 0);
  };

  const handleListeningChange = useCallback((listening) => setIsListening(listening), []);

  const handleCallerInfoChange = (newInfo) => {
    // Si el operador edita un campo a mano, la voz ya no lo reemplaza
    ['name', 'phone', 'address', 'additionalInfo'].forEach((field) => {
      if (newInfo?.[field] !== callerInfo?.[field]) autoFieldsRef.current.delete(field);
    });
    if (newInfo?.address !== callerInfo?.address) setAddressIsAuto(false);
    setCallerInfo(newInfo);
  };

  const handleCreateTicket = () => {
    const responsesText = questionResponses
      ?.map((r) => `${r?.question} ${r?.answer}`)
      ?.join('\n');
    const created = createIncident({
      type: classification?.type,
      priority: classification?.priority || 'medium',
      address: callerInfo?.address,
      caller: { name: callerInfo?.name, phone: callerInfo?.phone },
      description: [callerInfo?.additionalInfo, ...keyFacts, responsesText]?.filter(Boolean)?.join('\n'),
      transcript: transcriptRef.current,
      historyNote: 'Ticket creado desde llamada',
    }, user);
    setTicketId(created?.id);
  };

  const handleDispatchResources = (resourceType) => {
    if (ticket?.status === 'open') {
      changeStatus(ticket?.id, 'in-progress', user, `Despachada: ${DISPATCH_LABELS?.[resourceType] || resourceType}`);
    }
  };

  const handleTransferCall = (transferData) => {
    addTranscriptEntry(`Llamada transferida a ${transferData?.target}`, 'Sistema', 'operator');
  };

  const handleEmergencyDetected = (analysis) => {
    setClassification({
      ...classification,
      type: analysis?.emergencyType,
      priority: analysis?.priority,
      aiConfidence: analysis?.confidence,
      aiSuggestion: getEmergencyType(analysis?.emergencyType)?.label,
      estimatedUnits: analysis?.recommendedUnits,
      estimatedTime: analysis?.estimatedResponseTime
    });
  };

  const handleAIQuestionGenerated = (question) => {
    addTranscriptEntry(question, 'IA Asistente', 'ai');
  };

  const resetCall = () => {
    transcriptRef.current = [];
    autoFieldsRef.current = new Set();
    setTranscript([]);
    setCallerInfo(EMPTY_CALLER);
    setAddressIsAuto(false);
    setClassification(EMPTY_CLASSIFICATION);
    setQuestionResponses([]);
    setLocation(null);
    setKeyFacts([]);
    setTicketId(null);
    setCallAnalysis(null);
    setLiveText('');
    setCallDuration(0);
    setCallStatus('active');
  };

  const handleAcceptIncomingCall = (call) => {
    resetCall();
    setActiveCall(call);
    setViewMode('active-call');
    setCallerInfo({ ...EMPTY_CALLER, phone: call?.callerNumber, address: call?.location });
    if (call?.aiPrediction) {
      setClassification({
        ...EMPTY_CLASSIFICATION,
        type: call?.aiPrediction?.type,
        priority: call?.aiPrediction?.urgencyLevel,
        aiConfidence: call?.aiPrediction?.confidence,
        aiSuggestion: getEmergencyType(call?.aiPrediction?.type)?.label,
      });
    }
  };

  const handleCompleteCall = () => {
    setCallStatus('completed');
  };

  const handleEndCall = () => {
    if (window.confirm('¿Está seguro de que desea finalizar la llamada?')) {
      setCallStatus('ended');
      navigate('/emergency-dashboard');
    }
  };

  const missingFields = [
    !classification?.type && 'tipo de emergencia',
    !callerInfo?.address?.trim() && 'dirección',
  ]?.filter(Boolean);

  const ticketPanel = (
    <TicketPanel
      ticket={ticket}
      canCreate={missingFields?.length === 0}
      missingFields={missingFields}
      onCreate={handleCreateTicket}
      user={user}
      onChangeStatus={(id, status, note) => changeStatus(id, status, user, note)}
      onFinalize={(id, result, notes) => finalizeIncident(id, result, notes, user)}
    />
  );

  const microphone = (
    <MicrophoneTranscriber
      onFinalTranscript={handleFinalTranscript}
      onInterimTranscript={handleInterimTranscript}
      onListeningChange={handleListeningChange}
    />
  );

  const renderViewContent = () => {
    switch (viewMode) {
      case 'queue':
        return (
          <div className="space-y-6">
            <IncomingCallsQueue
              onAcceptCall={handleAcceptIncomingCall}
              onRejectCall={() => {}}
            />
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIVirtualAssistant
              callTranscript={transcript}
              onEmergencyDetected={handleEmergencyDetected}
              onQuestionGenerated={handleAIQuestionGenerated}
              isActive={aiAssistantActive}
            />

            <div className="space-y-6">
              <EmergencyProtocolGuide
                emergencyType={classification?.type}
                currentStep={0}
                onStepComplete={() => {}}
              />

              <CallTranscriptArea transcript={transcript} isRecording={isListening} analysis={callAnalysis} liveText={liveText} />
            </div>
          </div>
        );

      case 'active-call':
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Forms and Classification */}
            <div className="xl:col-span-2 space-y-6">
              <CallerInformationForm
                callerInfo={callerInfo}
                onCallerInfoChange={handleCallerInfoChange}
                onLocationValidate={setLocation}
              />

              <EmergencyClassification
                classification={classification}
                onClassificationChange={setClassification}
              />

              {keyFacts?.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                    <Icon name="Sparkles" size={16} />
                    <span>Datos detectados en la llamada</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-foreground">
                    {keyFacts?.map((fact) => <li key={fact}>{fact}</li>)}
                  </ul>
                </div>
              )}

              <GuidedQuestioningPanel
                emergencyType={classification?.type}
                responses={questionResponses}
                onResponseChange={setQuestionResponses}
              />

              <LocationMapping
                location={location}
                onLocationUpdate={setLocation}
                nearbyUnits={[]}
              />
            </div>

            {/* Right Column - Microphone, transcript, ticket and management */}
            <div className="space-y-6">
              {microphone}

              <CallTranscriptArea transcript={transcript} isRecording={isListening} analysis={callAnalysis} liveText={liveText} />

              {ticketPanel}

              <QuickActionButtons
                onDispatchResources={handleDispatchResources}
                onTransferCall={handleTransferCall}
                onCreateIncident={ticket || missingFields?.length ? null : handleCreateTicket}
              />

              <CallManagementPanel
                onTransferCall={handleTransferCall}
                onHoldCall={() => {}}
                onMergeCall={() => {}}
                onCreateConference={() => {}}
                callData={activeCall}
              />

              {/* Call Statistics */}
              <div className="bg-card rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Estadísticas de Llamada</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frases transcritas:</span>
                    <span className="text-foreground">{transcript?.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preguntas respondidas:</span>
                    <span className="text-foreground">{questionResponses?.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confianza de clasificación:</span>
                    <span className="text-foreground">{classification?.aiConfidence}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prioridad asignada:</span>
                    <span className="font-medium text-foreground">{getPriority(classification?.priority)?.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const tabClass = (mode) => `px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
    viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  }`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          {/* Navigation Tabs */}
          <div className="bg-card rounded-lg border border-border p-2 mb-6">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setViewMode('queue')} className={tabClass('queue')}>
                <Icon name="ListOrdered" size={16} />
                <span>Cola de Llamadas</span>
              </button>
              <button onClick={() => setViewMode('active-call')} className={tabClass('active-call')}>
                <Icon name="Phone" size={16} />
                <span>Llamada Activa</span>
              </button>
              <button onClick={() => setViewMode('ai-assistant')} className={tabClass('ai-assistant')}>
                <Icon name="Bot" size={16} />
                <span>Asistente IA</span>
              </button>
            </div>
          </div>

          {/* Call Status Header */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    callStatus === 'active' ? 'bg-success animate-pulse' :
                    callStatus === 'completed' ? 'bg-warning' : 'bg-muted-foreground'
                  }`}></div>
                  <span className="font-medium text-foreground">
                    {callStatus === 'active' ? 'Llamada Activa' :
                     callStatus === 'completed' ? 'Llamada Completada' : 'Llamada Finalizada'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span className="text-sm">Duración: {formatDuration(callDuration)}</span>
                </div>
                {isListening && (
                  <div className="flex items-center space-x-2 text-destructive">
                    <Icon name="Mic" size={16} />
                    <span className="text-sm">Transcribiendo</span>
                  </div>
                )}
                {ticket && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Icon name="Ticket" size={16} />
                    <span className="text-sm">{ticket?.id}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={aiAssistantActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAiAssistantActive(!aiAssistantActive)}
                  iconName="Bot"
                >
                  IA {aiAssistantActive ? 'ON' : 'OFF'}
                </Button>
                <Button variant="outline" size="sm" onClick={resetCall} iconName="RotateCcw">
                  Nueva llamada
                </Button>
                {callStatus === 'active' && (
                  <>
                    <Button variant="success" size="sm" onClick={handleCompleteCall} iconName="Check">
                      Completar Llamada
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleEndCall} iconName="PhoneOff">
                      Finalizar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Content Based on View Mode */}
          {renderViewContent()}
        </div>
      </main>
    </div>
  );
};

export default EmergencyCallIntake;
