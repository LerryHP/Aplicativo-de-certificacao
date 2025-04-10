let card = document.querySelector(".card");
let loginbutton = document.querySelector(".loginbutton");
let cadastrobutton = document.querySelector(".cadastrobutton");

loginbutton.onclick = () => {
    card.classList.remove("cadastroActive")
    card.classList.add("loginActive")
}

cadastrobutton.onclick = () => {
    card.classList.remove("loginActive")
    card.classList.add("cadastroActive")
}





document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const loginBtn = document.querySelector("button[onclick='loginUsuario()']");
  
    /* Ativa o botão de login só quando os campos estiverem preenchidos */
    const verificarCampos = () => {
      if (emailInput.value && senhaInput.value) {
        loginBtn.disabled = false;
      } else {
        loginBtn.disabled = true;
      }
    };
  
    emailInput.addEventListener("input", verificarCampos);
    senhaInput.addEventListener("input", verificarCampos);
  });
  


