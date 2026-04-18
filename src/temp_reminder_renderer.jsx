// ===================================
// REMINDERS MODULE RENDERER
// ===================================
const renderRemindersModule = () => {
    // Sort reminders: Upcoming first (by date then time)
    const sortedReminders = [...reminders].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-8 h-8 text-red-600 dark:text-red-400" />
                        Recordatorios
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona tus tareas y eventos importantes del club
                    </p>
                </div>
                <button
                    onClick={handleAddReminder}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Recordatorio
                </button>
            </div>

            {/* Reminders List */}
            {sortedReminders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes recordatorios</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Crea recordatorios para no olvidar eventos importantes, tareas administrativas o fechas límite.
                    </p>
                    <button
                        onClick={handleAddReminder}
                        className="text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                        Crear mi primer recordatorio
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedReminders.map((reminder) => {
                        const dateObj = new Date(`${reminder.date}T${reminder.time}`);
                        const isPast = dateObj < new Date();

                        return (
                            <div
                                key={reminder.id}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow relative group ${isPast ? 'opacity-75' : ''}`}
                            >
                                <div className={`h-1 w-full ${isPast ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-500'}`}></div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className={`font-bold text-lg ${isPast ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                            {reminder.title}
                                        </h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditReminder(reminder)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReminder(reminder.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(reminder.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{reminder.time}</span>
                                        </div>
                                    </div>

                                    {reminder.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            {reminder.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            {showReminderForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
                            </h3>
                            <button
                                onClick={handleCancelReminder}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={reminderFormData.title}
                                    onChange={(e) => setReminderFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ej: Reunión de Directiva"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={reminderFormData.date}
                                        onChange={(e) => setReminderFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Hora
                                    </label>
                                    <input
                                        type="time"
                                        value={reminderFormData.time}
                                        onChange={(e) => setReminderFormData(prev => ({ ...prev, time: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={reminderFormData.description}
                                    onChange={(e) => setReminderFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="3"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Detalles adicionales..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={handleCancelReminder}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveReminder}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow transition-all font-medium flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
