const carrossel = document.getElementById('carrossel');
  let posicao = 0;

  function moverCarrossel(direcao) {
    const total = carrossel.children.length;
    posicao += direcao;
    if (posicao < 0) posicao = 0;
    if (posicao >= total) posicao = total - 1;
    carrossel.style.transform = `translateX(-${posicao * 100}%)`;
  }