import os
import ast

d = 'e:/download/HealixPharm/backend/stock_management/app/models'
output_file = 'e:/download/HealixPharm/backend/parsed_models_stock.txt'

with open(output_file, 'w', encoding='utf-8') as out:
    for filename in os.listdir(d):
        if not filename.endswith('.py'):
            continue
        filepath = os.path.join(d, filename)
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
                                    if isinstance(stmt.value, ast.Call) and isinstance(stmt.value.func, ast.Name):
                                        if stmt.value.func.id == 'Column':
                                            columns.append(target.id)
                if tablename:
                    out.write(f"MODEL TABLE: {tablename}\n")
                    for col in columns:
                        out.write(f"  MODEL CHK_COL: {col}\n")
