import React, { useState, useCallback } from 'react';
import {
  Trophy, Plus, Play, Square, Trash2, Edit2, ChevronDown, ChevronRight,
  Users, ExternalLink, Copy, CheckCircle, AlertCircle, Award, Save,
  ToggleLeft, ToggleRight, BookOpen, Zap, Eye, RefreshCw, X, Star, Upload
} from 'lucide-react';
import ImportQuestionsModal from './ImportQuestionsModal';

// ─────────────────────────────────────────────────────────────────────────────
// FinalContestAdmin
// Admin panel for creating and managing "Final" contests.
// ─────────────────────────────────────────────────────────────────────────────

const generateJudgeCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const QUESTION_TYPES = [
  { type: 'select', label: 'Selección Múltiple' },
  { type: 'true_false', label: 'Verdadero / Falso' },
  { type: 'complete', label: 'Completar' }
];

const FinalContestAdmin = ({
  sessions = [],
  responses = [],
  members = [],
  units = [],
  currentUser,
  onSaveSession,
  onDeleteSession,
  onUpdateSessionStatus,
  onSaveFinalResponse,
  onUpdateRanking,
}) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'monitor'
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const emptyForm = {
    title: '',
    description: '',
    status: 'draft',
    modules: [{ id: 'mod_' + Date.now(), title: 'Módulo 1', type: 'sequential', questions: [] }],
    activeModuleIndex: -1,
    contestants: [],
    ranking: [],
    judgeCode: generateJudgeCode(),
    connectedJudges: [],
    presenterRevealedQuestionId: null
  };

  const [form, setForm] = useState(emptyForm);
  const [expandedModId, setExpandedModId] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('general'); // 'general' | 'modules' | 'participants'
  const [listFilter, setListFilter] = useState('all');

  // ── Participant selection ──────────────────────────────────────────────────
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedContestants, setSelectedContestants] = useState([]);

  // ── Ranking edit ──────────────────────────────────────────────────────────
  const [rankingScores, setRankingScores] = useState({});
  const [savingRanking, setSavingRanking] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getUnitName = (unitId) => {
    if (!unitId) return 'Sin Unidad';
    return units.find(u => String(u.id) === String(unitId))?.name || unitId;
  };

  const filteredSessions = sessions.filter(s => {
    if (listFilter === 'all') return true;
    return s.status === listFilter;
  });

  // ── New / Edit session ─────────────────────────────────────────────────────
  const handleNew = () => {
    setForm({ ...emptyForm, judgeCode: generateJudgeCode(), modules: [{ id: 'mod_' + Date.now(), title: 'Módulo 1', type: 'sequential', questions: [] }] });
    setEditingSessionId(null);
    setActiveFormTab('general');
    setExpandedModId(null);
    setSelectedContestants([]);
    setActiveTab('create');
  };

  const handleEdit = (session) => {
    setForm({
      title: session.title || '',
      description: session.description || '',
      status: session.status || 'draft',
      modules: JSON.parse(JSON.stringify(session.modules || [])),
      activeModuleIndex: session.activeModuleIndex ?? -1,
      contestants: [...(session.contestants || [])],
      ranking: JSON.parse(JSON.stringify(session.ranking || [])),
      judgeCode: session.judgeCode || generateJudgeCode(),
      connectedJudges: session.connectedJudges || [],
      presenterRevealedQuestionId: session.presenterRevealedQuestionId ?? null
    });
    setEditingSessionId(session.id);
    setSelectedContestants([...(session.contestants || [])]);
    setActiveFormTab('general');
    setExpandedModId(null);
    setActiveTab('create');
  };

  const handleMonitor = (session) => {
    setSelectedSession(session);
    // Initialize ranking scores
    const scores = {};
    (session.ranking || []).forEach(r => { scores[r.memberId] = r.score ?? 0; });
    setRankingScores(scores);
    setActiveTab('monitor');
  };

  // ── Save session ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { alert('El concurso necesita un título.'); return; }
    for (const mod of form.modules) {
      if (mod.type !== 'contesta' && mod.questions.length === 0) {
        alert(`El módulo "${mod.title}" no tiene preguntas.`);
        return;
      }
      if (mod.type === 'contesta' && mod.questions.length === 0) {
        alert(`El módulo de Contesta "${mod.title}" no tiene preguntas.`);
        return;
      }
    }

    const sessionData = {
      ...form,
      mode: 'final',
      contestants: selectedContestants,
      ranking: selectedContestants.map(memberId => {
        const m = members.find(m => String(m.id) === String(memberId));
        const existing = (form.ranking || []).find(r => String(r.memberId) === String(memberId));
        return {
          memberId,
          memberName: m ? `${m.firstName} ${m.lastName}` : memberId,
          unitName: m ? getUnitName(m.unitId) : '',
          score: existing?.score ?? 0
        };
      }),
      id: editingSessionId || 'final_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin'
    };

    await onSaveSession(sessionData);
    setActiveTab('list');
  };

  // ── Delete session ─────────────────────────────────────────────────────────
  const handleDelete = async (sessionId) => {
    if (!confirm('¿Eliminar este concurso Final y todos sus datos?')) return;
    await onDeleteSession(sessionId);
  };

  // ── Module management ──────────────────────────────────────────────────────
  const addModule = (type = 'sequential') => {
    const id = 'mod_' + Date.now();
    const title = type === 'contesta' ? 'Contesta' : `Módulo ${form.modules.length + 1}`;
    setForm(p => ({ ...p, modules: [...p.modules, { id, title, type, questions: [] }] }));
    setExpandedModId(id);
  };

  const removeModule = (modId) => {
    if (form.modules.length === 1) { alert('Debe haber al menos un módulo.'); return; }
    if (!confirm('¿Eliminar este módulo?')) return;
    setForm(p => ({ ...p, modules: p.modules.filter(m => m.id !== modId) }));
  };

  const updateModuleTitle = (modId, title) => {
    setForm(p => ({ ...p, modules: p.modules.map(m => m.id === modId ? { ...m, title } : m) }));
  };

  // ── Question management ────────────────────────────────────────────────────
  const addQuestion = (modId, type) => {
    const q = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type,
      questionText: '',
      hint: '',
      correctAnswer: type === 'true_false' ? true : '',
      options: type === 'select' ? ['', ''] : undefined,
      answer: '' // for contesta modules
    };
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? { ...m, questions: [...m.questions, q] } : m)
    }));
  };

  const addContestaQuestion = (modId) => {
    const q = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'contesta',
      questionText: '',
      answer: '',
      hint: '',
      revealed: false
    };
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? { ...m, questions: [...m.questions, q] } : m)
    }));
  };

  const updateQuestion = (modId, qId, field, value) => {
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? {
        ...m,
        questions: m.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
      } : m)
    }));
  };

  const removeQuestion = (modId, qId) => {
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? { ...m, questions: m.questions.filter(q => q.id !== qId) } : m)
    }));
  };

  const updateOption = (modId, qId, optIdx, value) => {
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? {
        ...m,
        questions: m.questions.map(q => {
          if (q.id !== qId) return q;
          const opts = [...(q.options || [])];
          opts[optIdx] = value;
          return { ...q, options: opts };
        })
      } : m)
    }));
  };

  const addOption = (modId, qId) => {
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? {
        ...m,
        questions: m.questions.map(q => q.id === qId ? { ...q, options: [...(q.options || []), ''] } : q)
      } : m)
    }));
  };

  const removeOption = (modId, qId, optIdx) => {
    setForm(p => ({
      ...p,
      modules: p.modules.map(m => m.id === modId ? {
        ...m,
        questions: m.questions.map(q => q.id === qId ? {
          ...q,
          options: (q.options || []).filter((_, i) => i !== optIdx)
        } : q)
      } : m)
    }));
  };

  // ── Activate / Deactivate module ───────────────────────────────────────────
  const handleActivateModule = async (session, moduleIndex) => {
    const newIndex = session.activeModuleIndex === moduleIndex ? -1 : moduleIndex;
    await onUpdateSessionStatus(session.id, { activeModuleIndex: newIndex });
    setSelectedSession(prev => prev ? { ...prev, activeModuleIndex: newIndex } : prev);
  };

  // ── Start / Stop session ───────────────────────────────────────────────────
  const handleToggleStatus = async (session) => {
    const newStatus = session.status === 'active' ? 'completed' : 'active';
    await onUpdateSessionStatus(session.id, { status: newStatus });
    setSelectedSession(prev => prev ? { ...prev, status: newStatus } : prev);
  };

  // ── Copy link helper ───────────────────────────────────────────────────────
  const copyLink = (type, sessionId) => {
    const base = window.location.origin + window.location.pathname;
    const url = `${base}#final-${type}?session=${sessionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openWindow = (type, sessionId) => {
    const base = window.location.origin + window.location.pathname;
    window.open(`${base}#final-${type}?session=${sessionId}`, `_final_${type}_${sessionId}`, 'width=1280,height=800');
  };

  // ── Save ranking ───────────────────────────────────────────────────────────
  const handleSaveRanking = async () => {
    if (!selectedSession) return;
    setSavingRanking(true);
    const updatedRanking = (selectedSession.ranking || []).map(r => ({
      ...r,
      score: Number(rankingScores[r.memberId] ?? r.score ?? 0)
    }));
    await onUpdateSessionStatus(selectedSession.id, { ranking: updatedRanking });
    setSelectedSession(prev => prev ? { ...prev, ranking: updatedRanking } : prev);
    setSavingRanking(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── List view ──────────────────────────────────────────────────────────────
  const renderList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Concursos Final</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gestiona los concursos de la modalidad Final</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Concurso Final
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-fit border border-gray-100">
        {[['all', 'Todos'], ['draft', 'Borrador'], ['active', 'Activo'], ['completed', 'Completado']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setListFilter(v)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${listFilter === v ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">No hay concursos Final aún</p>
          <button onClick={handleNew} className="mt-3 text-amber-500 font-bold text-sm hover:underline">
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map(sess => (
            <div key={sess.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-gray-900 tracking-tight truncate">{sess.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {(sess.modules || []).length} módulos · {(sess.contestants || []).length} concursantes · Creado {new Date(sess.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    sess.status === 'active' ? 'bg-green-100 text-green-600' :
                    sess.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {sess.status === 'active' ? '● Activo' : sess.status === 'completed' ? 'Completado' : 'Borrador'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <button onClick={() => handleMonitor(sess)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Monitor
                </button>
                <button onClick={() => handleEdit(sess)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => handleDelete(sess.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Create / Edit form ─────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveTab('list')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {editingSessionId ? 'Editar Concurso Final' : 'Nuevo Concurso Final'}
        </h2>
      </div>

      {/* Form tabs */}
      <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
        {[['general', 'General'], ['modules', 'Módulos'], ['participants', 'Participantes']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setActiveFormTab(v)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFormTab === v ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* General */}
      {activeFormTab === 'general' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Título del Concurso</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ej: Gran Final Conexión Bíblica 2025"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-gray-800 font-semibold focus:outline-none focus:border-amber-300 transition-colors bg-gray-50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Descripción (opcional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descripción del concurso..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-gray-800 font-medium text-sm resize-none focus:outline-none focus:border-amber-300 transition-colors bg-gray-50"
            />
          </div>

          {/* Judge code */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Código de Acceso para Jueces</span>
              <button
                onClick={() => setForm(p => ({ ...p, judgeCode: generateJudgeCode() }))}
                className="text-xs text-indigo-400 hover:text-indigo-600 font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Regenerar
              </button>
            </div>
            <div className="text-3xl font-black text-indigo-800 tracking-[0.3em] mt-1">{form.judgeCode}</div>
            <div className="text-xs text-indigo-400 mt-1">Comparte este código con los jueces para que puedan acceder al portal.</div>
          </div>
        </div>
      )}

      {/* Modules */}
      {activeFormTab === 'modules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lista de Módulos</span>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" /> Importar Preguntas (Excel/JSON)
            </button>
          </div>
          {form.modules.map((mod, modIdx) => (
            <div key={mod.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Module header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedModId(expandedModId === mod.id ? null : mod.id)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${mod.type === 'contesta' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {mod.type === 'contesta' ? '🎯' : modIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    value={mod.title}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateModuleTitle(mod.id, e.target.value)}
                    className="font-bold text-gray-800 bg-transparent outline-none w-full text-sm"
                  />
                  <div className="text-xs text-gray-400">
                    {mod.type === 'contesta' ? '📋 Módulo presencial (tablero)' : `📝 ${mod.questions.length} preguntas`}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${mod.type === 'contesta' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {mod.type === 'contesta' ? 'Contesta' : 'Secuencial'}
                </span>
                {expandedModId === mod.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <button
                  onClick={e => { e.stopPropagation(); removeModule(mod.id); }}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Module content */}
              {expandedModId === mod.id && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {mod.type === 'contesta' ? (
                    // Contesta questions (question + answer pairs)
                    <>
                      {mod.questions.map((q, qi) => (
                        <div key={q.id} className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-600">Pregunta {qi + 1}</span>
                            <button onClick={() => removeQuestion(mod.id, q.id)} className="text-red-400 hover:text-red-600">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            value={q.questionText}
                            onChange={e => updateQuestion(mod.id, q.id, 'questionText', e.target.value)}
                            placeholder="Escribe la pregunta..."
                            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:border-amber-400"
                          />
                          <input
                            value={q.answer || ''}
                            onChange={e => updateQuestion(mod.id, q.id, 'answer', e.target.value)}
                            placeholder="Respuesta correcta (visible solo para jueces)..."
                            className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm font-medium bg-green-50 focus:outline-none focus:border-green-400 text-green-800"
                          />
                          <input
                            value={q.hint || ''}
                            onChange={e => updateQuestion(mod.id, q.id, 'hint', e.target.value)}
                            placeholder="Pista (opcional)..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-white focus:outline-none focus:border-gray-300"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => addContestaQuestion(mod.id)}
                        className="w-full py-2.5 border-2 border-dashed border-amber-200 rounded-xl text-amber-500 font-bold text-sm hover:border-amber-300 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Añadir Pregunta al Tablero
                      </button>
                    </>
                  ) : (
                    // Sequential questions
                    <>
                      {mod.questions.map((q, qi) => (
                        <SequentialQuestionEditor
                          key={q.id}
                          question={q}
                          index={qi}
                          modId={mod.id}
                          onUpdate={updateQuestion}
                          onRemove={removeQuestion}
                          onAddOption={addOption}
                          onRemoveOption={removeOption}
                          onUpdateOption={updateOption}
                        />
                      ))}
                      <div className="flex gap-2 flex-wrap">
                        {QUESTION_TYPES.map(({ type, label }) => (
                          <button
                            key={type}
                            onClick={() => addQuestion(mod.id, type)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add module buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => addModule('sequential')}
              className="flex-1 py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Módulo Secuencial
            </button>
            {!form.modules.some(m => m.type === 'contesta') && (
              <button
                onClick={() => addModule('contesta')}
                className="flex-1 py-3 border-2 border-dashed border-amber-200 rounded-xl text-amber-500 font-bold text-sm hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Módulo Contesta
              </button>
            )}
          </div>
        </div>
      )}

      {/* Participants */}
      {activeFormTab === 'participants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-gray-800">Concursantes</div>
              <div className="text-xs text-gray-400 mt-0.5">{selectedContestants.length} seleccionados</div>
            </div>
            <button
              onClick={() => setShowParticipantsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
            >
              <Users className="w-4 h-4" /> Seleccionar
            </button>
          </div>

          {selectedContestants.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Ningún concursante seleccionado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedContestants.map(id => {
                const m = members.find(m => String(m.id) === String(id));
                if (!m) return null;
                return (
                  <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{m.firstName} {m.lastName}</div>
                      <div className="text-xs text-gray-400">{getUnitName(m.unitId)}</div>
                    </div>
                    <button
                      onClick={() => setSelectedContestants(p => p.filter(x => x !== id))}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black text-base shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {editingSessionId ? 'Guardar Cambios' : 'Crear Concurso Final'}
      </button>
    </div>
  );

  // ── Monitor view ───────────────────────────────────────────────────────────
  const renderMonitor = () => {
    if (!selectedSession) return null;
    const sess = sessions.find(s => s.id === selectedSession.id) || selectedSession;

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('list')} className="text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900 tracking-tight truncate">{sess.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${sess.status === 'active' ? 'bg-green-100 text-green-600' : sess.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {sess.status === 'active' ? '● En vivo' : sess.status === 'completed' ? 'Completado' : 'Borrador'}
              </span>
              <span className="text-xs text-gray-400">Código jueces: <strong className="text-indigo-600 tracking-wider">{sess.judgeCode}</strong></span>
            </div>
          </div>
          <button
            onClick={() => handleToggleStatus(sess)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${sess.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
          >
            {sess.status === 'active' ? <><Square className="w-4 h-4" /> Detener</> : <><Play className="w-4 h-4" /> Activar</>}
          </button>
        </div>

        {/* External links */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'presenter', label: 'Presentador', icon: '🖥️', color: 'amber' },
            { type: 'judge', label: 'Jueces', icon: '⚖️', color: 'indigo' },
            { type: 'ranking', label: 'Clasificación', icon: '🏆', color: 'green' }
          ].map(({ type, label, icon, color }) => (
            <div key={type} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className={`text-xs font-black text-${color}-700 mb-2`}>{label}</div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => openWindow(type, sess.id)}
                  className={`w-full py-1.5 bg-${color}-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1`}
                  style={{ background: color === 'amber' ? '#d97706' : color === 'indigo' ? '#4f46e5' : '#16a34a' }}
                >
                  <ExternalLink className="w-3 h-3" /> Abrir
                </button>
                <button
                  onClick={() => copyLink(type, sess.id)}
                  className={`w-full py-1.5 bg-white border border-${color}-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1`}
                  style={{ color: color === 'amber' ? '#d97706' : color === 'indigo' ? '#4f46e5' : '#16a34a' }}
                >
                  {copied === type ? <><CheckCircle className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Module activation */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="font-black text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Módulo Activo
          </div>
          <div className="space-y-2">
            {(sess.modules || []).map((mod, idx) => {
              const isActive = sess.activeModuleIndex === idx;
              const isContesta = mod.type === 'contesta';
              return (
                <div key={mod.id} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isActive ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isContesta ? 'bg-amber-100 text-amber-600' : isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                      {isContesta ? '🎯' : idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{mod.title}</div>
                      <div className="text-xs text-gray-400">{isContesta ? 'Tablero presencial' : `${mod.questions.length} preguntas`}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleActivateModule(sess, idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'}`}
                  >
                    {isActive ? <><Square className="w-3 h-3" /> Desactivar</> : <><Play className="w-3 h-3" /> Activar</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking manual input */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-black text-gray-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Puntajes Manuales
            </div>
            <button
              onClick={handleSaveRanking}
              disabled={savingRanking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors"
            >
              {savingRanking ? 'Guardando...' : <><Save className="w-3 h-3" /> Actualizar</>}
            </button>
          </div>
          {(sess.ranking || []).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No hay concursantes en el ranking.</p>
          ) : (
            <div className="space-y-2">
              {(sess.ranking || [])
                .sort((a, b) => (rankingScores[b.memberId] ?? b.score ?? 0) - (rankingScores[a.memberId] ?? a.score ?? 0))
                .map((contestant, idx) => (
                  <div key={contestant.memberId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-400">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-sm truncate">{contestant.memberName}</div>
                      <div className="text-xs text-gray-400">{contestant.unitName}</div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={rankingScores[contestant.memberId] ?? contestant.score ?? 0}
                      onChange={e => setRankingScores(p => ({ ...p, [contestant.memberId]: Number(e.target.value) }))}
                      className="w-20 px-3 py-1.5 border-2 border-gray-200 rounded-lg text-center text-sm font-black text-gray-800 focus:outline-none focus:border-amber-300"
                    />
                    <span className="text-xs text-gray-400 font-bold">pts</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Connected judges */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="font-black text-indigo-800 text-sm mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Jueces Conectados ({(sess.connectedJudges || []).length}/4)
          </div>
          {(sess.connectedJudges || []).length === 0 ? (
            <p className="text-xs text-indigo-400">Ningún juez conectado aún.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(sess.connectedJudges || []).map((j, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                  ⚖️ {j.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Participants modal ─────────────────────────────────────────────────────
  const renderParticipantsModal = () => {
    const eligible = members.filter(m => m.firstName && m.lastName);
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Seleccionar Concursantes</h3>
            <button onClick={() => setShowParticipantsModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {eligible.map(m => {
              const isSelected = selectedContestants.some(id => String(id) === String(m.id));
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedContestants(p =>
                    isSelected ? p.filter(id => id !== m.id) : [...p, m.id]
                  )}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{m.firstName} {m.lastName}</div>
                    <div className="text-xs text-gray-400">{getUnitName(m.unitId)}</div>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-indigo-500" />}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setShowParticipantsModal(false)}
            className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Confirmar ({selectedContestants.length} seleccionados)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {activeTab === 'list' && renderList()}
      {activeTab === 'create' && renderForm()}
      {activeTab === 'monitor' && renderMonitor()}
      {showParticipantsModal && renderParticipantsModal()}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(importedModules) => setForm(p => {
          const existing = p.modules || [];
          if (existing.length === 1 && existing[0].questions.length === 0 && existing[0].title === 'Módulo 1') {
            return { ...p, modules: importedModules };
          }
          const clonedExisting = JSON.parse(JSON.stringify(existing));
          importedModules.forEach(importedMod => {
            const existingMod = clonedExisting.find(
              m => m.title.trim().toLowerCase() === importedMod.title.trim().toLowerCase()
            );
            if (existingMod) {
              const newQuestions = importedMod.questions.map((q, idx) => ({
                ...q,
                id: 'q_import_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4)
              }));
              existingMod.questions = [...existingMod.questions, ...newQuestions];
            } else {
              clonedExisting.push(importedMod);
            }
          });
          return { ...p, modules: clonedExisting };
        })}
      />
    </div>
  );
};

// ── Sequential question editor sub-component ──────────────────────────────────
const SequentialQuestionEditor = ({ question: q, index, modId, onUpdate, onRemove, onAddOption, onRemoveOption, onUpdateOption }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">
        {q.type === 'select' ? 'Selección Múltiple' : q.type === 'true_false' ? 'Verdadero / Falso' : 'Completar'} — P{index + 1}
      </span>
      <button onClick={() => onRemove(modId, q.id)} className="text-red-400 hover:text-red-600">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
    <input
      value={q.questionText}
      onChange={e => onUpdate(modId, q.id, 'questionText', e.target.value)}
      placeholder="Escribe la pregunta..."
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:border-indigo-300"
    />

    {q.type === 'select' && (
      <div className="space-y-2">
        {(q.options || []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={q.correctAnswer === opt}
              onChange={() => onUpdate(modId, q.id, 'correctAnswer', opt)}
              className="accent-indigo-500"
            />
            <input
              value={opt}
              onChange={e => onUpdateOption(modId, q.id, i, e.target.value)}
              placeholder={`Opción ${String.fromCharCode(65 + i)}`}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-300"
            />
            <button onClick={() => onRemoveOption(modId, q.id, i)} className="text-red-300 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button onClick={() => onAddOption(modId, q.id)} className="text-xs text-indigo-500 font-bold hover:underline">
          + Añadir opción
        </button>
      </div>
    )}

    {q.type === 'true_false' && (
      <div className="flex gap-3 text-sm">
        {[{ v: true, l: 'Verdadero' }, { v: false, l: 'Falso' }].map(({ v, l }) => (
          <label key={String(v)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 cursor-pointer font-bold ${q.correctAnswer === v ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}>
            <input type="radio" checked={q.correctAnswer === v} onChange={() => onUpdate(modId, q.id, 'correctAnswer', v)} className="hidden" />
            {l}
          </label>
        ))}
      </div>
    )}

    {q.type === 'complete' && (
      <input
        value={q.correctAnswer || ''}
        onChange={e => onUpdate(modId, q.id, 'correctAnswer', e.target.value)}
        placeholder="Respuesta correcta..."
        className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm bg-green-50 text-green-800 font-medium focus:outline-none focus:border-green-400"
      />
    )}
  </div>
);

export default FinalContestAdmin;
