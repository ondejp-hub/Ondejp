// VARIÁVEIS DO MENU
const btnMenu = document.getElementById('btnMenu');
const btnFecharMenu = document.getElementById('btnFecharMenu');
const menuLateral = document.getElementById('menuLateral');
const peliculaMenu = document.getElementById('peliculaMenu');

// LÓGICA DE ABRIR/FECHAR MENU
function toggleMenu() {
    menuLateral.classList.toggle('menu-aberto');
    peliculaMenu.classList.toggle('oculto');
}

btnMenu.addEventListener('click', toggleMenu);
btnFecharMenu.addEventListener('click', toggleMenu);
peliculaMenu.addEventListener('click', toggleMenu);

// LÓGICA DO GERENCIADOR DE TELAS
function mudarTela(idTelaAlvo, titulo = "") {
    // Esconde todas as telas primeiro
    document.getElementById('telaInicial').classList.add('oculto');
    document.getElementById('telaResultados').classList.add('oculto');
    document.getElementById('telaQuemSomos').classList.add('oculto');
    document.getElementById('telaContato').classList.add('oculto');
    // Adicione mais telas aqui se criar no futuro

    // Mostra a tela desejada
    document.getElementById(idTelaAlvo).classList.remove('oculto');
    
    // Se for a tela de resultados, atualiza o título
    if (idTelaAlvo === 'telaResultados' && titulo !== "") {
        document.getElementById('tituloSecao').innerText = titulo;
    }

    // Se o menu lateral estiver aberto, ele fecha automaticamente ao clicar em um link
    if (menuLateral.classList.contains('menu-aberto')) {
        toggleMenu();
    }
    
    window.scrollTo(0, 0);
}

// ATENÇÃO: Se houver erros, atualize os cliques dos botões antigos para usar a nova função!
// Ex: No filtro do carrossel, troque 'abrirTelaResultados' por: mudarTela('telaResultados', tituloExibicao);
