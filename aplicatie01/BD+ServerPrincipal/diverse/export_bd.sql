BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS centru_medical (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    adresa TEXT NOT NULL,
    oras TEXT NOT NULL,
    id_utilizator INTEGER NOT NULL,
    FOREIGN KEY (id_utilizator) REFERENCES utilizator(id)
);
CREATE TABLE IF NOT EXISTS incident (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_farmacist INTEGER NOT NULL,
    nume_medicament TEXT NOT NULL,
    tip_incident TEXT NOT NULL,
    descriere TEXT,
    data_incident TEXT DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (id_farmacist) REFERENCES "utilizatori_vechi"(id)
);
CREATE TABLE IF NOT EXISTS lot (
    id_lot INTEGER PRIMARY KEY AUTOINCREMENT,
    id_medicament INTEGER NOT NULL,
    id_centru_medical INTEGER NOT NULL,
    cantitate INTEGER NOT NULL,
    data_expirare TEXT NOT NULL,
    FOREIGN KEY (id_medicament) REFERENCES medicament(id_medicament),
    FOREIGN KEY (id_centru_medical) REFERENCES centru_medical(id)
);
CREATE TABLE IF NOT EXISTS medicament (
    id_medicament INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    categorie TEXT NOT NULL,
    substante_active TEXT NOT NULL,
    numar_bucati INTEGER NOT NULL
);
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
);
CREATE TABLE IF NOT EXISTS utilizator (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    parola TEXT NOT NULL,
    rol TEXT DEFAULT 'user',
    data_creare TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "centru_medical" ("id","nume","adresa","oras","id_utilizator") VALUES (1,'Policlinica Regina Maria','Sector 6, Lujerului','Bucuresti',1),
 (2,'Policlinica SanoHelp','Sector 1, Piata Romana','Bucuresti',1),
 (3,'Clinica Speranta','Pitesti, std. Argedava','Arges, Pitesti',1);
INSERT INTO "lot" ("id_lot","id_medicament","id_centru_medical","cantitate","data_expirare") VALUES (1,2,1,12,'2025-10-08'),
 (2,1,1,34,'2025-06-28');
INSERT INTO "medicament" ("id_medicament","nume","categorie","substante_active","numar_bucati") VALUES (1,'Nurofen plus ','Antiinflamatoare ','Ibuprofen 200 mg / Fosfat de codeină hemihidrat 12,8 mg',24),
 (2,'Nurofen Express Forte','Antiinflamatoare','Ibuprofen 400 mg',10);
INSERT INTO "utilizator" ("id","nume","username","email","parola","rol","data_creare") VALUES (1,'Sava Ileana','sava.ileana.12','sava.ileana@farmacist.med.com','sava.ileana.12','user','2025-06-06 14:52:51'),
 (2,'Popescu Tudor-Gabriel','popescu.tudor14','popescu.tudor.gabriel@farmacist.med.com','popescu.tudor14','user','2025-06-06 15:00:35'),
 (3,'Marinescu Oana','marinescu.oana18','marinescu.oana@farmacist.med.com','marinescu.oana18','user','2025-06-06 15:13:56'),
 (4,'Angheloiu Mihai ','angheloiu.mihai.09','angheloiu.mihai@administrator.med.ro','angheloiu.mihai.09','admin','2025-06-06 15:18:43'),
 (5,'Radu Mihail','mihail.radu22','mihail.radu22@manager.stockmed.ro','mihail.radu22','manager','2025-06-07 13:32:49'),
 (6,'Gavrila Ana-Maria','ana.maria6','ana.maria@manager.stockmed.com','ana.maria6','manager','2025-06-07 18:47:43'),
 (7,'Floarea Eva-Ioana','floarea.eva56ioana','floarea.eva56ioana@admin.stockmed.ro','floarea.eva56ioana','admin','2025-06-07 19:07:00');
COMMIT;
