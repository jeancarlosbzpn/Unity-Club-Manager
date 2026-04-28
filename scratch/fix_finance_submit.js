
const fs = require('fs');
const content = fs.readFileSync('/Users/jeancarlosbaez/Desktop/Vencedores/src/ClubVencedoresSystem.jsx', 'utf8');
const lines = content.split('\n');
const startLine = 3394;
const endLine = 3500;
const functionContent = lines.slice(startLine - 1, endLine).join('\n');

// A very simple re-formatter for this specific function
const formatted = functionContent
    .replace(/^\s+/gm, '') // Remove existing indentation
    .split('\n')
    .map(line => {
        // Very basic indentation logic
        return '    ' + line; // Add a fixed indentation for now to see if it fixes things
    })
    .join('\n');

// Actually, let's just make it VERY clean manually.
const cleanFunction = `  const handleFinanceSubmit = async () => {
    if (isUploading) {
      alert('⚠️ Por favor, espere a que el comprobante termine de subir antes de guardar.');
      return;
    }
    if (!validateFinanceForm()) return;

    let status = 'official';
    if (financeFormData.type === 'expense') {
      if (!financeFormData.receipt) {
        status = 'pending_receipt';
        if (!confirm('No se ha adjuntado factura. El gasto se guardará como "Pendiente de Factura" y generará una deuda al responsable. ¿Continuar?')) {
          return;
        }
      } else {
        setIsVerifyingReceipt(true);
        try {
          let apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('clubvencedores_gemini_api_key');
          if (!apiKey) {
            apiKey = prompt('Para analizar el comprobante con IA, ingresa tu API Key de Gemini:');
            if (apiKey) {
              localStorage.setItem('clubvencedores_gemini_api_key', apiKey);
            } else {
              if (!confirm('No proporcionaste API Key. El comprobante de gasto se guardará sin verificación inteligente. ¿Continuar?')) {
                setIsVerifyingReceipt(false);
                return;
              }
            }
          }

          if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const sourceReceipt = lastRawReceipt || financeFormData.receipt;
            
            if (sourceReceipt && sourceReceipt.startsWith('data:')) {
              const base64Data = sourceReceipt.split(',')[1];
              const mimeMatch = sourceReceipt.match(/data:([^;]+);base64,/);
              const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              const promptStr = "Analiza este documento/imagen. ¿Es una factura, recibo o comprobante de pago comercial válido? Responde únicamente con 'SI' o 'NO'. Si tienes duda, prefiere decir 'SI'.";
              const imageParts = [{ inlineData: { data: base64Data, mimeType } }];
              const result = await model.generateContent([promptStr, ...imageParts]);
              const responseText = result.response.text().trim().toUpperCase();

              if (!responseText.includes('SI')) {
                alert('🤖 La Inteligencia Artificial ha detectado que la imagen o documento subido NO parece ser una factura o recibo válido. Por favor, sube un archivo correcto.');
                setIsVerifyingReceipt(false);
                return;
              }
            }
          }
        } catch (error) {
          console.error("Error validando comprobante con IA:", error);
          if (!confirm('Ocurrió un error al verificar con IA. ¿Deseas guardar el gasto de todos modos sin validación?')) {
            setIsVerifyingReceipt(false);
            return;
          }
        }
        setIsVerifyingReceipt(false);
      }
    }

    let finalReceipt = financeFormData.receipt;
    if (finalReceipt && finalReceipt.startsWith('data:')) {
      setIsVerifyingReceipt(true);
      try {
        const path = \`receipts/finance_\${Date.now()}.jpg\`;
        finalReceipt = await uploadImageToStorage(finalReceipt, path);
      } catch (e) {
        console.error("Error final subiendo factura:", e);
      }
      setIsVerifyingReceipt(false);
    }

    const newTransaction = {
      ...financeFormData,
      id: Date.now().toString(),
      receipt: finalReceipt,
      amount: parseFloat(financeFormData.amount),
      status: status
    };

    const updatedTransactionsList = [...transactions, newTransaction];

    try {
      setSyncStatus('saving');
      setTransactions(updatedTransactionsList);
      await dataService.writeData('transactions', updatedTransactionsList, { force: true });
      setSyncStatus('saved');
      resetFinanceForm();
      setShowFinanceForm(false);
      setLastRawReceipt(null);
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Error guardando transacción:', error);
      setSyncStatus('error');
      alert('⚠️ Error al guardar transacción en la nube: ' + (error.message || 'Error de conexión'));
    }
  };`;

lines.splice(startLine - 1, endLine - startLine + 1, cleanFunction);
fs.writeFileSync('/Users/jeancarlosbaez/Desktop/Vencedores/src/ClubVencedoresSystem.jsx', lines.join('\n'));
