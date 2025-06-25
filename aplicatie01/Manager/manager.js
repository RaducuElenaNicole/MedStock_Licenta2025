window.onload = function () {
  const username = localStorage.getItem("loggedInUser");
  const role = localStorage.getItem("userRole");

  if (!username || role !== "manager") {
    window.location.href = "../paginaDePornire/paginaDePornire.html";
    return;
  }

  document.getElementById("welcome-message").innerText = "Bine ai venit, " + username + "!";

  incarcaMedicamenteDropdown();
};

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("userRole");
  window.location.href = "../paginaDePornire/paginaDePornire.html";
}

function afiseazaFormularAdaugare() {
  document.getElementById("formular-adaugare-medicament").style.display = "block";
}

function salveazaMedicamentNou() {
  const nume = document.getElementById("med-nume").value;
  const categorie = document.getElementById("med-categorie").value;
  const substante = document.getElementById("med-substanta").value;
  const bucati = parseInt(document.getElementById("med-bucati").value);

  if (!nume || !categorie || !substante || isNaN(bucati)) {
    alert("Completează toate câmpurile!");
    return;
  }

  fetch("http://127.0.0.1:5000/adauga_medicament", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nume, categorie, substante, bucati })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Medicament adăugat cu succes!");
        document.getElementById("formular-adaugare-medicament").style.display = "none";
      
        document.getElementById("med-nume").value = "";
        document.getElementById("med-categorie").value = "";
        document.getElementById("med-substanta").value = "";
        document.getElementById("med-bucati").value = "";
      } else {
        alert(data.error || "Eroare la adăugarea medicamentului.");
      }
    });
}

function afiseazaMedicamente() {
  const lista = document.getElementById("medicamente-lista"); // ← corectat
  lista.innerHTML = "";
  const medicamente = JSON.parse(localStorage.getItem("listaMedicamente")) || [];

  medicamente.forEach(med => {
    const li = document.createElement("li");
    li.textContent = `${med.nume} - ${med.cantitate} buc. - Expiră la ${med.expirare}`;
    lista.appendChild(li);
  });
}

function afiseazaFormularLot() {
  document.getElementById("formular-adaugare-lot").style.display = "block";

  fetch("http://127.0.0.1:5000/medicamente")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("lot-medicament");
      select.innerHTML = '<option disabled selected>-- Selectează medicamentul --</option>';

      data.medicamente.forEach(med => {
        const opt = document.createElement("option");
        opt.value = med.id_medicament;
        opt.textContent = med.nume;
        select.appendChild(opt);
      });
    });
}

function salveazaLot() {
  const id_medicament = document.getElementById("lot-medicament").value;
  const cantitate = document.getElementById("lot-cantitate").value;
  const expirare = document.getElementById("lot-expirare").value;

  if (!id_medicament || !cantitate || !expirare) {
    alert("Completează toate câmpurile!");
    return;
  }

  const id_centru_medical = localStorage.getItem("idCentruMedical");

  fetch("http://127.0.0.1:5000/adauga_lot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_medicament: id_medicament,
      id_centru_medical: id_centru_medical,
      cantitate: cantitate,
      data_expirare: expirare
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Lot salvat cu succes!");
        document.getElementById("formular-adaugare-lot").style.display = "none";
      } else {
        alert(data.error || "Eroare la salvarea lotului.");
      }
    });
}

let medicamentSelectat = null;

function afiseazaMedicamenteCuStergere() {
  document.getElementById("lista-medicamente").style.display = "block";
  fetch("http://127.0.0.1:5000/medicamente_si_loturi")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("medicamente-lista");
      lista.innerHTML = "";

      data.forEach(item => {
        const li = document.createElement("li");
        const expirare = new Date(item.data_expirare);
        const azi = new Date();
        li.innerHTML = `
          <strong>${item.nume}</strong> | ${item.cantitate} cutii | expiră: ${item.data_expirare}
          <button onclick="initiereStergere(${item.id_medicament}, '${item.nume}', ${item.id_lot}, '${item.data_expirare}')">Șterge</button>
        `;
        if (expirare < azi) li.style.color = "red";
        lista.appendChild(li);
      });
    });
}

function initiereStergere(idMed, numeMed, idLot, numeLot) {
  medicamentSelectat = { idMed, numeMed, idLot, numeLot };
  document.getElementById("medicament-de-sters").innerText = `Ștergi: ${numeMed} (${numeLot})`;
  document.getElementById("popup-stergere").style.display = "block";
}

function anuleazaStergere() {
  medicamentSelectat = null;
  document.getElementById("popup-stergere").style.display = "none";
}

function confirmaStergere() {
  const motiv = document.getElementById("motiv-stergere").value;
  if (!motiv) {
    alert("Completează motivul ștergerii!");
    return;
  }

  fetch("http://127.0.0.1:5000/sterge_medicament", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_medicament: medicamentSelectat.idMed,
      nume_medicament: medicamentSelectat.numeMed,
      id_lot: medicamentSelectat.idLot,
      nume_lot: medicamentSelectat.numeLot,
      motiv: motiv
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Medicament șters și înregistrat cu succes!");
        afiseazaMedicamenteCuStergere();
      } else {
        alert("Eroare: " + data.error);
      }
      document.getElementById("popup-stergere").style.display = "none";
    });
}

function genereazaRaport() {
  const medicamente = JSON.parse(localStorage.getItem("listaMedicamente")) || [];
  if (medicamente.length === 0) {
    alert("Nu există medicamente pentru raport.");
    return;
  }

  const randuri = medicamente.map(med => `${med.nume},${med.cantitate},${med.expirare}`);
  const continutCSV = "data:text/csv;charset=utf-8,Nume,Cantitate,Data Expirare\n" + randuri.join("\n");
  const encodedUri = encodeURI(continutCSV);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "raport_medicamente.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function incarcaMedicamente() {
  afiseazaMedicamente();
}

function afiseazaDashboard() {
  const dash = document.getElementById("dashboard");
  dash.style.display = dash.style.display === "none" ? "block" : "none";
}

async function afiseazaPreviziuni() {
    const response = await fetch("http://127.0.0.1:5000/consum_medicament/1"); 
    const dateConsum = await response.json();

    let total = 0;
    dateConsum.forEach(c => total += c.cantitate);
    const medie = total / dateConsum.length;

    const mesaj = `Consumul mediu: ${medie.toFixed(2)} unități pe perioadă.<br> 
                  Recomand reaprovizionare dacă stocul scade sub ${(medie * 2).toFixed(2)} unități.`;

    document.getElementById("rezultat-previziuni").innerHTML = mesaj;
    document.getElementById("previziuni").style.display = "block";
}

async function incarcaMedicamenteDropdown() {
    const response = await fetch("http://127.0.0.1:5000/medicamente");
    if (response.ok) {
        const data = await response.json();
        const medicamente = data.medicamente;

        const select = document.getElementById("medicament-previziune");
        select.innerHTML = '<option value="">Selectează medicamentul</option>';

        medicamente.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id_medicament;
            opt.textContent = m.nume;
            select.appendChild(opt);
        });
    }
}

async function calculeazaPreviziuni() {
    const id_medicament = document.getElementById("medicament-previziune").value;
    if (!id_medicament) {
        alert("Selectează mai întâi un medicament!");
        return;
    }

    const response = await fetch(`http://127.0.0.1:5000/consum_medicament/${id_medicament}`);
    const dateConsum = await response.json();

    if (dateConsum.length === 0) {
        document.getElementById("rezultat-previziuni").innerHTML = "Nu există date de consum pentru acest medicament.";
        return;
    }

    let total = 0;
    dateConsum.forEach(c => total += c.cantitate);
    const medie = total / dateConsum.length;

    const mesaj = `
      <p><strong>Consumul mediu:</strong> ${medie.toFixed(2)} unități pe perioadă.</p>
      <p><strong>Recomandare reaprovizionare:</strong> dacă stocul scade sub <span class="critic">${(medie * 2).toFixed(2)}</span> unități.</p>
    `;

    document.getElementById("rezultat-previziuni").innerHTML = mesaj;
    document.getElementById("previziuni").style.display = "block";
}

async function afiseazaRaportStocuri() {
    const response = await fetch("http://127.0.0.1:5000/raport_stocuri");
    const data = await response.json();

    const tbody = document.querySelector("#tabel-stocuri tbody");
    tbody.innerHTML = "";

    data.raport.forEach(item => {
        const row = document.createElement("tr");

        const tdNume = document.createElement("td");
        tdNume.textContent = item.nume;

        const tdCutii = document.createElement("td");
        tdCutii.textContent = item.cantitate_cutii;

        const tdComprimate = document.createElement("td");
        tdComprimate.textContent = item.cantitate_comprimate;

        const tdExpirare = document.createElement("td");
        tdExpirare.textContent = item.cea_mai_apropiata_expirare;

        // Calculăm diferența de zile
        if (item.cea_mai_apropiata_expirare !== "-") {
            const azi = new Date();
            const exp = new Date(item.cea_mai_apropiata_expirare);
            const diffTime = exp - azi;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                row.style.backgroundColor = "#ffcccc"; // roșu
            } else if (diffDays <= 7) {
                row.style.backgroundColor = "#ffe5b4"; // portocaliu
            } else if (diffDays <= 21) {
                row.style.backgroundColor = "#fff7b3"; // galben
            }
        }

        row.appendChild(tdNume);
        row.appendChild(tdCutii);
        row.appendChild(tdComprimate);
        row.appendChild(tdExpirare);
        tbody.appendChild(row);
    });

    document.getElementById("raport-stocuri").style.display = "block";
}

async function afiseazaRaportLoturi() {
    const response = await fetch("http://127.0.0.1:5000/raport_stocuri_pe_loturi");
    const data = await response.json();

    const tbody = document.querySelector("#tabel-loturi tbody");
    tbody.innerHTML = "";

    data.raport.forEach(item => {
        const row = document.createElement("tr");

        const tdNume = document.createElement("td");
        tdNume.textContent = item.nume;

        const tdIntrare = document.createElement("td");
        tdIntrare.textContent = item.data_intrare;

        const tdCutii = document.createElement("td");
        tdCutii.textContent = item.cantitate_cutii;

        const tdComprimate = document.createElement("td");
        tdComprimate.textContent = item.cantitate_comprimate;

        const tdExpirare = document.createElement("td");
        tdExpirare.textContent = item.data_expirare;

        // Colorare expirare corectă:
        if (item.data_expirare !== "-") {
            const azi = new Date();
            const exp = new Date(item.data_expirare);
            const diffDays = Math.ceil((exp - azi) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                row.style.backgroundColor = "#ffcccc"; // roșu
            } else if (diffDays <= 7) {
                row.style.backgroundColor = "#ffe5b4"; // portocaliu
            } else if (diffDays <= 21) {
                row.style.backgroundColor = "#fff7b3"; // galben
            } else {
                row.style.backgroundColor = "white";
            }
        }

        row.appendChild(tdNume);
        row.appendChild(tdIntrare);
        row.appendChild(tdCutii);
        row.appendChild(tdComprimate);
        row.appendChild(tdExpirare);
        tbody.appendChild(row);
    });

    // Populează dropdown cu medicamente unice
    const medicamenteUnice = [...new Set(data.raport.map(item => item.nume))];
    const selectMedicament = document.getElementById("filtru-medicament");
    selectMedicament.innerHTML = '<option value="">Toate medicamentele</option>';

    medicamenteUnice.forEach(numeMedicament => {
        const opt = document.createElement("option");
        opt.value = numeMedicament;
        opt.textContent = numeMedicament;
        selectMedicament.appendChild(opt);
    });

    document.getElementById("raport-loturi").style.display = "block";
    document.getElementById("filtru-expirare").value = "";
}

function filtreazaTabelLoturi() {
    const selectMedicament = document.getElementById("filtru-medicament").value;
    const expirare = document.getElementById("filtru-expirare").value;
    const rows = document.querySelectorAll("#tabel-loturi tbody tr");

    const azi = new Date();

    rows.forEach(row => {
        const nume = row.cells[0].textContent;
        const dataExp = row.cells[4].textContent;
        let diffDays = Infinity;

        if (dataExp) {
            const exp = new Date(dataExp);
            diffDays = Math.ceil((exp - azi) / (1000 * 60 * 60 * 24));
        }

        let vizibil = true;

        if (selectMedicament && nume !== selectMedicament) vizibil = false;

        if (expirare === "expirate" && diffDays >= 0) vizibil = false;
        if (expirare === "7zile" && !(diffDays >= 0 && diffDays <= 7)) vizibil = false;
        if (expirare === "21zile" && !(diffDays >= 8 && diffDays <= 21)) vizibil = false;

        if (diffDays < 0) {
            row.style.backgroundColor = "#ffcccc";
        } else if (diffDays <= 7) {
            row.style.backgroundColor = "#ffe5b4";
        } else if (diffDays <= 21) {
            row.style.backgroundColor = "#fff7b3";
        } else {
            row.style.backgroundColor = "white";
        }

        row.style.display = vizibil ? "" : "none";
    });
}

async function afiseazaClasificare() {
    const response = await fetch("http://127.0.0.1:5000/clasificare_abcxyz");
    const data = await response.json();

    const tbody = document.querySelector("#tabel-abcxyz tbody");
    tbody.innerHTML = "";

    data.raport.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.nume}</td>
            <td>${item.total_consum}</td>
            <td>${item.deviatia}</td>
            <td>${item.clasa_abc}</td>
            <td>${item.clasa_xyz}</td>
            <td>${item.clasa_abc}${item.clasa_xyz}</td>
        `;

        tbody.appendChild(row);
    });

    document.getElementById("clasificare-abcxyz").style.display = "block";
    document.getElementById("explicatie-clasificare").style.display = "block";
}

function afiseazaFormularActualizare() {
  document.getElementById("formular-actualizare-medicament").style.display = "block";
  incarcaMedicamentePentruActualizare();
}

async function incarcaMedicamentePentruActualizare() {
  const response = await fetch("http://127.0.0.1:5000/medicamente");
  const data = await response.json();

  const select = document.getElementById("medicament-select");
  select.innerHTML = '<option value="">Selectează medicamentul</option>';

  data.medicamente.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id_medicament;
    opt.textContent = m.nume;
    select.appendChild(opt);
  });
}

async function incarcaDetaliiMedicament() {
  const id = document.getElementById("medicament-select").value;
  if (!id) return;

  const response = await fetch(`http://127.0.0.1:5000/detalii_medicament/${id}`);
  const data = await response.json();

  document.getElementById("med-nume-update").value = data.nume;
  document.getElementById("med-categorie-update").value = data.categorie;
  document.getElementById("med-substante-update").value = data.substante_active;
  document.getElementById("med-bucati-update").value = data.numar_bucati;

  const lotSelect = document.getElementById("lot-select");
  lotSelect.innerHTML = '<option value="">Selectează lotul</option>';
  data.loturi.forEach(lot => {
    const opt = document.createElement("option");
    opt.value = lot.id_lot;
    opt.textContent = `Lot ${lot.id_lot} - ${lot.cantitate} cutii`;
    lotSelect.appendChild(opt);
  });
}

async function salveazaActualizare() {
  const idMed = document.getElementById("medicament-select").value;
  const nume = document.getElementById("med-nume-update").value;
  const categorie = document.getElementById("med-categorie-update").value;
  const substante = document.getElementById("med-substante-update").value;
  const bucati = document.getElementById("med-bucati-update").value;

  await fetch("http://127.0.0.1:5000/update_medicament", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ id_medicament: idMed, nume, categorie, substante_active: substante, numar_bucati: bucati })
  });

  const idLot = document.getElementById("lot-select").value;
  const cantitateNoua = document.getElementById("lot-cantitate-update").value;

  if (idLot) {
    await fetch("http://127.0.0.1:5000/update_lot", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ id_lot: idLot, cantitate: cantitateNoua })
    });
  }

  alert("Actualizare efectuată cu succes!");
}

function exportaClasificare() {
  fetch("http://127.0.0.1:5000/export_clasificare_pdf")
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Raport_ABC_XYZ.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}

async function calculeazaPreviziuni() {
    const id_medicament = document.getElementById("medicament-previziune").value;
    if (!id_medicament) {
        alert("Selectează mai întâi un medicament!");
        return;
    }

    const response = await fetch(`http://127.0.0.1:5000/prognoza_moving_average/${id_medicament}`);
    const data = await response.json();

    if (!data.success) {
        document.getElementById("rezultat-previziuni").innerHTML = data.message;
        return;
    }

    const mesaj = `
        <p><strong>Prognoză folosind Media Mobilă (ultimele ${data.numar_obs} consumuri):</strong> ${data.media_mobila} unități.</p>
        <p><strong>Recomandare reaprovizionare:</strong> reaprovizionare recomandată dacă stocul scade sub <span class="critic">${data.recomandare_reaprovizionare} unități</span>.</p>
    `;

    document.getElementById("rezultat-previziuni").innerHTML = mesaj;
    document.getElementById("previziuni").style.display = "block";
}

let graficConsumul = null; 
async function calculeazaPreviziuni() {
    const id_medicament = document.getElementById("medicament-previziune").value;
    if (!id_medicament) {
        alert("Selectează mai întâi un medicament!");
        return;
    }

    // Apelăm backendul de prognoză
    const response = await fetch(`http://127.0.0.1:5000/prognoza_moving_average/${id_medicament}`);
    const data = await response.json();

    if (!data.success) {
        document.getElementById("rezultat-previziuni").innerHTML = data.message;
        return;
    }

    const mesaj = `
        <p><strong>Prognoză folosind Media Mobilă (ultimele ${data.numar_obs} consumuri):</strong> ${data.media_mobila} unități.</p>
        <p><strong>Recomandare reaprovizionare:</strong> reaprovizionare recomandată dacă stocul scade sub <span class="critic">${data.recomandare_reaprovizionare} unități</span>.</p>
    `;
    document.getElementById("rezultat-previziuni").innerHTML = mesaj;
    document.getElementById("previziuni").style.display = "block";

    // Acum luăm și datele de consum istoric pentru grafic:
    const consumResp = await fetch(`http://127.0.0.1:5000/consum_medicament/${id_medicament}`);
    const consumData = await consumResp.json();

    if (consumData.length === 0) {
        document.getElementById("grafic-consum").style.display = "none";
        return;
    }

    const labels = consumData.map(el => el.data);
    const valori = consumData.map(el => el.cantitate);

    // Dacă există deja un grafic, îl distrugem înainte să desenăm altul
    if (graficConsumul) graficConsumul.destroy();

    const ctx = document.getElementById('grafic-consum').getContext('2d');
    graficConsumul = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Consum',
                data: valori,
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evoluția consumului'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}