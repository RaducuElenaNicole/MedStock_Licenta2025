function afiseazaInregistrare() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
  document.getElementById("intro").innerText = "Creează un cont nou pentru a accesa platforma!";
}

function afiseazaAutentificare() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("intro").innerText =
    "Autentifică-te pentru a accesa platforma de gestionare a stocurilor de medicamente.";
}

// Signup
function signUp(event) {
  event.preventDefault();

  const nume = document.getElementById("signup-nume").value;
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const parola = document.getElementById("signup-password").value;
  const rol = document.getElementById("signup-rol").value;

  fetch("http://127.0.0.1:5000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nume, username, email, parola, rol }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Cont creat cu succes! Te rugăm să te autentifici.");
        afiseazaAutentificare();
       
       document.getElementById("signup-nume").value = "";
       document.getElementById("signup-username").value = "";
       document.getElementById("signup-email").value = "";
       document.getElementById("signup-password").value = "";
       document.getElementById("signup-rol").selectedIndex = 0;

      localStorage.setItem("username", data.username);
      localStorage.setItem("rol", data.rol);
      window.location.href = "Admin/admin.html";

      } else {
        alert(data.error || "Eroare la înregistrare.");
      }
    })
    .catch(err => {
      alert("Eroare de rețea sau server.");
      console.error(err);
    });
}

// Login
function logIn(event) {
  event.preventDefault();

  const username = document.getElementById("login-username").value;
  const parola = document.getElementById("login-password").value;

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, parola }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Salvăm în localStorage atât utilizatorul, cât și rolul
        localStorage.setItem("loggedInUser", username);
        localStorage.setItem("userRole", data.rol);  // se salvează rolul
        localStorage.setItem("userId", data.id); 
        localStorage.setItem("idCentruMedical", data.id_centru_medical);

        //window.location.href = "home.html";
        
          if (data.rol === "admin") {
            window.location.href = "../Admin/admin.html";
          } else if (data.rol === "manager") {
            window.location.href = "../Manager/manager.html";
          } else {
            window.location.href = "../Farmacist/farmacist.html";
          }
      
      } else {
        alert(data.message || "Autentificare eșuată.");
      }
    });
}