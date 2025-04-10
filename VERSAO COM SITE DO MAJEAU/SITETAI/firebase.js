/* Importação dos módulos Firebase */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

/* Configuração do seu Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyCpj7-KNm1w9_8sabz_pCi6EnICepsb0W8",
  authDomain: "loginscadastrosverifiq.firebaseapp.com",
  projectId: "loginscadastrosverifiq",
  storageBucket: "loginscadastrosverifiq.appspot.com",
  messagingSenderId: "723854490445",
  appId: "1:723854490445:web:f506fb0502b1f243ab1504",
  measurementId: "G-7G52ELSEP3"
};

/* Inicializa Firebase e Auth */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* Função para cadastrar usuário com nome */
window.cadastrarUsuario = () => {
  const username = document.getElementById("new-username").value;
  const email = document.getElementById("new-email").value;
  const senha = document.getElementById("new-senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;

  if (!username) {
    alert("Por favor, preencha o nome de usuário.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      const user = userCredential.user;

      // Atualiza o nome do usuário no perfil
      return updateProfile(user, {
        displayName: username
      }).then(() => {
        alert("Cadastro feito com sucesso!");
        console.log("Usuário cadastrado:", user);
      });
    })
    .catch((error) => {
      alert("Erro ao cadastrar: " + error.message);
    });
};

/* Função para login */
window.loginUsuario = () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

    /*REDIRECIONAR PARA OUTRA PAGINA*/
     signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      // Redireciona após login com sucesso
      window.location.href = "home/home.html";
    })

  /*signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      alert("Login realizado!");
      console.log(userCredential.user);
    })*/
    .catch((error) => {
      alert("Erro ao logar: " + error.message);
    });
};

/* Função para login com Google */
window.loginComGoogle = () => {
  const provider = new GoogleAuthProvider();


/* redirecionar para outra pagina*/
 signInWithPopup(auth, provider)
    .then((result) => {
      alert("Login com Google feito!");
      console.log(result.user);
      // Redireciona o usuário após login com sucesso
      window.location.href = "home/home.html"; // troque pelo caminho da sua página
    })
  signInWithPopup(auth, provider)
    .then((result) => {
      alert("Login com Google feito!");
      console.log(result.user);
    })
    .catch((error) => {
      alert("Erro com Google: " + error.message);
    });
};

/* Verifica se o usuário está logado */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário logado:", user.displayName, user.email);
  }
});
