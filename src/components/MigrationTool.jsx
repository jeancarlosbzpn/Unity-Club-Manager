import React, { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, Loader2, Cloud } from 'lucide-react';
import { dataService } from '../services/dataService';

const MigrationTool = ({ onComplete }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const migrateData = async (manualData = null) => {
    setStatus('loading');
    addLog("Iniciando proceso de migración...");

    try {
      let dataToSync = manualData;
      
      if (!dataToSync) {
        if (!window.electronAPI) {
          throw new Error("No se detectó Electron. Por favor usa el botón de subida manual.");
        }
        addLog("Leyendo datos desde la aplicación de escritorio...");
        dataToSync = await window.electronAPI.readData();
      } else {
        addLog("Datos recibidos manualmente. Procesando JSON...");
      }

      const keys = Object.keys(dataToSync);
      addLog(`Encontradas ${keys.length} categorías de datos. Preparando subida a Firebase...`);

      for (const key of keys) {
        addLog(`Subiendo: ${key}...`);
        await dataService.writeData(key, dataToSync[key]);
      }

      setStatus('success');
      addLog("✅ ¡Migración completada con éxito!");
      if (onComplete) onComplete();
    } catch (error) {
      console.error(error);
      setStatus('error');
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        migrateData(json);
      } catch (err) {
        alert("El archivo no es un JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/30">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <Cloud className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Migración a la Nube</h2>
            <p className="text-blue-100 text-sm">Transfiere tus datos locales a Firebase</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {status === 'idle' && (
          <div className="space-y-6 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Esto subirá todos tus miembros, finanzas y actividades a la cuenta de Firebase conectada.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {window.electronAPI && (
                <button
                  onClick={() => migrateData()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  Sincronización Automática (Electron)
                </button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500">O sube tu archivo manualmente</span></div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <label className="w-full cursor-pointer bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 p-6 rounded-xl transition-all">
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Seleccionar archivo .json (p.ej. vencedores-data.json)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {(status === 'loading' || status === 'success' || status === 'error') && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-48 border border-gray-200 dark:border-gray-700">
              {log.map((line, i) => (
                <div key={i} className="py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-blue-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span className="dark:text-gray-300">{line}</span>
                </div>
              ))}
              {status === 'loading' && (
                <div className="flex items-center gap-2 mt-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </div>
              )}
            </div>

            {status === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle className="text-green-600 w-6 h-6" />
                <p className="text-green-800 dark:text-green-200 font-medium">¡Datos sincronizados! Ya puedes usar la versión web.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3">
                <AlertTriangle className="text-red-600 w-6 h-6" />
                <p className="text-red-800 dark:text-red-200 font-medium">Ocurrió un error inesperado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationTool;
