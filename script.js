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

<header><a class="logo" id="btnLogo">onde<span>jp</span>.com</a></header>

<section class="carrossel-section">
    <div class="carrossel-container">
        <div class="item-carrossel color-1" data-cat="Mercados" data-titulo="🛒 Mercados & Açougues">
            <div class="circulo">🛒</div><span class="legenda">Mercados</span>
        </div>
        <div class="item-carrossel color-7" data-cat="Ajuda" data-titulo="🚨 Utilidade Pública">
            <div class="circulo">🚨</div><span class="legenda">Ajuda</span>
        </div>
    </div>
</section>

<div id="telaInicial" class="animacao-tela">
    <section class="hero">
        <h1>O que você procura hoje?</h1>
        <div class="search-container">
            <input type="text" placeholder="Ex: Banco, Mercado..." id="inputBusca">
            <button class="btn-busca" id="btnBusca">Ir</button>
        </div>
        <button class="btn-localizacao" id="btnLocalizacao">📍 Perto de mim</button>
    </section>
</div>

<div id="telaResultados" class="oculto animacao-tela">
    </div>

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

// GPS// 6. LÓGICA DE LOCALIZAÇÃO (GPS)
const btnGPS = document.getElementById('btnLocalizacao');

btnGPS.addEventListener('click', () => {
    // 1. Feedback visual imediato
    btnGPS.style.opacity = "0.7";
    btnGPS.textContent = "⌛ Localizando...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            try {
                // 2. Busca o endereço usando as coordenadas
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                
                // 3. Identifica a cidade ou bairro (Prioridade para cidades e distritos de Tóquio)
                const localidade = data.address.city_district || 
                                   data.address.suburb || 
                                   data.address.city || 
                                   data.address.town || 
                                   "sua região";

                // 4. Atualiza o botão e o input
                btnGPS.textContent = `📍 Em ${localidade}`;
                btnGPS.style.opacity = "1";
                inputBusca.value = localidade;

                // 5. MÁGICA: Dispara a busca automaticamente!
                abrirTelaResultados(`Perto de: ${localidade}`);
                
                const termo = localidade.toLowerCase();
                const filtrados = bancoDeDados.filter(item => 
                    item.cidade.toLowerCase().includes(termo) || 
                    item.endereco.toLowerCase().includes(termo)
                );
                
                exibir(filtrados);

            } catch (erro) {
                btnGPS.textContent = "📍 Erro ao identificar local";
                btnGPS.style.opacity = "1";
            }
        }, () => {
            btnGPS.textContent = "📍 GPS Desativado";
            btnGPS.style.opacity = "1";
            alert("Por favor, ative a localização no seu iPhone para usar esta função.");
        });
    } else {
        btnGPS.textContent = "📍 GPS não suportado";
    }
});


// Partida no Motor
carregarDados();
