import os

# New colors from user
new_cyan = "#13b9d6"
new_green = "#39b87c"

# The old "new" colors that are currently in the files (from the other script's modifications)
old_cyan = "#12b8cd"
old_green = "#3bb978"

# The RGB map
# #13b9d6 = 19, 185, 214
# #39b87c = 57, 184, 124

# #12b8cd = 18, 184, 205
# #3bb978 = 59, 185, 120

color_map = {
    "#12b8cd": "#13b9d6",
    "#12B8CD": "#13b9d6",
    "18,184,205": "19,185,214",
    "18, 184, 205": "19, 185, 214",
    
    "#3bb978": "#39b87c",
    "#3BB978": "#39b87c",
    "59,185,120": "57,184,124",
    "59, 185, 120": "57, 184, 124"
}

files_to_check = [
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\DashboardMain.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\Sidebar.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\app\usage\page.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\WorkspacePage.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\ChatBox.js",
    r"C:\Users\Admin\Documents\GitHub\forge-rag-frontend\components\ChatMessage.js"
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
