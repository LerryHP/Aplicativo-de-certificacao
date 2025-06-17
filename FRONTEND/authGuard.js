// authGuard.js

document.addEventListener('DOMContentLoaded', () => {
    const usuarioSalvo = localStorage.getItem('usuario');
    const loginPageUrl = 'http://127.0.0.1:5500/FRONTEND/login/index.html'; 
    let usuario = null; 

    if (!usuarioSalvo) {
        console.log('AuthGuard: Nenhum usuário encontrado no localStorage. Redirecionando para o login.');
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = loginPageUrl;
        return; 
    }

    try {
        usuario = JSON.parse(usuarioSalvo);
        console.log('AuthGuard: Usuário autenticado e recuperado:', usuario);


        const nomeSpan = document.getElementById('nomeUsuarioPagina');
        const emailSpan = document.getElementById('emailUsuarioPagina');
        const moedasSpan = document.getElementById('moedasUsuarioPagina');

        if (nomeSpan) {
            nomeSpan.textContent = usuario.nome || 'Visitante';
        }
        if (emailSpan) {
            emailSpan.textContent = usuario.email || 'N/A';
        }
        if (moedasSpan) {
            moedasSpan.textContent = usuario.moedas !== undefined ? usuario.moedas : 'N/A';
        }


        const logoutBtn = document.getElementById('logoutButton');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('usuario'); 
                alert('Você foi desconectado!');
                window.location.href = loginPageUrl; 
            });
        }

    } catch (e) {
        console.error('AuthGuard: Erro ao fazer parse do usuário do localStorage:', e);
        localStorage.removeItem('usuario'); 
        alert('Sua sessão de login expirou. Faça login novamente.');
        window.location.href = loginPageUrl;
        return; 
    }
 });
