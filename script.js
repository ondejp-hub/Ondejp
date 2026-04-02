let bancoDeDados = [];
const areaResultados = document.getElementById('areaResultados');
const inputBusca = document.getElementById('inputBusca');
const telaInicial = document.getElementById('telaInicial');
const telaResultados = document.getElementById('telaResultados');
const tituloSecao = document.getElementById('tituloSecao');

// O seu link do banco de dados na nuvem
const urlPlanilha = "https://docs.google.com/spreadsheets/d/1-1Lb3UorM05byHJzUDsqfipyCzSfl7ODd1PC61hv3QM/export?format=tsv";

// NAVEGAÇÃO ENTRE TELAS
function abrirTelaResultados(titulo) {
    telaInicial.classList.add('oculto');
    telaResultados.classList.remove('oculto');
    tituloSecao.innerText = titulo;
    window.scrollTo(0, 0); 
}

function voltarParaHome() {
    telaResultados.classList.add('oculto');
    telaInicial.classList.remove('oculto');
    areaResultados.innerHTML = ""; 
    inputBusca.value = ""; 
    window.scrollTo(0, 0);
}

// BOTOES DE VOLTAR E LOGO
document.getElementById('btnLogo').addEventListener('click', voltarParaHome);
document.getElementById('btnVoltar').addEventListener('click', voltarParaHome);

// CARREGAR DADOS DO GOOGLE SHEETS
async function carregarDados() {
    try {
        const resposta = await fetch(urlPlanilha);
        const dadosTexto = await resposta.text();
        const linhas = dadosTexto.split('\n');
        for (let i = 1; i < linhas.length; i++) {
            if (!linhas[i].trim()) continue; 
            const colunas = linhas[i].split('\t'); 
            const item = {
                nome: colunas[0] || "", cidade: colunas[1] || "", endereco: colunas[2] || "", 
                telefone: colunas[3] || "", site: colunas[4] || "", redesocial: colunas[5] || "", 
                whatsapp: colunas[6] || "", maps_link: colunas[7] || "", categoria: colunas[8] || "", descricao: colunas[9] || ""
            };
            bancoDeDados.push(item);
        }
    } catch (erro) { console.error("Erro no banco:", erro); }
}

// EXIBIR NA TELA
function exibir(lista) {
    areaResultados.innerHTML = "";
    if (lista.length === 0) {
        areaResultados.innerHTML = "<p class='sem-resultados'>Ops! Nada por enquanto nessa categoria. Tente buscar na barra acima.</p>";
        return;
    }
    lista.forEach(item => {
        const linkSite = item.site ? `<a href="${item.site}" target="_blank" class="info-link">🌐 Site Oficial</a>` : "";
        const linkSocial = item.redesocial ? `<a href="${item.redesocial}" target="_blank" class="info-link">📱 Redes Sociais</a>` : "";
        
        let botaoZap = "";
        if (item.whatsapp) {
            const numeroLimpo = item.whatsapp.replace(/\D/g, '');
            botaoZap = `<a href="https://wa.me/${numeroLimpo}" target="_blank" class="btn-whats">💬 WhatsApp</a>`;
        }
        const botaoMaps = item.maps_link ? `<a href="${item.maps_link}" target="_blank" class="btn-maps">🗺️ Maps</a>` : "";
        const textoDescricao = item.descricao ? `<p class="descricao">"${item.descricao}"</p>` : "";

        areaResultados.innerHTML += `
            <div class="card-item">
                <h3>${item.nome}</h3>
                ${textoDescricao}
                <p style="font-size: 13px; margin-bottom: 2px;">📍 ${item.cidade} - ${item.endereco}</p>
                <p style="font-size: 13px; margin-bottom: 6px;">📞 ${item.telefone}</p>
                ${linkSite}
                ${linkSocial}
                <div class="grupo-botoes">
                    ${botaoZap}
                    ${botaoMaps}
                </div>
                <span class="tag">${item.categoria}</span>
            </div>
        `;
    });
}

// FILTRAR POR CATEGORIA (Corrigido para clique seguro)
function filtrar(categoriaAlvo, tituloExibicao) {
    abrirTelaResultados(tituloExibicao);
    areaResultados.innerHTML = "<p class='sem-resultados'>⏳ Carregando...</p>";
    
    setTimeout(() => {
        const busca = categoriaAlvo.toLowerCase();
        const filtrados = bancoDeDados.filter(item => {
            const cat = item.categoria.toLowerCase();
            if (busca === 'saúde') return cat.includes('hospital') || cat.includes('clínica') || cat.includes('dentista');
            if (busca === 'estética') return cat.includes('manicure') || cat.includes('cabeleireiro') || cat.includes('beleza');
            if (busca === 'serviços') return cat.includes('banco') || cat.includes('interprete');
            return cat.includes(busca);
        });
        exibir(filtrados);
    }, 150); 
}

// OUVINTE DE CLIQUES NO CARROSSEL
document.querySelectorAll('.item-carrossel').forEach(botao => {
    botao.addEventListener('click', () => {
        const categoria = botao.getAttribute('data-cat');
        const titulo = botao.getAttribute('data-titulo');
        filtrar(categoria, titulo);
    });
});

// BUSCA POR TEXTO
document.getElementById('btnBusca').addEventListener('click', () => {
    const termo = inputBusca.value.toLowerCase();
    if(!termo) return;
    abrirTelaResultados(`Busca: "${inputBusca.value}"`);
    const filtrados = bancoDeDados.filter(item => 
        item.nome.toLowerCase().includes(termo) || 
        item.cidade.toLowerCase().includes(termo) || 
        item.categoria.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo)
    );
    exibir(filtrados);
});

// GPS
const btnGPS = document.getElementById('btnLocalizacao');
btnGPS.addEventListener('click', () => {
    btnGPS.textContent = "📍 Localizando...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const bairro = data.address.suburb || data.address.city || "sua região";
            btnGPS.textContent = `📍 Em ${bairro}`;
            inputBusca.value = bairro;
        }, () => { btnGPS.textContent = "📍 Erro ao localizar"; });
    }
});

// Partida no Motor
carregarDados();
