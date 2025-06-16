document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    // Se não estiver logado, volta para o login
    window.location.href = './login/index.html';
    return;
  }

  // Exemplo: mostrar nome e moedas
  document.getElementById('nomeUsuario').textContent = usuario.nome;
  document.getElementById('moedasUsuario').textContent = usuario.moedas;
});
