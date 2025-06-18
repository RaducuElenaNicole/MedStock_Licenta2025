function afiseazaSectiune(id) {
    const sectiuni = document.querySelectorAll('.sectiune');
    sectiuni.forEach(sec => sec.style.display = 'none');

    const selectata = document.getElementById(id);
    if (selectata) {
        selectata.style.display = 'block';

        if (id === 'unitatiMedicale') {
            document.getElementById("tabelCentre").style.display = "none";
        }
    }
}

function afiseazaFormularCentru() {
    const form = document.getElementById("formularCentru");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

document.getElementById("formularCentru").addEventListener("submit", async function(e) {
    e.preventDefault();

    const nume = document.getElementById("nume").value;
    const adresa = document.getElementById("adresa").value;
    const oras = document.getElementById("oras").value;

    const response = await fetch("http://127.0.0.1:5000/adauga_centru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume, adresa, oras })
    });

    const mesaj = document.getElementById("mesajCentru");
    if (response.ok) {
        mesaj.textContent = "Centru medical adăugat cu succes!";
        mesaj.style.color = "green";
        document.getElementById("formularCentru").reset();
    } else {
        mesaj.textContent = "Eroare la adăugare.";
        mesaj.style.color = "red";
    }
});

async function incarcaCentre() {
    const tabel = document.getElementById("tabelCentre");
    const tbody = tabel.querySelector("tbody");
    tbody.innerHTML = "";

    const response = await fetch("http://127.0.0.1:5000/centru_medical");
    if (response.ok) {
        const centre = await response.json();
        centre.forEach(c => {
            const rand = document.createElement("tr");
            rand.innerHTML = `
                <td>${c.nume}</td>
                <td>${c.adresa}</td>
                <td>${c.oras}</td>
                <td><button onclick="vizualizeazaProbleme(${c.id})">Vizualizează probleme</button></td>
            `;
            tbody.appendChild(rand);
        });
    }
}

function vizualizeazaCentre() {
    const tabel = document.getElementById("tabelCentre");
    const tbody = tabel.querySelector("tbody");
    tbody.innerHTML = "";  
    tabel.style.display = "table";
    incarcaCentre();       
}

function vizualizeazaProbleme(idCentru) {
    alert(`Aici vei vizualiza problemele pentru centrul cu ID-ul: ${idCentru}`);
}

function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    window.location.href = "../paginaDePornire/paginaDePornire.html";
}

async function incarcaManageri() {
    const select = document.getElementById("select-manager");
    select.innerHTML = "";

    const response = await fetch("http://127.0.0.1:5000/utilizatori?rol=manager");
    const manageri = await response.json();

    manageri.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.nume + " (" + m.username + ")";
        select.appendChild(opt);
    });
}

async function incarcaCentreDropdown() {
    const select = document.getElementById("select-centru");
    select.innerHTML = "";

    const response = await fetch("http://127.0.0.1:5000/centru_medical");
    const centre = await response.json();

    centre.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nume + " - " + c.oras;
        select.appendChild(opt);
    });
}

function afiseazaFormularAsociere() {
    const sectiune = document.getElementById("sectiune-asociere");
    const esteVizibil = sectiune.style.display === "block";
    sectiune.style.display = esteVizibil ? "none" : "block";

    if (!esteVizibil) {
        incarcaManageri();
        incarcaCentreDropdown();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.onload = function () {
        const username = localStorage.getItem("loggedInUser");
        const role = localStorage.getItem("userRole");

        if (!username || role !== "admin") {
            window.location.href = "../paginaDePornire/paginaDePornire.html";
            return;
        }

        document.getElementById("numeUser").textContent = username;

        const formular = document.getElementById("asociereManagerForm");
        if (formular) {
            formular.addEventListener("submit", async function (e) {
                e.preventDefault();

                const idUtilizator = document.getElementById("select-manager").value;
                const idCentru = document.getElementById("select-centru").value;
                const mesaj = document.getElementById("asociereMesaj");

                const response = await fetch("http://127.0.0.1:5000/asociaza_manager", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_utilizator: idUtilizator, id_centru: idCentru })
                });

                const data = await response.json();
                mesaj.textContent = data.message || data.error;
                mesaj.style.color = response.ok ? "green" : "red";

                if (response.ok) {
                    incarcaManageri();
                    incarcaCentreDropdown();
                }
            });
        }
        incarcaCentreDropdown();
    };
});

function afiseazaFormularEditare() {
  const form = document.getElementById("formularEditare");
  form.style.display = form.style.display === "none" ? "block" : "none";

  document.getElementById("tabelUtilizatori").style.display = "none";

  if (form.style.display === "block") {
    incarcaUtilizatoriPentruEditare();
    incarcaCentrePentruEditare();
  }
}

async function incarcaUtilizatoriPentruEditare() {
  const select = document.getElementById("select-utilizator-edit");
  select.innerHTML = "<option disabled selected>-- Selectează --</option>";

  const responseUser = await fetch("http://127.0.0.1:5000/utilizatori?rol=user");
  const responseManager = await fetch("http://127.0.0.1:5000/utilizatori?rol=manager");

  const useri = await responseUser.json();
  const manageri = await responseManager.json();

  const toti = [...useri, ...manageri];
  toti.forEach(u => {

    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.nume + " (" + u.username + ")";
    opt.dataset.email = u.email;
    opt.dataset.rol = u.rol;

    select.appendChild(opt);
  });

    select.addEventListener("change", function () {
        const selectedOption = select.options[select.selectedIndex];
        document.getElementById("edit-nume").value = selectedOption.textContent.split(" (")[0];
        document.getElementById("edit-email").value = selectedOption.dataset.email || "";
        document.getElementById("edit-rol").value = selectedOption.dataset.rol || "user";
    });
}

async function handleEditareUtilizator(e) {
  e.preventDefault();

  const id = document.getElementById("select-utilizator-edit").value;
  const nume = document.getElementById("edit-nume").value;
  const email = document.getElementById("edit-email").value;
  const rol = document.getElementById("edit-rol").value;
  const mesaj = document.getElementById("editareMesaj");
  const id_centru = document.getElementById("edit-centru").value;

  const response = await fetch("http://127.0.0.1:5000/editeaza_utilizator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, nume, email, rol, id_centru })
  });

  const data = await response.json();

  mesaj.textContent = data.message || data.error;
  mesaj.style.color = response.ok ? "green" : "red";

  if (response.ok) {
    mesaj.textContent = "Utilizator actualizat cu succes!";
    mesaj.style.color = "green";

    document.getElementById("formularEditare").style.display = "none";

    incarcaUtilizatoriPentruEditare();
    afiseazaTabelUtilizatori(window.ultimaEditareId);
  }
}

async function afiseazaTabelUtilizatori(idEvidentiat = null) {
  const tabel = document.getElementById("tabelUtilizatori");
  const tbody = tabel.querySelector("tbody");
  tbody.innerHTML = ""; 

  tabel.style.display = tabel.style.display === "none" ? "table" : "none";

  if (tabel.style.display === "table") {
    const response = await fetch("http://127.0.0.1:5000/utilizatori_complet");
    const utilizatori = await response.json();

    utilizatori.forEach(u => {
      const rand = document.createElement("tr");
        if (idEvidentiat && u.id == idEvidentiat) {
            rand.style.backgroundColor = "#cce5ff";  
        }

      rand.innerHTML = `
        <td>${u.nume}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.rol === "user" ? "Farmacist" : "Manager"}</td>
        <td>${u.centru_medical || "-"}</td>
        <td><button onclick="selecteazaUtilizator('${u.id}', 
                '${u.nume}', '${u.email}', '${u.rol}', '${u.id_centru_medical || ""}')">Editează</button></td>
      `;
      tbody.appendChild(rand);
    });
    }

    await incarcaCentrePentruFiltru();
}

function selecteazaUtilizator(id, nume, email, rol, id_centru) {
  const formular = document.getElementById("formularEditare");
  formular.style.display = "block";
  document.getElementById("tabelUtilizatori").style.display = "none";

  incarcaCentrePentruEditare().then(() => {
    if (id_centru) {
      document.getElementById("edit-centru").value = id_centru;
    }
  });

  incarcaUtilizatoriPentruEditare().then(() => {
    const select = document.getElementById("select-utilizator-edit");

    select.value = id;

    document.getElementById("edit-nume").value = nume;
    document.getElementById("edit-email").value = email;
    document.getElementById("edit-rol").value = rol;

    window.ultimaEditareId = id;
  });
}

async function incarcaCentrePentruEditare() {
  const select = document.getElementById("edit-centru");
  select.innerHTML = '<option value="">-- Fără asociere --</option>';

  const response = await fetch("http://127.0.0.1:5000/centru_medical");
  const centre = await response.json();

  centre.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nume} (${c.oras})`;
    select.appendChild(opt);
  });
}

function afiseazaFormularCreareUtilizator() {
  const formular = document.getElementById("formularCreareUtilizator");
  formular.style.display = formular.style.display === "none" ? "block" : "none";

  if (formular.style.display === "block") {
    incarcaCentrePentruCreare();
  }
}

function afiseazaSelectCentru() {
  const rol = document.getElementById("rol-nou").value;
  const divCentru = document.getElementById("camp-centru");

  if (rol === "user" || rol === "manager") {
    divCentru.style.display = "block";
  } else {
    divCentru.style.display = "none";
  }
}

async function incarcaCentrePentruCreare() {
  const select = document.getElementById("centru-nou");
  select.innerHTML = '<option value="">-- Selectează un centru --</option>';

  const response = await fetch("http://127.0.0.1:5000/centru_medical");
  const centre = await response.json();

  centre.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nume} (${c.oras})`;
    select.appendChild(opt);
  });
}

async function creeazaUtilizatorNou(e) {
  e.preventDefault();

  const nume = document.getElementById("nume-nou").value;
  const username = document.getElementById("username-nou").value;
  const email = document.getElementById("email-nou").value;
  const rol = document.getElementById("rol-nou").value;
  const id_centru = document.getElementById("centru-nou").value;

  const mesaj = document.getElementById("mesajCreareUtilizator");

  const response = await fetch("http://127.0.0.1:5000/pregateste_utilizator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nume, username, email, rol, id_centru })
  });

  const data = await response.json();

  mesaj.textContent = data.message || data.error;
  mesaj.style.color = response.ok ? "green" : "red";

  if (response.ok) {
    document.getElementById("formularCreareUtilizator").reset();
    document.getElementById("camp-centru").style.display = "none";
  }
}

async function incarcaCentrePentruFiltru() {
  const select = document.getElementById("filtru-centru");
  select.innerHTML = `
    <option value="tot">Toate centrele</option>
    <option value="fara">Fără asociere</option>
  `;

  const response = await fetch("http://127.0.0.1:5000/centru_medical");
  const centre = await response.json();

  centre.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nume} (${c.oras})`;
    select.appendChild(opt);
  });

  document.getElementById("filtru-centru-wrapper").style.display = "block";
}

async function aplicaFiltre() {
  const selectCentru = document.getElementById("filtru-centru").value;
  const selectRol = document.getElementById("filtru-rol").value;

  const tabel = document.getElementById("tabelUtilizatori");
  const tbody = tabel.querySelector("tbody");
  tbody.innerHTML = "";

  const response = await fetch("http://127.0.0.1:5000/utilizatori_complet");
  const utilizatori = await response.json();

  let filtrati = utilizatori;

  // Filtrare după centru
  if (selectCentru === "fara") {
    filtrati = filtrati.filter(u => !u.id_centru_medical);
  } else if (selectCentru !== "tot") {
    filtrati = filtrati.filter(u => String(u.id_centru_medical) === selectCentru);
  }

  // Filtrare după rol
  if (selectRol !== "tot") {
    filtrati = filtrati.filter(u => u.rol === selectRol);
  }

  // Manager evidențiat dacă este filtrat doar pe centru
  if (selectCentru !== "tot" && selectCentru !== "fara") {
    const manager = filtrati.find(u => u.rol === "manager" && u.id_centru_medical == selectCentru);
    if (manager) {
      const rand = document.createElement("tr");
      rand.style.backgroundColor = "#d4f7d4"; // verde
      rand.innerHTML = `
        <td>${manager.nume}</td>
        <td>${manager.username}</td>
        <td>${manager.email}</td>
        <td>Manager</td>
        <td>${manager.centru_medical || "-"}</td>
        <td><button onclick="selecteazaUtilizator('${manager.id}', '${manager.nume}', '${manager.email}', '${manager.rol}', '${manager.id_centru_medical || ""}')">Editează</button></td>
      `;
      tbody.appendChild(rand);
      filtrati = filtrati.filter(u => u.id !== manager.id);
    }
  }

  // Afișare restul utilizatorilor
  filtrati.forEach(u => {
    const rand = document.createElement("tr");
    rand.innerHTML = `
      <td>${u.nume}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.rol === "user" ? "Farmacist" : "Manager"}</td>
      <td>${u.centru_medical || "-"}</td>
      <td><button onclick="selecteazaUtilizator('${u.id}', '${u.nume}', '${u.email}', '${u.rol}', '${u.id_centru_medical || ""}')">Editează</button></td>
    `;
    tbody.appendChild(rand);
  });
}