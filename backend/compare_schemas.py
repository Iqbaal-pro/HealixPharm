import json

def parse_db_schema(filepath):
    db_tables = {}
    current_table = None
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('TABLE: '):
                current_table = line[7:]
                db_tables[current_table] = []
            elif line.startswith('COLUMN: ') and current_table:
                # format: COLUMN: id | INTEGER | PK=True | Null_Ok=False
                parts = line.split(' | ')
                col_name = parts[0][8:]
                db_tables[current_table].append(col_name)
    return db_tables

def parse_models(filepath):
    models = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('----'):
                continue
            if line.startswith('['):
                parts = line.split(']')
                table = parts[0][1:]
                cols = [c.strip() for c in parts[1].split(',') if c.strip()]
                if table not in models:
                    models[table] = set()
                models[table].update(cols)
    return models

db_schema = parse_db_schema('e:/download/HealixPharm/backend/db_schema_utf8.txt')
models = parse_models('e:/download/HealixPharm/backend/all_parsed_models_utf8.txt')

missing = {}
for table, expected_cols in models.items():
    if table not in db_schema:
        missing[table] = {"MISSING_TABLE": True, "cols": list(expected_cols)}
    else:
        db_cols = set(db_schema[table])
        missing_cols = expected_cols - db_cols
        if missing_cols:
            missing[table] = {"MISSING_TABLE": False, "cols": list(missing_cols)}

with open('e:/download/HealixPharm/backend/missing_report.json', 'w') as f:
    json.dump(missing, f, indent=2)
