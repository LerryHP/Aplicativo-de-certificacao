// Simulação de dados (em produção, será substituído por fetch do backend)
const envios = [
  {
    nome: "João Silva",
    data: "2025-05-27",
    hora: "10:30",
    fotos: ["foto1.jpg", "foto2.jpg","foto3.jpg","foto4.jpg", "foto5.jpg"]
  },
  {
    nome: "Maria Souza",
    data: "2025-05-27",
    hora: "11:10",
    fotos: ["foto1.jpg", "foto2.jpg","foto3.jpg","foto4.jpg", "foto5.jpg"]
  }
];

const usuariosList = document.getElementById("usuarios");
const detalhesDiv = document.getElementById("detalhes");
const alerta = document.getElementById("alerta");

function carregarEnvios() {
  if (envios.length === 0) {
    alerta.textContent = "No files received.";
    return;
  }

  alerta.textContent = "";

  envios.forEach((envio, index) => {
    const li = document.createElement("li");
    li.textContent = `${envio.nome} - ${envio.data} ${envio.hora}`;
    li.onclick = () => mostrarDetalhes(index);
    usuariosList.appendChild(li);
  });
}

function mostrarDetalhes(index) {
  const envio = envios[index];
  detalhesDiv.innerHTML = `
    <h2>Details</h2>
    <p><strong>Name:</strong> ${envio.nome}</p>
    <p><strong>Date:</strong> ${envio.data}</p>
    <p><strong>Time:</strong> ${envio.hora}</p>
    <div><strong>Photos:</strong></div>
    ${envio.fotos.map(f => `<img src="${f}" alt="Sneaker photo">`).join("")}
  `;
}

carregarEnvios();
