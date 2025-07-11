/*
 * ===================================================================
 * MÓDULO DE API DE PRODUTOS - CAFÉ QUENTE
 * ===================================================================
 * 
 * Este módulo é responsável por:
 * 1. Carregar produtos da API do servidor
 * 2. Gerenciar categorias e filtros
 * 3. Renderizar produtos no grid
 * 4. Gerenciar carrinho de compras
 * 5. Feedback visual para o usuário
 */

// Configuração de categorias com ícones e nomes amigáveis
const categoryIcons = {
    'lanche': '🍔',
    'bebida': '🥤',
    'acompanhamento': '🍟',
    'sobremesa': '🍰',
    'combo': '🍱'
};

const categoryNames = {
    'lanche': 'Lanches',
    'bebida': 'Bebidas',
    'acompanhamento': 'Acompanhamentos',
    'sobremesa': 'Sobremesas',
    'combo': 'Combos'
};

// Variáveis globais
let carrinhoItens = [];
let currentCategory = 'todos';

/**
 * Função principal para carregar produtos da API
 * Faz requisição ao servidor e inicializa o cardápio
 */
async function CarProdutos() {
    try {
        console.log('🔄 Iniciando carregamento de produtos...');

        const response = await fetch('/api/produtos-salvos', {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        const dados = await response.json();
        const produtos = dados.produtos;

        console.log('📦 Dados recebidos do servidor:', dados);

        // Salva produtos no localStorage para uso no carrinho
        localStorage.setItem('allProducts', JSON.stringify(produtos));

        // Carrega as categorias na sidebar
        loadCategories(produtos);

        // Exibe os produtos no grid principal
        exibirProdutos(produtos);

        // Carrega itens do carrinho se existirem no localStorage
        loadCart();

        // Processa combos para o carrossel
        processarCombos();

        console.log('✅ Cardápio carregado com sucesso!');

    } catch (error) {
        console.error('❌ Falha ao carregar produtos:', error);
        alert(`Erro ao carregar cardápio: ${error.message}`);
    }
}
/**
 * Obtém e armazena as imagens dos combos no localStorage
 * @returns {Array} Array contendo as URLs das imagens dos combos
 */
function processarCombos() {
    try {
        // 1. Carrega produtos do localStorage
        const produtos = JSON.parse(localStorage.getItem('allProducts')) || [];

        // 2. Filtra apenas os combos com imagens válidas
        const combosComImagens = produtos.filter(produto =>
            produto.idCategoria === 'combo' &&
            produto.imgProd &&
            (produto.imgProd.startsWith('http') || produto.imgProd.startsWith('/'))
        );

        // 3. Extrai apenas as URLs das imagens
        const comboImages = combosComImagens.map(combo => combo.imgProd);

        // 4. Armazena no localStorage
        localStorage.setItem('comboImages', JSON.stringify(comboImages));

        console.log('📸 Imagens de combos salvas no localStorage:', comboImages);
        return comboImages;

    } catch (error) {
        console.error('❌ Erro ao processar combos:', error);
        return [];
    }
}

/**
 * Carrega e renderiza as categorias na sidebar
 * @param {Array} produtos - Lista de produtos para extrair categorias
 */
function loadCategories(produtos) {
    const sidebar = document.getElementById('categories-sidebar');
    if (!sidebar) return;

    // Extrai categorias únicas dos produtos
    const categorias = [...new Set(produtos.map(p => p.idCategoria))];

    // Adiciona botão "Todos" primeiro
    sidebar.innerHTML = `
        <div class="category-item active" data-category="todos" onclick="filterByCategory('todos')">
            <div class="category-icon">📋</div>
            <span class="category-name">Todos</span>
        </div>
    `;

    // Adiciona as demais categorias
    categorias.forEach(cat => {
        if (categoryIcons[cat]) {
            sidebar.innerHTML += `
                <div class="category-item" data-category="${cat}" onclick="filterByCategory('${cat}')">
                    <div class="category-icon">${categoryIcons[cat]}</div>
                    <span class="category-name">${categoryNames[cat] || cat}</span>
                </div>
            `;
        }
    });
}

/**
 * Filtra produtos por categoria
 * @param {string} category - Categoria selecionada
 */
function filterByCategory(category) {
    currentCategory = category;

    // Atualiza a classe ativa nos botões da sidebar
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.toggle('active', item.dataset.category === category);
    });

    // Recarrega os produtos filtrados
    const produtos = JSON.parse(localStorage.getItem('allProducts')) || [];
    exibirProdutos(produtos);
}

/**
 * Exibe produtos no grid principal
 * @param {Array} produtos - Lista de produtos para exibir
 */
function exibirProdutos(produtos) {
    const section = document.getElementById('products-section');
    if (!section) return;

    // Filtra produtos por categoria se necessário
    const produtosFiltrados = currentCategory === 'todos' ?
        produtos :
        produtos.filter(p => p.idCategoria === currentCategory);

    // Se categoria "todos" está selecionada, agrupa por categoria
    if (currentCategory === 'todos') {
        const produtosPorCategoria = groupByCategory(produtosFiltrados);
        section.innerHTML = '';

        // Renderiza cada categoria com seus produtos
        for (const [categoria, produtos] of Object.entries(produtosPorCategoria)) {
            if (produtos.length > 0) {
                section.innerHTML += `
                    <h2 class="category-title">${categoryNames[categoria] || categoria}</h2>
                    <div class="products-grid" id="grid-${categoria}"></div>
                `;

                const grid = document.getElementById(`grid-${categoria}`);
                produtos.forEach(produto => {
                    grid.appendChild(createProductCard(produto));
                });
            }
        }
    } else {
        // Mostra todos os produtos da categoria selecionada
        section.innerHTML = `
            <div class="products-grid" id="grid-${currentCategory}"></div>
        `;

        const grid = document.getElementById(`grid-${currentCategory}`);
        produtosFiltrados.forEach(produto => {
            grid.appendChild(createProductCard(produto));
        });
    }
}

/**
 * Agrupa produtos por categoria
 * @param {Array} produtos - Lista de produtos
 * @returns {Object} Produtos agrupados por categoria
 */
function groupByCategory(produtos) {
    return produtos.reduce((acc, produto) => {
        const categoria = produto.idCategoria;
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(produto);
        return acc;
    }, {});
}

/**
 * Cria um card de produto
 * @param {Object} produto - Dados do produto
 * @returns {HTMLElement} Elemento do card
 */
function createProductCard(produto) {
    const div = document.createElement('div');
    div.className = 'product-card';

    div.innerHTML = `
        <img src="${produto.imgProd}" alt="${produto.nomeProd}" class="product-image" onerror="this.src='https://via.placeholder.com/150?text=Produto'">
        <div class="product-info">
            <h3 class="product-name">${produto.nomeProd}</h3>
            <p class="product-price">R$ ${produto.preco?.toFixed(2) || '0,00'}</p>
            <button class="add-to-cart" onclick="adicionarAoCarrinho(${produto.idprod})">
                Adicionar
            </button>
        </div>
    `;

    return div;
}

/**
 * Adiciona produto ao carrinho
 * @param {number} id - ID do produto
 */
function adicionarAoCarrinho(id) {
    const produtos = JSON.parse(localStorage.getItem('allProducts')) || [];
    const produto = produtos.find(p => p.idprod === id);

    if (produto) {
        // Verifica se o produto já está no carrinho
        const itemExistente = carrinhoItens.find(item => item.id === id);

        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinhoItens.push({
                id: produto.idprod,
                nome: produto.nomeProd,
                preco: produto.preco,
                quantidade: 1,
                img: produto.imgProd
            });
        }

        // Atualiza o localStorage e o contador
        saveCart();
        updateCartCount();

        // Feedback visual com toast
        showToast(`${produto.nomeProd} adicionado ao carrinho!`);
    }
}

/**
 * Exibe notificação toast
 * @param {string} message - Mensagem a ser exibida
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#4CAF50';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

/**
 * Carrega carrinho do localStorage
 */
function loadCart() {
    const cartData = localStorage.getItem('cartItems');
    if (cartData) {
        carrinhoItens = JSON.parse(cartData);
        updateCartCount();
    }
}

/**
 * Salva carrinho no localStorage
 */
function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(carrinhoItens));
}

/**
 * Atualiza contador visual do carrinho
 */
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const totalItems = carrinhoItens.reduce((sum, item) => sum + item.quantidade, 0);
        countElement.textContent = totalItems;
        countElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Torna a função disponível globalmente
window.filterByCategory = filterByCategory;
window.adicionarAoCarrinho = adicionarAoCarrinho;

// Exporta a função principal
export { CarProdutos, processarCombos };