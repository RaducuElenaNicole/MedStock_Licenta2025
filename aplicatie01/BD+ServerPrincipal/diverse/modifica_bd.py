import sqlite3
import shutil
import os

# === CONFIG ===
db_path = "MedStock_BD.db"
backup_path = "MedStock_BD_BACKUP.db"

# === 1. BACKUP ===
if not os.path.exists(db_path):
    print(f"Fișierul '{db_path}' NU a fost găsit. Pune scriptul în același folder cu baza de date.")
    exit()

if not os.path.exists(backup_path):
    shutil.copyfile(db_path, backup_path)
    print("Backup creat: MedStock_BD_BACKUP.db")

# === 2. CONECTARE ===
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")

# === 3. REDENUMIRE TABEL EXISTENT ===
cursor.execute("ALTER TABLE utilizatori RENAME TO utilizatori_vechi;")
cursor.execute("ALTER TABLE medicamente RENAME TO medicamente_vechi;")
cursor.execute("ALTER TABLE loturi RENAME TO loturi_vechi;")
cursor.execute("ALTER TABLE centre_medicale RENAME TO centre_medicale_vechi;")
cursor.execute("ALTER TABLE medicamente_sterse RENAME TO medicamente_sterse_vechi;")
print("Tabelele vechi au fost redenumite.")

# === 4. CREARE TABELE NOI ===
cursor.execute('''
CREATE TABLE IF NOT EXISTS utilizator (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    parola TEXT NOT NULL,
    rol TEXT DEFAULT 'user',
    data_creare TEXT DEFAULT CURRENT_TIMESTAMP
)
''')
print("Tabela 'utilizator' a fost creată.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS medicament (
    id_medicament INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    categorie TEXT NOT NULL,
    substante_active TEXT NOT NULL,
    numar_bucati INTEGER NOT NULL
)
''')
print("Tabela 'medicament' a fost creată.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS centru_medical (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    adresa TEXT NOT NULL,
    oras TEXT NOT NULL,
    id_utilizator INTEGER NOT NULL,
    FOREIGN KEY (id_utilizator) REFERENCES utilizator(id)
)
''')
print("Tabela 'centru_medical' a fost creată.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS lot (
    id_lot INTEGER PRIMARY KEY AUTOINCREMENT,
    id_medicament INTEGER NOT NULL,
    id_centru_medical INTEGER NOT NULL,
    cantitate INTEGER NOT NULL,
    data_expirare TEXT NOT NULL,
    FOREIGN KEY (id_medicament) REFERENCES medicament(id_medicament),
    FOREIGN KEY (id_centru_medical) REFERENCES centru_medical(id)
)
''')
print("Tabela 'lot' a fost creată.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS medicament_sters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_medicament INTEGER NOT NULL,
    nume_medicament TEXT,
    id_lot INTEGER,
    nume_lot TEXT,
    motiv TEXT,
    id_manager INTEGER NOT NULL,
    data_stergere TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medicament) REFERENCES medicament(id_medicament),
    FOREIGN KEY (id_manager) REFERENCES utilizator(id)
)
''')
print("Tabela 'medicament_sters' a fost creată.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS incident (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_farmacist INTEGER NOT NULL,
    nume_medicament TEXT NOT NULL,
    tip_incident TEXT NOT NULL,
    descriere TEXT,
    data_incident TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_farmacist) REFERENCES utilizator(id)
)
''')
print("Tabela 'incident' a fost creată.")

# === 5. MIGRARE DATE ===
cursor.execute("""
INSERT INTO utilizator (id, nume, username, email, parola, rol, data_creare)
SELECT id, nume, username, email, parola, rol, data_creare FROM utilizatori_vechi;
""")

cursor.execute("""
INSERT INTO medicament (id_medicament, nume, categorie, substante_active, numar_bucati)
SELECT id_medicament, nume, categorie, substante_active, numar_bucati FROM medicamente_vechi;
""")

cursor.execute("""
INSERT INTO centru_medical (id, nume, adresa, oras, id_utilizator)
SELECT id, nume, adresa, oras, 1 FROM centre_medicale_vechi;
""")

cursor.execute("""
INSERT INTO lot (id_lot, id_medicament, id_centru_medical, cantitate, data_expirare)
SELECT id_lot, id_medicament, 1, cantitate, data_expirare FROM loturi_vechi;
""")

cursor.execute("""
INSERT INTO medicament_sters (id, id_medicament, nume_medicament, id_lot, nume_lot, motiv, id_manager, data_stergere)
SELECT id, id_medicament, nume_medicament, id_lot, nume_lot, motiv, 1, data_stergere FROM medicamente_sterse_vechi;
""")

print("Datele au fost copiate în noile tabele.")

# === 6. ÎNCHIDERE CONEXIUNE ===
conn.commit()
conn.close()
print("Baza de date a fost refacuta complet și datele au fost copiate din vechea baza de date.")
