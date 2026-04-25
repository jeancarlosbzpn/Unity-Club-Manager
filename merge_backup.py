import json
import os

backup_path = "/Users/jeancarlosbaez/Desktop/BACKUP_VENCEDORES_PRE_VERCEL/Code/electron/vencedores-data.json"
current_path = "/Users/jeancarlosbaez/Desktop/Vencedores/electron/vencedores-data.json"
merged_path = "/Users/jeancarlosbaez/Desktop/Vencedores/electron/vencedores-data-merged.json"

try:
    print(f"Reading backup from {backup_path}...")
    with open(backup_path, 'r') as f:
        backup_data = json.load(f)
    
    print(f"Reading current data from {current_path}...")
    with open(current_path, 'r') as f:
        current_data = json.load(f)
    
    # Merge activities and inventory
    new_activities = backup_data.get("activities", [])
    new_inventory = backup_data.get("inventory", [])
    
    print(f"Found {len(new_activities)} activities and {len(new_inventory)} inventory items in backup.")
    
    current_data["activities"] = new_activities
    current_data["inventory"] = new_inventory
    
    # Also restore points if they are empty in current but have data in backup?
    # User only asked for calendar and inventory.
    
    print(f"Saving merged data to {merged_path}...")
    with open(merged_path, 'w') as f:
        json.dump(current_data, f, indent=2)
    
    print("Success! Merged data saved to vencedores-data-merged.json")

except Exception as e:
    print(f"Error: {str(e)}")
