import React, { useState } from 'react';
import { BookOpen, Clock, ChevronRight, Check } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FinalContestPortal
// Member-facing portal for the Final contest.
// - Sequential questions: one at a time, no right/wrong feedback.
// - "Contesta" modules are NOT shown here.
// - Shows a waiting screen when no module is active.
// ─────────────────────────────────────────────────────────────────────────────

const FinalContestPortal = ({ sessions = [], member, onSaveFinalResponse, finalResponses = [] }) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Find the active Final session
  const activeSession = sessions.find(s => s.mode === 'final' && s.status === 'active');

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-black text-gray-800 tracking-tight">Sin concurso Final activo</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Cuando el administrador active un concurso Final, aparecerá aquí.
        </p>
      </div>
    );
  }

  // Check if this member is a contestant
  const isContestant = (activeSession.contestants || []).some(
    id => String(id) === String(member.id)
  );

  if (!isContestant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-black text-gray-800 tracking-tight">{activeSession.title}</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-xs">
          No estás registrado como concursante en esta Final.
        </p>
      </div>
    );
  }

  // Find the active module (only sequential types, NOT contesta)
  const activeModuleIndex = activeSession.activeModuleIndex ?? -1;
  const activeModule = activeSession.modules?.[activeModuleIndex];
  const isContesta = activeModule?.type === 'contesta';

  if (!activeModule || isContesta || activeModuleIndex === -1) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping" />
        </div>
        <h3 className="text-xl font-black text-gray-800 tracking-tight">{activeSession.title}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Espera — el administrador activará el siguiente módulo pronto.
        </p>
        <div className="mt-6 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">⚡ Modalidad Final</span>
        </div>
      </div>
    );
  }

  // Get or create member response for this module
  const existingResponse = finalResponses.find(
    r => String(r.memberId) === String(member.id) &&
      r.sessionId === activeSession.id &&
      r.moduleId === activeModule.id
  );

  const answeredCount = Object.keys(existingResponse?.answers || {}).length;
  const questions = activeModule.questions || [];
  const currentQuestionIndex = existingResponse?.currentQuestionIndex ?? 0;

  // Module completed
  if (currentQuestionIndex >= questions.length) {
    return (
      <ModuleCompleted
        session={activeSession}
        module={activeModule}
        answeredCount={answeredCount}
        total={questions.length}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === '') return;
    setSubmitting(true);

    const updatedAnswers = { ...(existingResponse?.answers || {}), [currentQuestion.id]: selectedAnswer };
    const newIndex = currentQuestionIndex + 1;

    const responseData = {
      id: existingResponse?.id || `fresp_${member.id}_${activeSession.id}_${activeModule.id}`,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      sessionId: activeSession.id,
      moduleId: activeModule.id,
      answers: updatedAnswers,
      currentQuestionIndex: newIndex,
      completedAt: newIndex >= questions.length ? new Date().toISOString() : null
    };

    await onSaveFinalResponse(responseData);
    setSelectedAnswer(null);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-lg">
        <div className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-1">
          ⚡ Modalidad Final
        </div>
        <div className="font-black text-xl tracking-tight">{activeSession.title}</div>
        <div className="text-indigo-200 text-sm mt-0.5">{activeModule.title}</div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
          <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
          <span>{Math.round((currentQuestionIndex / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">
          Pregunta {currentQuestionIndex + 1}
        </div>
        <p className="text-gray-900 font-bold text-lg leading-snug mb-5">
          {currentQuestion.questionText}
        </p>

        {/* Multiple choice options */}
        {currentQuestion.type === 'select' && (
          <div className="flex flex-col gap-3">
            {(currentQuestion.options || []).map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnswer(opt)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-semibold text-sm ${
                  selectedAnswer === opt
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <span className={`inline-flex w-6 h-6 rounded-full border-2 mr-3 items-center justify-center text-xs font-black ${
                  selectedAnswer === opt ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* True / False */}
        {currentQuestion.type === 'true_false' && (
          <div className="flex gap-3">
            {[
              { value: true, label: '✅ Verdadero' },
              { value: false, label: '❌ Falso' }
            ].map(({ value, label }) => (
              <button
                key={String(value)}
                onClick={() => setSelectedAnswer(value)}
                className={`flex-1 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                  selectedAnswer === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-indigo-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Complete / Fill-in */}
        {currentQuestion.type === 'complete' && (
          <textarea
            value={selectedAnswer || ''}
            onChange={e => setSelectedAnswer(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={3}
            className="w-full p-4 border-2 border-gray-100 rounded-2xl text-gray-800 font-medium text-sm resize-none focus:outline-none focus:border-indigo-400 bg-gray-50"
          />
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === ''}
        className={`w-full py-4 rounded-2xl font-black text-base tracking-tight transition-all flex items-center justify-center gap-2 ${
          selectedAnswer !== null && selectedAnswer !== undefined && selectedAnswer !== ''
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg active:scale-95'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <span>Enviando...</span>
        ) : currentQuestionIndex + 1 < questions.length ? (
          <>Siguiente Pregunta <ChevronRight className="w-5 h-5" /></>
        ) : (
          <>Finalizar Módulo <Check className="w-5 h-5" /></>
        )}
      </button>
    </div>
  );
};

// ── Module completed sub-component ────────────────────────────────────────────
const ModuleCompleted = ({ session, module, answeredCount, total }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center px-4">
    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center mb-5 shadow-inner">
      <Check className="w-10 h-10 text-green-500" />
    </div>
    <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">¡Módulo completado!</div>
    <div className="text-gray-500 text-sm mb-4">
      Respondiste {answeredCount} de {total} preguntas en <strong>{module.title}</strong>.
    </div>
    <div className="px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
      <span className="text-xs font-black text-amber-600 uppercase tracking-widest">
        Espera el siguiente módulo
      </span>
    </div>
  </div>
);

export default FinalContestPortal;
