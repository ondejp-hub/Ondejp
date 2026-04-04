let bancoDeDados = [];
const areaResultados = document.getElementById('areaResultados');
const inputBusca = document.getElementById('inputBusca');
const tituloSecao = document.getElementById('tituloSecao');

const btnMenu = document.getElementById('btnMenu');
const btnFecharMenu = document.getElementById('btnFecharMenu');
const menuLateral = document.getElementById('menuLateral');
const peliculaMenu = document.getElementById('peliculaMenu');

const urlPlanilha = "https://docs.google.com/spreadsheets/d/1-1Lb3UorM05byHJzUDsqfipyCzSfl7ODd1PC61hv3QM/export?format=tsv";

// VARIÁVEIS DE MEMÓRIA PARA O BOTÃO VOLTAR INTELIGENTE E REORDENAÇÃO DE GPS
let telaOrigemBusca = 'telaInicial'; 
let ultimaListaExibida = [];

// 1. MENU LATERAL
function toggleMenu() {
    if(menuLateral && peliculaMenu) {
        menuLateral.classList.toggle('menu-aberto');
        peliculaMenu.classList.toggle('oculto');
    }
}
if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
if(btnFecharMenu) btnFecharMenu.addEventListener('click', toggleMenu);
if(peliculaMenu) peliculaMenu.addEventListener('click', toggleMenu);

// 2. GERENCIADOR DE TELAS
function mudarTela(idTelaAlvo, titulo = "") {
    const telas = ['telaInicial', 'telaResultados', 'telaQuemSomos', 'telaContato', 'telaDetalhes', 'telaCategoriasAv'];
    
    telas.forEach(tela => {
        const el = document.getElementById(tela);
        if(el) el.classList.add('oculto');
    });
    
    const telaAlvo = document.getElementById(idTelaAlvo);
    if(telaAlvo) telaAlvo.classList.remove('oculto');
    
    if (idTelaAlvo === 'telaResultados' && titulo !== "") {
        const tituloEl = document.getElementById('tituloSecao');
        if(tituloEl) tituloEl.innerText = titulo;
    }
    
    if (menuLateral && menuLateral.classList.contains('menu-aberto')) {
        toggleMenu();
    }
    window.scrollTo(0, 0);
}

// 3. IDENTIFICA DE ONDE O USUÁRIO FEZ A BUSCA (Para voltar pra página certa)
function registrarOrigemBusca() {
    if (!document.getElementById('telaCategoriasAv').classList.contains('oculto')) {
        telaOrigemBusca = 'telaCategoriasAv';
    } else if (!document.getElementById('telaInicial').classList.contains('oculto')) {
        telaOrigemBusca = 'telaInicial';
    }
}

function voltarDaBusca() {
    mudarTela(telaOrigemBusca);
}

// 4. CARREGAR DADOS DA PLANILHA
async function carregarDados() {
    try {
        const resposta = await fetch(urlPlanilha);
        const dadosTexto = await resposta.text();
        const linhas = dadosTexto.split('\n');
        for (let i = 1; i < linhas.length; i++) {
            if (!linhas[i].trim()) continue; 
            const colunas = linhas[i].split('\t'); 
            const item = {
                id: i,
                nome: colunas[0] || "", cidade: colunas[1] || "", endereco: colunas[2] || "", 
                telefone: colunas[3] || "", site: colunas[4] || "", redesocial: colunas[5] || "", 
                whatsapp: colunas[6] || "", maps_link: colunas[7] || "", categoria: colunas[8] || "", descricao: colunas[9] || ""
            };
            bancoDeDados.push(item);
        }
    } catch (erro) { console.error("Erro no banco:", erro); }
}

// 5. EXIBIR CARTÕES RESUMIDOS (Agora com introdução do texto)
function exibir(lista) {
    areaResultados.innerHTML = "";
    ultimaListaExibida = lista; // Salva a lista atual para o botão Perto de Mim reordenar depois
    
    if (lista.length === 0) {
        areaResultados.innerHTML = "<p class='sem-resultados'>Ops! Nada por enquanto nessa categoria.</p>";
        return;
    }
    
    lista.forEach(item => {
        // Encurta a descrição se ela for maior que 75 letras
        let introDesc = "";
        if (item.descricao) {
            let descCurta = item.descricao.length > 75 ? item.descricao.substring(0, 75) + '...' : item.descricao;
            introDesc = `<p style="font-size: 13px; color: #777; margin-top: 8px; line-height: 1.4; font-style: italic;">"${descCurta}"</p>`;
        }

        areaResultados.innerHTML += `
            <div class="card-item" onclick="abrirDetalhes(${item.id})" style="cursor: pointer; transition: 0.2s;">
                <h3 style="font-size: 18px;">${item.nome}</h3>
                <p style="font-size: 14px; color: #666; margin-top: 4px;">📍 ${item.cidade}</p>
                ${introDesc}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span class="tag">${item.categoria}</span>
                    <span style="font-size: 13px; color: var(--verde-br); font-weight: bold;">Ler mais ➔</span>
                </div>
            </div>
        `;
    });
}

// 6. ABRIR PÁGINA DE DETALHES (Agora com Mapa ao lado do endereço)
function abrirDetalhes(idAlvo) {
    const item = bancoDeDados.find(local => local.id === idAlvo);
    if (!item) return;

    let linkSite = "";
    if (item.site) {
        let siteLimpo = item.site.replace('https://', '').replace('http://', '');
        linkSite = `<a href="https://${siteLimpo}" target="_blank" class="info-link" style="font-size: 15px; margin-top: 10px;">🌐 Site Oficial</a>`;
    }
    const linkSocial = item.redesocial ? `<a href="${item.redesocial}" target="_blank" class="info-link" style="font-size: 15px; margin-top: 5px;">📱 Instagram / Rede Social</a>` : "";
    
    let botaoZap = "";
    if (item.whatsapp) {
        const numeroLimpo = item.whatsapp.replace(/\D/g, '');
        botaoZap = `<a href="https://wa.me/${numeroLimpo}" target="_blank" class="btn-whats" style="flex: 1; text-align: center; padding: 12px; font-size: 15px; color: white; text-decoration: none; border-radius: 6px;">💬 WhatsApp</a>`;
    }
    
    // O Mapa vai direto na linha do endereço
    let iconeMapa = "";
    if (item.maps_link) {
        const linkSeguro = item.maps_link.replace('http://', 'https://');
        iconeMapa = `<a href="${linkSeguro}" target="_blank" style="text-decoration: none; margin-left: 8px; font-size: 18px;" title="Abrir no Mapa">🗺️</a>`;
    }

    const textoDescricao = item.descricao ? `<p style="font-size: 15px; color: #444; font-style: italic; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid var(--amarelo-br);">"${item.descricao}"</p>` : "";

    const divConteudo = document.getElementById('conteudoDetalhes');
    if(divConteudo) {
        divConteudo.innerHTML = `
            <div class="card-item" style="border-left: none; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                <span class="tag" style="margin-bottom: 10px; display: inline-block;">${item.categoria}</span>
                <h2 style="color: var(--azul-br); margin-bottom: 5px; font-size: 22px;">${item.nome}</h2>
                <p style="font-size: 15px; color: #555; display: flex; align-items: center; flex-wrap: wrap;">📍 ${item.cidade} - ${item.endereco} ${iconeMapa}</p>
                
                ${textoDescricao}
                
                <div style="margin: 20px 0; border-top: 1px solid #eee; padding-top: 15px;">
                    <p style="font-size: 16px; margin-bottom: 8px;"><strong>📞 Tel:</strong> ${item.telefone || "Não informado"}</p>
                    ${linkSite}
                    ${linkSocial}
                </div>
                
                <div class="grupo-botoes" style="display: flex; gap: 10px; margin-top: 25px;">
                    ${botaoZap}
                </div>
            </div>
        `;
        mudarTela('telaDetalhes');
    }
}

// 7. SUBCATEGORIAS E FILTRAGEM BASE
const mapaSubcategorias = {
    'mercados': ['Mercado', 'Açougue', 'Mercearia'],
    'comer': ['Restaurante', 'Lanchonete', 'Padaria', 'Doce'],
    'saúde': ['Clínica', 'Hospital', 'Dentista', 'Farmácia'],
    'beleza': ['Cabeleireiro', 'Manicure', 'Estética', 'Barbeiro'],
    'burocracia': ['Despachante', 'Intérprete', 'Tradução'],
    'serviços': ['Banco', 'Mecânico', 'Costureira', 'Designer'],
    'ajuda': ['Prefeitura', 'Delegacia', 'Embaixada']
};

function pegarItensPorMacro(macro) {
    return bancoDeDados.filter(item => {
        const cat = item.categoria.toLowerCase();
        if (macro === 'mercados') return cat.includes('mercado') || cat.includes('açougue') || cat.includes('mercearia');
        if (macro === 'comer') return cat.includes('restaurante') || cat.includes('lanchonete') || cat.includes('padaria') || cat.includes('doce');
        if (macro === 'saúde') return cat.includes('hospital') || cat.includes('clínica') || cat.includes('dentista') || cat.includes('farmácia');
        if (macro === 'beleza') return cat.includes('manicure') || cat.includes('cabeleireiro') || cat.includes('estética') || cat.includes('barbeiro');
        if (macro === 'burocracia') return cat.includes('despachante') || cat.includes('intérprete') || cat.includes('tradução');
        if (macro === 'serviços') return cat.includes('banco') || cat.includes('mecânico') || cat.includes('costureira') || cat.includes('designer') || cat.includes('outros');
        if (macro === 'ajuda') return cat.includes('prefeitura') || cat.includes('delegacia') || cat.includes('embaixada');
        return cat.includes(macro);
    });
}

function filtrar(categoriaAlvo, tituloExibicao) {
    registrarOrigemBusca();
    mudarTela('telaResultados', tituloExibicao);
    areaResultados.innerHTML = "<p class='sem-resultados'>⏳ Carregando...</p>";
    
    // Reseta o botão Perto de mim
    document.getElementById('btnOrdenarPerto').textContent = "📍 Perto";
    document.getElementById('btnOrdenarPerto').style.opacity = "1";

    const busca = categoriaAlvo.toLowerCase();
    const divSub = document.getElementById('areaSubcategorias');
    if(divSub) {
        divSub.innerHTML = ""; 
        const subs = mapaSubcategorias[busca];
        if(subs && subs.length > 0) {
            divSub.innerHTML = `<button class="btn-subcat ativo" onclick="aplicarSubFiltro('todos', this, '${busca}')">Todos</button>`;
            subs.forEach(sub => {
                divSub.innerHTML += `<button class="btn-subcat" onclick="aplicarSubFiltro('${sub.toLowerCase()}', this, '${busca}')">${sub}</button>`;
            });
        }
    }

    setTimeout(() => {
        const filtrados = pegarItensPorMacro(busca);
        exibir(filtrados);
    }, 150); 
}

function aplicarSubFiltro(subTermo, botaoClicado, macroCat) {
    const botoes = document.querySelectorAll('.btn-subcat');
    botoes.forEach(b => b.classList.remove('ativo'));
    botaoClicado.classList.add('ativo');

    areaResultados.innerHTML = "<p class='sem-resultados'>⏳ Filtrando...</p>";

    setTimeout(() => {
        let filtrados = pegarItensPorMacro(macroCat);
        if(subTermo !== 'todos') {
            filtrados = filtrados.filter(item => item.categoria.toLowerCase().includes(subTermo));
        }
        exibir(filtrados);
    }, 100);
}

// 8. EVENTOS DA TELA INICIAL E BOTÕES GPS
document.querySelectorAll('.item-carrossel').forEach(botao => {
    botao.addEventListener('click', function() {
        const categoria = this.getAttribute('data-cat');
        const titulo = this.getAttribute('data-titulo');
        filtrar(categoria, titulo);
    });
});

const btnBusca = document.getElementById('btnBusca');
if(btnBusca) {
    btnBusca.addEventListener('click', () => {
        const termo = inputBusca.value.toLowerCase();
        if(!termo) return;
        registrarOrigemBusca();
        mudarTela('telaResultados', `Busca: "${inputBusca.value}"`);
        
        const divSub = document.getElementById('areaSubcategorias');
        if(divSub) divSub.innerHTML = "";
        document.getElementById('btnOrdenarPerto').textContent = "📍 Perto";
        
        const filtrados = bancoDeDados.filter(item => 
            item.nome.toLowerCase().includes(termo) || 
            item.cidade.toLowerCase().includes(termo) || 
            item.categoria.toLowerCase().includes(termo) ||
            item.descricao.toLowerCase().includes(termo)
        );
        exibir(filtrados);
    });
}

// GPS da Tela Inicial (Busca Total)
const btnGPS = document.getElementById('btnLocalizacao');
if(btnGPS) {
    btnGPS.addEventListener('click', () => {
        btnGPS.style.opacity = "0.7";
        btnGPS.textContent = "⌛ Localizando...";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const localidade = data.address.city_district || data.address.suburb || data.address.city || data.address.town || "sua região";
                    
                    btnGPS.textContent = `📍 Em ${localidade}`;
                    btnGPS.style.opacity = "1";
                    inputBusca.value = localidade;
                    
                    registrarOrigemBusca();
                    mudarTela('telaResultados', `Perto de: ${localidade}`);
                    
                    const divSub = document.getElementById('areaSubcategorias');
                    if(divSub) divSub.innerHTML = "";
                    document.getElementById('btnOrdenarPerto').textContent = "📍 Perto";
                    
                    const termo = localidade.toLowerCase();
                    const filtrados = bancoDeDados.filter(item => item.cidade.toLowerCase().includes(termo) || item.endereco.toLowerCase().includes(termo));
                    exibir(filtrados);
                } catch (erro) {
                    btnGPS.textContent = "📍 Erro ao identificar local";
                    btnGPS.style.opacity = "1";
                }
            }, () => {
                btnGPS.textContent = "📍 GPS Desativado";
                btnGPS.style.opacity = "1";
            });
        }
    });
}

// NOVO: GPS da Tela de Resultados (Reorganiza a lista atual por proximidade)
const btnOrdenarPerto = document.getElementById('btnOrdenarPerto');
if(btnOrdenarPerto) {
    btnOrdenarPerto.addEventListener('click', () => {
        if(ultimaListaExibida.length === 0) return;
        
        btnOrdenarPerto.style.opacity = "0.7";
        btnOrdenarPerto.textContent = "⌛...";
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const localidade = data.address.city_district || data.address.suburb || data.address.city || data.address.town || "";
                    
                    if(localidade) {
                        btnOrdenarPerto.textContent = `📍 ${localidade}`;
                        btnOrdenarPerto.style.opacity = "1";
                        
                        const termo = localidade.toLowerCase();
                        // Separa quem é da cidade de quem não é
                        const comMatch = ultimaListaExibida.filter(i => i.cidade.toLowerCase().includes(termo) || i.endereco.toLowerCase().includes(termo));
                        const semMatch = ultimaListaExibida.filter(i => !(i.cidade.toLowerCase().includes(termo) || i.endereco.toLowerCase().includes(termo)));
                        
                        if(comMatch.length > 0) {
                            areaResultados.innerHTML = "<p class='sem-resultados'>⌛ Reorganizando...</p>";
                            setTimeout(() => {
                                exibir([...comMatch, ...semMatch]);
                            }, 200);
                        } else {
                            alert(`Não encontramos locais desta categoria exatamente em ${localidade}, mostrando os outros resultados.`);
                            btnOrdenarPerto.textContent = "📍 Perto";
                        }
                    }
                } catch (erro) {
                    btnOrdenarPerto.textContent = "📍 Erro";
                    btnOrdenarPerto.style.opacity = "1";
                }
            }, () => {
                btnOrdenarPerto.textContent = "📍 Sem GPS";
                btnOrdenarPerto.style.opacity = "1";
            });
        }
    });
}

// 9. TELA DE CONTATO (E-MAIL)
function enviarContatoEmail() {
    const nome = document.getElementById('nomeContato').value;
    const tel = document.getElementById('telContato').value;
    const msg = document.getElementById('msgContato').value;

    if(!nome || !msg) {
        alert("Por favor, preencha pelo menos o seu nome e a mensagem!");
        return;
    }

    const emailDestino = "ondejp.com@gmail.com"; 
    const assunto = "Novo Contato - ondejp.com";
    const corpoEmail = `Nome: ${nome}\nTelefone/WhatsApp: ${tel}\n\nMensagem:\n${msg}`;

    window.location.href = `mailto:${emailDestino}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;
}

// 10. TELA EXPLORAR (ABAS E REGIÕES)
const provinciasJapao = [
    "Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu", "Gunma", 
    "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa", "Kagoshima", "Kanagawa", 
    "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki", "Nara", "Niigata", 
    "Oita", "Okayama", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", 
    "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata", "Yamaguchi", "Yamanashi"
];

function mudarAbaExplorar(aba) {
    const btnCat = document.getElementById('btnAbaCat');
    const btnReg = document.getElementById('btnAbaReg');
    const listaCat = document.getElementById('listaPorCategoria');
    const listaReg = document.getElementById('listaPorRegiao');

    if (aba === 'cat') {
        btnCat.className = 'aba-ativa'; btnReg.className = 'aba-inativa';
        listaCat.classList.remove('oculto'); listaReg.classList.add('oculto');
    } else {
        btnReg.className = 'aba-ativa'; btnCat.className = 'aba-inativa';
        listaReg.classList.remove('oculto'); listaCat.classList.add('oculto');
    }
}

function construirTelaExplorar() {
    const listaCat = document.getElementById('listaPorCategoria');
    const listaReg = document.getElementById('listaPorRegiao');
    if (!listaCat || !listaReg) return;

    let htmlCat = '<ul class="lista-simples sanfona-item" style="padding: 0 15px;">';
    for (const [macro, subs] of Object.entries(mapaSubcategorias)) {
        const tituloAjustado = macro.charAt(0).toUpperCase() + macro.slice(1);
        const subsTexto = subs.join(', ');
        htmlCat += `<li onclick="filtrar('${macro}', 'Categoria: ${tituloAjustado}')">
                        ${tituloAjustado} <span class="tag-sub">${subsTexto}</span>
                    </li>`;
    }
    htmlCat += '</ul>';
    listaCat.innerHTML = htmlCat;

    let htmlReg = '';
    provinciasJapao.forEach(prov => {
        let linksCategorias = '';
        for (const macro of Object.keys(mapaSubcategorias)) {
            const tituloAjustado = macro.charAt(0).toUpperCase() + macro.slice(1);
            linksCategorias += `<li onclick="filtrarPorRegiao('${prov}', '${macro}', '${tituloAjustado}')">🔎 Buscar ${tituloAjustado}</li>`;
        }

        htmlReg += `
            <div class="sanfona-item">
                <button class="sanfona-titulo" onclick="abrirSanfona(this)">📍 ${prov}</button>
                <div class="sanfona-conteudo">
                    <ul class="lista-simples">
                        <li onclick="filtrarPorRegiao('${prov}', '', 'Tudo em ${prov}')" style="color: var(--verde-br); font-weight: bold;">🌟 Ver tudo em ${prov}</li>
                        ${linksCategorias}
                    </ul>
                </div>
            </div>
        `;
    });
    listaReg.innerHTML = htmlReg;
}

function abrirSanfona(botaoClicado) {
    const itemAtual = botaoClicado.parentElement;
    const todosItens = document.querySelectorAll('.sanfona-item');
    if (itemAtual.classList.contains('aberto')) {
        itemAtual.classList.remove('aberto');
    } else {
        todosItens.forEach(item => item.classList.remove('aberto'));
        itemAtual.classList.add('aberto');
    }
}

function filtrarPorRegiao(regiao, categoria, tituloExibicao) {
    registrarOrigemBusca();
    mudarTela('telaResultados', tituloExibicao);
    areaResultados.innerHTML = "<p class='sem-resultados'>⏳ Buscando na região...</p>";
    
    const divSub = document.getElementById('areaSubcategorias');
    if(divSub) divSub.innerHTML = "";
    document.getElementById('btnOrdenarPerto').textContent = "📍 Perto";

    setTimeout(() => {
        let filtrados = bancoDeDados;
        if(categoria !== "") {
            filtrados = pegarItensPorMacro(categoria);
        }
        const termoRegiao = regiao.toLowerCase();
        filtrados = filtrados.filter(item => 
            item.cidade.toLowerCase().includes(termoRegiao) || 
            item.endereco.toLowerCase().includes(termoRegiao)
        );
        exibir(filtrados);
    }, 150);
}

// INICIALIZAÇÃO
carregarDados();
setTimeout(construirTelaExplorar, 500);
