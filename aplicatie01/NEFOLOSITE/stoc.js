function adaugaMedicament(event) {
  event.preventDefault();

  const nume = document.getElementById("nume").value;
  const lot = document.getElementById("lot").value;
  const expirare = document.getElementById("expirare").value;
  const cantitate = parseInt(document.getElementById("cantitate").value);

  const medicament = { nume, lot, expirare, cantitate };

  let stoc = JSON.parse(localStorage.getItem("stoc")) || [];
  stoc.push(medicament);
  localStorage.setItem("stoc", JSON.stringify(stoc));

  event.target.reset();
  afiseazaStoc();
}

function afiseazaStoc() {
  const stoc = JSON.parse(localStorage.getItem("stoc")) || [];
  const tabel = document.getElementById("tabelStoc");
  tabel.innerHTML = "";

  const azi = new Date();

  stoc.forEach((med, index) => {
    const rand = document.createElement("tr");

    const dataExp = new Date(med.expirare);
    const diffZile = Math.ceil((dataExp - azi) / (1000 * 3600 * 24));

    rand.innerHTML = `
      <td>${med.nume}</td>
      <td>${med.lot}</td>
      <td>${med.expirare}</td>
      <td>${med.cantitate}</td>
      <td style="color: ${diffZile <= 30 ? 'red' : 'green'}">
        ${diffZile <= 30 ? 'Aproape de expirare' : 'OK'}
      </td>
      <td><button onclick="stergeMedicament(${index})">Șterge</button></td>
    `;

    tabel.appendChild(rand);
  });
}

function stergeMedicament(index) {
  let stoc = JSON.parse(localStorage.getItem("stoc")) || [];
  stoc.splice(index, 1);
  localStorage.setItem("stoc", JSON.stringify(stoc));
  afiseazaStoc();
}


window.onload = afiseazaStoc;