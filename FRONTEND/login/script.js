// Alterações nos botões de login e cadastro
let card = document.querySelector(".card");
let loginbutton = document.querySelector(".loginbutton");
let cadastrobutton = document.querySelector(".cadastrobutton");


loginbutton.onclick = () => {
    card.classList.remove("cadastroActive");
    card.classList.add("loginActive");
};

cadastrobutton.onclick = () => {
    card.classList.remove("loginActive");
    card.classList.add("cadastroActive");
};


function cadastrarUsuario() {
    const nome = document.getElementById('new-username').value;
    const email = document.getElementById('new-email').value;
    const senha = document.getElementById('new-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

       // Valida se os campos estão preenchidos
    if (!nome || !email || !senha || !confirmarSenha) {
        alert('Preencha todos os campos!');
        return;
    }

    // Valida se a senha e a confirmação da senha são iguais
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
    }

    fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuário cadastrado com sucesso!');
            window.location.href = 'http://127.0.0.1:5500/FRONTEND/home.html';
        } else {
            alert('Erro ao cadastrar o usuário.');
        }
    })
    .catch(error => console.error('Erro:', error));
}


function loginUsuario() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    alert('Preencha todos os campos!');
    return;
  }

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Resposta do Backend:', data); 
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        console.log('Usuário salvo no localStorage:', localStorage.getItem('usuario'));


        if (data.usuario && data.usuario.isAdmin) {
          // Se for o usuário administrador, redireciona para a página de administração
          window.location.href = 'http://127.0.0.1:5500/FRONTEND//adm/admpage.html';
          console.log("Logado como Administrador");
        } else {
          // Para todos os outros usuários, redireciona para a home
          window.location.href = 'http://127.0.0.1:5500/FRONTEND/home.html';
          console.log("Logado como Usuário Comum");
        }

      } else {
        alert(data.mensagem || 'Email ou senha incorretos!');
      }
    })
    .catch(err => {
      console.error('Erro ao fazer login:', err);
      alert('Erro ao fazer login.');
    });
}
