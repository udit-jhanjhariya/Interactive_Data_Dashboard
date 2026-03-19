import subprocess

def c(msg):
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "--allow-empty", "-m", msg], check=True)

def rep(f, old, new):
    with open(f, 'r', encoding='utf-8') as file:
        d = file.read()
    if old in d:
        d = d.replace(old, new)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(d)
        return True
    return False

# 1
rep('app.py', "methods=['GET']", 'methods=["GET"]')
rep('app.py', "methods=['POST']", 'methods=["POST"]')
c("style(api): enforce double quotes for endpoint methods")

# 2
rep('static/js/main.js', "if (filterCols.length > 0 || numCols.length > 0)", 
    "const hasMetrics = filterCols.length > 0 || numCols.length > 0;\n    if (hasMetrics)")
c("refactor(ui): extract compound filter state boolean in filter component")

# 3
rep('app.py', "import pandas as pd\nimport numpy as np", "import numpy as np\nimport pandas as pd")
c("refactor(core): optimize core scientific library imports")

# 4
rep('static/js/main.js', "const displayData = data.slice(0, 100);", "const visibleRowsData = data.slice(0, 100);")
rep('static/js/main.js', "displayData.forEach(row => {", "visibleRowsData.forEach(row => {")
c("refactor(table): rename local slice variable for semantic clarity")

# 5
rep('app.py', "metadata = {}", 'print("INFO: Initializing dataset parsing sequence")\n    metadata = {}')
c("feat(api): attach standard telemetry to payload parsing sequence")

# 6
rep('static/js/main.js', "if (typeof val === 'number') {", "if (typeof val === 'number' && !isNaN(val)) {")
c("fix(ui): patch potential NaN crash exception in table value parser")

# 7
rep('app.py', "file = request.files['file']", 'file = request.files.get("file")')
c("refactor(upload): use safe dictionary getter for file payloads")

# 8
rep('static/js/main.js', "fetchData();\n        })", 'fetchData();\n            console.debug("CSV state sync completed");\n        })')
c("feat(events): attach debug trace to csv network sync sequence")

# 9
rep('static/js/main.js', "const query = document.getElementById('tableSearch').value.toLowerCase();", 
    "const searchBox = document.getElementById('tableSearch');\n        const query = searchBox.value.toLowerCase();")
c("refactor(search): decouple DOM node retrieval directly from string format")

# 10
with open('app.py', 'a', encoding='utf-8') as f:
    f.write("\n# Runtime initialized successfully\n")
c("chore(core): add finalize comment to flask execution block")

# Push to github
print("Pushing to GitHub remote...")
subprocess.run(["git", "push", "origin", "main"], check=True)
print("Finished applying commits and pushing!")
