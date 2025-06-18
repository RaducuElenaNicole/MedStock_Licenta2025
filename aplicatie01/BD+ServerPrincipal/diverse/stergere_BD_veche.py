import sqlite3

db_path = "MedStock_BD.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")

tabele_vechi = [
    "utilizatori_vechi",
    "medicamente_vechi",
    "loturi_vechi",
    "centre_medicale_vechi",
    "medicamente_sterse_vechi"
]

for tabela in tabele_vechi:
    try:
        cursor.execute(f"DROP TABLE IF EXISTS {tabela}")
        print(f"Tabela '{tabela}' a fost ștearsă.")
    except Exception as e:
        print(f"Eroare la ștergerea tabelei '{tabela}': {e}")

conn.commit()
conn.close()

print("Curățare completă a tabelelor vechi.")
