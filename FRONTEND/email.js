document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    try {
      const response = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (data.success) {
        alert("Mensagem enviada com sucesso!");
        form.reset();
      } else {
        alert("Erro ao enviar: " + data.mensagem);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
      console.error("Erro:", error);
    }
  });
});
