import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileText, Code, Copy, HelpCircle } from 'lucide-react';

const CSV_HEADER_EXAMPLE = 'Modulo,TipoModulo,TipoPregunta,Pregunta,Opciones,Respuesta,Pista';
const CSV_CONTENT_EXAMPLE = `Modulo 1,sequential,select,¿Quién construyó el arca?,Moisés|Noé|David,Noé,Génesis 6
Modulo 1,sequential,true_false,¿La Biblia tiene 66 libros?,Verdadero|Falso,true,39 en el AT y 27 en el NT
Modulo 1,sequential,complete,El primer libro de la Biblia es _______.,,Génesis,Comienza con la creación
Módulo Contesta,contesta,contesta,¿Quién derrotó a Goliat?,,David,Era un pastor de ovejas`;

const JSON_EXAMPLE = `[
  {
    "title": "Módulo 1",
    "type": "sequential",
    "questions": [
      {
        "type": "select",
        "questionText": "¿Quién construyó el arca?",
        "options": ["Moisés", "Noé", "David"],
        "correctAnswer": "Noé",
        "hint": "Génesis 6"
      },
      {
        "type": "true_false",
        "questionText": "¿La Biblia tiene 66 libros?",
        "correctAnswer": true,
        "hint": "39 en el AT y 27 en el NT"
      },
      {
        "type": "complete",
        "questionText": "El primer libro de la Biblia es _______.",
        "correctAnswer": "Génesis",
        "hint": "Comienza con la creación"
      }
    ]
  },
  {
    "title": "Módulo Contesta",
    "type": "contesta",
    "questions": [
      {
        "type": "contesta",
        "questionText": "¿Quién derrotó a Goliat?",
        "answer": "David",
        "hint": "Era un pastor de ovejas"
      }
    ]
  }
]`;

export const parseCSVData = (text) => {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  
  // Auto-detect delimiter (comma vs semicolon)
  const firstLine = text.split('\n')[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
};

const ImportQuestionsModal = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'json'
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [parsedModules, setParsedModules] = useState([]);
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleCopyTemplate = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);
    setParsedModules([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setFileContent(text);
      validateAndParse(text, file.name.endsWith('.json') ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  const validateAndParse = (text, format) => {
    const errs = [];
    const modulesMap = {};

    if (format === 'json') {
      try {
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          errs.push('El archivo JSON debe contener un arreglo de módulos en la raíz.');
          setErrors(errs);
          return;
        }

        data.forEach((mod, modIdx) => {
          const modTitle = mod.title || `Módulo ${modIdx + 1}`;
          const modType = mod.type || 'sequential';
          
          if (modType !== 'sequential' && modType !== 'contesta') {
            errs.push(`Módulo ${modIdx + 1}: El tipo debe ser 'sequential' o 'contesta'.`);
            return;
          }

          if (!Array.isArray(mod.questions)) {
            errs.push(`Módulo "${modTitle}": Campo "questions" debe ser un arreglo.`);
            return;
          }

          const questions = [];
          mod.questions.forEach((q, qIdx) => {
            const type = q.type || (modType === 'contesta' ? 'contesta' : 'select');
            
            if (modType === 'contesta' && type !== 'contesta') {
              errs.push(`Módulo "${modTitle}" (Contesta): Pregunta ${qIdx + 1} tiene tipo inválido "${type}". Debe ser "contesta".`);
              return;
            }

            if (!q.questionText || !q.questionText.trim()) {
              errs.push(`Módulo "${modTitle}": Pregunta ${qIdx + 1} no tiene texto ("questionText").`);
              return;
            }

            let parsedQ = {
              id: 'q_import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              type,
              questionText: q.questionText.trim(),
              hint: q.hint || ''
            };

            if (type === 'select') {
              if (!Array.isArray(q.options) || q.options.length < 2) {
                errs.push(`Módulo "${modTitle}" P${qIdx + 1}: Las preguntas de opción múltiple requieren al menos 2 opciones.`);
                return;
              }
              parsedQ.options = q.options.map(o => String(o).trim());
              parsedQ.correctAnswer = q.correctAnswer !== undefined ? String(q.correctAnswer).trim() : parsedQ.options[0];
            } else if (type === 'true_false') {
              parsedQ.correctAnswer = typeof q.correctAnswer === 'boolean' ? q.correctAnswer : q.correctAnswer === 'true';
            } else if (type === 'complete') {
              parsedQ.correctAnswer = q.correctAnswer !== undefined ? String(q.correctAnswer).trim() : '';
            } else if (type === 'contesta') {
              parsedQ.answer = q.answer !== undefined ? String(q.answer).trim() : '';
              parsedQ.revealed = false;
            }

            questions.push(parsedQ);
          });

          if (!modulesMap[modTitle]) {
            modulesMap[modTitle] = {
              id: 'mod_import_' + Date.now() + '_' + modIdx,
              title: modTitle,
              type: modType,
              questions
            };
          } else {
            modulesMap[modTitle].questions.push(...questions);
          }
        });

      } catch (e) {
        errs.push(`Error de sintaxis JSON: ${e.message}`);
      }
    } else {
      // CSV format
      const rows = parseCSVData(text);
      if (rows.length < 2) {
        errs.push('El archivo CSV está vacío o le falta la fila de encabezados.');
        setErrors(errs);
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const expectedHeaders = ['modulo', 'tipomodulo', 'tipopregunta', 'pregunta', 'opciones', 'respuesta', 'pista'];
      
      const missing = expectedHeaders.filter(h => !headers.includes(h));
      if (missing.length > 0) {
        errs.push(`Encabezados faltantes en el CSV: ${missing.join(', ')}.`);
        errs.push(`Se esperaba: Modulo, TipoModulo, TipoPregunta, Pregunta, Opciones, Respuesta, Pista`);
        setErrors(errs);
        return;
      }

      const getVal = (row, headerName) => {
        const idx = headers.indexOf(headerName);
        return idx !== -1 ? row[idx] : '';
      };

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) continue; // skip empty line

        const modName = getVal(row, 'modulo')?.trim();
        const modType = getVal(row, 'tipomodulo')?.trim().toLowerCase() || 'sequential';
        const qType = getVal(row, 'tipopregunta')?.trim().toLowerCase() || 'select';
        const qText = getVal(row, 'pregunta')?.trim();
        const optsStr = getVal(row, 'opciones')?.trim();
        const respStr = getVal(row, 'respuesta')?.trim();
        const hintStr = getVal(row, 'pista')?.trim();

        if (!modName) {
          errs.push(`Fila ${i + 1}: El nombre del módulo ("Modulo") es obligatorio.`);
          continue;
        }

        if (modType !== 'sequential' && modType !== 'contesta') {
          errs.push(`Fila ${i + 1}: El "TipoModulo" debe ser 'sequential' o 'contesta'.`);
          continue;
        }

        if (!qText) {
          errs.push(`Fila ${i + 1}: El texto de la pregunta ("Pregunta") es obligatorio.`);
          continue;
        }

        let options = [];
        if (qType === 'select') {
          if (!optsStr) {
            errs.push(`Fila ${i + 1}: Preguntas tipo 'select' requieren opciones separadas por '|'.`);
            continue;
          }
          options = optsStr.split('|').map(o => o.trim()).filter(o => o !== '');
          if (options.length < 2) {
            errs.push(`Fila ${i + 1}: Debes proveer al menos 2 opciones en la columna 'Opciones'.`);
            continue;
          }
        } else if (qType === 'true_false') {
          options = ['Verdadero', 'Falso'];
        }

        let parsedQ = {
          id: 'q_import_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
          type: qType,
          questionText: qText,
          hint: hintStr || ''
        };

        if (qType === 'select') {
          parsedQ.options = options;
          parsedQ.correctAnswer = respStr || options[0];
        } else if (qType === 'true_false') {
          parsedQ.correctAnswer = respStr === 'true' || respStr === 'Verdadero' || respStr === '1';
        } else if (qType === 'complete') {
          parsedQ.correctAnswer = respStr || '';
        } else if (qType === 'contesta') {
          parsedQ.answer = respStr || '';
          parsedQ.revealed = false;
        }

        if (!modulesMap[modName]) {
          modulesMap[modName] = {
            id: 'mod_import_' + Date.now() + '_' + i,
            title: modName,
            type: modType,
            questions: []
          };
        }
        
        // Validation check for mixed types
        if (modulesMap[modName].type !== modType) {
          errs.push(`Fila ${i + 1}: Módulo "${modName}" ya está definido como '${modulesMap[modName].type}', pero en esta fila se especifica '${modType}'.`);
          continue;
        }

        modulesMap[modName].questions.push(parsedQ);
      }
    }

    setErrors(errs);
    if (errs.length === 0) {
      setParsedModules(Object.values(modulesMap));
    }
  };

  const handleConfirm = () => {
    if (parsedModules.length > 0) {
      onImport(parsedModules);
      onClose();
      // Reset state
      setFileName('');
      setFileContent('');
      setParsedModules([]);
      setErrors([]);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Importar Concurso desde Documento</h3>
            <p className="text-xs text-gray-400 mt-1">Sube un archivo de preguntas en formato CSV (Excel) o JSON</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Format Tabs */}
          <div className="flex gap-1 bg-gray-50 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-100 dark:border-slate-800/80 w-fit">
            <button
              onClick={() => { setActiveTab('csv'); setErrors([]); setParsedModules([]); setFileName(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'csv' ? 'bg-white dark:bg-slate-800 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FileText className="w-4 h-4 text-emerald-500" /> Archivo CSV (Excel)
            </button>
            <button
              onClick={() => { setActiveTab('json'); setErrors([]); setParsedModules([]); setFileName(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'json' ? 'bg-white dark:bg-slate-800 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Code className="w-4 h-4 text-indigo-500" /> Archivo JSON
            </button>
          </div>

          {/* Form instructions and templates */}
          <div className="bg-blue-50/50 dark:bg-slate-800/30 border border-blue-100/50 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex gap-2 items-start text-xs text-blue-800 dark:text-blue-300">
              <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">¿Cómo preparo mi archivo para evitar errores?</p>
                <p className="mt-1">
                  {activeTab === 'csv' 
                    ? 'Crea una hoja de cálculo en Excel o Google Sheets con las columnas indicadas abajo, llena las preguntas y expórtala como archivo CSV (Delimitado por comas).'
                    : 'Crea un archivo de texto con extensión .json conteniendo una estructura estructurada de módulos y preguntas.'
                  }
                </p>
              </div>
            </div>

            {/* Template actions */}
            <div className="flex gap-2 pt-1">
              {activeTab === 'csv' ? (
                <>
                  <button
                    onClick={() => handleCopyTemplate(CSV_HEADER_EXAMPLE, 'header')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> 
                    {copiedText === 'header' ? '¡Copiado!' : 'Copiar Encabezados CSV'}
                  </button>
                  <button
                    onClick={() => handleCopyTemplate(CSV_HEADER_EXAMPLE + '\n' + CSV_CONTENT_EXAMPLE, 'content')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedText === 'content' ? '¡Copiado!' : 'Copiar Ejemplo Completo'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCopyTemplate(JSON_EXAMPLE, 'json')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText === 'json' ? '¡Copiado!' : 'Copiar Plantilla JSON'}
                </button>
              )}
            </div>
          </div>

          {/* File upload input */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={activeTab === 'csv' ? '.csv' : '.json'}
              className="hidden"
            />
            <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-500">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-slate-200">
                {fileName ? `Archivo seleccionado: ${fileName}` : 'Haz clic para seleccionar tu archivo'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeTab === 'csv' ? 'Solo archivos .csv' : 'Solo archivos .json'}
              </p>
            </div>
          </div>

          {/* Errors section */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Se encontraron errores de formato ({errors.length}):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-red-600 dark:text-red-300 font-medium">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validated preview section */}
          {parsedModules.length > 0 && errors.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-black text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Vista Previa del Concurso (Archivo Correcto)</span>
              </div>
              
              <div className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
                {parsedModules.map((mod, idx) => (
                  <div key={idx} className="p-4 bg-gray-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-gray-800 dark:text-slate-200">{mod.title}</span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 ml-2">
                          ({mod.type === 'contesta' ? 'Contesta' : 'Secuencial'})
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {mod.questions.length} preguntas
                      </span>
                    </div>

                    {/* Question quick preview list */}
                    <div className="mt-2 text-xs text-gray-400 max-h-32 overflow-y-auto pl-2 border-l border-indigo-100 dark:border-slate-800 space-y-1">
                      {mod.questions.map((q, qi) => (
                        <div key={qi} className="truncate">
                          <strong className="text-gray-500 dark:text-slate-400">{qi + 1}.</strong> {q.questionText}
                          {q.type === 'select' && <span className="text-[9px] bg-indigo-50 dark:bg-slate-800 text-indigo-500 px-1 rounded ml-1">opciones: {q.options.length}</span>}
                          {q.type === 'true_false' && <span className="text-[9px] bg-amber-50 dark:bg-slate-800 text-amber-500 px-1 rounded ml-1">V/F</span>}
                          {q.type === 'complete' && <span className="text-[9px] bg-green-50 dark:bg-slate-800 text-green-500 px-1 rounded ml-1">completar</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedModules.length === 0 || errors.length > 0}
            className={`px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-md transition-all flex items-center gap-1.5 ${
              parsedModules.length > 0 && errors.length === 0
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-lg active:scale-95'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Confirmar e Importar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImportQuestionsModal;
