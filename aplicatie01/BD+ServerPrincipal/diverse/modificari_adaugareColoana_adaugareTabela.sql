ALTER TABLE utilizator ADD COLUMN id_centru_medical INTEGER REFERENCES centru_medical(id);

CREATE TABLE utilizator_pregatit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    rol TEXT NOT NULL,
    id_centru_medical INTEGER,
    FOREIGN KEY (id_centru_medical) REFERENCES centru_medical(id)
);
