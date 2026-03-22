import os
import ast

def parse_models_dir(directory, prefix=""):
    models = {}
    for filename in os.listdir(directory):
        if not filename.endswith('.py'):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        try:
            tree = ast.parse(content)
        except:
            continue
        for node in tree.body:
            if isinstance(node, ast.ClassDef):
                tablename = None
                columns = []
                for stmt in node.body:
                    if isinstance(stmt, ast.Assign):
                        for target in stmt.targets:
                            if isinstance(target, ast.Name):
                                if target.id == '__tablename__':
                                    if isinstance(stmt.value, ast.Constant):
                                        tablename = stmt.value.value
                                else:
                                    if isinstance(stmt.value, ast.Call) and getattr(stmt.value.func, 'id', '') == 'Column':
                                        # sometimes Column has an external name string as first arg
                                        if stmt.value.args and isinstance(stmt.value.args[0], ast.Constant) and isinstance(stmt.value.args[0].value, str):
                                             columns.append(stmt.value.args[0].value)
                                        else:
                                             columns.append(target.id)
                if tablename:
                    if tablename not in models:
                        models[tablename] = []
                    models[tablename].extend(columns)
    return models

stock_models = parse_models_dir('e:/download/HealixPharm/backend/stock_management/app/models')
healix_models = parse_models_dir('e:/download/HealixPharm/backend/healix_app/app') # this includes models.py and channelling_models.py

print("---- STOCK MODELS ----")
for t, cols in stock_models.items():
    print(f"[{t}] {', '.join(cols)}")

print("\n---- HEALIX MODELS ----")
for t, cols in healix_models.items():
    print(f"[{t}] {', '.join(cols)}")
