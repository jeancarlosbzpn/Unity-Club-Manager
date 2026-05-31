import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Play, Square, Check, X, Trash2, Edit2, 
  ChevronRight, ChevronDown, Award, Users, RefreshCw, Clock, 
  FileText, Save, ArrowRight, ArrowLeft, ToggleLeft, ToggleRight,
  AlertCircle
} from 'lucide-react';

const BiblicalConnectionAdmin = ({
  sessions = [],
  responses = [],
  members = [],
  currentUser,
  onSaveSession,
  onDeleteSession,
  onUpdateSessionStatus,
  onGradeManualResponse,
  onConsolidatePoints
}) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'monitor'
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Create / Edit Session Form States
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    activeModuleIndex: 0,
    modules: [
      {
        id: 'mod_' + Date.now(),
        title: 'Módulo 1',
        questions: []
      }
    ]
  });

  const [activeFormTab, setActiveFormTab] = useState('general'); // 'general' | 'modules'
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);

  // Live Monitor States
  const [monitorSession, setMonitorSession] = useState(null);
  const [monitorTab, setMonitorTab] = useState('progress'); // 'progress' | 'grading' | 'ranking'

  // Consolidation Merit States
  const [consolidationPoints, setConsolidationPoints] = useState({});
  const [isConsolidating, setIsConsolidating] = useState(false);

  // Initialize consolidation points when session becomes completed
  useEffect(() => {
    if (monitorSession && (monitorSession.status === 'completed' || monitorSession.status === 'active')) {
      const activeResponses = responses.filter(r => r.sessionId === monitorSession.id);
      const initialPts = {};
      activeResponses.forEach(r => {
        initialPts[r.memberId] = r.status === 'disqualified' ? 0 : (r.score || 0);
      });
      setConsolidationPoints(initialPts);
    }
  }, [monitorSession?.id, monitorSession?.status, responses]);

  // Participant Selection States
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedSessionForActive, setSelectedSessionForActive] = useState(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const [unitFilter, setUnitFilter] = useState('all');
  const [isRepeatingMode, setIsRepeatingMode] = useState(false);

  // Filter list states
  const [listFilter, setListFilter] = useState('all'); // 'all' | 'active' | 'draft' | 'completed'

  // Open / Close Form Helpers
  const handleNewSession = () => {
    setSessionFormData({
      title: '',
      description: '',
      status: 'draft',
      activeModuleIndex: 0,
      modules: [
        {
          id: 'mod_' + Date.now(),
          title: 'Módulo 1',
          questions: []
        }
      ]
    });
    setEditingSessionId(null);
    setActiveFormTab('general');
    setActiveTab('create');
    if (sessionFormData.modules.length > 0) {
      setExpandedModuleId(sessionFormData.modules[0].id);
    }
  };

  const handleEditSession = (session) => {
    setSessionFormData({
      title: session.title || '',
      description: session.description || '',
      status: session.status || 'draft',
      activeModuleIndex: session.activeModuleIndex || 0,
      modules: session.modules ? JSON.parse(JSON.stringify(session.modules)) : []
    });
    setEditingSessionId(session.id);
    setActiveFormTab('general');
    setActiveTab('create');
    if (session.modules && session.modules.length > 0) {
      setExpandedModuleId(session.modules[0].id);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionFormData.title.trim()) {
      alert('Por favor introduce un título para la sesión.');
      return;
    }

    // Validation: Check that every module has at least one question
    for (let i = 0; i < sessionFormData.modules.length; i++) {
      const mod = sessionFormData.modules[i];
      if (mod.questions.length === 0) {
        alert(`El módulo "${mod.title}" no tiene preguntas. Añade al menos una pregunta.`);
        return;
      }
    }

    const sessionData = {
      ...sessionFormData,
      id: editingSessionId || 'sess_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrador'
    };

    await onSaveSession(sessionData);
    setActiveTab('list');
  };

  // Module and Question Management inside Form
  const handleAddModule = () => {
    const newModId = 'mod_' + Date.now();
    const newModule = {
      id: newModId,
      title: `Módulo ${sessionFormData.modules.length + 1}`,
      questions: []
    };
    setSessionFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    setExpandedModuleId(newModId);
  };

  const handleRemoveModule = (modId) => {
    if (sessionFormData.modules.length === 1) {
      alert('La sesión debe tener al menos un módulo.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este módulo y todas sus preguntas?')) {
      setSessionFormData(prev => ({
        ...prev,
        modules: prev.modules.filter(m => m.id !== modId)
      }));
    }
  };

  const handleUpdateModuleTitle = (modId, newTitle) => {
    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === modId ? { ...m, title: newTitle } : m)
    }));
  };

  const handleAddQuestion = (modId, type) => {
    const newQuestion = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type,
      questionText: '',
      hint: '',
      correctAnswer: type === 'true_false' ? true : '',
      options: type === 'select' ? ['', ''] : undefined
    };

    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            questions: [...m.questions, newQuestion]
          };
        }
        return m;
      })
    }));
  };

  const handleRemoveQuestion = (modId, qId) => {
    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            questions: m.questions.filter(q => q.id !== qId)
          };
        }
        return m;
      })
    }));
  };

  const handleUpdateQuestion = (modId, qId, fields) => {
    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            questions: m.questions.map(q => q.id === qId ? { ...q, ...fields } : q)
          };
        }
        return m;
      })
    }));
  };

  // Select Option Helper
  const handleUpdateSelectOption = (modId, qId, optIndex, val) => {
    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            questions: m.questions.map(q => {
              if (q.id === qId) {
                const newOpts = [...(q.options || [])];
                newOpts[optIndex] = val;
                return { ...q, options: newOpts };
              }
              return q;
            })
          };
        }
        return m;
      })
    }));
  };

  const handleAddSelectOption = (modId, qId) => {
    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            questions: m.questions.map(q => {
              if (q.id === qId) {
                return { ...q, options: [...(q.options || []), ''] };
              }
              return q;
            })
          };
        }
        return m;
      })
    }));
  };

  const handleRemoveSelectOption = (modId, qId, optIndex) => {
    setSessionFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            questions: m.questions.map(q => {
              if (q.id === qId) {
                const opts = q.options || [];
                if (opts.length <= 2) {
                  alert('Una pregunta de selección debe tener al menos dos opciones.');
                  return q;
                }
                const newOpts = opts.filter((_, idx) => idx !== optIndex);
                // Reset correct answer if it was the deleted one
                let correct = q.correctAnswer;
                if (correct === opts[optIndex]) correct = '';
                return { ...q, options: newOpts, correctAnswer: correct };
              }
              return q;
            })
          };
        }
        return m;
      })
    }));
  };

  // Monitor Live Actions
  const handleStartMonitor = (session) => {
    setMonitorSession(session);
    setMonitorTab('progress');
    setActiveTab('monitor');
  };

  const handleStartSession = (session) => {
    setSelectedSessionForActive(session);
    setIsRepeatingMode(false);
    // Seleccionar por defecto a todos los miembros no exentos de puntuación
    const initialParticipants = members.filter(m => !m.isExemptFromPoints && !m.exemptFromScoring).map(m => m.id);
    setSelectedParticipantIds(initialParticipants);
    setUnitFilter('all');
    setShowParticipantsModal(true);
  };

  const handleRepeatSession = (session) => {
    setSelectedSessionForActive(session);
    setIsRepeatingMode(true);
    
    const sessionResponses = responses.filter(r => r.sessionId === session.id);
    const previousParticipantIds = session.participantIds ? new Set(session.participantIds.map(String)) : null;
    
    // Filtrar miembros que cumplen con los criterios de repetición
    const targetMembers = members.filter(m => {
      if (m.isExemptFromPoints || m.exemptFromScoring) return false;
      
      const mIdStr = String(m.id);
      const resp = sessionResponses.find(r => String(r.memberId) === mIdStr);
      
      const isDisqualified = resp && resp.status === 'disqualified';
      const isNotSelected = previousParticipantIds ? !previousParticipantIds.has(mIdStr) : false;
      const didNotParticipate = !resp || resp.status === 'not_joined';
      
      return isDisqualified || isNotSelected || didNotParticipate;
    });
    
    setSelectedParticipantIds(targetMembers.map(m => m.id));
    setUnitFilter('all');
    setShowParticipantsModal(true);
  };

  const handleConfirmStartSession = async () => {
    if (selectedParticipantIds.length === 0) {
      alert('Debes seleccionar al menos a un miembro participante para poder iniciar la competencia.');
      return;
    }

    await onUpdateSessionStatus(selectedSessionForActive.id, { 
      status: 'active', 
      activeModuleIndex: 0,
      participantIds: selectedParticipantIds,
      isConsolidated: false
    });

    // Update local state if monitoring
    if (monitorSession && monitorSession.id === selectedSessionForActive.id) {
      setMonitorSession(prev => ({ 
        ...prev, 
        status: 'active', 
        activeModuleIndex: 0,
        participantIds: selectedParticipantIds,
        isConsolidated: false
      }));
    }

    setShowParticipantsModal(false);
    handleStartMonitor(selectedSessionForActive);
  };

  const handleNextModule = async () => {
    const nextIdx = monitorSession.activeModuleIndex + 1;
    if (nextIdx >= monitorSession.modules.length) {
      alert('Ya estás en el último módulo.');
      return;
    }
    
    const nextModName = monitorSession.modules[nextIdx].title;
    if (confirm(`¿Deseas avanzar al siguiente módulo: "${nextModName}"? Esto desbloqueará la pantalla de todos los participantes.`)) {
      await onUpdateSessionStatus(monitorSession.id, { activeModuleIndex: nextIdx });
      setMonitorSession(prev => ({ ...prev, activeModuleIndex: nextIdx }));
    }
  };

  const handleFinishSession = async () => {
    if (confirm('¿Estás seguro de finalizar el concurso? Esto cerrará la sesión de forma definitiva y mostrará los resultados finales a todos.')) {
      await onUpdateSessionStatus(monitorSession.id, { status: 'completed' });
      setMonitorSession(prev => ({ ...prev, status: 'completed' }));
      setActiveTab('list');
    }
  };

  // List filter helper
  const filteredSessions = sessions.filter(s => {
    if (listFilter === 'all') return true;
    return s.status === listFilter;
  });

  // Derived Monitor Data
  const activeSessionResponses = monitorSession 
    ? responses.filter(r => r.sessionId === monitorSession.id) 
    : [];

  const totalRegisteredMembers = activeSessionResponses.length;
  
  // Count how many have finished the CURRENT active module
  const currentModIndex = monitorSession?.activeModuleIndex ?? 0;
  const finishedCurrentModuleCount = activeSessionResponses.filter(r => 
    r.currentModuleIndex >= currentModIndex || r.status === 'completed'
  ).length;

  // Manual responses to grade
  const manualQuestionsToGrade = [];
  if (monitorSession) {
    activeSessionResponses.forEach(resp => {
      const memberId = resp.memberId;
      const memberName = resp.memberName || 'Miembro';
      const unitName = resp.unitName || 'Sin Unidad';
      
      Object.entries(resp.answers || {}).forEach(([qId, ans]) => {
        if (ans.isCorrect === null) {
          // Find question definition
          let qText = 'Pregunta';
          let mTitle = 'Módulo';
          
          monitorSession.modules.forEach(m => {
            m.questions.forEach(q => {
              if (q.id === qId) {
                qText = q.questionText;
                mTitle = m.title;
              }
            });
          });
          
          manualQuestionsToGrade.push({
            responseId: resp.id,
            memberId,
            memberName,
            unitName,
            questionId: qId,
            questionText: qText,
            moduleTitle: mTitle,
            userResponse: ans.userResponse
          });
        }
      });
    });
  }

  // Live Leaderboard calculation
  const liveLeaderboard = React.useMemo(() => {
    if (!monitorSession) return [];

    const participantIds = monitorSession.participantIds || [];
    let leaderboardData = [];

    if (participantIds.length > 0) {
      leaderboardData = participantIds.map(pId => {
        const existingResponse = activeSessionResponses.find(r => String(r.memberId) === String(pId));
        const memberObj = members.find(m => String(m.id) === String(pId));

        if (existingResponse) {
          return {
            ...existingResponse,
            status: existingResponse.status || 'joined'
          };
        } else {
          // Resolver el nombre de la unidad si tiene unitId
          const uName = memberObj?.unitId || 'Sin Unidad';
          
          return {
            id: `temp_${pId}`,
            memberId: pId,
            memberName: memberObj ? `${memberObj.firstName} ${memberObj.lastName}` : 'Miembro',
            unitName: uName,
            score: 0,
            totalCorrect: 0,
            totalManualCorrect: 0,
            currentModuleIndex: -1,
            status: 'not_joined',
            timeSpent: 999999
          };
        }
      });
    } else {
      leaderboardData = activeSessionResponses.map(r => ({
        ...r,
        status: r.status || 'joined'
      }));
    }

    return leaderboardData.sort((a, b) => {
      // 1. Mayor puntuación acumulada
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;

      // 2. Mayor número de aciertos (correctas automáticas + manuales)
      const correctA = (a.totalCorrect || 0) + (a.totalManualCorrect || 0);
      const correctB = (b.totalCorrect || 0) + (b.totalManualCorrect || 0);
      if (correctB !== correctA) return correctB - correctA;

      // 3. Menor tiempo empleado en responder
      const timeSpentA = a.timeSpent || (a.completedAt && a.startedAt ? (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / 1000 : 999999);
      const timeSpentB = b.timeSpent || (b.completedAt && b.startedAt ? (new Date(b.completedAt).getTime() - new Date(b.startedAt).getTime()) / 1000 : 999999);
      return timeSpentA - timeSpentB;
    });
  }, [monitorSession, activeSessionResponses, members]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-red-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Conexión Bíblica
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Panel de Control de Concursos del Club
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'list' && (
          <button
            onClick={handleNewSession}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/10 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Concurso</span>
          </button>
        )}
      </div>

      {/* VIEW: SESSION LIST */}
      {activeTab === 'list' && (
        <div>
          {/* Filters Bar */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Activos' },
              { id: 'draft', label: 'Borradores' },
              { id: 'completed', label: 'Completados' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setListFilter(f.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  listFilter === f.id
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-amber-400'
                    : 'text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No hay sesiones en esta categoría</h3>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm mb-6">
                Comienza creando una nueva sesión de Conexión Bíblica con módulos de preguntas para tus miembros.
              </p>
              <button
                onClick={handleNewSession}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition"
              >
                Crear primera sesión
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map(s => {
                const totalQuestions = s.modules?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0;
                
                return (
                  <div 
                    key={s.id}
                    className="relative flex flex-col justify-between p-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-300 group"
                  >
                    <div>
                      {/* Status badge */}
                      <div className="flex justify-between items-center mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          s.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                            : s.status === 'completed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 ring-1 ring-amber-500/20'
                        }`}>
                          {s.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                          {s.status === 'active' ? 'En Curso' : s.status === 'completed' ? 'Completado' : 'Borrador'}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSession(s)}
                            title="Editar"
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el concurso "${s.title}"? Esta acción no se puede deshacer.`)) {
                                onDeleteSession(s.id);
                              }
                            }}
                            title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                        {s.description || 'Sin descripción.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {s.modules?.length || 0} {s.modules?.length === 1 ? 'Módulo' : 'Módulos'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {totalQuestions} {totalQuestions === 1 ? 'Pregunta' : 'Preguntas'}
                        </span>
                      </div>

                      {s.status === 'active' ? (
                        <button
                          onClick={() => handleStartMonitor(s)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-600/10"
                        >
                          <Play className="w-4 h-4" />
                          <span>Monitorear En Vivo</span>
                        </button>
                      ) : s.status === 'completed' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartMonitor(s)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition"
                          >
                            <Award className="w-4 h-4" />
                            <span>Resultados</span>
                          </button>
                          <button
                            onClick={() => handleRepeatSession(s)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-amber-500/10"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Repetir</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartSession(s)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-sm font-semibold rounded-xl transition"
                        >
                          <Play className="w-4 h-4" />
                          <span>Iniciar Concurso</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: CREATE / EDIT SESSION FORM */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-100 dark:shadow-none">
          {/* Form Header */}
          <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
            <div>
              <h2 className="text-xl font-bold">
                {editingSessionId ? 'Editar Concurso' : 'Nuevo Concurso'}
              </h2>
              <p className="text-xs text-slate-400">Diseña las secciones, preguntas y temas del concurso</p>
            </div>
            <button
              onClick={() => setActiveTab('list')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6">
            <button
              onClick={() => setActiveFormTab('general')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition ${
                activeFormTab === 'general'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              1. Datos Generales
            </button>
            <button
              onClick={() => setActiveFormTab('modules')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition ${
                activeFormTab === 'modules'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              2. Temas y Preguntas ({sessionFormData.modules.length})
            </button>
          </div>

          {/* Form Body */}
          <div className="p-8">
            
            {/* SUB-VIEW: GENERAL SETTINGS */}
            {activeFormTab === 'general' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                    Título del Concurso
                  </label>
                  <input
                    type="text"
                    value={sessionFormData.title}
                    onChange={(e) => setSessionFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Conexión Bíblica: Libro de Esdras"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                    Instrucciones / Descripción (Opcional)
                  </label>
                  <textarea
                    rows="4"
                    value={sessionFormData.description}
                    onChange={(e) => setSessionFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe los capítulos a evaluar, libros del espíritu de profecía y reglas generales..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white transition"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setActiveFormTab('modules')}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-750 dark:hover:bg-slate-700 text-white font-semibold rounded-xl transition"
                  >
                    <span>Configurar Preguntas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-VIEW: MODULES & QUESTIONS BUILDER */}
            {activeFormTab === 'modules' && (
              <div className="space-y-6">
                
                {/* Modules Sidebar / List */}
                <div className="flex flex-col gap-6">
                  {sessionFormData.modules.map((mod, modIdx) => {
                    const isExpanded = expandedModuleId === mod.id;
                    
                    return (
                      <div 
                        key={mod.id}
                        className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/30"
                      >
                        {/* Module Header Accordion */}
                        <div 
                          className="flex justify-between items-center px-6 py-4 bg-slate-100 dark:bg-slate-800/40 cursor-pointer"
                          onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-7 h-7 flex items-center justify-center bg-slate-200 dark:bg-slate-800 rounded-full font-bold text-xs">
                              {modIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={mod.title}
                              onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                              onChange={(e) => handleUpdateModuleTitle(mod.id, e.target.value)}
                              placeholder="Título del Módulo (ej. Capítulo 1)"
                              className="bg-transparent font-bold border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 px-2 py-1 outline-none text-slate-800 dark:text-white rounded"
                            />
                            <span className="text-xs text-slate-400 font-medium">
                              ({mod.questions.length} {mod.questions.length === 1 ? 'pregunta' : 'preguntas'})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveModule(mod.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                              title="Eliminar Módulo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Module Questions Accordion Content */}
                        {isExpanded && (
                          <div className="p-6 bg-white dark:bg-slate-800/10 space-y-6">
                            
                            {/* Question list */}
                            {mod.questions.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-6">
                                Aún no has agregado preguntas a este módulo. ¡Elige un tipo abajo!
                              </p>
                            ) : (
                              <div className="space-y-6">
                                {mod.questions.map((q, qIdx) => (
                                  <div 
                                    key={q.id}
                                    className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl relative group/q"
                                  >
                                    {/* Question Type and Header */}
                                    <div className="flex justify-between items-center mb-4">
                                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                        Pregunta {qIdx + 1} — {
                                          q.type === 'select' ? 'Selección Múltiple' :
                                          q.type === 'true_false' ? 'Verdadero / Falso' :
                                          q.type === 'complete' ? 'Completar' : 'Respuesta Abierta'
                                        }
                                      </span>
                                      
                                      <button
                                        onClick={() => handleRemoveQuestion(mod.id, q.id)}
                                        className="text-slate-300 hover:text-red-500 transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                        title="Eliminar Pregunta"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Question Text */}
                                    <div className="grid gap-4">
                                      <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">
                                          Enunciado / Pregunta
                                        </label>
                                        <input
                                          type="text"
                                          value={q.questionText}
                                          onChange={(e) => handleUpdateQuestion(mod.id, q.id, { questionText: e.target.value })}
                                          placeholder={
                                            q.type === 'complete' 
                                              ? "Ej. Lámpara es a mis pies tu ___ y lumbrera a mi camino (Usa ___ para el espacio)"
                                              : "Ej. ¿Quién fue lanzado al foso de los leones?"
                                          }
                                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 dark:text-white"
                                        />
                                      </div>

                                      {/* RENDER DYNAMIC FIELDS BASED ON TYPE */}
                                      
                                      {/* Type: SELECT (Options & Correct) */}
                                      {q.type === 'select' && (
                                        <div className="space-y-3">
                                          <label className="block text-xs font-bold text-slate-400">
                                            Opciones de Respuesta (Marca la correcta)
                                          </label>
                                          
                                          <div className="grid md:grid-cols-2 gap-3">
                                            {(q.options || []).map((opt, optIdx) => {
                                              const isCorrect = q.correctAnswer === opt && opt !== '';
                                              
                                              return (
                                                <div 
                                                  key={optIdx}
                                                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800/80"
                                                >
                                                  <button
                                                    onClick={() => handleUpdateQuestion(mod.id, q.id, { correctAnswer: opt })}
                                                    className={`w-6 h-6 flex items-center justify-center rounded-full transition ${
                                                      isCorrect 
                                                        ? 'bg-emerald-500 text-white' 
                                                        : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                                                    }`}
                                                  >
                                                    {isCorrect && <Check className="w-3.5 h-3.5" />}
                                                  </button>
                                                  
                                                  <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleUpdateSelectOption(mod.id, q.id, optIdx, e.target.value)}
                                                    placeholder={`Opción ${optIdx + 1}`}
                                                    className="bg-transparent flex-1 outline-none text-sm text-slate-900 dark:text-white font-medium"
                                                  />

                                                  <button
                                                    onClick={() => handleRemoveSelectOption(mod.id, q.id, optIdx)}
                                                    className="text-slate-400 hover:text-red-500 p-1"
                                                  >
                                                    <X className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>

                                          <button
                                            onClick={() => handleAddSelectOption(mod.id, q.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 transition"
                                          >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Añadir Opción</span>
                                          </button>
                                        </div>
                                      )}

                                      {/* Type: TRUE / FALSE */}
                                      {q.type === 'true_false' && (
                                        <div>
                                          <label className="block text-xs font-bold text-slate-400 mb-2">
                                            Respuesta Correcta
                                          </label>
                                          <div className="flex gap-4">
                                            <button
                                              onClick={() => handleUpdateQuestion(mod.id, q.id, { correctAnswer: true })}
                                              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${
                                                q.correctAnswer === true
                                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
                                              }`}
                                            >
                                              Verdadero
                                            </button>
                                            <button
                                              onClick={() => handleUpdateQuestion(mod.id, q.id, { correctAnswer: false })}
                                              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${
                                                q.correctAnswer === false
                                                  ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
                                              }`}
                                            >
                                              Falso
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Type: COMPLETE (Correct answer text) */}
                                      {q.type === 'complete' && (
                                        <div>
                                          <label className="block text-xs font-bold text-slate-400 mb-1">
                                            Palabra(s) Correcta(s) para rellenar
                                          </label>
                                          <input
                                            type="text"
                                            value={q.correctAnswer}
                                            onChange={(e) => handleUpdateQuestion(mod.id, q.id, { correctAnswer: e.target.value })}
                                            placeholder="Palabra exacta, ej: palabra (no importa mayúsculas/acentos al evaluar)"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 dark:text-white"
                                          />
                                        </div>
                                      )}

                                      {/* Type: OPEN (No auto-grading, only dynamic label) */}
                                      {q.type === 'open' && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/20 text-amber-850 dark:text-amber-400 text-xs rounded-xl flex items-center gap-2">
                                          <Award className="w-4 h-4" />
                                          <span>
                                            Esta pregunta requiere respuesta escrita abierta. Se calificará **manualmente** por ti en la consola en vivo.
                                          </span>
                                        </div>
                                      )}

                                      {/* Question Hint (Cita bíblica, etc.) */}
                                      <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">
                                          Pista o Referencia Bíblica (Opcional)
                                        </label>
                                        <input
                                          type="text"
                                          value={q.hint || ''}
                                          onChange={(e) => handleUpdateQuestion(mod.id, q.id, { hint: e.target.value })}
                                          placeholder="Ej. Esdras 7:10"
                                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 dark:text-white"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Actions to add questions */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-2 justify-center">
                              {[
                                { type: 'select', label: 'Selecciona' },
                                { type: 'true_false', label: 'Verdadero / Falso' },
                                { type: 'complete', label: 'Completa' },
                                { type: 'open', label: 'Contesta (Abierta)' }
                              ].map(btn => (
                                <button
                                  key={btn.type}
                                  onClick={() => handleAddQuestion(mod.id, btn.type)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>{btn.label}</span>
                                </button>
                              ))}
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-800 gap-4">
                  <button
                    onClick={handleAddModule}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-slate-300 hover:border-amber-500 text-slate-500 hover:text-amber-500 dark:border-slate-700 dark:hover:border-amber-500 font-bold rounded-2xl transition w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Añadir Tema/Módulo</span>
                  </button>

                  <div className="flex gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveFormTab('general')}
                      className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-750 dark:hover:bg-slate-800 rounded-xl font-semibold transition flex-1 sm:flex-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Volver</span>
                    </button>
                    
                    <button
                      onClick={handleSaveSession}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold rounded-xl transition shadow-lg shadow-red-500/10 flex-1 sm:flex-none"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Concurso</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW: LIVE MONITOR & MONITOR ACTIONS */}
      {activeTab === 'monitor' && monitorSession && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-100 dark:shadow-none">
          {/* Monitor Header */}
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:justify-between md:items-center gap-6 bg-slate-50 dark:bg-slate-800/40">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  monitorSession.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {monitorSession.status === 'active' ? 'Concurso Activo' : 'Concurso Finalizado'}
                </span>
              </div>
              <h2 className="text-2xl font-black">{monitorSession.title}</h2>
              <p className="text-xs text-slate-400">
                Creado por {monitorSession.createdBy} • {monitorSession.modules?.length} Módulos en total
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {monitorSession.status === 'active' && (
                <>
                  <button
                    onClick={handleNextModule}
                    disabled={monitorSession.activeModuleIndex >= monitorSession.modules.length - 1}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-650 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Habilitar Sig. Módulo</span>
                  </button>

                  <button
                    onClick={handleFinishSession}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-red-600/10"
                  >
                    <Square className="w-4 h-4 animate-pulse" />
                    <span>Finalizar Concurso</span>
                  </button>
                </>
              )}
              
              <button
                onClick={() => setActiveTab('list')}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:hover:bg-slate-750 text-sm font-semibold rounded-xl transition"
              >
                <span>Salir del Monitor</span>
              </button>
            </div>
          </div>

          {/* Monitor Status Subbar */}
          {monitorSession.status === 'active' && (
            <div className="grid sm:grid-cols-3 border-b border-slate-200 dark:border-slate-800 text-center font-medium bg-slate-50/20">
              <div className="p-4 border-r border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Módulo Actual Activo</span>
                <span className="text-lg font-bold text-amber-500">
                  {monitorSession.modules[monitorSession.activeModuleIndex]?.title || 'Módulo'}
                </span>
              </div>
              <div className="p-4 border-r border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Miembros Conectados</span>
                <span className="text-lg font-bold flex items-center justify-center gap-1.5">
                  <Users className="w-4.5 h-4.5 text-slate-400" />
                  {totalRegisteredMembers}
                </span>
              </div>
              <div className="p-4">
                <span className="text-xs text-slate-400 block mb-1">Módulo Completado por</span>
                <span className="text-lg font-bold text-emerald-500">
                  {finishedCurrentModuleCount} de {totalRegisteredMembers} listos
                </span>
              </div>
            </div>
          )}

          {/* BANNER DE ALERTAS DE SEGURIDAD (ANTI-CHEAT) */}
          {(() => {
            const disqualifiedParticipants = activeSessionResponses.filter(r => r.status === 'disqualified');
            if (disqualifiedParticipants.length === 0) return null;
            return (
              <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/50 p-4">
                <div className="max-w-7xl mx-auto flex items-start gap-3">
                  <div className="p-1.5 bg-red-650 text-white rounded-lg animate-pulse">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-red-750 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Alertas de Seguridad en Vivo</span>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    </h4>
                    <div className="mt-1 space-y-1.5">
                      {disqualifiedParticipants.map(item => (
                        <p key={item.id} className="text-xs font-bold text-slate-700 dark:text-slate-350 leading-snug">
                          ⚠️ El miembro <span className="font-extrabold text-red-650 dark:text-red-450">"{item.memberName}"</span> ha sido <span className="font-black underline text-red-650 dark:text-red-400">ANULADO</span>. Razón: {item.disqualificationReason || 'Salió de la pantalla del concurso / Perdió foco'}.
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Monitor Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/10 overflow-x-auto">
            {(() => {
              const tabsList = [
                { id: 'progress', label: 'Progreso en Vivo', icon: RefreshCw, badge: undefined },
                { id: 'grading', label: 'Calificación Manual', icon: FileText, badge: manualQuestionsToGrade.length || undefined },
                { id: 'ranking', label: 'Tabla de Posiciones', icon: Award, badge: undefined }
              ];
              
              if (monitorSession.status === 'completed') {
                tabsList.push({ 
                  id: 'consolidate', 
                  label: 'Consolidar Méritos', 
                  icon: Save, 
                  badge: monitorSession.isConsolidated ? 'Listo' : 'Pendiente' 
                });
              }

              return tabsList.map(tab => {
                const Icon = tab.icon;
                const isStringBadge = typeof tab.badge === 'string';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMonitorTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition relative flex-shrink-0 ${
                      monitorTab === tab.id
                        ? 'border-amber-500 text-amber-500 font-extrabold'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`px-2 py-0.5 text-[9px] rounded-full font-black ${
                        isStringBadge
                          ? (tab.badge === 'Listo' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse')
                          : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              });
            })()}
          </div>

          {/* Monitor Content Body */}
          <div className="p-8">

            {/* TAB: PROGRESS IN LIVE */}
            {monitorTab === 'progress' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Listado de Miembros</h3>
                  <span className="text-xs text-slate-400 font-medium">Actualizado en vivo</span>
                </div>

                {activeSessionResponses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="font-semibold">Esperando a que los miembros ingresen al concurso...</p>
                    <p className="text-xs max-w-xs mx-auto mt-1">Los miembros verán el botón para ingresar en su panel en este momento.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Miembro</th>
                          <th className="py-3 px-4">Unidad</th>
                          <th className="py-3 px-4 text-center">Último Módulo Completado</th>
                          <th className="py-3 px-4 text-center">Estado Módulo Actual</th>
                          <th className="py-3 px-4 text-right">Puntuación Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSessionResponses.map(resp => {
                          const isDisqualified = resp.status === 'disqualified';
                          const isFinished = resp.currentModuleIndex >= currentModIndex || resp.status === 'completed';
                          const isTotalFinished = resp.status === 'completed';
                          
                          return (
                            <tr 
                              key={resp.id} 
                              className={`border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${
                                isDisqualified ? 'bg-red-50/20 dark:bg-red-950/5 text-red-600 dark:text-red-400' : ''
                              }`}
                            >
                              <td className="py-4 px-4 font-bold flex items-center gap-2">
                                {isDisqualified && <X className="w-4 h-4 text-red-500" />}
                                <span className={isDisqualified ? 'line-through text-red-500 dark:text-red-400' : ''}>
                                  {resp.memberName}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{resp.unitName}</td>
                              <td className="py-4 px-4 text-center font-semibold text-sm">
                                {isDisqualified ? 'Anulado' : resp.currentModuleIndex === -1 ? 'Ninguno' : `Módulo ${resp.currentModuleIndex + 1}`}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                                  isDisqualified
                                    ? 'bg-red-650 text-white font-black animate-pulse'
                                    : isTotalFinished
                                    ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                                    : isFinished
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 animate-pulse'
                                }`}>
                                  {isDisqualified ? 'Anulado / Salió' : isTotalFinished ? 'Sesión Completada' : isFinished ? 'Esperando Siguiente' : 'Respondiendo...'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right font-black text-amber-500">
                                {isDisqualified ? '0' : resp.score || 0} pts
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MANUAL GRADING */}
            {monitorTab === 'grading' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Bandeja de Preguntas por Calificar</h3>
                  <span className="text-xs text-slate-400 font-medium">Revisión requerida</span>
                </div>

                {manualQuestionsToGrade.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">¡Bandeja completamente limpia!</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">No hay respuestas de miembros que requieran evaluación manual en este momento.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {manualQuestionsToGrade.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                                {item.memberName}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium">
                                Unidad: {item.unitName} • {item.moduleTitle}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                              Pregunta
                            </span>
                            <p className="text-sm font-semibold text-slate-850 dark:text-slate-200 leading-snug">
                              {item.questionText}
                            </p>
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4 border border-slate-100 dark:border-slate-850">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                              Respuesta del Miembro
                            </span>
                            <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-pre-wrap break-all">
                              {String(item.userResponse)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                          <button
                            onClick={() => onGradeManualResponse(item.responseId, item.questionId, true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-600/10"
                          >
                            <Check className="w-4 h-4" />
                            <span>Aprobar (Correcta)</span>
                          </button>
                          
                          <button
                            onClick={() => onGradeManualResponse(item.responseId, item.questionId, false)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-red-600/10"
                          >
                            <X className="w-4 h-4" />
                            <span>Rechazar (Incorrecta)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: LEADERBOARD / RANKING */}
            {monitorTab === 'ranking' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Ranking de Conexión Bíblica</h3>
                  <span className="text-xs text-slate-400 font-medium">Ordenado por puntuación</span>
                </div>

                {liveLeaderboard.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="font-semibold">Aún no hay puntuaciones registradas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4 text-center w-16">Puesto</th>
                          <th className="py-3 px-4">Miembro</th>
                          <th className="py-3 px-4">Unidad</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-center">Aciertos (Auto / Manual)</th>
                          <th className="py-3 px-4 text-center">Tiempo Empleado</th>
                          <th className="py-3 px-4 text-right">Puntuación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveLeaderboard.map((row, index) => {
                          const isPodium = index < 3;
                          const podiumColors = [
                            'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400', // Gold
                            'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',    // Silver
                            'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/15 dark:text-amber-500' // Bronze
                          ];

                          const isDisqualified = row.status === 'disqualified';
                          const isNotJoined = row.status === 'not_joined';
                          const isFinished = row.status === 'completed';
                          
                          // Formatear tiempo empleado de forma amigable
                          let timeText = '-';
                          if (isFinished && !isDisqualified) {
                            const secs = row.timeSpent && row.timeSpent !== 999999
                              ? row.timeSpent
                              : (row.completedAt && row.startedAt 
                                  ? (new Date(row.completedAt).getTime() - new Date(row.startedAt).getTime()) / 1000 
                                  : null);
                            if (secs !== null) {
                              timeText = secs < 60 ? `${Math.round(secs)}s` : `${Math.floor(secs / 60)}m ${Math.round(secs % 60)}s`;
                            }
                          }
                          
                          return (
                            <tr 
                              key={row.id} 
                              className={`border-b border-slate-100 dark:border-slate-850 transition ${
                                index === 0 && !isNotJoined && !isDisqualified ? 'bg-amber-50/10 dark:bg-amber-950/5' : ''
                              } ${isNotJoined ? 'opacity-50' : ''} ${isDisqualified ? 'bg-red-50/20 dark:bg-red-950/5 text-red-600 dark:text-red-400' : ''}`}
                            >
                              <td className="py-4 px-4 text-center">
                                {isPodium && !isNotJoined && !isDisqualified ? (
                                  <span className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full font-black text-sm border ${podiumColors[index]}`}>
                                    {index + 1}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">{index + 1}</span>
                                )}
                              </td>
                              <td className="py-4 px-4 font-bold flex items-center gap-2">
                                <span className={isNotJoined ? 'text-slate-400 dark:text-slate-500 font-medium' : isDisqualified ? 'line-through text-red-500 dark:text-red-400' : ''}>
                                  {row.memberName}
                                </span>
                                {index === 0 && !isNotJoined && !isDisqualified && <Award className="w-4 h-4 text-amber-500" />}
                              </td>
                              <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{row.unitName}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full ${
                                  isDisqualified
                                    ? 'bg-red-600 text-white font-black animate-pulse'
                                    : isNotJoined
                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                    : isFinished
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 animate-pulse'
                                }`}>
                                  {isDisqualified ? 'Anulado' : isNotJoined ? 'Esperando' : isFinished ? 'Listo' : 'Jugando'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-sm font-semibold">
                                {isNotJoined || isDisqualified ? '-' : `${row.totalCorrect || 0} / ${row.totalManualCorrect || 0}`}
                              </td>
                              <td className="py-4 px-4 text-center text-sm font-semibold font-mono text-slate-500">
                                {isDisqualified ? 'Anulado' : timeText}
                              </td>
                              <td className="py-4 px-4 text-right font-black text-amber-500 text-lg">
                                {isDisqualified ? '0' : row.score || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CONSOLIDAR MÉRITOS */}
            {monitorTab === 'consolidate' && monitorSession.status === 'completed' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-6 bg-amber-500/10 dark:bg-amber-950/15 border border-amber-500/20 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-amber-500 flex items-center gap-2">
                      <Award className="w-6 h-6 stroke-[2.5px]" />
                      <span>Consolidar Méritos a la Base de Datos</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-2xl leading-relaxed">
                      El concurso ha finalizado. Aquí puedes revisar los puntos oficiales acumulados en base a las respuestas de los participantes. Modifica los puntos de forma individual si es necesario antes de exportarlos formalmente al historial del miembro.
                    </p>
                  </div>
                  
                  {monitorSession.isConsolidated && (
                    <span className="px-4 py-2 bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                      <Check className="w-4 h-4 stroke-[3px]" />
                      <span>Méritos Consolidados</span>
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto bg-slate-50/20 dark:bg-slate-900/10 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-1">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-5">Miembro</th>
                        <th className="py-4 px-5">Unidad</th>
                        <th className="py-4 px-5 text-center">Correctas (Auto/Manual)</th>
                        <th className="py-4 px-5 text-center">Puntaje Juego</th>
                        <th className="py-4 px-5 text-center w-40">Puntos a Otorgar</th>
                        <th className="py-4 px-5 text-right">Estatus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSessionResponses.map(resp => {
                        const isDisq = resp.status === 'disqualified';
                        const pointsVal = consolidationPoints[resp.memberId] ?? (isDisq ? 0 : (resp.score || 0));

                        return (
                          <tr key={resp.id} className={`border-b border-slate-100 dark:border-slate-850/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition ${
                            isDisq ? 'bg-red-50/10 dark:bg-red-950/5' : ''
                          }`}>
                            <td className="py-4 px-5 font-extrabold flex items-center gap-2">
                              {isDisq && <X className="w-4 h-4 text-red-500" />}
                              <span className={isDisq ? 'line-through text-red-500 dark:text-red-400' : ''}>
                                {resp.memberName}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-xs font-bold text-slate-500 dark:text-slate-450">{resp.unitName}</td>
                            <td className="py-4 px-5 text-center text-sm font-semibold">
                              {isDisq ? '-' : `${resp.totalCorrect || 0} / ${resp.totalManualCorrect || 0}`}
                            </td>
                            <td className="py-4 px-5 text-center text-sm font-black text-slate-700 dark:text-slate-350">
                              {isDisq ? '0 pts' : `${resp.score || 0} pts`}
                            </td>
                            <td className="py-3 px-5 text-center">
                              <input
                                type="number"
                                disabled={monitorSession.isConsolidated || isConsolidating || isDisq}
                                min="0"
                                value={pointsVal}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setConsolidationPoints(prev => ({
                                    ...prev,
                                    [resp.memberId]: val
                                  }));
                                }}
                                className="w-24 text-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl font-black text-sm text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="py-4 px-5 text-right">
                              <span className={`inline-flex px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                                isDisq 
                                  ? 'bg-red-100 text-red-755 dark:bg-red-950/30' 
                                  : monitorSession.isConsolidated 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20'
                              }`}>
                                {isDisq ? 'Anulado' : monitorSession.isConsolidated ? 'Consolidado' : 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {!monitorSession.isConsolidated && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={async () => {
                        if (isConsolidating) return;
                        setIsConsolidating(true);
                        try {
                          if (onConsolidatePoints) {
                            await onConsolidatePoints(monitorSession.id, consolidationPoints);
                          }
                          // Recargamos el estatus de la sesión en el monitorSession
                          setMonitorSession(prev => ({ ...prev, isConsolidated: true }));
                        } catch (err) {
                          console.error("Error al consolidar:", err);
                        } finally {
                          setIsConsolidating(false);
                        }
                      }}
                      disabled={isConsolidating || activeSessionResponses.length === 0}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold rounded-2xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConsolidating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Guardando Puntos...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Guardar y Exportar a Méritos del Club</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL DE SELECCIÓN DE PARTICIPANTES */}
      {showParticipantsModal && selectedSessionForActive && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-850 rounded-t-[40px] sm:rounded-[30px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[85vh] overflow-y-auto relative border border-slate-200 dark:border-slate-750">
            <button 
              onClick={() => setShowParticipantsModal(false)}
              className="absolute top-6 right-6 p-2.5 bg-slate-105 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 rounded-xl text-slate-500 dark:text-slate-300 transition shadow-sm border border-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              // Calcular miembros disponibles según el modo
              const sessionResponses = responses.filter(r => r.sessionId === selectedSessionForActive.id);
              const previousParticipantIds = selectedSessionForActive.participantIds ? new Set(selectedSessionForActive.participantIds.map(String)) : null;

              const repeatingMembers = members.filter(m => {
                if (m.isExemptFromPoints || m.exemptFromScoring) return false;
                const mIdStr = String(m.id);
                const resp = sessionResponses.find(r => String(r.memberId) === mIdStr);
                const isDisqualified = resp && resp.status === 'disqualified';
                const isNotSelected = previousParticipantIds ? !previousParticipantIds.has(mIdStr) : false;
                const didNotParticipate = !resp || resp.status === 'not_joined';
                return isDisqualified || isNotSelected || didNotParticipate;
              });

              const availableMembers = isRepeatingMode ? repeatingMembers : members.filter(m => !m.isExemptFromPoints && !m.exemptFromScoring);

              return (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Users className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {isRepeatingMode ? 'Fase de Recuperación / Repetición' : 'Fase de Preparación'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {isRepeatingMode ? 'Repetir Concurso' : 'Selección de Participantes'}
                    </h3>
                    <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
                      {isRepeatingMode 
                        ? 'Selecciona a los miembros que repetirán o recuperarán el concurso: '
                        : 'Elige a los miembros que competirán en la sesión: '}
                      <span className="font-extrabold text-amber-500">"{selectedSessionForActive.title}"</span>
                    </p>
                  </div>

                  {isRepeatingMode && (
                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-semibold">
                      ℹ️ **Modo de Recuperación:** Solo se muestran miembros que fueron **anulados / descalificados**, **no seleccionados** o **no participaron** en la sesión original de este concurso.
                    </div>
                  )}

                  {/* CONTROLES RÁPIDOS */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 items-center justify-between">
                    {/* Filtro por unidad */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar por Unidad:</span>
                      <select
                        value={unitFilter}
                        onChange={(e) => setUnitFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="all">Todas las Unidades</option>
                        {Array.from(new Set(availableMembers.filter(m => m.unitId).map(m => m.unitId))).map(uId => (
                          <option key={uId} value={uId}>{uId}</option>
                        ))}
                      </select>
                    </div>

                    {/* Botones de acción rápida */}
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = availableMembers.map(m => m.id);
                          setSelectedParticipantIds(allIds);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-black uppercase text-slate-650 dark:text-slate-300 transition"
                      >
                        Seleccionar Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedParticipantIds([])}
                        className="px-3 py-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-black uppercase text-slate-650 dark:text-slate-300 transition"
                      >
                        Deseleccionar Todos
                      </button>
                    </div>
                  </div>

                  {/* LISTA DE MIEMBROS */}
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-8 pr-2">
                    {(() => {
                      const filteredList = availableMembers.filter(m => unitFilter === 'all' || String(m.unitId) === String(unitFilter));
                      
                      if (filteredList.length === 0) {
                        return (
                          <div className="text-center py-12 text-slate-400">
                            <Users className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="font-semibold text-sm">No hay miembros disponibles</p>
                            <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                              {isRepeatingMode 
                                ? 'Todos los miembros elegibles completaron el concurso exitosamente en la sesión anterior.'
                                : 'No se encontraron miembros para el filtro seleccionado.'}
                            </p>
                          </div>
                        );
                      }

                      return filteredList.map(m => {
                        const isChecked = selectedParticipantIds.includes(m.id);
                        
                        // Determinar la etiqueta del estado previo para repetición
                        let labelPrev = '';
                        if (isRepeatingMode) {
                          const resp = sessionResponses.find(r => String(r.memberId) === String(m.id));
                          if (resp && resp.status === 'disqualified') {
                            labelPrev = 'Anulado / Descalificado';
                          } else if (previousParticipantIds && !previousParticipantIds.has(String(m.id))) {
                            labelPrev = 'No Seleccionado';
                          } else {
                            labelPrev = 'No Participó';
                          }
                        }

                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedParticipantIds(prev =>
                                isChecked 
                                  ? prev.filter(id => id !== m.id)
                                  : [...prev, m.id]
                              );
                            }}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'border-amber-500 bg-amber-50/5 dark:bg-amber-950/10'
                                : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isChecked ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                              </div>
                              <div>
                                <span className="block font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                  {m.firstName} {m.lastName}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Unidad: {m.unitId || 'Sin Unidad'} • Clase: {m.pathfinderClass || m.currentClass || 'Ninguna'}
                                  </span>
                                  {labelPrev && (
                                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-full uppercase tracking-wider ${
                                      labelPrev === 'Anulado / Descalificado'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                        : labelPrev === 'No Seleccionado'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                        : 'bg-slate-100 text-slate-650 dark:bg-slate-850 dark:text-slate-450'
                                    }`}>
                                      {labelPrev}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked 
                                ? 'bg-amber-500 border-amber-500 text-white' 
                                : 'border-slate-300 dark:border-slate-650'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              );
            })()}

            {/* BOTONES DE CONFIRMACIÓN */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 dark:hover:bg-slate-850 font-bold rounded-2xl text-sm text-slate-700 dark:text-slate-300 transition"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleConfirmStartSession}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-red-500/15 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 animate-pulse" />
                <span>Confirmar e Iniciar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiblicalConnectionAdmin;
