
import sys

file_path = '/Users/jeancarlosbaez/Desktop/Vencedores/src/ClubVencedoresSystem.jsx'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Match the broken onClick block
    if 'onClick={() => {' in line and i < len(lines)-1 and 'const updatedConcepts = fixedPaymentConcepts.filter' in lines[i+1]:
        new_lines.append('                                           onClick={() => {\n')
        new_lines.append('                                             if (confirm(`¿Estás seguro de eliminar el concepto "${c.name}"? Se perderán las marcas de todos los miembros.`)) {\n')
        new_lines.append('                                               const updatedConcepts = fixedPaymentConcepts.filter(x => x.id !== c.id);\n')
        new_lines.append('                                               setFixedPaymentConcepts(updatedConcepts);\n')
        new_lines.append('                                               const newPayments = { ...fixedPayments };\n')
        new_lines.append('                                               delete newPayments[c.id];\n')
        new_lines.append('                                               setFixedPayments(newPayments);\n')
        new_lines.append('                                               \n')
        new_lines.append('                                               // Forced immediate save\n')
        new_lines.append('                                               dataService.writeData(\'fixedPaymentConcepts\', updatedConcepts, { force: true });\n')
        new_lines.append('                                               dataService.writeData(\'fixedPayments\', newPayments, { force: true });\n')
        new_lines.append('                                             }\n')
        new_lines.append('                                           }}\n')
        skip = True
    elif skip:
        if '}}' in line:
            skip = False
        continue
    else:
        new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)
print("File fixed successfully")
