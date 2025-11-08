import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Import components
import CallerInformationForm from './components/CallerInformationForm';
import EmergencyClassification from './components/EmergencyClassification';
import GuidedQuestioningPanel from './components/GuidedQuestioningPanel';
import CallTranscriptArea from './components/CallTranscriptArea';
import QuickActionButtons from './components/QuickActionButtons';
import LocationMapping from './components/LocationMapping';

// New imports for enhanced call reception module
import IncomingCallsQueue from './components/IncomingCallsQueue';
import AIVirtualAssistant from './components/AIVirtualAssistant';
import CallManagementPanel from './components/CallManagementPanel';
import EmergencyProtocolGuide from './components/EmergencyProtocolGuide';

const EmergencyCallIntake = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('active-call'); // 'queue', 'active-call', 'ai-assistant'
  const [callStatus, setCallStatus] = useState('active');
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(true);

  // Enhanced state management
  const [activeCall, setActiveCall] = useState(null);
  const [aiAssistantActive, setAiAssistantActive] = useState(true);

  // State for caller information
  const [callerInfo, setCallerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    additionalInfo: '',
    callStatus: 'En línea'
  });

  // State for emergency classification
  const [classification, setClassification] = useState({
    type: '',
    priority: '',
    aiConfidence: 85,
    aiSuggestion: 'Incendio estructural',
    manualOverride: false,
    estimatedUnits: 2,
    estimatedTime: '8-12',
    riskLevel: 'Alto',
    resourcesNeeded: 'Estándar'
  });

  // State for guided questioning
  const [questionResponses, setQuestionResponses] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [location, setLocation] = useState(null);

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

  const handleCallerInfoChange = (newInfo) => {
    setCallerInfo(newInfo);
  };

  const handleClassificationChange = (newClassification) => {
    setClassification(newClassification);
  };

  const handleQuestionResponse = (responses) => {
    setQuestionResponses(responses);
  };

  const handleNextQuestion = (response) => {
    // Add response to transcript
    const newTranscriptEntry = {
      id: transcript?.length + 1,
      timestamp: new Date()?.toLocaleTimeString('es-ES'),
      speaker: 'Llamante',
      message: response?.answer,
      type: 'caller'
    };
    setTranscript([...transcript, newTranscriptEntry]);
  };

  const handleLocationValidate = (locationData) => {
    setLocation(locationData);
  };

  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleDispatchResources = (resourceType) => {
    console.log(`Dispatching ${resourceType}`);
    // Navigate to resource management or show confirmation
  };

  const handleTransferCall = (transferData) => {
    console.log('Transferring call:', transferData);
    // Implement call transfer logic
  };

  const handleHoldCall = (isHold) => {
    console.log('Call hold status:', isHold);
    // Implement call hold logic
  };

  const handleEmergencyDetected = (analysis) => {
    console.log('AI detected emergency:', analysis);
    
    // Update classification based on AI analysis
    setClassification({
      ...classification,
      type: analysis?.emergencyType,
      priority: analysis?.priority,
      aiConfidence: analysis?.confidence,
      aiSuggestion: analysis?.emergencyType,
      estimatedUnits: analysis?.recommendedUnits,
      estimatedTime: analysis?.estimatedResponseTime
    });
  };

  const handleAIQuestionGenerated = (question) => {
    // Add AI question to transcript
    const aiQuestion = {
      id: transcript?.length + 1,
      timestamp: new Date()?.toLocaleTimeString('es-ES'),
      speaker: 'IA Asistente',
      message: question,
      type: 'ai'
    };
    setTranscript([...transcript, aiQuestion]);
  };

  const handleAcceptIncomingCall = (call) => {
    setActiveCall(call);
    setViewMode('active-call');
    setCallStatus('active');
    setCallDuration(0);
    setIsRecording(true);

    // Initialize caller info with incoming call data
    setCallerInfo({
      name: '',
      phone: call?.callerNumber,
      address: call?.location,
      additionalInfo: '',
      callStatus: 'En línea'
    });

    // Set AI prediction as initial classification
    if (call?.aiPrediction) {
      setClassification({
        type: call?.aiPrediction?.type?.toLowerCase(),
        priority: call?.aiPrediction?.urgencyLevel?.toLowerCase(),
        aiConfidence: call?.aiPrediction?.confidence,
        aiSuggestion: call?.aiPrediction?.type,
        manualOverride: false,
        estimatedUnits: 2,
        estimatedTime: '8-12',
        riskLevel: 'Alto',
        resourcesNeeded: 'Estándar'
      });
    }
  };

  const handleRejectIncomingCall = (call) => {
    console.log('Call rejected:', call);
    // Could implement call logging or transfer to voicemail
  };

  const handleCompleteCall = () => {
    setCallStatus('completed');
    setIsRecording(false);
    // Show completion confirmation or navigate
  };

  const handleEndCall = () => {
    if (window.confirm('¿Está seguro de que desea finalizar la llamada?')) {
      setCallStatus('ended');
      setIsRecording(false);
      navigate('/emergency-dashboard');
    }
  };

  const handleCreateIncident = () => {
    // Navigate to incident documentation with current data
    navigate('/incident-documentation', {
      state: {
        callerInfo,
        classification,
        responses: questionResponses,
        location
      }
    });
  };

  const renderViewContent = () => {
    switch (viewMode) {
      case 'queue':
        return (
          <div className="space-y-6">
            <IncomingCallsQueue
              onAcceptCall={handleAcceptIncomingCall}
              onRejectCall={handleRejectIncomingCall}
            />
            
            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" className="text-blue-500" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">3</div>
                    <div className="text-sm text-muted-foreground">En Espera</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" className="text-green-500" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">12</div>
                    <div className="text-sm text-muted-foreground">Atendidas Hoy</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" className="text-yellow-500" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">2:30</div>
                    <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingUp" className="text-primary" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">94%</div>
                    <div className="text-sm text-muted-foreground">Eficiencia IA</div>
                  </div>
                </div>
              </div>
            </div>
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
                onStepComplete={(step) => console.log('Protocol step completed:', step)}
              />
              
              <CallTranscriptArea
                transcript={transcript}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
              />
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
                onLocationValidate={handleLocationValidate}
              />

              <EmergencyClassification
                classification={classification}
                onClassificationChange={handleClassificationChange}
              />

              <GuidedQuestioningPanel
                emergencyType={classification?.type}
                responses={questionResponses}
                onResponseChange={handleQuestionResponse}
                onNextQuestion={handleNextQuestion}
              />

              <LocationMapping
                location={location}
                onLocationUpdate={handleLocationUpdate}
                nearbyUnits={[]}
              />
            </div>

            {/* Right Column - Transcript, AI Assistant, and Management */}
            <div className="space-y-6">
              <CallTranscriptArea
                transcript={transcript}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
              />

              <CallManagementPanel
                onTransferCall={handleTransferCall}
                onHoldCall={handleHoldCall}
                onMergeCall={(callData) => console.log('Merging call:', callData)}
                onCreateConference={(participants) => console.log('Creating conference:', participants)}
                callData={activeCall}
              />

              <QuickActionButtons
                onDispatchResources={handleDispatchResources}
                onTransferCall={handleTransferCall}
                onCreateIncident={handleCreateIncident}
              />

              {/* Call Statistics - enhanced */}
              <div className="bg-card rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Estadísticas de Llamada</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo de respuesta:</span>
                    <span className="text-foreground">12 segundos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preguntas realizadas:</span>
                    <span className="text-foreground">{questionResponses?.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confianza IA:</span>
                    <span className="text-foreground">{classification?.aiConfidence}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prioridad asignada:</span>
                    <span className={`font-medium ${
                      classification?.priority === 'critical' ? 'text-destructive' :
                      classification?.priority === 'high' ? 'text-warning' :
                      classification?.priority === 'medium' ? 'text-primary' : 'text-success'
                    }`}>
                      {classification?.priority === 'critical' ? 'Crítica' :
                       classification?.priority === 'high' ? 'Alta' :
                       classification?.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estado IA:</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${aiAssistantActive ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
                      <span className="text-foreground">{aiAssistantActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />
          
          {/* Enhanced Navigation Tabs */}
          <div className="bg-card rounded-lg border border-border p-2 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('queue')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'queue' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Queue" size={16} />
                <span>Cola de Llamadas</span>
              </button>
              
              <button
                onClick={() => setViewMode('active-call')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'active-call' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Phone" size={16} />
                <span>Llamada Activa</span>
              </button>
              
              <button
                onClick={() => setViewMode('ai-assistant')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'ai-assistant' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Bot" size={16} />
                <span>Asistente IA</span>
              </button>
            </div>
          </div>

          {/* Call Status Header - Enhanced */}
          {callStatus !== 'idle' && (
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Icon name="Calendar" size={16} />
                    <span className="text-sm">
                      {new Date()?.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {activeCall && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Icon name="User" size={16} />
                      <span className="text-sm">{activeCall?.callerNumber}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={aiAssistantActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiAssistantActive(!aiAssistantActive)}
                    iconName="Bot"
                  >
                    IA {aiAssistantActive ? 'ON' : 'OFF'}
                  </Button>
                  
                  {callStatus === 'active' && (
                    <>
                      <Button
                        variant="success"
                        onClick={handleCompleteCall}
                        iconName="Check"
                      >
                        Completar Llamada
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleEndCall}
                        iconName="PhoneOff"
                      >
                        Finalizar
                      </Button>
                    </>
                  )}
                  {callStatus === 'completed' && (
                    <Button
                      variant="default"
                      onClick={() => navigate('/emergency-dashboard')}
                      iconName="ArrowLeft"
                    >
                      Volver al Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Content Based on View Mode */}
          {renderViewContent()}
        </div>
      </main>
    </div>
  );
};

export default EmergencyCallIntake;