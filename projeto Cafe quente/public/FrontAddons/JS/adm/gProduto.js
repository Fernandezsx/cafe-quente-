// Removendo import e declarando products
let products = [];

console.warn("JS gProduto conectado");
document.addEventListener("DOMContentLoaded", function () {
    // Carrega produtos iniciais
    loadProducts();

    // Configura eventos
    document
        .getElementById("add-product-btn")
        .addEventListener("click", function () {
            openProductModal();
        });

    document
        .getElementById("product-form")
        .addEventListener("submit", handleProductSubmit);
    document
        .querySelector(".modal-close")
        .addEventListener("click", closeModal);
    document
        .querySelector(".modal-cancel")
        .addEventListener("click", closeModal);
});

function loadProducts() {
    console.log("🔄 Carregando produtos do arquivo JSON...");

    // Busca produtos do arquivo produtos.json através da API
    fetch("/api/produtos-salvos")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("📡 Resposta da API:", data);

            if (data.success) {
                // Converte os dados do JSON para o formato usado no frontend
                products = data.produtos.map((produto) => ({
                    id: produto.idprod,
                    nome: produto.nomeProd,
                    categoria: produto.idCategoria,
                    preco: produto.preco || 0, // Define preço padrão se não existir
                    imagem: produto.imgProd,
                    ativo: produto.disponivel !== false, // Usa disponivel do JSON
                }));

                console.log(
                    `✅ ${products.length} produtos carregados do JSON:`,
                );
                console.log(products);

                renderProducts();
            } else {
                console.warn("⚠️ Erro ao carregar produtos:", data.message);
                products = [];
                renderProducts();
            }
        })
        .catch((error) => {
            console.error("❌ Erro ao carregar produtos:", error);

            // Em caso de erro, usa produtos padrão para não quebrar a interface
            products = [
                {
                    id: 1,
                    nome: "Hambúrguer Clássico",
                    categoria: "lanche",
                    preco: 25.9,
                    imagem: "https://via.placeholder.com/80x80?text=Produto+1",
                    ativo: true,
                },
                {
                    id: 2,
                    nome: "Refrigerante",
                    categoria: "bebida",
                    preco: 8.5,
                    imagem: "https://via.placeholder.com/80x80?text=Produto+2",
                    ativo: true,
                },
            ];

            renderProducts();
            alert(
                "Erro ao carregar produtos do servidor. Usando dados padrão.",
            );
        });
}

function renderProducts() {
    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = "<p>Nenhum produto cadastrado.</p>";
        return;
    }

    products.forEach(function (product) {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `
                    <img src="${product.imagem}" alt="${product.nome}">
                    <div class="product-details">
                        <h4>${product.nome}</h4>
                        <p>Categoria: ${getCategoryName(product.categoria)}</p>
                        <p class="product-price">R$ ${product.preco ? product.preco.toFixed(2) : "0.00"}</p>
                        <p>Status: <span class="${product.ativo ? "text-success" : "text-danger"}">${product.ativo ? "Ativo" : "Inativo"}</span></p>
                    </div>
                    <div class="product-actions">
                        <button class="btn-secondary" onclick="editProduct(${product.id})">✏️ Editar</button>
                        <button class="${product.ativo ? "btn-danger" : "btn-success"}" onclick="toggleProduct(${product.id})">
                            ${product.ativo ? "❌ Desativar" : "✅ Ativar"}
                        </button>
                    </div>
                `;
        container.appendChild(productItem);
    });
}

function getCategoryName(category) {
    const categories = {
        lanche: "🍔 Lanche",
        bebida: "🥤 Bebida",
        acompanhamento: "🍟 Acompanhamento",
        sobremesa: "🍰 Sobremesa",
    };
    return categories[category] || category;
}

function openProductModal(product = null) {
    const modal = document.getElementById("product-modal");
    const title = document.getElementById("modal-title");
    const form = document.getElementById("product-form");

    if (product) {
        title.textContent = "Editar Produto";
        document.getElementById("product-name").value = product.nome;
        document.getElementById("product-category").value = product.categoria;
        document.getElementById("product-price").value = product.preco;
        document.getElementById("product-image").value = product.imagem;
        form.dataset.productId = product.id;
    } else {
        title.textContent = "Adicionar Produto";
        form.reset();
        delete form.dataset.productId;
    }

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("product-modal").style.display = "none";
}

function handleProductSubmit(event) {
    event.preventDefault();

    console.log("🚀 Iniciando envio de produto...");

    // Coleta os dados do formulário
    let nome = document.getElementById("product-name").value;
    let categoria = document.getElementById("product-category").value;
    let preco = parseFloat(document.getElementById("product-price").value);
    let imagem = document.getElementById("product-image").value;

    console.log("📝 Dados coletados:", { nome, categoria, preco, imagem });

    // Cria objeto no formato esperado pela classe produto
    const produtoData = {
        nomeProd: nome.trim(),
        idCategoria: categoria,
        preco: parseInt(preco),
        imgProd: imagem.trim(),
        ativo: true, // Produto criado como disponível por padrão
    };

    console.log("📦 Objeto produto preparado:", produtoData);

    // Envia para a API
    fetch("/api/obj-prod", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoData),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("📡 Resposta da API:", data);

            if (data.success) {
                console.log("✅ Produto registrado com sucesso!");
                console.log(`🎉 ${data.message}`);
                console.log("📊 Detalhes:", data.produto);

                alert(
                    `Produto "${nome}" registrado com sucesso no arquivo JSON!\nID: ${data.produto.idprod}\nTotal de produtos: ${data.totalProdutos}`,
                );

                // Limpa o formulário
                document.getElementById("product-form").reset();
                closeModal();

                // Recarrega a lista de produtos
                loadProducts();
            } else {
                console.warn("⚠️ Erro ao registrar produto:", data.message);
                alert("Erro ao registrar produto: " + data.message);
            }
        })
        .catch((error) => {
            console.error("❌ Erro na requisição:", error);
            alert("Erro de conexão ao registrar produto");
        });

    const form = event.target;
    /*const productData = {
        nome: document.getElementById('product-name').value,
        categoria: document.getElementById('product-category').value,
        preco: parseFloat(document.getElementById('product-price').value),
        imagem: document.getElementById('product-image').value
    };*/
    const productData = {
        idprod: id,
        nome: nome,
        categoria: categoria,
        preco: parseFloat(preco),
        imagem: imagem,
    };

    if (form.dataset.productId) {
        updateProduct(form.dataset.productId, productData);
    } else {
        addProduct(productData);
    }

    closeModal();
}

function addProduct(productData) {
    // Esta função agora só recarrega os produtos, já que o produto
    // é adicionado via API no handleProductSubmit
    console.log("🔄 Recarregando lista de produtos...");
    loadProducts();
    alert("Produto adicionado com sucesso!");
}

function updateProduct(id, productData) {
    const index = products.findIndex((p) => p.id === parseInt(id));
    if (index !== -1) {
        products[index] = { ...products[index], ...productData };
        renderProducts();
        alert("Produto atualizado com sucesso!");
    }
}

function editProduct(id) {
    const product = products.find((p) => p.id === id);
    if (product) {
        openProductModal(product);
    }
}

function toggleProduct(id) {
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
        products[index].ativo = !products[index].ativo;
        renderProducts();
        alert(
            `Produto ${products[index].ativo ? "ativado" : "desativado"} com sucesso!`,
        );
    }
}

// Torna as funções disponíveis globalmente para os eventos onclick
window.editProduct = editProduct;
window.toggleProduct = toggleProduct;
