import os
import re

color_map = {
    "#10a37f": "#12b8cd",
    "16,163,127": "18,184,205",
    "#0b7a5e": "#3bb978",
    "rgba(16,163,127": "rgba(18,184,205"
}

files_to_check = [
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\DashboardMain.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\Sidebar.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\app\usage\page.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\WorkspacePage.js"
    
]

for file_path in files_to_check:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for k, v in color_map.items():
            content = content.replace(k, v)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated colors in {file_path}")
