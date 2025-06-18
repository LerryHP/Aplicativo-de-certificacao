// upload.js

document.addEventListener('DOMContentLoaded', () => {
    const uploadFormFree = document.getElementById('uploadForm');
    const uploadFormPaid = document.getElementById('uploadFormPaid'); 

    async function handleFormSubmit(event) {
        event.preventDefault(); 

        const form = event.target;
        const formData = new FormData(form); 
        
        const planType = formData.get('planType'); 
        const moedasADescontar = 10; 

        let usuarioLogado = null;
        const usuarioSalvo = localStorage.getItem('usuario');
        
        // --- 1. RECUPERAÇÃO E VALIDAÇÃO BÁSICA DO USUÁRIO LOGADO ---
        if (usuarioSalvo) {
            try {
                usuarioLogado = JSON.parse(usuarioSalvo);
                if (!usuarioLogado || usuarioLogado.id === undefined) {
                    // Se o parse falhou ou o ID está faltando, é uma sessão corrompida
                    throw new Error("ID do usuário faltando ou sessão corrompida.");
                }
            } catch (e) {
                console.error("Sua sessão expirou ou está corrompida, logue novamente por favor!", e);
                localStorage.removeItem('usuario'); 
                alert("Sua sessão expirou ou está corrompida. Por favor, faça login novamente.");
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
                return;
            }
        } else {
            // Se não houver usuário logado, mas o plano é pago, força o login
            if (planType === 'pago') {
                alert("Você precisa estar logado para usar o plano pago.");
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
                return;
            }
            // Para plano grátis, o envio pode continuar sem userId (será null no BD)
            console.log("Frontend: Nenhum usuário logado. Upload grátis permitido sem userId."); 
        }

        // --- 2. ANEXAR userId ao FormData (se o usuário estiver logado) ---
        // Este passo garante que o userId seja enviado se usuarioLogado existe e tem ID.
        if (usuarioLogado && usuarioLogado.id !== undefined) {
            formData.append('userId', usuarioLogado.id);
            console.log("Frontend: userId anexado ao FormData:", usuarioLogado.id); // Debug
        }

        // --- 3. Lógica específica para PLANO PAGO (permanece com validações e desconto) ---
        if (planType === 'pago') {
            // As validações de saldo e a confirmação permanecem aqui
            if (usuarioLogado.moedas < moedasADescontar) {
                alert(`Você precisa de ${moedasADescontar} moedas para este plano. Saldo atual: ${usuarioLogado.moedas}.`);
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/cards.html';
                return;
            }

            const confirmacao = confirm(`Este plano custa ${moedasADescontar} moedas. Seu saldo atual é ${usuarioLogado.moedas}. Deseja continuar?`);
            if (!confirmacao) {
                return; 
            }
            
            // Anexar moedasADescontar ao FormData APENAS para plano pago
            formData.append('moedasADescontar', moedasADescontar);
            console.log("Frontend: moedasADescontar anexadas ao FormData:", moedasADescontar); // Debug

        } else if (planType === 'gratis') {
            console.log("Frontend: Enviando formulário do plano GRÁTIS. Nenhuma moeda será descontada.");
        } else {
            alert("Tipo de plano inválido. Por favor, recarregue a página.");
            return;
        }

        // --- 4. Enviar o formulário para o backend (lógica inalterada) ---
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData, 
            });

            const data = await response.json();

            if (data.success) {
                alert(data.mensagem);

                if (planType === 'pago' && data.novasMoedas !== undefined) {
                    usuarioLogado.moedas = data.novasMoedas;
                    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
                    
                    if (typeof displayUserData === 'function') {
                        displayUserData();
                    } else {
                        window.location.reload(); 
                    }
                } else if (planType === 'gratis') {
                    // Opcional: Recarregar a página para o plano grátis também, se quiser
                    // window.location.reload(); 
                }
                
            } else {
                alert(data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            alert('Ocorreu um erro ao enviar sua verificação.');
        }
    }

    if (uploadFormFree) {
        uploadFormFree.addEventListener('submit', handleFormSubmit);
    }
    if (uploadFormPaid) {
        uploadFormPaid.addEventListener('submit', handleFormSubmit);
    }
});