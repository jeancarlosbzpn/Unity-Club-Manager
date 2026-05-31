import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Play, Check, X, Award, Users, RefreshCw, 
  HelpCircle, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';

const BiblicalConnectionPortal = ({
  member,
  sessions = [],
  responses = [],
  onJoinSession,
  onSubmitAnswers,
  onDisqualifyMember,
  onRefreshData,
  isSyncing = false
}) => {
  const [activeSession, setActiveSession] = useState(null);
  const [memberResponse, setMemberResponse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  
  // Local answers state for the current active module
  // Formato: { [questionId]: userResponse }
  const [localAnswers, setLocalAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Motivational verses for the waiting screen
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const verses = [
    { text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.", ref: "Salmos 119:105" },
    { text: "En mi corazón he guardado tus dichos, para no pecar contra ti.", ref: "Salmos 119:11" },
    { text: "Escudriñad las Escrituras; porque a vosotros os parece que en ellas tenéis la vida eterna.", ref: "Juan 5:39" },
    { text: "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir...", ref: "2 Timoteo 3:16" },
    { text: "Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él...", ref: "Josué 1:8" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerseIndex(prev => (prev + 1) % verses.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 1. Sync Active Session and Response in real-time
  useEffect(() => {
    // Look for active sessions
    const activeSess = sessions.find(s => s.status === 'active');
    
    if (activeSess) {
      setActiveSession(activeSess);
      
      // Look for current member's response to this active session
      const resp = responses.find(r => r.sessionId === activeSess.id && r.memberId === member.id);
      setMemberResponse(resp || null);

      // Find the currently active module from session
      if (activeSess.modules && activeSess.modules[activeSess.activeModuleIndex]) {
        setCurrentModule(activeSess.modules[activeSess.activeModuleIndex]);
      } else {
        setCurrentModule(null);
      }
    } else {
      setActiveSession(null);
      setMemberResponse(null);
      setCurrentModule(null);
    }
  }, [sessions, responses, member.id]);

  // 2. Clear local answers when module changes
  useEffect(() => {
    setLocalAnswers({});
  }, [activeSession?.activeModuleIndex]);

  // 3. Shuffle questions using Fisher-Yates when current module changes
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  useEffect(() => {
    if (currentModule && currentModule.questions && currentModule.questions.length > 0) {
      const questionsCopy = [...currentModule.questions];
      
      // Algoritmo Fisher-Yates
      for (let i = questionsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
      }
      
      setShuffledQuestions(questionsCopy);
    } else {
      setShuffledQuestions([]);
    }
  }, [currentModule?.id]);

  // 4. Anti-Cheat: Detect losing focus or changing tabs when actively playing
  useEffect(() => {
    const isPlaying = activeSession && memberResponse && memberResponse.status === 'playing' && currentModule;
    if (!isPlaying) return;

    let alreadyDisqualified = false;

    const handleCheatDisqualify = async (eventDetails) => {
      if (alreadyDisqualified) return;
      alreadyDisqualified = true;

      console.warn("⚠️ Anti-Cheat Activado: Infracción detectada.", eventDetails);
      try {
        if (onDisqualifyMember) {
          await onDisqualifyMember(activeSession.id, "Salió de la pantalla de juego / Cambió de pestaña");
        }
      } catch (err) {
        console.error("Error al registrar la descalificación:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleCheatDisqualify("visibility_hidden");
      }
    };

    const handleWindowBlur = () => {
      handleCheatDisqualify("window_blur");
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeSession?.id, memberResponse?.status, currentModule?.id, onDisqualifyMember]);

  const handleJoin = async () => {
    if (!activeSession) return;
    await onJoinSession(activeSession.id);
  };

  const handleOptionSelect = (qId, option) => {
    setLocalAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleTextChange = (qId, text) => {
    setLocalAnswers(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  const handleTrueFalseSelect = (qId, val) => {
    setLocalAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleSubmitModule = async () => {
    if (!currentModule) return;

    // Validation: Make sure every question has a response
    const unanswered = currentModule.questions.filter(q => {
      const ans = localAnswers[q.id];
      return ans === undefined || ans === '';
    });

    if (unanswered.length > 0) {
      if (!confirm(`Tienes ${unanswered.length} pregunta(s) sin contestar. ¿Estás seguro de enviar tus respuestas de este módulo de todas formas?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmitAnswers(
        activeSession.id, 
        currentModule.id, 
        activeSession.activeModuleIndex,
        localAnswers,
        currentModule.questions
      );
    } catch (e) {
      alert('Ocurrió un error al enviar tus respuestas. Por favor intenta de nuevo.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find if member has completed the session that has recently closed
  const recentlyCompletedSession = sessions.find(s => s.status === 'completed');
  const finishedSessionResponse = recentlyCompletedSession
    ? responses.find(r => r.sessionId === recentlyCompletedSession.id && r.memberId === member.id)
    : null;

  // Render Lobby, Live Quiz, Waiting Screen, or Results
  const renderContent = () => {
    // 0. Control de seguridad: Validar si el participante fue descalificado (Anti-Cheat)
    if (memberResponse && memberResponse.status === 'disqualified') {
      return (
        <div className="max-w-xl mx-auto py-12">
          <div className="p-8 md:p-10 bg-red-500/10 dark:bg-red-950/15 border-2 border-red-500 rounded-3xl text-center shadow-xl shadow-red-500/5 dark:shadow-none animate-in fade-in duration-350">
            <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/20">
              <X className="w-9 h-9 stroke-[3px]" />
            </div>
            
            <span className="text-xs font-black px-3 py-1 bg-red-600 text-white rounded-full inline-block mb-3 uppercase tracking-wider animate-pulse">
              ● Participación Anulada
            </span>

            <h2 className="text-3xl font-black text-red-600 dark:text-red-400 mb-2 leading-tight">
              Descalificado del Concurso
            </h2>
            <p className="text-slate-700 dark:text-slate-350 text-sm font-bold mb-6">
              ¡Infracción de Seguridad Detectada!
            </p>

            <div className="text-left text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200/50 dark:border-red-950/50 space-y-3 font-semibold">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400">Motivo:</span>
                <span className="font-black text-red-600 dark:text-red-400">{memberResponse.disqualificationReason || 'Salió de la pantalla de juego'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400">Concurso:</span>
                <span className="font-extrabold text-slate-750 dark:text-slate-300">{activeSession?.title || 'Conexión Bíblica'}</span>
              </div>
              <p className="text-center font-bold text-[10px] text-red-500 uppercase tracking-widest pt-1 leading-snug">
                ⚠️ Las reglas del club prohíben cambiar de pestaña, minimizar el juego o perder el foco del navegador. Tu puntuación ha sido invalidada.
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Esta pantalla se cerrará de forma automática e inmediata en cuanto el administrador finalice la sesión actual.
            </p>
          </div>
        </div>
      );
    }

    // Control de acceso: Validar si la sesión activa tiene participantes declarados y el miembro no está en la lista
    if (activeSession && activeSession.participantIds && !activeSession.participantIds.map(String).includes(String(member.id))) {
      return (
        <div className="max-w-xl mx-auto py-12">
          <div className="p-8 md:p-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl shadow-slate-100/50 dark:shadow-none animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 dark:bg-red-400/5 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 animate-pulse" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 rounded-full inline-block mb-3">
              ● Acceso No Registrado
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
              No Participando
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              ¡Hola! Tu perfil no ha sido incluido en la lista de participantes autorizados para esta competencia bíblica activa.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-8 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              Pide a tu director o instructor de clase que te añada a la lista de participantes desde la consola de administración del club.
            </p>
            <button
              onClick={onRefreshData}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-650 text-white font-bold rounded-2xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Verificar si fui añadido</span>
            </button>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // CASE A: SESSION IN PROGRESS AND MEMBER ACTIVE
    // ----------------------------------------------------
    if (activeSession && memberResponse) {
      const activeIdx = activeSession.activeModuleIndex;
      const currentMemberIdx = memberResponse.currentModuleIndex;
      
      // A1. Member is WAITING for the next module to unlock
      if (currentMemberIdx >= activeIdx) {
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-xl mx-auto">
            {/* Pulsing visual animation */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-amber-500/10 dark:bg-amber-400/5 rounded-full flex items-center justify-center animate-ping absolute inset-0 duration-1000" />
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-red-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/20 relative">
                <RefreshCw className="w-10 h-10 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>

            <h2 className="text-2xl font-black mb-3">
              ¡Módulo {currentMemberIdx + 1} Enviado!
            </h2>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full inline-flex items-center gap-1.5 mb-8">
              <CheckCircle2 className="w-4 h-4" />
              Tus respuestas están a salvo.
            </p>

            {/* Glassmorphic motivational verse card */}
            <div className="w-full p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-left mb-6 relative overflow-hidden">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">
                Palabra de Aliento
              </span>
              <p className="text-slate-700 dark:text-slate-200 font-medium italic mb-2 leading-relaxed">
                "{verses[currentVerseIndex].text}"
              </p>
              <p className="text-right text-xs font-bold text-slate-400">
                — {verses[currentVerseIndex].ref}
              </p>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Espera un momento. En cuanto el **director o instructor** active el siguiente tema, tu pantalla se desbloqueará sola de forma automática en tiempo real.
            </p>

            {/* Quick manual refresh button */}
            <button
              onClick={onRefreshData}
              disabled={isSyncing}
              className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Verificar actualizaciones</span>
            </button>
          </div>
        );
      }

      // A2. Member is actively PLAYING the current module
      if (currentModule) {
        return (
          <div className="max-w-3xl mx-auto">
            {/* Header progress bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                <span>Concurso Activo</span>
                <span>Módulo {activeIdx + 1} de {activeSession.modules?.length}</span>
              </div>
              
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${((activeIdx + 1) / activeSession.modules.length) * 100}%` }}
                />
              </div>

              <h2 className="text-3xl font-extrabold mt-6 mb-1">
                {currentModule.title}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Lee con atención y responde cada pregunta a tu propio ritmo. Al finalizar pulsa "Enviar Módulo".
              </p>
            </div>

            {/* Questions Container */}
            <div className="space-y-6">
              {shuffledQuestions.map((q, idx) => {
                const answer = localAnswers[q.id];
                
                return (
                  <div 
                    key={q.id}
                    className="p-6 md:p-8 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md shadow-slate-100/50 dark:shadow-none"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <span className="w-8 h-8 min-w-[32px] flex items-center justify-center bg-amber-500/10 dark:bg-amber-400/5 text-amber-500 font-black rounded-lg text-sm">
                        {idx + 1}
                      </span>
                      <h3 className="text-lg font-bold leading-snug pt-0.5">
                        {q.questionText}
                      </h3>
                    </div>

                    {/* DYNAMIC ANSWER RENDERER BY TYPE */}
                    
                    {/* TYPE: SELECT */}
                    {q.type === 'select' && (
                      <div className="grid md:grid-cols-2 gap-3 pl-12">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = answer === opt;
                          
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, opt)}
                              className={`flex items-center text-left p-4 rounded-xl border text-sm font-bold transition-all duration-150 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/5'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                              }`}
                            >
                              <span className={`w-5 h-5 flex items-center justify-center rounded-full mr-3 text-xs font-black transition ${
                                isSelected 
                                  ? 'bg-amber-500 text-white' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1 leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TYPE: TRUE_FALSE */}
                    {q.type === 'true_false' && (
                      <div className="flex gap-4 pl-12">
                        <button
                          onClick={() => handleTrueFalseSelect(q.id, true)}
                          className={`flex-1 py-4 rounded-xl text-sm font-bold border transition ${
                            answer === true
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          Verdadero
                        </button>
                        <button
                          onClick={() => handleTrueFalseSelect(q.id, false)}
                          className={`flex-1 py-4 rounded-xl text-sm font-bold border transition ${
                            answer === false
                              ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          Falso
                        </button>
                      </div>
                    )}

                    {/* TYPE: COMPLETE */}
                    {q.type === 'complete' && (
                      <div className="pl-12">
                        <label className="block text-xs font-bold text-slate-400 mb-2">
                          Escribe la palabra que rellena el espacio
                        </label>
                        <input
                          type="text"
                          value={answer || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          placeholder="Tu respuesta..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white transition font-semibold"
                        />
                      </div>
                    )}

                    {/* TYPE: OPEN */}
                    {q.type === 'open' && (
                      <div className="pl-12">
                        <label className="block text-xs font-bold text-slate-400 mb-2">
                          Escribe tu respuesta
                        </label>
                        <textarea
                          rows="3"
                          value={answer || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          placeholder="Escribe tu respuesta detallada aquí..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white transition"
                        />
                      </div>
                    )}

                    {/* Question Hint/Ref */}
                    {q.hint && (
                      <div className="mt-4 pl-12 flex items-center gap-1.5 text-xs text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Referencia: **{q.hint}**</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Send answers button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmitModule}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-500/10 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Enviando Respuestas...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Respuestas del Módulo</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      }
    }

    // ----------------------------------------------------
    // CASE B: ACTIVE SESSION EXISTS BUT MEMBER HAS NOT JOINED
    // ----------------------------------------------------
    if (activeSession && !memberResponse) {
      const totalQuestions = activeSession.modules?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0;
      
      return (
        <div className="max-w-xl mx-auto py-12">
          <div className="p-8 md:p-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-400/5 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-full inline-block mb-3">
              ● Concurso en Curso
            </span>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
              {activeSession.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              {activeSession.description || 'Prepárate para demostrar tus conocimientos en este concurso de libros específicos de la Biblia.'}
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 text-left text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>{activeSession.modules?.length || 0} Módulos</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>{totalQuestions} Preguntas</span>
              </div>
            </div>

            <button
              onClick={handleJoin}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/15 hover:shadow-xl hover:shadow-red-500/25 transition duration-250 transform hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Participar en el Concurso</span>
            </button>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // CASE C: NO ACTIVE SESSION, BUT JUST FINISHED A SESSION (Completion Screen - no scores shown)
    // ----------------------------------------------------
    if (!activeSession && finishedSessionResponse && recentlyCompletedSession) {
      return (
        <div className="max-w-xl mx-auto py-12">
          <div className="p-8 md:p-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl shadow-slate-100/50 dark:shadow-none animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
              <Award className="w-10 h-10" />
            </div>

            <span className="text-xs font-black px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-full inline-block mb-4 uppercase tracking-wider">
              ✓ Concurso Completado
            </span>

            <h2 className="text-3xl font-black leading-tight mb-2">
              ¡Excelente, {member.firstName}!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
              Has participado en <strong>{recentlyCompletedSession.title}</strong>. Los resultados serán revisados y comunicados por el director del club.
            </p>

            <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-left mb-6">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">Palabra de Aliento</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "En mi corazón he guardado tus dichos, para no pecar contra ti."
              </p>
              <p className="text-right text-xs font-bold text-slate-400 mt-1">— Salmos 119:11</p>
            </div>

            <p className="text-xs text-slate-400">
              Sigue estudiando la Biblia y el Espíritu de Profecía. ¡Nos vemos en el próximo concurso!
            </p>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // CASE D: DEFAULT DEFAULT (No active session, no recently finished)
    // ----------------------------------------------------
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-3xl flex items-center justify-center mb-6">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-slate-700 dark:text-slate-350 mb-1">
          No hay concursos activos
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          En este momento no se está realizando ninguna Conexión Bíblica. Mantente atento y sigue estudiando la Biblia y el Espíritu de Profecía.
        </p>
        
        <button
          onClick={onRefreshData}
          disabled={isSyncing}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Verificar si ya inició</span>
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-850 dark:text-slate-100 transition-all duration-250">
      
      {/* Upper header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span className="font-extrabold text-lg">Conexión Bíblica</span>
        </div>
        <div className="text-xs font-bold text-slate-400">
          Miembro: <span className="text-slate-600 dark:text-slate-200">{member.firstName} {member.lastName}</span>
        </div>
      </div>

      {/* Dynamic Content Renderer */}
      {renderContent()}

    </div>
  );
};

export default BiblicalConnectionPortal;
