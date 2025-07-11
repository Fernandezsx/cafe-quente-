// Manipulador de carrossel e inatividade

let imagens = [];

// Função para carregar imagens dos combos diretamente da API
async function carregarImagensCombos() {
    try {
        console.log("🔄 Carregando imagens dos combos da API...");

        const response = await fetch("/api/produtos-salvos");
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const dados = await response.json();
        if (dados.success && dados.produtos) {
            // Filtra apenas os combos com imagens válidas
            const combosComImagens = dados.produtos.filter(
                (produto) =>
                produto.idCategoria === "combo" &&
                produto.imgProd &&
                (produto.imgProd.startsWith("http") ||
                    produto.imgProd.startsWith("/")),
            );

            // Extrai apenas as URLs das imagens
            imagens = combosComImagens.map((combo) => combo.imgProd);

            // Armazena no localStorage para cache
            localStorage.setItem("comboImages", JSON.stringify(imagens));

            console.log("📸 Imagens de combos carregadas da API:", imagens);

            // Configura imagem inicial se existirem imagens
            if (imagens.length > 0 && centro) {
                centro.style.backgroundImage = `url('${imagens[0]}')`;
            }
        }
    } catch (error) {
        console.error("❌ Erro ao carregar imagens dos combos:", error);

        // Tenta usar localStorage como fallback
        try {
            const data = localStorage.getItem("comboImages");
            imagens = data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("erro ao carregar as imagens do localStorage", e);
            imagens = [];
        }
    }
}

// Carrega as imagens quando o módulo é importado
carregarImagensCombos();

const TEMPO_INATIVIDADE = 30000; // 30 segundos
let inactivityTimer;
const INACTIVITY_TIMEOUT = 30000; // 30 segundos em milissegundos

/*const imagens = [
    'https://292aa00292a014763d1b-96a84504aed2b25fc1239be8d2b61736.ssl.cf1.rackcdn.com/GaleriaImagem/130275/fotos-para-hamburguerias_fotografia-de-hamburguer-9.JPG',
    'https://s2-oglobo.glbimg.com/7Ea-LBy4TqZ1W6xASfbifUnp8b8=/0x0:301x301/924x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_da025474c0c44edd99332dddb09cabe8/internal_photos/bs/2022/5/0/hdhwI2St270nDxTqBtnQ/96450421-um-caseiro-de-21-anos-matou-sua-mulher-que-estava-gravida-de-4-meses-a-enteada-de-2-anos-e.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/55/Hemp_extract.jpg'
];*/

let index = 0;
let carrosselAtivo = false;
let intervaloId = null;
let timeoutId = null;

const carroca = document.getElementById("carroça");
const centro = document.querySelector(".centro");
centro.style.position = "relative";
centro.style.overflow = "hidden";

const overlay = document.createElement("div");
overlay.style.position = "absolute";
overlay.style.top = "0";
overlay.style.left = "100%";
overlay.style.width = "100%";
overlay.style.height = "calc(100% - 50px)";
overlay.style.bottom = "50px";
overlay.style.backgroundSize = "cover";
overlay.style.backgroundPosition = "center";
overlay.style.transition = "transform 0.5s ease";
centro.appendChild(overlay);

function atualizarImagemAnimada() {
    if (carroca.style.display === "none") {
        console.warn("Carrossel parado - display none");
        pararCarrossel();
        return;
    }

    if (imagens.length === 0) {
        console.warn("Nenhuma imagem disponível para o carrossel");
        return;
    }

    const proxima = imagens[index];
    console.log(
        `🖼️ Trocando para imagem ${index + 1}/${imagens.length}:`,
        proxima,
    );

    overlay.style.backgroundImage = `url('${proxima}')`;
    overlay.style.transform = "translateX(-100%)";

    setTimeout(() => {
        centro.style.backgroundImage = `url('${proxima}')`;
        overlay.style.transition = "none";
        overlay.style.left = "100%";
        overlay.style.transform = "translateX(0)";
        void overlay.offsetWidth;
        overlay.style.transition = "transform 0.5s ease";
    }, 500);
}

function iniciarCarrossel() {
    if (carrosselAtivo) return;

    // Se não tem imagens, tenta carregar novamente
    if (imagens.length === 0) {
        console.log("🔄 Tentando recarregar imagens...");
        carregarImagensCombos();
        return;
    }

    console.log("⏳ Carrossel iniciado com", imagens.length, "imagens");
    carrosselAtivo = true;

    // Configura a primeira imagem
    if (imagens.length > 0) {
        centro.style.backgroundImage = `url('${imagens[0]}')`;
        index = 0;
    }

    // Só inicia o intervalo se houver mais de uma imagem
    if (imagens.length > 1) {
        intervaloId = setInterval(() => {
            index = (index + 1) % imagens.length;
            atualizarImagemAnimada();
        }, 3000);
    } else {
        console.log("📸 Apenas 1 imagem disponível - carrossel estático");
    }
}

function pararCarrossel() {
    if (!carrosselAtivo) return;
    clearInterval(intervaloId);
    intervaloId = null;
    carrosselAtivo = false;
    console.log("⏹️ Carrossel parado");
}

// A imagem inicial será configurada quando carregarImagensCombos() terminar

function startInactivityTimer() {
    // Limpa qualquer timer anterior
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    // Inicia o timer para mostrar o carrossel após 30 segundos
    inactivityTimer = setTimeout(() => {
        console.log("⏰ Timer de inatividade ativado - mostrando carrossel");
        showCarrossel();
    }, INACTIVITY_TIMEOUT);
}

function resetInatividadeTimer() {
    // Reseta o timer, limpando o anterior e começando um novo
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    // Só reinicia o timer se não estiver no carrossel
    const carrossel = document.getElementById("carroça");
    if (!carrossel || carrossel.style.display === "none") {
        startInactivityTimer();
    }
}

function stopInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
        console.log("⏹️ Timer de inatividade parado");
    }
}

/**
 * Mostra o carrossel após período de inatividade
 */
/**
 * Mostra o carrossel após período de inatividade
 */
function showCarrossel() {
    // Limpa os dados do usuário para reiniciar o totem após a inatividade
    localStorage.removeItem("nomeCliente");
    localStorage.removeItem("pedido");
    const carrossel = document.getElementById("carroça");
    if (carrossel) {
        console.log("📺 Mostrando carrossel por inatividade");
        carrossel.style.display = "flex"; // Torna o carrossel visível para a transição
        setTimeout(() => {
            carrossel.classList.add('show'); // Adiciona a classe 'show' para iniciar a transição de entrada
        }, 10); // Pequeno atraso para garantir que o display seja aplicado antes da transição

        stopInactivityTimer();
        iniciarCarrossel();

        const initialScreen = document.getElementById("initial-screen");
        const mainApp = document.getElementById("main-app");

        if (initialScreen) initialScreen.style.display = "none";
        if (mainApp) mainApp.style.display = "none";
    }
}


/**
 * Volta para o app principal a partir do carrossel
 */
/**
 * Volta para o app principal a partir do carrossel
 */
function voltarParaApp() {
    const carrossel = document.getElementById("carroça");
    const mainApp = document.getElementById("main-app");
    const initialScreen = document.getElementById("initial-screen");

    const nomeCliente = localStorage.getItem('nomeCliente');

    pararCarrossel();

    if (carrossel) {
        carrossel.classList.remove('show'); // Remove a classe 'show' para iniciar a transição de saída
        setTimeout(() => { // Espera a transição terminar para esconder completamente
            carrossel.style.display = "none";
        }, 500); // Tempo da transição (0.5s)
    }

    if (nomeCliente && mainApp) {
        mainApp.style.display = "flex";
        startInactivityTimer();
    } else if (initialScreen) {
        initialScreen.style.display = "flex";
        startInactivityTimer();
    }
}
// Também reseta timer se quiser detectar outras ações (movimentos do mouse, toques, cliques)
document.body.addEventListener("mousemove", resetInatividadeTimer);
document.body.addEventListener("touchstart", resetInatividadeTimer);
document.body.addEventListener("click", resetInatividadeTimer);
document.body.addEventListener("scroll", resetInatividadeTimer);
export {
    showCarrossel,
    startInactivityTimer,
    resetInatividadeTimer,
    stopInactivityTimer,
    pararCarrossel,
    voltarParaApp,
    iniciarCarrossel,
};