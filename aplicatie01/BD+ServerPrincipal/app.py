from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)  

def conectare_db():
    path = os.path.join(os.path.dirname(__file__), 'MedStock_BD.db')
    return sqlite3.connect(path)

@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json(force=True)
        username = data.get("username")
        parola = data.get("parola")

        if not all([username, parola]):
            return jsonify({"success": False, "error": "Username și parola sunt necesare"}), 400

        conn = conectare_db()
        cursor = conn.cursor()

        # Verifică dacă username există deja în tabela finală
        cursor.execute("SELECT id FROM utilizator WHERE username = ?", (username,))
        if cursor.fetchone():
            return jsonify({"success": False, "error": "Username-ul este deja folosit!"}), 409

        # Caută datele în tabela pregătită
        cursor.execute("""
            SELECT nume, email, rol, id_centru_medical 
            FROM utilizator_pregatit 
            WHERE username = ?
        """, (username,))
        rezultat = cursor.fetchone()

        if rezultat:
            nume, email, rol, id_centru = rezultat

            # Inserează în tabela utilizator
            cursor.execute("""
                INSERT INTO utilizator (nume, username, email, parola, rol, id_centru_medical)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (nume, username, email, parola, rol, id_centru))

            # Șterge din utilizator_pregatit
            cursor.execute("DELETE FROM utilizator_pregatit WHERE username = ?", (username,))
            conn.commit()

            return jsonify({
                "success": True,
                "message": "Cont creat cu succes!",
                "username": username,
                "rol": rol
            })

        else:
            return jsonify({
                "success": False,
                "error": "Contul nu a fost pregătit de un administrator."
            }), 403

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Eroare la înregistrare"
        }), 500

    finally:
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    parola = data.get("parola")

    conn = conectare_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.*, c.id AS id_centru_medical 
        FROM utilizator u
        LEFT JOIN centru_medical c ON u.id = c.id_utilizator
        WHERE u.username = ? AND u.parola = ?
        """, (username, parola))

    user = cursor.fetchone()

    conn.close()

    if user:
        return jsonify({"success": True, 
                        "message": "Autentificare reușită!", 
                         "id": user[0],
                        "username": username, 
                        "rol" : user[5], 
                        "id_centru_medical": user[-1]})
    else:
        return jsonify({"success": False, "message": "Utilizator sau parolă greșită!"}), 401
    
@app.route("/adauga_medicament", methods=["POST"])
def adauga_medicament():
    data = request.get_json()
    nume = data.get("nume")
    categorie = data.get("categorie")
    substante = data.get("substante")
    bucati = data.get("bucati")

    if not all([nume, categorie, substante, bucati]):
        return jsonify({"success": False, "error": "Date lipsă"}), 400

    try:
        conn = conectare_db()
        c = conn.cursor()
        c.execute("INSERT INTO medicament (nume, categorie, substante_active, numar_bucati) VALUES (?, ?, ?, ?)",
                  (nume, categorie, substante, bucati))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/medicamente")
def get_medicamente():
    conn = conectare_db()
    c = conn.cursor()
    c.execute("SELECT id_medicament, nume FROM medicament")
    rezultat = [{"id_medicament": row[0], "nume": row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify({"medicamente": rezultat})

@app.route("/adauga_lot", methods=["POST"])
def adauga_lot():
    data = request.get_json()
    id_medicament = data.get("id_medicament")
    id_centru_medical = data.get("id_centru_medical")
    cantitate = data.get("cantitate")
    data_expirare = data.get("data_expirare")

    if not all([id_medicament, id_centru_medical, cantitate, data_expirare]):
        return jsonify({"success": False, "error": "Date lipsă"}), 400

    try:
        conn = conectare_db()
        c = conn.cursor()

        # Inserăm și data_intrare
        c.execute("""
            INSERT INTO lot (id_medicament, id_centru_medical, cantitate, data_expirare, data_intrare)
            VALUES (?, ?, ?, ?, date('now'))
        """, (id_medicament, id_centru_medical, cantitate, data_expirare))

        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/medicamente_si_loturi")
def medicamente_si_loturi():
    conn = conectare_db()
    c = conn.cursor()
    c.execute('''
        SELECT m.id_medicament, m.nume, l.id_lot, l.data_expirare, l.cantitate
        FROM medicament m
        JOIN lot l ON m.id_medicament = l.id_medicament
    ''')
    rezultate = [{
        "id_medicament": r[0],
        "nume": r[1],
        "id_lot": r[2],
        "data_expirare": r[3],
        "cantitate": r[4]
    } for r in c.fetchall()]
    conn.close()
    return jsonify(rezultate)

@app.route("/sterge_medicament", methods=["POST"])
def sterge_medicament():
    data = request.get_json()
    conn = conectare_db()
    c = conn.cursor()

    try:
        c.execute('''
            INSERT INTO medicament_sters 
            (id_medicament, nume_medicament, id_lot, nume_lot, motiv)
            VALUES (?, ?, ?, ?, ?)
        ''', (data["id_medicament"], data["nume_medicament"], data["id_lot"], data["nume_lot"], data["motiv"]))

        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/adauga_centru', methods=['POST'])
def adauga_centru():
    data = request.get_json()
    nume = data.get('nume')
    adresa = data.get('adresa')
    oras = data.get('oras')

    try:
        conn = conectare_db() 
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO centru_medical (nume, adresa, oras) VALUES (?, ?, ?)
        ''', (nume, adresa, oras))
        conn.commit()
        conn.close()
        return jsonify({"message": "Centru adăugat"}), 200
    except Exception as e:
        print("Eroare la inserare:", e)
        return jsonify({"error": "Eroare la inserare"}), 500

@app.route('/centru_medical')
def get_centre_medicale():
    try:
        conn = conectare_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nume, adresa, oras FROM centru_medical")
        rezultate = cursor.fetchall()
        conn.close()

        centre = [
            {"id": r[0], "nume": r[1], "adresa": r[2], "oras": r[3]}
            for r in rezultate
        ]
        return jsonify(centre)  
    except:
        return jsonify({"error": "Eroare la interogare centre"}), 500

@app.route("/raporteaza_incident", methods=["POST"])
def raporteaza_incident():
    data = request.get_json()
    id_farmacist = data.get("id_farmacist")
    id_medicament = data.get("id_medicament")
    tip = data.get("tip_incident")
    descriere = data.get("descriere")

    if not all([id_farmacist, id_medicament, tip]):
        return jsonify({"success": False, "error": "Date lipsă"}), 400

    try:
        conn = conectare_db()
        cursor = conn.cursor()

        cursor.execute("SELECT nume FROM medicament WHERE id_medicament = ?", (id_medicament,))
        rezultat = cursor.fetchone()

        if rezultat is None:
            return jsonify({"success": False, "error": "Medicamentul nu a fost găsit!"}), 400

        nume_medicament = rezultat[0]

        cursor.execute('''
            INSERT INTO incident (id_farmacist, id_medicament, nume_medicament, tip_incident, descriere)
            VALUES (?, ?, ?, ?, ?)
        ''', (id_farmacist, id_medicament, nume_medicament, tip, descriere))

        conn.commit()
        conn.close()

        return jsonify({"success": True})
    except Exception as e:
        print("Eroare incident:", e)
        return jsonify({"success": False, "error": "Eroare la raportare"}), 500

@app.route("/utilizatori")
def get_utilizatori_dupa_rol():
    rol = request.args.get("rol")
    try:
        conn = conectare_db()
        c = conn.cursor()

        c.execute("SELECT id, nume, username, email, rol FROM utilizator WHERE rol = ?", (rol,))

        rezultate = [
            {"id": row[0], "nume": row[1], "username": row[2], "email": row[3], "rol": row[4]}
            for row in c.fetchall()
        ]
        conn.close()
        return jsonify(rezultate)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/editeaza_utilizator", methods=["POST"])
def editeaza_utilizator():
    try:
        data = request.get_json()
        id_utilizator = data.get("id")
        nume = data.get("nume")
        email = data.get("email")
        rol = data.get("rol")
        id_centru = data.get("id_centru") 

        if not all([id_utilizator, nume, email, rol]):
            return jsonify({"success": False, "error": "Date lipsă!"}), 400

        conn = conectare_db()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE utilizator 
            SET nume = ?, email = ?, rol = ?
            WHERE id = ?
        """, (nume, email, rol, id_utilizator))

        if rol == "manager":
            cursor.execute("""
                UPDATE centru_medical SET id_utilizator = NULL 
                WHERE id_utilizator = ?
            """, (id_utilizator,))
            
            if id_centru:
                cursor.execute("""
                    UPDATE centru_medical 
                    SET id_utilizator = ?
                    WHERE id = ?
                """, (id_utilizator, id_centru))

        elif rol == "user":
            cursor.execute("""
                UPDATE utilizator 
                SET id_centru_medical = ?
                WHERE id = ?
            """, (id_centru if id_centru else None, id_utilizator))

        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Utilizator actualizat cu succes!"})

    except Exception as e:
        print("Eroare editare:", e)
        return jsonify({"success": False, "error": "Eroare la actualizare"}), 500

@app.route("/utilizatori_complet")
def utilizatori_complet():
    try:
        conn = conectare_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT u.id, u.nume, u.username, u.email, u.rol, 
                   COALESCE(cm.nume, cm2.nume) as centru_medical,
                   COALESCE(cm.id, cm2.id) as id_centru_medical
            FROM utilizator u
            LEFT JOIN centru_medical cm ON u.rol = 'manager' AND u.id = cm.id_utilizator
            LEFT JOIN centru_medical cm2 ON u.rol = 'user' AND u.id_centru_medical = cm2.id
            WHERE u.rol IN ('user', 'manager')
        """)

        rezultate = [
            {
                "id": row[0],
                "nume": row[1],
                "username": row[2],
                "email": row[3],
                "rol": row[4],
                "centru_medical": row[5],
                "id_centru_medical": row[6]
            }
            for row in cursor.fetchall()
        ]

        conn.close()
        return jsonify(rezultate)
    except Exception as e:
        print("Eroare /utilizatori_complet:", e)
        return jsonify({"error": "Eroare la interogare utilizatori"}), 500

@app.route("/pregateste_utilizator", methods=["POST"])
def pregateste_utilizator():
    try:
        data = request.get_json()
        nume = data.get("nume")
        username = data.get("username")
        email = data.get("email")
        rol = data.get("rol")
        id_centru = data.get("id_centru")

        if not all([nume, username, email, rol]):
            return jsonify({"success": False, "error": "Câmpuri lipsă!"}), 400

        conn = conectare_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO utilizator_pregatit (nume, username, email, rol, id_centru_medical)
            VALUES (?, ?, ?, ?, ?)
        """, (nume, username, email, rol, id_centru if id_centru else None))

        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Utilizator pregătit cu succes!"})

    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Username deja existent!"}), 409
    except Exception as e:
        print("Eroare la /pregateste_utilizator:", e)
        return jsonify({"success": False, "error": "Eroare internă"}), 500
    
@app.route("/consum_medicament/<int:id_medicament>", methods=["GET"])
def consum_medicament(id_medicament):
    conexiune = conectare_db()  
    cursor = conexiune.cursor()

    cursor.execute("""
        SELECT data_consum, cantitate
        FROM consum
        WHERE id_medicament = ?
        ORDER BY data_consum ASC
    """, (id_medicament,))

    rezultate = cursor.fetchall()
    conexiune.close()

    consum = [{"data": data, "cantitate": cantitate} for data, cantitate in rezultate]
    return jsonify(consum)

@app.route("/adauga_consum", methods=["POST"])
def adauga_consum():
    data = request.get_json()
    id_medicament = data.get("id_medicament")
    data_consum = data.get("data_consum")
    cantitate = data.get("cantitate")
    centru_id = data.get("centru_id")

    conexiune = sqlite3.connect('MedStock_BD.db')
    cursor = conexiune.cursor()

    cursor.execute("""
        INSERT INTO consum (id_medicament, data_consum, cantitate, centru_id)
        VALUES (?, ?, ?, ?)
    """, (id_medicament, data_consum, cantitate, centru_id))

    conexiune.commit()
    conexiune.close()

    return jsonify({"success": True, "message": "Consum adăugat cu succes!"}), 201

@app.route("/consum/<int:id_medicament>", methods=["GET"])
def obtine_consum(id_medicament):
    conexiune = sqlite3.connect('MedStock_BD.db')
    cursor = conexiune.cursor()

    cursor.execute("""
        SELECT data_consum, cantitate
        FROM consum
        WHERE id_medicament = ?
        ORDER BY data_consum ASC
    """, (id_medicament,))

    rezultate = cursor.fetchall()
    conexiune.close()

    consum = [{"data_consum": data, "cantitate": cantitate} for data, cantitate in rezultate]
    return jsonify(consum)

@app.route("/medicamente", methods=["GET"])
def lista_medicamente():
    conexiune = sqlite3.connect('MedStock_BD.db')
    cursor = conexiune.cursor()

    cursor.execute("SELECT id_medicament, denumire FROM medicament")
    rezultate = cursor.fetchall()

    conexiune.close()

    medicamente = [{"id_medicament": id_medicament, "nume": denumire} for id_medicament, denumire in rezultate]
    return jsonify({"medicamente": medicamente})

@app.route("/raport_stocuri", methods=["GET"])
def raport_stocuri():
    conexiune = conectare_db()
    cursor = conexiune.cursor()

    cursor.execute("""
        SELECT m.id_medicament, m.nume, 
               IFNULL(SUM(l.cantitate), 0), 
               IFNULL(MIN(l.data_expirare), '-'),
               m.numar_bucati
        FROM medicament m
        LEFT JOIN lot l ON m.id_medicament = l.id_medicament
        GROUP BY m.id_medicament, m.nume, m.numar_bucati
    """)

    rezultate = cursor.fetchall()
    conexiune.close()

    raport = []
    for id_med, nume, total_cantitate, data_exp, numar_bucati in rezultate:
        total_comprimate = total_cantitate * (numar_bucati if numar_bucati else 0)
        raport.append({
            "id_medicament": id_med,
            "nume": nume,
            "cantitate_cutii": total_cantitate,
            "cantitate_comprimate": total_comprimate,
            "cea_mai_apropiata_expirare": data_exp
        })

    return jsonify({"raport": raport})

@app.route("/raport_stocuri_pe_loturi", methods=["GET"])
def raport_stocuri_pe_loturi():
    conexiune = conectare_db()
    cursor = conexiune.cursor()

    cursor.execute("""
        SELECT m.nume, l.cantitate, m.numar_bucati, 
               l.data_intrare, l.data_expirare
        FROM medicament m
        JOIN lot l ON m.id_medicament = l.id_medicament
        ORDER BY l.data_intrare DESC
    """)

    rezultate = cursor.fetchall()
    conexiune.close()

    raport = []
    for nume, cantitate, numar_bucati, data_intrare, data_expirare in rezultate:
        total_comprimate = cantitate * (numar_bucati if numar_bucati else 0)
        raport.append({
            "nume": nume,
            "cantitate_cutii": cantitate,
            "cantitate_comprimate": total_comprimate,
            "data_intrare": data_intrare,
            "data_expirare": data_expirare
        })

    return jsonify({"raport": raport})

@app.route("/clasificare_abcxyz", methods=["GET"])
def clasificare_abcxyz():
    import statistics

    conexiune = conectare_db()
    cursor = conexiune.cursor()

    # AICI schimbăm: luam toate medicamentele existente
    cursor.execute("SELECT id_medicament, nume FROM medicament")
    medicamente = cursor.fetchall()

    raport = []

    for id_med, nume in medicamente:
        # Pentru fiecare medicament, luam toate valorile de consum
        cursor.execute("""
            SELECT cantitate FROM consum WHERE id_medicament = ?
        """, (id_med,))
        consumuri = [row[0] for row in cursor.fetchall()]
        total_consum = sum(consumuri)

        # Calculam deviația standard
        if len(consumuri) > 1:
            deviatia = statistics.stdev(consumuri)
        elif len(consumuri) == 1:
            deviatia = 0  # doar un singur consum nu are variație
        else:
            deviatia = 0

        # Clasificare ABC
        if total_consum >= 1000:
            clasa_abc = "A"
        elif total_consum >= 500:
            clasa_abc = "B"
        else:
            clasa_abc = "C"

        # Clasificare XYZ
        if deviatia <= 20:
            clasa_xyz = "X"
        elif deviatia <= 50:
            clasa_xyz = "Y"
        else:
            clasa_xyz = "Z"

        raport.append({
            "nume": nume,
            "total_consum": total_consum,
            "deviatia": round(deviatia, 2),
            "clasa_abc": clasa_abc,
            "clasa_xyz": clasa_xyz
        })

    conexiune.close()
    return jsonify({"raport": raport})

@app.route("/detalii_medicament/<int:id_medicament>")
def detalii_medicament(id_medicament):
    conn = conectare_db()
    c = conn.cursor()

    c.execute("""
        SELECT id_medicament, nume, categorie, substante_active, numar_bucati
        FROM medicament
        WHERE id_medicament = ?
    """, (id_medicament,))
    row = c.fetchone()

    c.execute("""
        SELECT id_lot, cantitate FROM lot
        WHERE id_medicament = ?
    """, (id_medicament,))
    loturi = [{"id_lot": l[0], "cantitate": l[1]} for l in c.fetchall()]

    conn.close()

    return jsonify({
        "id_medicament": row[0],
        "nume": row[1],
        "categorie": row[2],
        "substante_active": row[3],
        "numar_bucati": row[4],
        "loturi": loturi
    })

@app.route("/update_medicament", methods=["POST"])
def update_medicament():
    data = request.get_json()
    conn = conectare_db()
    c = conn.cursor()
    c.execute("""
        UPDATE medicament
        SET nume=?, categorie=?, substante_active=?, numar_bucati=?
        WHERE id_medicament=?
    """, (data["nume"], data["categorie"], data["substante_active"], data["numar_bucati"], data["id_medicament"]))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/update_lot", methods=["POST"])
def update_lot():
    data = request.get_json()
    conn = conectare_db()
    c = conn.cursor()
    c.execute("""
        UPDATE lot SET cantitate=? WHERE id_lot=?
    """, (data["cantitate"], data["id_lot"]))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# generare raport -> pip install reportlab
from flask import send_file
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
import io

@app.route("/export_clasificare_pdf", methods=["GET"])
def export_clasificare_pdf():
    conexiune = conectare_db()
    cursor = conexiune.cursor()

    cursor.execute("SELECT id_medicament, nume FROM medicament")
    medicamente = cursor.fetchall()

    raport = []
    for id_med, nume in medicamente:
        cursor.execute("SELECT cantitate FROM consum WHERE id_medicament = ?", (id_med,))
        consumuri = [row[0] for row in cursor.fetchall()]
        total_consum = sum(consumuri)
        if len(consumuri) > 1:
            import statistics
            deviatia = statistics.stdev(consumuri)
        elif len(consumuri) == 1:
            deviatia = 0
        else:
            deviatia = 0

        if total_consum >= 1000:
            clasa_abc = "A"
        elif total_consum >= 500:
            clasa_abc = "B"
        else:
            clasa_abc = "C"

        if deviatia <= 20:
            clasa_xyz = "X"
        elif deviatia <= 50:
            clasa_xyz = "Y"
        else:
            clasa_xyz = "Z"

        raport.append([nume, total_consum, round(deviatia, 2), clasa_abc, clasa_xyz, clasa_abc + clasa_xyz])

    conexiune.close()

    # Generăm PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []

    styles = getSampleStyleSheet()
    elements.append(Paragraph("Raport Clasificare ABC - XYZ", styles['Title']))
    elements.append(Spacer(1, 20))

    tabel_data = [["Medicament", "Total Consum", "Deviatie", "ABC", "XYZ", "ABC-XYZ"]]
    tabel_data += raport

    tabel = Table(tabel_data, repeatRows=1)
    tabel.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightblue),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    elements.append(tabel)
    doc.build(elements)

    buffer.seek(0)
    return send_file(buffer, download_name="raport_abc_xyz.pdf", as_attachment=True, mimetype='application/pdf')

@app.route("/prognoza_moving_average/<int:id_medicament>", methods=["GET"])
def prognoza_moving_average(id_medicament):
    import statistics

    conexiune = conectare_db()
    cursor = conexiune.cursor()

    cursor.execute("""
        SELECT data_consum, cantitate
        FROM consum
        WHERE id_medicament = ?
        ORDER BY data_consum DESC
        LIMIT 3
    """, (id_medicament,))

    rezultate = cursor.fetchall()
    conexiune.close()

    if len(rezultate) == 0:
        return jsonify({"success": False, "message": "Nu există date suficiente de consum pentru prognoză."})

    cantitati = [cant for data, cant in rezultate]
    media_mobila = sum(cantitati) / len(cantitati)

    return jsonify({
        "success": True,
        "media_mobila": round(media_mobila, 2),
        "recomandare_reaprovizionare": round(media_mobila * 2, 2),
        "numar_obs": len(cantitati)
    })

if __name__ == "__main__":
    app.run(debug=True)