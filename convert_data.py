import json
import os

def convert_races_to_js():
    data_path = 'data/races.json'
    output_path = 'races_data.js'
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    with open(data_path, 'r', encoding='utf-8') as f:
        races = json.load(f)
    
    js_content = f"const races_data = {json.dumps(races, ensure_ascii=False, indent=2)};"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Successfully converted {data_path} to {output_path}")

if __name__ == "__main__":
    convert_races_to_js()
