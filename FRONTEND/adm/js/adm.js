// js/adm.js

document.addEventListener('DOMContentLoaded', async () => {
    const listaEnviosUl = document.getElementById('enviosPendentes');
    const detalhesEnvioDiv = document.getElementById('detalhesEnvio');
    const detalhesConteudoDiv = document.getElementById('detalhesConteudo'); // Div que contém os detalhes
    const selectMessageP = document.getElementById('selectMessage'); // Mensagem "Select a submission..."
    const btnAprovar = document.getElementById('btnAprovar');
    const btnReprovar = document.getElementById('btnReprovar');
    const logoutAdminBtn = document.getElementById('logoutAdmin'); 

    let enviosPendentes = []; 
    let envioSelecionado = null; 

    // --- Lógica de Segurança (mantida como está) ---
    let adminLogado = null;
    const usuarioSalvo = localStorage.getItem('usuario');
    if (!usuarioSalvo) {
        alert("Acesso não autorizado. Por favor, faça login.");
        window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
        return;
    }
    try {
        adminLogado = JSON.parse(usuarioSalvo);
        if (!adminLogado || adminLogado.id !== 4 || !adminLogado.isAdmin) { 
            alert("Acesso não autorizado. Apenas administradores podem acessar esta página.");
            window.location.href = 'http://127.0.0.1:5500/FRONTEND/home.html';
            return;
        }
    } catch (e) {
        console.error("Erro ao verificar sessão de administrador:", e);
        localStorage.removeItem('usuario');
        alert("Sua sessão está corrompida. Faça login novamente.");
        window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
        return;
    }

    if (logoutAdminBtn) {
        logoutAdminBtn.addEventListener('click', () => {
            localStorage.removeItem('usuario');
            alert("Você foi desconectado.");
            window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
        });
    }

    // --- Funções para Gerenciar a Interface ---

    async function carregarEnviosPendentes() {
        try {
            const response = await fetch('http://localhost:3000/api/envios-pendentes');
            if (!response.ok) {
                throw new Error('Falha ao carregar envios pendentes.');
            }
            enviosPendentes = await response.json();
            console.log("Envios pendentes carregados:", enviosPendentes); // DEBUG

            listaEnviosUl.innerHTML = ''; 

            if (enviosPendentes.length === 0) {
                listaEnviosUl.innerHTML = '<p>No pending submissions.</p>';
                selectMessageP.style.display = 'block'; // Mostra a mensagem inicial
                detalhesConteudoDiv.style.display = 'none'; // Esconde o conteúdo dos detalhes
                btnAprovar.style.display = 'none'; 
                btnReprovar.style.display = 'none';
                return;
            }

            enviosPendentes.forEach(envio => {
                const li = document.createElement('li');
                li.textContent = `ID: ${envio.id} - ${envio.marca} ${envio.modelo}`; 
                li.dataset.envioId = envio.id;
                li.addEventListener('click', () => exibirDetalhesEnvio(envio.id));
                listaEnviosUl.appendChild(li);
            });

            // Se houver envios, tenta exibir o primeiro por padrão
            if (enviosPendentes.length > 0) { // Removido !envioSelecionado para sempre mostrar o primeiro ao carregar
                 exibirDetalhesEnvio(enviosPendentes[0].id);
            }

        } catch (error) {
            console.error('Erro ao carregar envios:', error);
            document.getElementById('alerta').textContent = 'Error loading submissions.';
            selectMessageP.style.display = 'block';
            detalhesConteudoDiv.style.display = 'none';
            btnAprovar.style.display = 'none';
            btnReprovar.style.display = 'none';
        }
    }


    function exibirDetalhesEnvio(id) {
        envioSelecionado = enviosPendentes.find(envio => envio.id === id);
        console.log("Envio selecionado para detalhes:", envioSelecionado); // DEBUG: Veja o objeto completo

        if (envioSelecionado) {
            selectMessageP.style.display = 'none'; // Esconde a mensagem inicial
            detalhesConteudoDiv.style.display = 'block'; // Mostra o conteúdo dos detalhes

            // Preencher os spans com os dados (com || 'N/A' para evitar erros se nulo)
            document.getElementById('detalheId').textContent = envioSelecionado.id || 'N/A';
            document.getElementById('detalheMarca').textContent = envioSelecionado.marca || 'N/A';
            document.getElementById('detalheModelo').textContent = envioSelecionado.modelo || 'N/A';
            document.getElementById('detalheNumero').textContent = envioSelecionado.numero || 'N/A';
            document.getElementById('detalheMensagem').textContent = envioSelecionado.mensagem || 'N/A';
            document.getElementById('detalheTipoPlano').textContent = envioSelecionado.tipo_plano || 'N/A';
            document.getElementById('detalheUsuarioId').textContent = envioSelecionado.usuario_id || 'N/A';
            document.getElementById('detalheStatus').textContent = envioSelecionado.status || 'N/A'; // Coluna 'status'

            // Exibir Imagens
            const detalheImagensDiv = document.getElementById('detalheImagens');
            detalheImagensDiv.innerHTML = ''; 
            const imagens = [
                envioSelecionado.topo_url,
                envioSelecionado.sola_url,
                envioSelecionado.lingua_url,
                envioSelecionado.lado_url,
                envioSelecionado.caixa_url
            ];
            imagens.forEach(url => {
                if (url) {
                    const img = document.createElement('img');
                    img.src = `http://localhost:3000/${url}`; 
                    img.alt = 'Sneaker Image';
                    img.style.maxWidth = '150px'; 
                    img.style.margin = '5px';
                    img.style.border = '1px solid #ddd'; 
                    detalheImagensDiv.appendChild(img);
                }
            });

            btnAprovar.style.display = 'inline-block';
            btnReprovar.style.display = 'inline-block';
        } else {
            // Caso envioSelecionado seja nulo (algo deu errado)
            selectMessageP.style.display = 'block';
            detalhesConteudoDiv.style.display = 'none';
            detalhesConteudoDiv.innerHTML = '<p>Submission not found or error.</p>';
            btnAprovar.style.display = 'none';
            btnReprovar.style.display = 'none';
        }
    }

    // --- Funções para Ações do Admin (mantidas) ---

    async function atualizarStatusEnvio(status) {
        if (!envioSelecionado) {
            alert('Please select a submission first.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/atualizar-status-envio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: envioSelecionado.id,
                    status: status,
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(data.mensagem);
                const listItem = listaEnviosUl.querySelector(`li[data-envio-id="${envioSelecionado.id}"]`);
                if (listItem) {
                    listaEnviosUl.removeChild(listItem);
                }
                
                envioSelecionado = null; 
                selectMessageP.style.display = 'block'; // Mostra a mensagem inicial novamente
                detalhesConteudoDiv.style.display = 'none'; // Esconde os detalhes
                btnAprovar.style.display = 'none';
                btnReprovar.style.display = 'none';

                await carregarEnviosPendentes(); // Recarrega para garantir a lista atualizada

            } else {
                alert(data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Error updating status.');
        }
    }

    // --- Event Listeners (mantidos, mas com verificação para evitar erro de null) ---
    if (btnAprovar) btnAprovar.addEventListener('click', () => atualizarStatusEnvio('Aprovado'));
    if (btnReprovar) btnReprovar.addEventListener('click', () => atualizarStatusEnvio('Reprovado'));

    // Carregar os envios ao iniciar a página
    await carregarEnviosPendentes();
});