window.onload = function () {
  const username = localStorage.getItem("loggedInUser");
  const role = localStorage.getItem("userRole");

  // Securitate de bază: dacă nu e logat sau nu e farmacist => redirect
  if (!username || role !== "user") {
    window.location.href = "../paginaDePornire/paginaDePornire.html";
    return;
  }

  document.getElementById("welcome-message").innerText =
    "Bine ai venit, " + username + "!";

  incarcaMedicamenteGenerica("id_medicament");
  incarcaMedicamenteGenerica("incident-medicament");
};

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("userRole");
  window.location.href = "../paginaDePornire/paginaDePornire.html";
}

function verificaTipAltceva() {
  const select = document.getElementById("incident-tip");
  const altceva = document.getElementById("incident-altceva");

  if (select.value === "Altceva") {
    altceva.style.display = "block";
    altceva.required = true;
  } else {
    altceva.style.display = "none";
    altceva.required = false;
  }
}

async function incarcaMedicamenteGenerica(idSelect) {
    const response = await fetch("http://127.0.0.1:5000/medicamente");
    if (response.ok) {
        const data = await response.json();
        const medicamente = data.medicamente;

        const select = document.getElementById(idSelect);
        select.innerHTML = '<option value="">Selectează medicamentul</option>';

        medicamente.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id_medicament;
            opt.textContent = m.nume;
            select.appendChild(opt);
        });
    }
}

function afiseazaFormularIncident() {
    const containerIncident = document.getElementById("containerIncident");
    const containerConsum = document.getElementById("containerConsum");

    if (containerIncident.style.display === "none") {
       incarcaMedicamenteGenerica("incident-medicament");
        containerIncident.style.display = "block";
        containerConsum.style.display = "none";
    } else {
        containerIncident.style.display = "none";
    }
}

function verificaTipAltceva() {
  const select = document.getElementById("incident-tip");
  const altcevaInput = document.getElementById("incident-altceva");

  if (select.value === "Altceva") {
    altcevaInput.style.display = "block";
    altcevaInput.required = true;
  } else {
    altcevaInput.style.display = "none";
    altcevaInput.required = false;
  }
}

function trimiteIncident(e) {
  e.preventDefault();

  const id_farmacist = localStorage.getItem("userId"); // ID-ul utilizatorului logat
  const id_medicament = document.getElementById("incident-medicament").value;
  let tip = document.getElementById("incident-tip").value;
  const altceva = document.getElementById("incident-altceva").value;
  const descriere = document.getElementById("incident-descriere").value;

  if (tip === "Altceva") {
    tip = altceva;
  }

  fetch("http://127.0.0.1:5000/raporteaza_incident", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_farmacist,
      id_medicament,
      tip_incident: tip,
      descriere
    })
  })
    .then(res => res.json())
    .then(data => {
      const msg = document.getElementById("mesajIncident");
      if (data.success) {
        msg.textContent = "Incident raportat cu succes!";
        msg.style.color = "green";
        document.getElementById("formularIncident").reset();
        document.getElementById("incident-altceva").style.display = "none";
      } else {
        msg.textContent = "Eroare la raportare.";
        msg.style.color = "red";
      }
    });
}

function afiseazaFormularConsum() {
    const containerConsum = document.getElementById("containerConsum");
    const containerIncident = document.getElementById("containerIncident");

    if (containerConsum.style.display === "none") {
        incarcaMedicamenteGenerica("id_medicament");
        containerConsum.style.display = "block";
        containerIncident.style.display = "none";
    } else {
        containerConsum.style.display = "none";
    }
}

document.getElementById("formularConsum").addEventListener("submit", async function(e) {
    e.preventDefault();

    const id_medicament = document.getElementById("id_medicament").value;
    const data_consum = document.getElementById("data_consum").value;
    const cantitate = document.getElementById("cantitate").value;

    const response = await fetch("http://127.0.0.1:5000/adauga_consum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_medicament, data_consum, cantitate })
    });

    const mesaj = document.getElementById("mesajConsum");
    if (response.ok) {
        mesaj.textContent = "Consum adăugat cu succes!";
        mesaj.style.color = "green";
        document.getElementById("formularConsum").reset();
    } else {
        mesaj.textContent = "Eroare la adăugare!";
        mesaj.style.color = "red";
    }
});