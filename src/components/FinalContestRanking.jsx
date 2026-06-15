import React, { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

// ─────────────────────────────────────────────────────────────────────────────
// FinalContestRanking
// Public ranking screen — auto-refreshes every 5 seconds.
// URL: /#final-ranking?session=SESSION_ID
// Shows contestants sorted by points (manually updated by admin).
// ─────────────────────────────────────────────────────────────────────────────

const MEDAL_COLORS = ['#fbbf24', '#cbd5e1', '#f59e0b']; // Gold, Silver, Bronze
const MEDAL_LABELS = ['🥇', '🥈', '🥉'];

const FinalContestRanking = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSession = useCallback(async () => {
    try {
      const all = await dataService.readData('finalContestSessions');
      const sessions = Array.isArray(all) ? all : [];
      const found = sessions.find(s => s.id === sessionId);
      if (found) {
        setSession(found);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error('Error fetching ranking:', e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.fullscreen}>
        <div style={{ color: '#fbbf24', fontSize: 22 }}>Cargando clasificación...</div>
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

  // Sort ranking by points descending
  const ranking = [...(session.ranking || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0a0f1e 0%, #0f172a 40%, #1a0a2e 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Animated background circles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
          top: '10%', left: '20%', transform: 'translate(-50%,-50%)'
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          bottom: '10%', right: '10%', transform: 'translate(50%,50%)'
        }} />
      </div>

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '24px 40px',
        borderBottom: '1px solid rgba(251,191,36,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 4 }}>
            🏆 Tabla de Posiciones
          </div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>
            {session.title}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
            ⚡ Modalidad Final
          </div>
          {lastUpdate && (
            <div style={{ color: '#334155', fontSize: 11 }}>
              Actualizado: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Ranking content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {ranking.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#334155', marginTop: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🏁</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#475569' }}>
              El concurso aún no ha comenzado
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ranking.map((contestant, idx) => {
              const isTop3 = idx < 3;
              const medalColor = MEDAL_COLORS[idx] || '#94a3b8';
              const medal = MEDAL_LABELS[idx] || `${idx + 1}`;
              const isTied = idx > 0 && (ranking[idx - 1].score || 0) === (contestant.score || 0);

              return (
                <div
                  key={contestant.memberId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '20px 28px',
                    background: isTop3
                      ? `linear-gradient(135deg, rgba(${idx === 0 ? '251,191,36' : idx === 1 ? '203,213,225' : '245,158,11'},0.08), rgba(0,0,0,0))`
                      : 'rgba(15,23,42,0.5)',
                    border: `1px solid rgba(${idx === 0 ? '251,191,36' : idx === 1 ? '203,213,225' : idx === 2 ? '245,158,11' : '51,65,85'},${isTop3 ? '0.3' : '0.15'})`,
                    borderRadius: 18,
                    backdropFilter: 'blur(10px)',
                    boxShadow: idx === 0
                      ? '0 0 30px rgba(251,191,36,0.1)'
                      : '0 2px 12px rgba(0,0,0,0.2)',
                    animation: `rankIn 0.4s ease ${idx * 0.05}s both`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <style>{`@keyframes rankIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }`}</style>

                  {/* Rank number / medal */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: isTop3
                      ? `linear-gradient(135deg, rgba(${idx === 0 ? '251,191,36' : idx === 1 ? '203,213,225' : '245,158,11'},0.2), rgba(${idx === 0 ? '251,191,36' : idx === 1 ? '203,213,225' : '245,158,11'},0.08))`
                      : 'rgba(30,41,59,0.8)',
                    border: `2px solid rgba(${idx === 0 ? '251,191,36' : idx === 1 ? '203,213,225' : idx === 2 ? '245,158,11' : '51,65,85'},${isTop3 ? '0.4' : '0.2'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isTop3 ? 24 : 18,
                    fontWeight: 900,
                    color: isTop3 ? medalColor : '#64748b',
                    flexShrink: 0
                  }}>
                    {isTop3 ? medal : idx + 1}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isTop3 ? '#fff' : '#e2e8f0',
                      fontSize: isTop3 ? 20 : 17,
                      fontWeight: isTop3 ? 800 : 600,
                      letterSpacing: '-0.3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {contestant.memberName}
                    </div>
                    {contestant.unitName && (
                      <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                        {contestant.unitName}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      color: isTop3 ? medalColor : '#64748b',
                      fontSize: isTop3 ? 28 : 22,
                      fontWeight: 900,
                      letterSpacing: '-1px'
                    }}>
                      {contestant.score ?? 0}
                    </div>
                    <div style={{ color: '#334155', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      puntos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '12px 40px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#22c55e',
          animation: 'pulse 2s infinite'
        }} />
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        <div style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>
          Actualizando automáticamente cada 5 segundos
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
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  }
};

export default FinalContestRanking;
