// home.js - VERSÃO SÓ COM LOCALSTORAGE

async function initHome() {
    console.log('--- Início da initHome ---');
    const authButton = document.getElementById('authButton')

    // 1. Tentar recuperar o usuário do localStorage
    const usuarioSalvo = localStorage.getItem('usuario');

    console.log('HOME.JS: Valor bruto de "usuario" no localStorage:', usuarioSalvo); // ADICIONE ESTA LINHA

    // 2. Verificar se o usuário está logado
    if (!usuarioSalvo) {
        console.log('Nenhum usuário encontrado no localStorage. Redirecionando para o login.');

        if(authButton){
            authButton.textContent = 'Login'
            authButton.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html'
        }
        // Ative esta linha para redirecionar se o usuário não estiver logado
        //window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';

        return; // Interrompe a execução da função
    }

    let usuario;
    try {
        console.log('Tentando fazer JSON.parse...'); // Adicione este
        usuario = JSON.parse(usuarioSalvo); // <--- COLOQUE UM BREAKPOINT AQUI
        console.log('JSON.parse BEM SUCEDIDO!'); // Adicione este
        console.log('Usuário recuperado do localStorage:', usuario);

        if(authButton) {
            authButton.textContent = 'Logout'
            authButton.href = '#'
            authButton.onclick = () => {
                localStorage.removeItem('usuario');
                alert("Você foi desconectado");
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
            }
        }

        // AQUI VOCÊ ATUALIZA SUA INTERFACE DO USUÁRIO com os dados do LOCALSTORAGE
        // Descomente e adapte estas linhas para exibir os dados na sua home.html
        // Certifique-se de que sua home.html tem elementos com esses IDs (ex: <span id="nomeUsuario"></span>)
        document.getElementById('nomeUsuario').textContent = usuario.nome || 'Visitante';
        document.getElementById('moedasUsuario').textContent = usuario.moedas !== undefined ? usuario.moedas : 'N/A';
        // Adicione aqui outros campos que você salvou no localStorage (ex: usuario.id)

        console.log('Interface do usuário atualizada com sucesso!');
    } catch (e) {
        console.error('Erro ao fazer parse do usuário do localStorage:', e);
        // Se o JSON estiver corrompido, limpa o localStorage e redireciona
        localStorage.removeItem('usuario');
        alert("Seu login expirou, por favor faça login novamente")
        // Ative esta linha para redirecionar em caso de erro no parse do localStorage
        window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
        return;
    }

    console.log('--- Fim da initHome (sem erros) ---');

}

// Chamar a função initHome quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', initHome);