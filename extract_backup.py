import json

backup_path = "/Users/jeancarlosbaez/Desktop/BACKUP_VENCEDORES_PRE_VERCEL/vencedores-data.json"
output_path = "/Users/jeancarlosbaez/Desktop/Vencedores/extracted_backup.json"

try:
    with open(backup_path, 'r') as f:
        data = json.load(f)
    
    extracted = {
        "activities": data.get("activities", []),
        "inventory": data.get("inventory", [])
    }
    
    with open(output_path, 'w') as f:
        json.dump(extracted, f, indent=2)
    
    print(f"Successfully extracted {len(extracted['activities'])} activities and {len(extracted['inventory'])} inventory items.")
except Exception as e:
    print(f"Error: {str(e)}")
