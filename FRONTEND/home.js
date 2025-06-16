fetch('http://localhost:3000/perfil', {
  credentials: 'include'
})
.then(res => {
  if (res.status === 200) return res.json();
  else throw new Error('Não autenticado');
})

const dados = await
const button = document.getElementById('botao');
