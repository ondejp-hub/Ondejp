let bancoDeDados = [];
const areaResultados = document.getElementById('areaResultados');
const inputBusca = document.getElementById('inputBusca');
const telaInicial = document.getElementById('telaInicial');
const telaResultados = document.getElementById('telaResultados');
const tituloSecao = document.getElementById('tituloSecao');

const urlPlanilha = "https://docs.google.com/spreadsheets/d/1-1Lb3UorM05byHJzUDsqfipyCzSfl7ODd1PC61hv3QM/export?format=tsv";

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

document.getElementById('btnLogo').addEventListener('click', voltarParaHome);
document.getElementById('btnVoltar').addEventListener('click', voltarParaHome);

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

function exibir(lista) {
    areaResultados.innerHTML = "";
    if (lista.length === 0) {
        areaResultados.innerHTML = "<p class='sem-resultados'>Ops! Nada por enquanto nessa categoria.</p>";
        return;
    }
    lista.forEach(item => {
        
        // Garante HTTPS no site
        let linkSite = "";
        if (item.site) {
            let siteLimpo = item.site.replace('https://', '').replace('http://', '');
            linkSite = `<a href="https://${siteLimpo}" target="_blank" class="info-link">🌐 Site Oficial</a>`;
        }
        
        const linkSocial = item.redesocial ? `<a href="${item.redesocial}" target="_blank" class="info-link">📱 Redes Sociais</a>` : "";
        
        let botaoZap = "";
        if (item.whatsapp) {
            const numeroLimpo = item.whatsapp.replace(/\D/g, '');
            botaoZap = `<a href="https://wa.me/${numeroLimpo}" target="_blank" class="btn-whats">💬 WhatsApp</a>`;
        }
        
        // Garante HTTPS no Google Maps
        let botaoMaps = "";
        if (item.maps_link) {
            const linkSeguro = item.maps_link.replace('http://', 'https://');
            botaoMaps = `<a href="${linkSeguro}" target="_blank" class="btn-maps">🗺️ Maps</a>`;
        }

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

function filtrar(categoriaAlvo, tituloExibicao) {
    abrirTelaResultados(tituloExibicao);
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

// OUVINTE DO CARROSSEL (Voltou a ser simples e seguro)
document.querySelectorAll('.item-carrossel').forEach(botao => {
    botao.addEventListener('click', function() {
        const categoria = this.getAttribute('data-cat');
        const titulo = this.getAttribute('data-titulo');
        filtrar(categoria, titulo);
    });
});

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

const btnGPS = document.getElementById('btnLocalizacao');
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
                
                abrirTelaResultados(`Perto de: ${localidade}`);
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

carregarDados();
