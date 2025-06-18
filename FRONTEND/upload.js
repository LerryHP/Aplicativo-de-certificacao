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
        

        if (usuarioSalvo) {
            try {
                usuarioLogado = JSON.parse(usuarioSalvo);
                if (!usuarioLogado || usuarioLogado.id === undefined) {
                    throw new Error("ID do usuário faltando ou sessão corrompida.");
                }
            } catch (e) {
                console.error("Erro ao fazer parse do usuário do localStorage:", e);
                localStorage.removeItem('usuario'); 
                alert("Sua sessão expirou ou está corrompida. Por favor, faça login novamente.");
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
                return;
            }
        }

        
        if (usuarioLogado && usuarioLogado.id !== undefined) {
            formData.append('userId', usuarioLogado.id);
            console.log("Frontend: userId anexado ao FormData:", usuarioLogado.id); // Debug
        } else {
            // Se não houver usuário logado
            if (planType === 'pago') {
                alert("Você precisa estar logado para usar o plano pago.");
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/login/index.html';
                return;
            }
           
            console.log("Frontend: Nenhum usuário logado, userId não anexado."); 
        }


        if (planType === 'pago') {
            
            if (usuarioLogado.moedas < moedasADescontar) {
                alert(`Você precisa de ${moedasADescontar} moedas para este plano. Saldo atual: ${usuarioLogado.moedas}.`);
                window.location.href = 'http://127.0.0.1:5500/FRONTEND/cards.html';
                return;
            }

            const confirmacao = confirm(`Este plano custa ${moedasADescontar} moedas. Seu saldo atual é ${usuarioLogado.moedas}. Deseja continuar?`);
            if (!confirmacao) {
                return; 
            }
            
           
            formData.append('moedasADescontar', moedasADescontar);
            console.log("Frontend: moedasADescontar anexadas ao FormData:", moedasADescontar); // Debug

        } else if (planType === 'gratis') {
            console.log("Frontend: Enviando formulário do plano GRÁTIS. Nenhuma moeda será descontada.");
        } else {
            alert("Tipo de plano inválido. Por favor, recarregue a página.");
            return;
        }

      
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