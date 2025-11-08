import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { emergencyCallsService } from '../../services/supabaseClient';

// Import all components
import CallerInformationForm from './components/CallerInformationForm';
import EmergencyClassification from './components/EmergencyClassification';
import GuidedQuestioningPanel from './components/GuidedQuestioningPanel';
import CallTranscriptArea from './components/CallTranscriptArea';
import QuickActionButtons from './components/QuickActionButtons';
import LocationMapping from './components/LocationMapping';
import IncomingCallsQueue from './components/IncomingCallsQueue';
import CallManagementPanel from './components/CallManagementPanel';
import EmergencyProtocolGuide from './components/EmergencyProtocolGuide';

const EmergencyCallIntake = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('active-call');
  const [callStatus, setCallStatus] = useState('active');
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

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
    aiConfidence: 0,
    aiSuggestion: '',
    manualOverride: false,
    estimatedUnits: 1,
    estimatedTime: '',
    riskLevel: '',
    resourcesNeeded: ''
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

  // Handler for transcript updates (including auto-fill from voice)
  const handleTranscriptUpdate = (data) => {
    if (data.transcript) {
      setTranscript(data.transcript);
    }

    // Auto-fill caller info from voice recognition
    if (data.name || data.phone || data.address) {
      setCallerInfo(prev => ({
        ...prev,
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address })
      }));
    }
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

  const handleToggleRecording = (recording) => {
    setIsRecording(recording);
  };

  const handleDispatchResources = async (resourceType) => {
    console.log(`Dispatching ${resourceType}`);
    alert(`🚒 Despachando recursos: ${resourceType}`);
  };

  const handleTransferCall = (transferData) => {
    console.log('Transferring call:', transferData);
    alert(`📞 Transfiriendo llamada a: ${transferData.label}`);
  };

  const handleHoldCall = (isHold) => {
    console.log('Call hold status:', isHold);
    setCallerInfo(prev => ({
      ...prev,
      callStatus: isHold ? 'En espera' : 'En línea'
    }));
  };

  const handleAcceptIncomingCall = (call) => {
    setActiveCall(call);
    setViewMode('active-call');
    setCallStatus('active');
    setCallDuration(0);
    setIsRecording(false);

    setCallerInfo({
      name: '',
      phone: call?.callerNumber,
      address: call?.location,
      additionalInfo: '',
      callStatus: 'En línea'
    });

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
  };

  const handleCompleteCall = async () => {
    setCallStatus('completed');
    setIsRecording(false);

    // Save to Supabase
    try {
      const callData = {
        callerName: callerInfo.name,
        callerPhone: callerInfo.phone,
        callerAddress: callerInfo.address,
        emergencyType: classification.type,
        priority: classification.priority,
        description: callerInfo.additionalInfo,
        transcript: transcript,
        locationLat: location?.lat,
        locationLng: location?.lng,
        status: 'completed'
      };

      const savedCall = await emergencyCallsService.createCall(callData);
      setCurrentCallId(savedCall.id);
      alert('✅ Llamada guardada exitosamente en la base de datos');
    } catch (error) {
      console.error('Error saving call:', error);
      alert('⚠️ Error al guardar la llamada');
    }
  };

  const handleEndCall = () => {
    if (window.confirm('¿Está seguro de que desea finalizar la llamada?')) {
      setCallStatus('ended');
      setIsRecording(false);
      navigate('/login');
    }
  };

  const handleCreateIncident = () => {
    navigate('/incident-documentation', {
      state: {
        callerInfo,
        classification,
        responses: questionResponses,
        location,
        transcript
      }
    });
  };

  // Prepare data for PDF generation
  const getPDFData = () => {
    return {
      id: currentCallId || Date.now(),
      callerName: callerInfo.name,
      callerPhone: callerInfo.phone,
      callerAddress: callerInfo.address,
      emergencyType: classification.type,
      priority: classification.priority,
      status: callStatus,
      riskLevel: classification.riskLevel,
      description: callerInfo.additionalInfo,
      transcript: transcript,
      locationLat: location?.lat,
      locationLng: location?.lng,
      resourcesDispatched: `${classification.estimatedUnits} unidades`
    };
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
            <EmergencyProtocolGuide
              emergencyType={classification?.type}
              currentStep={0}
              onStepComplete={(step) => console.log('Protocol step completed:', step)}
            />

            <div className="space-y-6">
              <CallTranscriptArea
                transcript={transcript}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                onTranscriptUpdate={handleTranscriptUpdate}
              />

              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Información Auto-completada
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="text-foreground font-medium">{callerInfo.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="text-foreground font-medium">{callerInfo.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección:</span>
                    <span className="text-foreground font-medium">{callerInfo.address || '-'}</span>
                  </div>
                </div>
              </div>
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
                nearbyUnits={[
                  { name: 'Unidad 1', distance: '2.3 km' },
                  { name: 'Unidad 3', distance: '3.8 km' }
                ]}
              />
            </div>

            {/* Right Column - Transcript, Management and Actions */}
            <div className="space-y-6">
              <CallTranscriptArea
                transcript={transcript}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                onTranscriptUpdate={handleTranscriptUpdate}
              />

              <CallManagementPanel
                onTransferCall={handleTransferCall}
                onHoldCall={handleHoldCall}
                onMergeCall={(callData) => console.log('Merging call:', callData)}
                onCreateConference={(participants) => console.log('Creating conference:', participants)}
                callData={activeCall}
              />

              <QuickActionButtons
                callData={getPDFData()}
                onDispatchResources={handleDispatchResources}
                onTransferCall={handleTransferCall}
                onCreateIncident={handleCreateIncident}
              />
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

          {/* Navigation Tabs */}
          <div className="bg-card rounded-lg border border-border p-2 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('queue')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'queue' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>📋 Cola de Llamadas</span>
              </button>

              <button
                onClick={() => setViewMode('active-call')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'active-call' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>📞 Llamada Activa</span>
              </button>

              <button
                onClick={() => setViewMode('ai-assistant')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'ai-assistant' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>🤖 Asistente IA</span>
              </button>
            </div>
          </div>

          {/* Call Status Header */}
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
                </div>

                <div className="flex items-center space-x-2">
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
                      onClick={() => navigate('/login')}
                      iconName="ArrowLeft"
                    >
                      Volver al Login
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
