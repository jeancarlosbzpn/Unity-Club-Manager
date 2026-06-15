import React, { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

// ─────────────────────────────────────────────────────────────────────────────
// FinalContestPresenter
// External window for the presenter / public projection.
// URL: /#final-presenter?session=SESSION_ID
// Presenter clicks a number → question reveals on screen (no answer shown).
// Automatically polls for session state changes every 3 seconds.
// ─────────────────────────────────────────────────────────────────────────────

const FinalContestPresenter = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null); // { question, index }

  // ── Fetch session ──────────────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    try {
      const all = await dataService.readData('finalContestSessions');
      const sessions = Array.isArray(all) ? all : [];
      const found = sessions.find(s => s.id === sessionId);
      if (found) {
        setSession(found);
        // Sync revealed question from session state
        if (found.presenterRevealedQuestionId !== undefined) {
          const contestaModule = (found.modules || []).find(m => m.type === 'contesta');
          if (contestaModule) {
            const q = contestaModule.questions?.find(
              q => q.id === found.presenterRevealedQuestionId
            );
            if (q) setActiveQuestion({ question: q, moduleId: contestaModule.id });
            else if (found.presenterRevealedQuestionId === null) setActiveQuestion(null);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching final session:', e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // ── Handle presenter click on a question number ────────────────────────────
  const handleReveal = async (contestaModuleId, question, questionIndex) => {
    if (!session) return;
    const contestaModule = session.modules?.find(m => m.id === contestaModuleId);
    if (!contestaModule) return;

    // Toggle: clicking again the same hides it
    const isSame = activeQuestion?.question?.id === question.id;
    const newRevealedId = isSame ? null : question.id;
    setActiveQuestion(isSame ? null : { question, moduleId: contestaModuleId });

    // Persist revealed question ID to session
    try {
      const all = await dataService.readData('finalContestSessions');
      const sessions = Array.isArray(all) ? all : [];
      const updated = sessions.map(s => {
        if (s.id === sessionId) {
          const updatedModules = s.modules.map(m => {
            if (m.id === contestaModuleId) {
              return {
                ...m,
                questions: m.questions.map(q =>
                  q.id === question.id ? { ...q, revealed: true } : q
                )
              };
            }
            return m;
          });
          return { ...s, modules: updatedModules, presenterRevealedQuestionId: newRevealedId };
        }
        return s;
      });
      await dataService.writeData('finalContestSessions', updated);
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          presenterRevealedQuestionId: newRevealedId,
          modules: prev.modules.map(m => {
            if (m.id === contestaModuleId) {
              return {
                ...m,
                questions: m.questions.map(q =>
                  q.id === question.id ? { ...q, revealed: true } : q
                )
              };
            }
            return m;
          })
        };
      });
    } catch (e) {
      console.error('Error revealing question:', e);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ color: '#fbbf24', fontSize: 24, fontFamily: 'sans-serif' }}>Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12
      }}>
        <div style={{ color: '#ef4444', fontSize: 24, fontFamily: 'sans-serif' }}>Concurso no encontrado</div>
        <div style={{ color: '#64748b', fontSize: 14, fontFamily: 'sans-serif' }}>ID: {sessionId}</div>
      </div>
    );
  }

  const activeModuleIndex = session.activeModuleIndex ?? -1;
  const activeModule = session.modules?.[activeModuleIndex];

  if (activeModuleIndex === -1 || !activeModule) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{ fontSize: 64, animation: 'bounce 2s infinite' }}>⏳</div>
        <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>Esperando al Administrador</div>
        <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', maxWidth: 400, padding: '0 20px', lineHeight: 1.5 }}>
          El concurso está activo, pero el administrador aún no ha habilitado ningún módulo.
        </div>
      </div>
    );
  }

  if (activeModule.type === 'sequential') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{ fontSize: 64 }}>📝</div>
        <div style={{ color: '#fbbf24', fontSize: 12, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          Módulo en Curso (Celulares)
        </div>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>{activeModule.title}</div>
        <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', maxWidth: 450, padding: '0 20px', lineHeight: 1.5 }}>
          Este es un módulo secuencial. Los participantes están respondiendo las preguntas directamente desde sus dispositivos móviles.
        </div>
      </div>
    );
  }

  const questions = activeModule.questions || [];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #020617 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid rgba(251,191,36,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 4 }}>
            ⚡ Conexión Bíblica — Modalidad Final
          </div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
            {session.title}
          </div>
        </div>
        <div style={{
          padding: '8px 18px',
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 50,
          color: '#fbbf24',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase'
        }}>
          Vista Presentador
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Question Board */}
        <div style={{
          width: activeQuestion ? '40%' : '100%',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'width 0.5s ease',
          overflow: 'auto'
        }}>
          {questions.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 18, marginTop: 80, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              No hay preguntas en el módulo de Contesta
            </div>
          ) : (
            <>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>
                Módulo Activo: {activeModule.title}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(5, Math.ceil(Math.sqrt(questions.length)))}, 1fr)`,
                gap: 16,
                maxWidth: 600,
                width: '100%'
              }}>
                {questions.map((q, idx) => {
                  const isRevealed = q.revealed;
                  const isActive = activeQuestion?.question?.id === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleReveal(activeModule.id, q, idx)}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 16,
                        border: isActive
                          ? '2px solid #fbbf24'
                          : isRevealed
                            ? '2px solid rgba(71,85,105,0.4)'
                            : '2px solid rgba(99,102,241,0.4)',
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))'
                          : isRevealed
                            ? 'rgba(30,41,59,0.4)'
                            : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                        color: isActive ? '#fbbf24' : isRevealed ? '#475569' : '#c7d2fe',
                        fontSize: 28,
                        fontWeight: 900,
                        cursor: isRevealed && !isActive ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive
                          ? '0 0 24px rgba(251,191,36,0.3)'
                          : isRevealed
                            ? 'none'
                            : '0 4px 16px rgba(99,102,241,0.15)',
                        opacity: isRevealed && !isActive ? 0.4 : 1,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {isRevealed && !isActive && (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '60%', height: 2,
                            background: '#475569',
                            transform: 'rotate(-45deg)'
                          }} />
                        </div>
                      )}
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Revealed Question */}
        {activeQuestion && (
          <div style={{
            flex: 1,
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid rgba(251,191,36,0.1)',
            background: 'rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.4s ease'
          }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 50,
              color: '#fbbf24',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              width: 'fit-content',
              marginBottom: 24,
              gap: 8
            }}>
              <span>{activeModule.title}</span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>Pregunta #{questions.findIndex(q => q.id === activeQuestion.question.id) + 1}</span>
            </div>
            <div style={{
              color: '#fff',
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.5px'
            }}>
              {activeQuestion.question.questionText}
            </div>
            {activeQuestion.question.hint && (
              <div style={{
                marginTop: 20,
                color: '#94a3b8',
                fontSize: 16,
                fontStyle: 'italic'
              }}>
                💡 {activeQuestion.question.hint}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalContestPresenter;
