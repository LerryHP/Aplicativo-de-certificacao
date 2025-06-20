// js/adm.js

document.addEventListener('DOMContentLoaded', async () => {
    const listaEnviosUl = document.getElementById('enviosPendentes');
    const detalhesEnvioDiv = document.getElementById('detalhesEnvio');
    const detalhesConteudoDiv = document.getElementById('detalhesConteudo');
    const btnAprovar = document.getElementById('btnAprovar');
    const btnReprovar = document.getElementById('btnReprovar');
    const logoutAdminBtn = document.getElementById('logoutAdmin'); 

    let enviosPendentes = []; 
    let envioSelecionado = null; 


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
            window.location.href = 'http://127.0.0.1:5500/FRONTEND/home.html'; // Redireciona se não for admin
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



    async function carregarEnviosPendentes() {
        try {
            const response = await fetch('http://localhost:3000/api/envios-pendentes');
            if (!response.ok) {
                throw new Error('Falha ao carregar envios pendentes.');
            }
            enviosPendentes = await response.json();

            listaEnviosUl.innerHTML = ''; 

            if (enviosPendentes.length === 0) {
                listaEnviosUl.innerHTML = '<p>No pending submissions.</p>';
                detalhesConteudoDiv.innerHTML = '<p>Select a submission to see details</p>'; 
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


            if (enviosPendentes.length > 0 && !envioSelecionado) {
                 exibirDetalhesEnvio(enviosPendentes[0].id);
            }

        } catch (error) {
            console.error('Erro ao carregar envios:', error);
            document.getElementById('alerta').textContent = 'Error loading submissions.';
            detalhesConteudoDiv.innerHTML = '<p>Error loading submissions.</p>';
        }
    }


    function exibirDetalhesEnvio(id) {
        envioSelecionado = enviosPendentes.find(envio => envio.id === id);

        if (envioSelecionado) {
            document.getElementById('detalheId').textContent = envioSelecionado.id;
            document.getElementById('detalheMarca').textContent = envioSelecionado.marca;
            document.getElementById('detalheModelo').textContent = envioSelecionado.modelo;
            document.getElementById('detalheNumero').textContent = envioSelecionado.numero;
            document.getElementById('detalheMensagem').textContent = envioSelecionado.mensagem;
            document.getElementById('detalheTipoPlano').textContent = envioSelecionado.tipo_plano;
            document.getElementById('detalheUsuarioId').textContent = envioSelecionado.usuario_id || 'N/A'; 
            document.getElementById('detalheStatus').textContent = envioSelecionado.status; 


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
                    detalheImagensDiv.appendChild(img);
                }
            });


            btnAprovar.style.display = 'inline-block';
            btnReprovar.style.display = 'inline-block';
        } else {
            detalhesConteudoDiv.innerHTML = '<p>Submission not found.</p>';
            btnAprovar.style.display = 'none';
            btnReprovar.style.display = 'none';
        }
    }



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
                detalhesConteudoDiv.innerHTML = '<p>Submission processed. Select another one.</p>';
                btnAprovar.style.display = 'none';
                btnReprovar.style.display = 'none';


            } else {
                alert(data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Error updating status.');
        }
    }


    btnAprovar.addEventListener('click', () => atualizarStatusEnvio('Aprovado'));
    btnReprovar.addEventListener('click', () => atualizarStatusEnvio('Reprovado'));


    await carregarEnviosPendentes();
});