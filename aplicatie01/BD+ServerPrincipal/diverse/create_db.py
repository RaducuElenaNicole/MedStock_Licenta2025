import sqlite3

conn = sqlite3.connect("MedStock_BD.db")
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")  # Activăm suportul pentru chei străine

# 1. Tabela utilizator
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

# 2. Tabela medicament
cursor.execute('''
CREATE TABLE IF NOT EXISTS medicament (
    id_medicament INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    categorie TEXT NOT NULL,
    substante_active TEXT NOT NULL,
    numar_bucati INTEGER NOT NULL
)
''')

# 3. Tabela centru_medical
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

# 4. Tabela lot (lot de medicamente aflat într-un centru medical)
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

# 5. Tabela medicament_sters
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

# 6. Tabela incident
cursor.execute("""
CREATE TABLE IF NOT EXISTS incident (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_farmacist INTEGER NOT NULL,
    nume_medicament TEXT NOT NULL,
    tip_incident TEXT NOT NULL,
    descriere TEXT,
    data_incident TEXT DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (id_farmacist) REFERENCES utilizator(id)
)
""")

conn.commit()
conn.close()
print("Baza de date 'MedStock_BD.db' a fost recreată complet.")
