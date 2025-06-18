// Mapeamento dos priceId para a quantidade de moedas
const moedasPorPriceId = {
    'prod_SJH14ckV271dqy': 10,  // 10 Tokens
    'prod_SJH1ZseBQ5ht12': 25,  // 25 Tokens
    'prod_SJH2CQyvw11aYB': 35,  // 35 Tokens
    'prod_SJH28aeQpZra91': 70   // 70 Tokens
};

async function pagar(priceId) {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (!usuarioSalvo) {
        alert("Você precisa estar logado para adicionar moedas.");
        return;
    }
    
    let usuario;
    try {
        usuario = JSON.parse(usuarioSalvo);
        if (!usuario || !usuario.id) {
            throw new Error("ID do usuário não encontrado no objeto salvo.");
        }
    } catch (e) {
        console.error("Erro ao recuperar dados do usuário do localStorage:", e);
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        localStorage.removeItem('usuario');
        return;
    }

    const userId = usuario.id;
    const moedasParaAdicionar = moedasPorPriceId[priceId];

    if (moedasParaAdicionar === undefined) {
        alert("ID do produto inválido. Por favor, selecione um plano válido.");
        console.error("PriceId desconhecido:", priceId);
        return;
    }

    // 2. Fazer uma requisição para o seu backend para adicionar as moedas
    try {
        // Vamos usar uma nova rota ou ajustar a existente para a simulação
        const response = await fetch('http://localhost:3000/adicionar-moedas-simulado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, moedas: moedasParaAdicionar }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || 'Falha ao adicionar moedas no backend.');
        }

        const data = await response.json();
        alert(data.mensagem); // Mensagem de sucesso do backend

        // ATUALIZAR O LOCALSTORAGE COM AS NOVAS MOEDAS
        usuario.moedas = data.novasMoedas; // O backend deve retornar as novas moedas
        localStorage.setItem('usuario', JSON.stringify(usuario));

        //Recarregar Pag
        window.location.reload();

    } catch (error) {
        console.error('Erro ao adicionar moedas:', error);
        alert('Ocorreu um erro ao adicionar moedas: ' + error.message);
    }
}

window.pagar = pagar;