-- Creează o tabelă nouă fără coloana data_adaugare
CREATE TABLE centre_medicale_noua (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    adresa TEXT NOT NULL,
    oras TEXT NOT NULL
);

-- Copiază datele existente (ignori coloana data_adaugare)
INSERT INTO centre_medicale_noua (id, nume, adresa, oras)
SELECT id, nume, adresa, oras FROM centre_medicale;

-- Șterge tabela veche
DROP TABLE centre_medicale;

-- Redenumește tabela nouă cu numele original
ALTER TABLE centre_medicale_noua RENAME TO centre_medicale;
