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

function afiseazaFormularIncident() {
  const form = document.getElementById("formularIncident");
  form.style.display = form.style.display === "none" ? "block" : "none";
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
  const nume = document.getElementById("incident-medicament").value;
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
      nume_medicament: nume,
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
