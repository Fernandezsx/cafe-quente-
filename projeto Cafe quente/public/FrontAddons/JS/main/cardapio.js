       // Dados de exemplo para categorias (pode ser substituído por dados reais da API)
       const categoryIcons = {
           'lanche': '🍔',
           'bebida': '🥤',
           'acompanhamento': '🍟',
           'sobremesa': '🍰'
       };

       const categoryNames = {
           'lanche': 'Lanches',
           'bebida': 'Bebidas',
           'acompanhamento': 'Acompanhamentos',
           'sobremesa': 'Sobremesas'
       };

       let carrinhoItens = [];
       let currentCategory = 'todos';

       async function CarProdutos() {
           try {
               const response = await fetch('http://localhost:8080/api/produtos-salvos', {
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
               console.log(produtos[0].nomeProd)

               // Salva produtos no localStorage para uso no carrinho
               localStorage.setItem('allProducts', JSON.stringify(produtos));

               // Primeiro carrega as categorias
               loadCategories(produtos);

               // Depois exibe os produtos
               exibirProdutos(produtos);

               // Carrega itens do carrinho se existirem no localStorage
               loadCart();
           } catch (error) {
               console.error('Falha ao carregar produtos:', error);
               alert(`Erro: ${error.message}`);
           }
       }

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

       function filterByCategory(category) {
           currentCategory = category;

           // Atualiza a classe ativa nos botões
           document.querySelectorAll('.category-item').forEach(item => {
               item.classList.toggle('active', item.dataset.category === category);
           });

           // Recarrega os produtos filtrados
           const produtos = JSON.parse(localStorage.getItem('allProducts')) || [];
           exibirProdutos(produtos);
       }

       function exibirProdutos(produtos) {
           const section = document.getElementById('products-section');
           if (!section) return;

           // Filtra produtos por categoria se necessário
           const produtosFiltrados = currentCategory === 'todos' ?
               produtos :
               produtos.filter(p => p.idCategoria === currentCategory);

           // Agrupa por categoria (só mostra se estiver na view "todos")
           if (currentCategory === 'todos') {
               const produtosPorCategoria = groupByCategory(produtosFiltrados);
               section.innerHTML = '';

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

               // Feedback visual
               const toast = document.createElement('div');
               toast.textContent = `${produto.nomeProd} adicionado ao carrinho!`;
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
       }

       function loadCart() {
           const cartData = localStorage.getItem('cartItems');
           if (cartData) {
               carrinhoItens = JSON.parse(cartData);
               updateCartCount();
           }
       }

       function saveCart() {
           localStorage.setItem('cartItems', JSON.stringify(carrinhoItens));
       }

       function updateCartCount() {
           const countElement = document.getElementById('cart-count');
           if (countElement) {
               const totalItems = carrinhoItens.reduce((sum, item) => sum + item.quantidade, 0);
               countElement.textContent = totalItems;
               countElement.style.display = totalItems > 0 ? 'flex' : 'none';
           }
       }
       export { CarProdutos }