CREATE TABLE IF NOT EXISTS consum (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_medicament INTEGER NOT NULL,
    data_consum TEXT NOT NULL,
    cantitate INTEGER NOT NULL,
    centru_id INTEGER,
    FOREIGN KEY (id_medicament) REFERENCES medicament(id_medicament),
    FOREIGN KEY (centru_id) REFERENCES centru_medical(id)
);

ALTER TABLE incident ADD COLUMN id_medicament INTEGER;
