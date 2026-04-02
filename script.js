let bancoDeDados = [];
const areaResultados = document.getElementById('areaResultados');
const inputBusca = document.getElementById('inputBusca');
const tituloSecao = document.getElementById('tituloSecao');

// Elementos do Menu
const btnMenu = document.getElementById('btnMenu');
const btnFecharMenu = document.getElementById('btnFecharMenu');
const menuLateral = document.getElementById('menuLateral');
const peliculaMenu = document.getElementById('peliculaMenu');

// Seu link da planilha
const urlPlanilha = "https://docs.google.com/spreadsheets/d/1-1Lb3UorM05byHJzUDsqfipyCzSfl7ODd1PC61hv3QM/export?format=tsv";

// -----------------------------------------
// 1. LÓGICA DO MENU
// -----------------------------------------
function toggleMenu() {
    if(menuLateral && peliculaMenu) {
        menuLateral.classList.toggle('menu-aberto');
        peliculaMenu.classList.toggle('oculto');
    }
}

if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
if(btnFecharMenu) btnFecharMenu.addEventListener('click', toggleMenu);
if(peliculaMenu) peliculaMenu.addEventListener('click', toggleMenu);

// -----------------------------------------
// 2. GERENCIADOR DE TELAS (SPA)
// -----------------------------------------
function mudarTela(idTelaAlvo, titulo = "") {
    // Lista de todas as telas que existem no site
    const telas = ['telaInicial', 'telaResultados', 'telaQuemSomos', 'telaContato', 'telaDetalhes'];
    
    // Esconde todas as telas
    telas.forEach(tela => {
        const el = document.getElementById(tela);
        if(el) el.classList.add('oculto');
    });
    
    // Mostra apenas a tela que queremos
    const telaAlvo = document.getElementById(idTelaAlvo);
    if(telaAlvo) telaAlvo.classList.remove('oculto');
    
    // Atualiza o título se for a tela de resultados
    if (idTelaAlvo === 'telaResultados' && titulo !== "") {
        const tituloEl = document.getElementById('tituloSecao');
        if(tituloEl) tituloEl.innerText = titulo;
    }
    
    // Fecha o menu lateral automaticamente ao trocar de tela
    if (menuLateral && menuLateral.classList.contains('menu-aberto')) {
        toggleMenu();
    }
    
    // Joga a visão lá pro topo da página
    window.scrollTo(0, 0);
}

// -----------------------------------------
// 3. CARREGAR DADOS DO GOOGLE SHEETS
// -----------------------------------------
async function carregarDados() {
    try {
        const resposta = await fetch(urlPlanilha);
        const dadosTexto = await resposta.text();
        const linhas = dadosTexto.split('\n');
        for (let i = 1; i < linhas.length; i++) {
            if (!linhas[i].trim()) continue; 
            const colunas = linhas[i].split('\t'); 
            const item = {
                id: i, // Criamos um ID para cada local saber quem ele é
                nome: colunas[0] || "", cidade: colunas[1] || "", endereco: colunas[2] || "", 
                telefone: colunas[3] || "", site: colunas[4] || "", redesocial: colunas[5] || "", 
                whatsapp: colunas[6] || "", maps_link: colunas[7] || "", categoria: colunas[8] || "", descricao: colunas[9] || ""
            };
            bancoDeDados.push(item);
        }
    } catch (erro) { console.error("Erro no banco:", erro); }
}

// -----------------------------------------
// 4. EXIBIR A LISTA RESUMIDA
// -----------------------------------------
function exibir(lista) {
    areaResultados.innerHTML = "";
    if (lista.length === 0) {
        areaResultados.innerHTML = "<p class='sem-resultados'>Ops! Nada por enquanto nessa categoria. Tente outra busca.</p>";
        return;
    }
    lista.forEach(item => {
        // O cartão agora é um "resumo" que abre a tela de detalhes ao clicar
        areaResultados.innerHTML += `
            <div class="card-item" onclick="abrirDetalhes(${item.id})" style="cursor: pointer; transition: 0.2s;">
                <h3 style="font-size: 18px;">${item.nome}</h3>
                <p style="font-size: 14px; color: #666; margin-top: 4px;">📍 ${item.cidade}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span class="tag">${item.categoria}</span>
                    <span style="font-size: 13px; color: var(--verde-br); font-weight: bold;">Ver detalhes ➔</span>
                </div>
            </div>
        `;
    });
}

// -----------------------------------------
// 5. EXIBIR OS DETALHES DO LOCAL CLICADO
// -----------------------------------------
function abrirDetalhes(idAlvo) {
    // Procura no banco de dados quem é o local clicado
    const item = bancoDeDados.find(local => local.id === idAlvo);
    if (!item) return;

    // Arruma os links de forma segura (HTTPS)
    let linkSite = "";
    if (item.site) {
        let siteLimpo = item.site.replace('https://', '').replace('http://', '');
        linkSite = `<a href="https://${siteLimpo}" target="_blank" class="info-link" style="font-size: 15px; margin-top: 10px;">🌐 Site Oficial</a>`;
    }
    const linkSocial = item.redesocial ? `<a href="${item.redesocial}" target="_blank" class="info-link" style="font-size: 15px; margin-top: 5px;">📱 Instagram / Rede Social</a>` : "";
    
    let botaoZap = "";
    if (item.whatsapp) {
        const numeroLimpo = item.whatsapp.replace(/\D/g, '');
        botaoZap = `<a href="https://wa.me/${numeroLimpo}" target="_blank" class="btn-whats" style="flex: 1; text-align: center; padding: 12px; font-size: 15px;">💬 WhatsApp</a>`;
    }
    
    let botaoMaps = "";
    if (item.maps_link) {
        const linkSeguro = item.maps_link.replace('http://', 'https://');
        botaoMaps = `<a href="${linkSeguro}" target="_blank" class="btn-maps" style="flex: 1; text-align: center; padding: 12px; font-size: 15px;">🗺️ Abrir no Maps</a>`;
    }

    const textoDescricao = item.descricao ? `<p style="font-size: 15px; color: #444; font-style: italic; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid var(--amarelo-br);">"${item.descricao}"</p>` : "";

    // Pega a caixa da tela de detalhes e injeta o conteúdo
    const divConteudo = document.getElementById('conteudoDetalhes');
    if(divConteudo) {
        divConteudo.innerHTML = `
            <div class="card-item" style="border-left: none; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                <span class="tag" style="margin-bottom: 10px; display: inline-block;">${item.categoria}</span>
                <h2 style="color: var(--azul-br); margin-bottom: 5px; font-size: 22px;">${item.nome}</h2>
                <p style="font-size: 15px; color: #555;">📍 ${item.cidade} - ${item.endereco}</p>
                
                ${textoDescricao}
                
                <div style="margin: 20px 0; border-top: 1px solid #eee; padding-top: 15px;">
                    <p style="font-size: 16px; margin-bottom: 8px;"><strong>📞 Tel:</strong> ${item.telefone || "Não informado"}</p>
                    ${linkSite}
                    ${linkSocial}
                </div>

                <div class="grupo-botoes" style="display: flex; gap: 10px; margin-top: 25px;">
                    ${botaoZap}
                    ${botaoMaps}
                </div>
            </div>
        `;
        // Manda o gerenciador mostrar a tela
        mudarTela('telaDetalhes');
    }
}

// -----------------------------------------
// 6. FILTRAR POR MACRO-CATEGORIAS
// -----------------------------------------
function filtrar(categoriaAlvo, tituloExibicao) {
    mudarTela('telaResultados', tituloExibicao);
    areaResultados.innerHTML = "<p class='sem-resultados'>⏳ Carregando...</p>";
    
    setTimeout(() => {
        const busca = categoriaAlvo.toLowerCase();
        const filtrados = bancoDeDados.filter(item => {
            const cat = item.categoria.toLowerCase();
            if (busca === 'mercados') return cat.includes('mercado') || cat.includes('açougue');
            if (busca === 'comer') return cat.includes('restaurante');
            if (busca === 'saúde') return cat.includes('hospital') || cat.includes('clínica') || cat.includes('dentista');
            if (busca === 'beleza') return cat.includes('manicure') || cat.includes('cabeleireiro') || cat.includes('maquiador') || cat.includes('estética');
            if (busca === 'burocracia') return cat.includes('despachante') || cat.includes('intérprete') || cat.includes('tradução');
            if (busca === 'serviços') return cat.includes('banco') || cat.includes('designer') || cat.includes('guia') || cat.includes('outros');
            if (busca === 'ajuda') return cat.includes('prefeitura') || cat.includes('delegacia') || cat.includes('embaixada');
            return cat.includes(busca);
        });
        exibir(filtrados);
    }, 150); 
}

// -----------------------------------------
// 7. OUVINTES DO CARROSSEL
// -----------------------------------------
document.querySelectorAll('.item-carrossel').forEach(botao => {
    botao.addEventListener('click', function() {
        const categoria = this.getAttribute('data-cat');
        const titulo = this.getAttribute('data-titulo');
        filtrar(categoria, titulo);
    });
});

// -----------------------------------------
// 8. BUSCA POR TEXTO NA BARRA
// -----------------------------------------
const btnBusca = document.getElementById('btnBusca');
if(btnBusca) {
    btnBusca.addEventListener('click', () => {
        const termo = inputBusca.value.toLowerCase();
        if(!termo) return;
        mudarTela('telaResultados', `Busca: "${inputBusca.value}"`);
        const filtrados = bancoDeDados.filter(item => 
            item.nome.toLowerCase().includes(termo) || 
            item.cidade.toLowerCase().includes(termo) || 
            item.categoria.toLowerCase().includes(termo) ||
            item.descricao.toLowerCase().includes(termo)
        );
        exibir(filtrados);
    });
}

// -----------------------------------------
// 9. LOCALIZAÇÃO (GPS)
// -----------------------------------------
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
                    
                    mudarTela('telaResultados', `Perto de: ${localidade}`);
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

// -----------------------------------------
// INÍCIO DO APLICATIVO
// -----------------------------------------
carregarDados();
