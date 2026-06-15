import React, { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

// ─────────────────────────────────────────────────────────────────────────────
// FinalContestJudge
// Judge portal — sees same board as presenter + questions AND answers.
// Max 4 judges. Access requires judgeCode.
// URL: /#final-judge?session=SESSION_ID
// ─────────────────────────────────────────────────────────────────────────────

const MAX_JUDGES = 4;

const FinalContestJudge = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginState, setLoginState] = useState({ code: '', name: '' });
  const [loginError, setLoginError] = useState('');
  const [judgeProfile, setJudgeProfile] = useState(null); // { name, slot }
  const [activeQuestion, setActiveQuestion] = useState(null);

  // ── Fetch session ──────────────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    try {
      const all = await dataService.readData('finalContestSessions');
      const sessions = Array.isArray(all) ? all : [];
      const found = sessions.find(s => s.id === sessionId);
      if (found) {
        setSession(found);
        // Sync revealed question from presenter
        const contestaModule = (found.modules || []).find(m => m.type === 'contesta');
        if (contestaModule && found.presenterRevealedQuestionId !== undefined) {
          const q = contestaModule.questions?.find(q => q.id === found.presenterRevealedQuestionId);
          if (q) setActiveQuestion({ question: q });
          else setActiveQuestion(null);
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

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!session) return;
    if (!loginState.code.trim() || !loginState.name.trim()) {
      setLoginError('Por favor completa todos los campos.');
      return;
    }
    if (loginState.code.trim().toUpperCase() !== (session.judgeCode || '').toUpperCase()) {
      setLoginError('Código de juez incorrecto.');
      return;
    }

    // Check how many judges are currently logged in
    const connectedJudges = session.connectedJudges || [];
    if (connectedJudges.length >= MAX_JUDGES) {
      setLoginError(`El máximo de ${MAX_JUDGES} jueces ya está conectado.`);
      return;
    }

    // Register this judge
    const judgeEntry = {
      name: loginState.name.trim(),
      connectedAt: new Date().toISOString()
    };
    try {
      const all = await dataService.readData('finalContestSessions');
      const sessions = Array.isArray(all) ? all : [];
      const updated = sessions.map(s => {
        if (s.id === sessionId) {
          const existing = s.connectedJudges || [];
          // Avoid duplicate names
          const filtered = existing.filter(j => j.name !== judgeEntry.name);
          return { ...s, connectedJudges: [...filtered, judgeEntry] };
        }
        return s;
      });
      await dataService.writeData('finalContestSessions', updated);
      setJudgeProfile(judgeEntry);
      setLoginError('');
    } catch (e) {
      console.error('Error registering judge:', e);
      setLoginError('Error al conectar. Intenta de nuevo.');
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.fullscreen}>
        <div style={{ color: '#818cf8', fontSize: 20 }}>Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={styles.fullscreen}>
        <div style={{ color: '#ef4444', fontSize: 20 }}>Concurso no encontrado</div>
      </div>
    );
  }

  // ── Judge login screen ─────────────────────────────────────────────────────
  if (!judgeProfile) {
    return (
      <div style={styles.fullscreen}>
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(129,140,248,0.25)',
          borderRadius: 24,
          padding: '40px',
          width: '100%',
          maxWidth: 420,
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
            <div style={{ color: '#818cf8', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
              Portal de Jueces
            </div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>
              {session.title}
            </div>
            <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
              Cupos disponibles: {MAX_JUDGES - (session.connectedJudges?.length || 0)} / {MAX_JUDGES}
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={styles.label}>Tu nombre</label>
              <input
                type="text"
                value={loginState.name}
                onChange={e => setLoginState(p => ({ ...p, name: e.target.value }))}
                placeholder="Ej: Juan Pérez"
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Código de acceso</label>
              <input
                type="text"
                value={loginState.code}
                onChange={e => setLoginState(p => ({ ...p, code: e.target.value }))}
                placeholder="Código proporcionado por el admin"
                style={styles.input}
                autoCapitalize="characters"
              />
            </div>
            {loginError && (
              <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '8px 12px' }}>
                {loginError}
              </div>
            )}
            <button type="submit" style={styles.btn}>
              Entrar como Juez →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeModuleIndex = session.activeModuleIndex ?? -1;
  const activeModule = session.modules?.[activeModuleIndex];

  if (activeModuleIndex === -1 || !activeModule) {
    return (
      <div style={styles.fullscreen}>
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(129,140,248,0.25)',
          borderRadius: 24,
          padding: '40px',
          width: '100%',
          maxWidth: 420,
          backdropFilter: 'blur(20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounceJudge 2s infinite' }}>⏳</div>
          <style>{`@keyframes bounceJudge { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Esperando Módulo Activo</div>
          <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
            El concurso está en curso, pero el administrador aún no ha habilitado ningún módulo.
          </div>
        </div>
      </div>
    );
  }

  if (activeModule.type === 'sequential') {
    return (
      <div style={styles.fullscreen}>
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(129,140,248,0.25)',
          borderRadius: 24,
          padding: '40px',
          width: '100%',
          maxWidth: 420,
          backdropFilter: 'blur(20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
          <div style={{ color: '#818cf8', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Módulo Secuencial Activo
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 12 }}>{activeModule.title}</div>
          <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
            Los concursantes están respondiendo preguntas secuenciales directamente desde sus celulares. Este portal se activará cuando comience un módulo de "Contesta".
          </div>
        </div>
      </div>
    );
  }

  const questions = activeModule.questions || [];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #020617 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 28px',
        borderBottom: '1px solid rgba(129,140,248,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <div style={{ color: '#818cf8', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ⚖️ Portal de Jueces
          </div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{session.title}</div>
        </div>
        <div style={{
          padding: '6px 16px',
          background: 'rgba(129,140,248,0.1)',
          border: '1px solid rgba(129,140,248,0.25)',
          borderRadius: 50,
          color: '#818cf8',
          fontSize: 12,
          fontWeight: 700
        }}>
          {judgeProfile.name}
        </div>
      </div>

      <div style={{ padding: '28px', display: 'flex', gap: 28, minHeight: 'calc(100vh - 70px)' }}>
        {/* Left: Board */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Tablero: {activeModule.title}
          </div>
          {questions.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
              Sin preguntas
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10
            }}>
              {questions.map((q, idx) => {
                const isRevealed = q.revealed;
                const isActive = session.presenterRevealedQuestionId === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestion(isActive ? null : { question: q })}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 10,
                      border: isActive
                        ? '2px solid #818cf8'
                        : isRevealed
                          ? '2px solid rgba(71,85,105,0.3)'
                          : '2px solid rgba(99,102,241,0.3)',
                      background: isActive
                        ? 'rgba(129,140,248,0.2)'
                        : isRevealed
                          ? 'rgba(30,41,59,0.3)'
                          : 'rgba(99,102,241,0.1)',
                      color: isActive ? '#818cf8' : isRevealed ? '#334155' : '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 900,
                      cursor: 'pointer',
                      opacity: isRevealed && !isActive ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Question */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {activeQuestion ? (
            <div style={{ animation: 'fadeInJudge 0.3s ease' }}>
              <style>{`@keyframes fadeInJudge { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

              {/* Question */}
              <div style={{
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(129,140,248,0.2)',
                borderRadius: 20,
                padding: '28px',
                marginBottom: 16
              }}>
                <div style={{ color: '#818cf8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  <span>{activeModule.title}</span>
                  <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                  <span>Pregunta #{questions.findIndex(q => q.id === activeQuestion.question.id) + 1}</span>
                </div>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1.4 }}>
                  {activeQuestion.question.questionText}
                </div>
                {activeQuestion.question.hint && (
                  <div style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
                    💡 {activeQuestion.question.hint}
                  </div>
                )}
              </div>

              {/* Answer */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 20,
                padding: '24px 28px'
              }}>
                <div style={{ color: '#10b981', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
                  ✅ Respuesta Correcta
                </div>
                <div style={{ color: '#6ee7b7', fontSize: 24, fontWeight: 900, lineHeight: 1.3 }}>
                  {activeQuestion.question.answer}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#334155' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Esperando selección...</div>
              <div style={{ fontSize: 14, marginTop: 8, color: '#1e293b' }}>
                El presentador seleccionará el número de la pregunta
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  fullscreen: {
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 20
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 6
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box'
  },
  btn: {
    width: '100%',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4
  }
};

export default FinalContestJudge;
