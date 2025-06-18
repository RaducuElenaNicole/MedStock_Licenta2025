window.onload = function () {
  const username = localStorage.getItem("loggedInUser");
  const role = localStorage.getItem("userRole");

  if (!username || role !== "manager") {
    window.location.href = "../paginaDePornire/paginaDePornire.html";
    return;
  }

  document.getElementById("welcome-message").innerText =
    "Bine ai venit, " + username + "!";

  incarcaMedicamente();
  // afiseazaMedicamenteCuStergere();
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
