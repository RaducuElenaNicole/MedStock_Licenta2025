import sqlite3

conn = sqlite3.connect("../MedStock_BD.db")
cursor = conn.cursor()

# Activează chei străine
cursor.execute("PRAGMA foreign_keys = ON;")

# Verifică dacă coloana deja există
cursor.execute("PRAGMA table_info(utilizator);")
coloane = [col[1] for col in cursor.fetchall()]
if "id_centru_medical" not in coloane:
    cursor.execute("ALTER TABLE utilizator ADD COLUMN id_centru_medical INTEGER REFERENCES centru_medical(id);")
    print("Coloana id_centru_medical a fost adăugată.")
else:
    print("Coloana există deja.")

conn.commit()
conn.close()