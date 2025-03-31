let images = [];
let users = [];

// Função para realizar o login
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Login bem-sucedido') {
            if (data.role === 'admin') {
                document.getElementById("login-container").classList.add("hidden");
                document.getElementById("admin-container").classList.remove("hidden");
                displayImages();
            } else {
                document.getElementById("login-container").classList.add("hidden");
                document.getElementById("upload-container").classList.remove("hidden");
            }
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Erro no login: ' + err));
}

// Função para criar um novo usuário
// Função para criar um novo usuário
// Função para criar um novo usuário
function createUser() {
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const email = document.getElementById("new-email").value;

    // Verificar se algum dos campos está vazio
    if (!username || !password || !email) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Enviar o pedido de criação do usuário para o backend
    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Usuário criado com sucesso!') {
            alert('Usuário criado com sucesso!');
            goBack('login');
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Erro ao criar usuário: ' + err));
}



// Função para enviar uma imagem
function submitImage() {
    const email = document.getElementById("email").value;
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];
    
    if (!email || !file) {
        alert("Por favor, insira um email e selecione uma imagem.");
        return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('image', file);

    fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Imagem enviada com sucesso!') {
            alert(data.message);
            document.getElementById("image-preview").innerHTML = '';
        } else {
            alert('Erro ao enviar a imagem');
        }
    })
    .catch(err => alert('Erro ao enviar a imagem: ' + err));
}

// Função para exibir as imagens na tela de admin
function displayImages() {
    fetch('http://localhost:3000/api/images')
    .then(res => res.json())
    .then(data => {
        const imageList = document.getElementById("image-list");
        imageList.innerHTML = '';
        data.forEach(image => {
            imageList.innerHTML += `
                <div>
                    <p>Email: ${image.email}</p>
                    <img src="http://localhost:3000${image.imageUrl}" alt="Imagem" width="200">

                </div>
            `;
        });
    })
    .catch(err => console.log('Erro ao carregar imagens: ' + err));
}

// Função para navegar entre as telas
// Função para navegar entre as telas
function goBack(page) {
    if (page === 'login') {
        document.getElementById("login-container").classList.remove("hidden");
        document.getElementById("upload-container").classList.add("hidden");
        document.getElementById("admin-container").classList.add("hidden");
        document.getElementById("create-user-container").classList.add("hidden"); // Esconde a tela de criação de usuário
    } else {
        document.getElementById("create-user-container").classList.remove("hidden"); // Exibe a tela de criação de usuário
        document.getElementById("login-container").classList.add("hidden");
    }
}


function goToCreateUser() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("create-user-container").classList.remove("hidden");
}
