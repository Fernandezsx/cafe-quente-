/*
 * ===================================================================
 * SERVIDOR PRINCIPAL - PROJETO CAFÉ QUENTE
 * ===================================================================
 * 
 * Este é o arquivo principal do servidor que integra todas as funcionalidades
 * do sistema de totem Café Quente. Ele combina:
 * 
 * 1. Sistema original do totem (interface do cliente)
 * 2. Painel administrativo completo (gerenciamento do sistema)
 * 3. APIs para comunicação entre frontend e backend
 * 4. Middleware de segurança e validação
 * 
 * ARQUITETURA:
 * - Express.js como framework web
 * - Arquivos estáticos servidos da pasta 'public'
 * - APIs RESTful para operações CRUD
 * - Sistema de logs integrado
 * - Verificação de IP para segurança
 */

// Importações necessárias
const express = require('express');
const path = require('path');
const fs = require('fs');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const produto = require('./modules/produtos.js')
    // Módulos do projeto original
const clientData = require('./modules/clientData');
const { adminid } = require('./modules/obj.js');

// Novos módulos integrados do painel administrativo
const { AuthManager, DashboardManager, ProductManager, LogManager } = require('./modules/SystemManagers');
const { adminData } = require('./modules/adminData');
const { error } = require('console');
const { salvarPedidoNoBanco } = require('./modules/MandarJson.js');

/* pagamento via mercado pago, vulgo MP🥶🥶 */



/*
 * CONFIGURAÇÃO DO SERVIDOR
 * ========================
 * 
 * Inicializa o servidor Express e define configurações básicas.
 */
const app = express();
const PORT = process.env.PORT || 8080; // Porta padrão do projeto Café Quente

/*
 * MIDDLEWARES BÁSICOS
 * ===================
 * 
 * Configurações essenciais para o funcionamento do servidor.
 */

// Middleware para parsing de JSON
// Permite que o servidor entenda requisições com dados em formato JSON
app.use(express.json());

// Middleware para servir arquivos estáticos
// Serve arquivos HTML, CSS, JS e imagens da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));



const client = new MercadoPagoConfig({ accessToken: 'TEST-8102679798978688-071010-5d50a05a86c398e4caca9fdcceadd412-2543298449' });
app.post('/api/pedido', async(req, res) => {
    const pedido = req.body;

    const preference = new Preference(client);

    try {
        const response = await preference.create({
            body: {
                items: pedido.itens.map(item => ({
                    title: item.nome,
                    quantity: item.quantidade,
                    unit_price: item.preco
                })),
                payer: {
                    name: pedido.cliente.nome,
                    email: pedido.cliente.email
                },
                back_urls: {
                    success: 'http://localhost:3000/sucesso',
                    failure: 'http://localhost:3000/erro',
                    pending: 'http://localhost:3000/pendente'
                },
                notification_url: 'https://SEU_BACKEND.com/webhook'
            }
        });

        // Monta o pedido com o ID de pagamento
        const pedidoComPagamento = {
            ...pedido,
            status: 'aguardando_pagamento',
            preferenceId: response.id
        };

        // Salva o pedido no arquivo JSON
        await salvarPedidoNoBanco(pedidoComPagamento);

        // Retorna o link de pagamento para o frontend
        res.json({
            success: true,
            linkPagamento: response.init_point
        });

    } catch (err) {
        console.error('Erro ao criar preferência:', err);
        res.status(500).json({ success: false, message: 'Erro ao criar preferência' });
    }
});
app.get('/api/pedidoEspera', async(req, res) => {
    const filePath = path.join(__dirname, 'data', 'cliente.json');

    try {
        const dados = fs.readFileSync(filePath, 'utf8');
        const pedidos = JSON.parse(dados);
        res.json({ success: true, pedidos });
    } catch (err) {
        console.error('Erro ao ler o arquivo cliente.json:', err);
        res.status(500).json({ success: false, message: 'Erro ao obter pedidos' });
    }
});
/*
 * MIDDLEWARE DE SEGURANÇA - VERIFICAÇÃO DE IP
 * ===========================================
 * 
 * Implementa verificação de IP para proteger o acesso ao painel administrativo.
 * Apenas IPs autorizados podem acessar certas rotas do sistema.
 * 
 * COMO FUNCIONA:
 * 1. Captura o IP da requisição
 * 2. Verifica se o IP está na lista de IPs permitidos
 * 3. Permite ou bloqueia o acesso baseado na verificação
 * 4. Permite ou bloqueia o acesso baseado na verificação
 * 5. Registra tentativas de acesso não autorizado
 */
app.use((req, res, next) => {
    // Captura o IP do cliente que fez a requisição
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Lista de IPs permitidos para acessar o sistema administrativo
    // '::1' e '127.0.0.1' são endereços localhost (mesma máquina)
    // Em produção, você pode adicionar IPs específicos da rede local
    const allowedIps = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];

    // Rotas que não precisam de verificação de IP (acesso público)
    const publicRoutes = [
        '/', // Página principal do totem
        '/api/user', // API de dados do usuário
        '/api/update-user' // API para atualizar usuário
    ];

    // Verifica se a rota atual é pública
    const isPublicRoute = publicRoutes.some(route => req.path === route) ||
        req.path.startsWith('/fist-sprint'); // Arquivos do totem original

    // Se for rota pública, permite acesso sem verificação
    if (isPublicRoute) {
        return next();
    }

    // Para rotas administrativas, verifica o IP
    /*if (!allowedIps.includes(clientIp)) {
        // Registra tentativa de acesso não autorizado
        LogManager.addLog('AVISO', `Tentativa de acesso não autorizado do IP: ${clientIp} para ${req.path}`);

        // Retorna erro 403 (Proibido)
        return res.status(403).json({
            success: false,
            message: 'Acesso não autorizado. Este totem só pode ser administrado localmente.'
        });
    }*/

    // Se o IP for autorizado, continua para a próxima função
    next();
});

/*
 * ===================================================================
 * ROTAS DO SISTEMA ORIGINAL (TOTEM DO CLIENTE)
 * ===================================================================
 */

/*
 * ROTA PRINCIPAL DO TOTEM
 * =======================
 * 
 * Serve a interface principal do totem onde os clientes fazem seus pedidos.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));

});
app.get('/carrinho', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pagamento.html'));
})

/*
 * ROTA DO PAINEL ADMINISTRATIVO
 * =============================
 * 
 * Serve a interface de administração do totem.
 * Rota protegida por verificação de IP.
 */
app.get('/kb/minda/two/paineel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/*
 * API PARA ATUALIZAR NOME DO USUÁRIO
 * ===================================
 * 
 * Permite que o cliente atualize seu nome no totem.
 * Parte do sistema original do Café Quente.
 */
app.post('/api/update-user', (req, res) => {
    try {
        const { nome } = req.body;

        // Validação: verifica se o nome foi fornecido e não está vazio
        if (!nome || nome.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nome inválido. Por favor, forneça um nome válido.'
            });
        }

        // Atualiza o usuário usando o módulo clientData original
        const updatedUser = clientData.updateUser({ nome: nome.trim() });

        // Log da operação
        console.log(`Nome do usuário atualizado: ${nome}`);
        LogManager.addLog('INFO', `Nome do usuário atualizado para: ${nome}`);

        // Resposta de sucesso
        res.json({
            success: true,
            message: 'Nome atualizado com sucesso',
            user: updatedUser
        });

    } catch (error) {
        console.error('Erro ao atualizar nome do usuário:', error);
        LogManager.addLog('ERRO', `Erro ao atualizar nome do usuário: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API PARA OBTER DADOS DO USUÁRIO
 * ================================
 * 
 * Retorna os dados atuais do usuário do totem.
 * Parte do sistema original do Café Quente.
 */
app.get('/api/user', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Dados do usuário obtidos com sucesso',
            user: clientData.user
        });
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        LogManager.addLog('ERRO', `Erro ao obter dados do usuário: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

app.get('/api/prods', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'produtos.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo', err)
            return res.status(500).json({
                error: 'Erro interno do servidor'
            })
        }
        try {
            const produtos = JSON.parse(data);
            res.json(produtos)
        } catch (parseError) {
            res.status(500).json({ error: "Erro ao interpretar o json" })
        }
    })
})

// API para registrar clientes
app.post('/api/cliente', (req, res) => {
    try {
        const usuario = req.body;

        // Validação básica
        if (!usuario.nome && !usuario.cpf) {
            return res.status(400).json({
                success: false,
                message: 'Cliente deve ter pelo menos nome ou CPF'
            });
        }

        console.log("📝 Registrando novo cliente:", usuario);

        // Configuração dos caminhos
        const pastaData = path.join(__dirname, 'data');
        const filePath = path.join(pastaData, 'cliente.json');

        // Cria pasta data se não existir 
        if (!fs.existsSync(pastaData)) {
            fs.mkdirSync(pastaData, { recursive: true });
            console.log("📁 Pasta 'data' criada");
        }

        // Lê arquivo existente ou cria array vazio
        fs.readFile(filePath, 'utf8', (err, data) => {
            let usuario = [];

            if (!err && data.trim()) {
                try {
                    usuario = JSON.parse(data);
                    console.log(`📖 Arquivo clientes.json lido - ${usuario.length} clientes existentes`);
                } catch (parseError) {
                    console.error("❌ Erro ao fazer parse do JSON de clientes:", parseError);
                    LogManager.addLog('ERRO', `Erro ao fazer parse do JSON de clientes: ${parseError.message}`);

                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao ler arquivo de clientes existente'
                    });
                }
            } else {
                console.log("📄 Criando novo arquivo de clientes");
            }

            // Adiciona timestamp ao cliente
            usuario.registradoEm = new Date().toISOString();

            // Adiciona o novo cliente
            usuario.push(cliente);
            console.log(`➕ Cliente adicionado - Total: ${usuario.length} clientes`);

            // Salva no arquivo JSON
            fs.writeFile(filePath, JSON.stringify(usuario, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error("❌ Erro ao salvar cliente no arquivo:", writeErr);
                    LogManager.addLog('ERRO', `Erro ao salvar cliente: ${writeErr.message}`);

                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao salvar cliente no arquivo'
                    });
                }

                console.log("✅ Cliente salvo com sucesso no arquivo JSON!");
                console.log(`📊 Cliente registrado: ID ${usuario.id} - ${usuario.nome || 'Sem nome'}`);

                LogManager.addLog('INFO', `Novo cliente registrado: ID ${usuario.id} - ${usuario.nome || 'Sem nome'}`);

                res.json({
                    success: true,
                    message: 'Cliente registrado com sucesso!',
                    cliente: usuario,
                    totalClientes: usuario.length
                });
            });
        });

    } catch (error) {
        console.error("❌ Erro geral ao registrar cliente:", error);
        LogManager.addLog('ERRO', `Erro geral ao registrar cliente: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * ===================================================================
 * ROTAS DO PAINEL ADMINISTRATIVO
 * ===================================================================
 */

/*
 * API DE LOGIN ADMINISTRATIVO
 * ===========================
 * 
 * Autentica administradores para acesso ao painel de controle.
 */
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // Validação: verifica se usuário e senha foram fornecidos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, preencha todos os campos.'
            });
        }

        // Valida as credenciais usando o AuthManager
        const user = AuthManager.validateCredentials(username, password);

        if (user) {
            // Login bem-sucedido: gera sessão e registra no log
            const session = AuthManager.generateSession(user);
            LogManager.addLog('INFO', `Login administrativo realizado por ${user.usuarioAdm} (${user.role})`);

            res.json({
                success: true,
                message: `Login bem-sucedido! Bem-vindo, ${user.usuarioAdm} (${user.role}).`,
                user: user,
                session: session
            });
        } else {
            // Login falhado: registra tentativa e retorna erro
            LogManager.addLog('AVISO', `Tentativa de login administrativo falhada para usuário: ${username}`);
            res.status(401).json({
                success: false,
                message: 'Usuário ou senha incorretos.'
            });
        }
    } catch (error) {
        console.error('Erro no login administrativo:', error);
        LogManager.addLog('ERRO', `Erro no login administrativo: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});


//api responsavel pelo usuario administrador
app.get('/api/obj-data', (req, res) => {
        try {
            res.json({
                success: true,
                message: 'dados admin recebidos com sucesso',
                data: adminid
            })
        } catch (error) {
            console.error("erro ao obter os dados dos administradores:", error);
            LogManager.addLog(error, `erro ao obter os dados do obj.js: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Erro do servidor ao obter os dados da api'
            })
        }
    })
    // API GET - Retorna estrutura da classe produto
app.get('/api/obj-prod', (req, res) => {
    try {
        console.log("📋 Solicitação para obter estrutura da classe produto");

        // Cria uma instância vazia da classe produto para mostrar a estrutura
        const produtoEstrutura = new produto();

        console.log("✅ Estrutura da classe produto obtida com sucesso");
        LogManager.addLog('INFO', 'Estrutura da classe produto consultada');

        res.json({
            success: true,
            message: 'Estrutura da classe produto obtida com sucesso',
            data: produtoEstrutura,
            campos: {
                idprod: 'ID do produto (number)',
                nomeProd: 'Nome do produto (string)',
                idCategoria: 'ID da categoria (string)',
                preco: 'Preco do produto (number)',
                imgProd: 'URL da imagem (string)',
                disponivel: 'Disponibilidade (boolean)'
            }
        });

    } catch (error) {
        console.error("❌ Erro ao obter estrutura da classe produto:", error);
        LogManager.addLog('ERRO', `Erro ao obter estrutura da classe produto: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro do servidor ao obter dados da API'
        });
    }
});

// API POST - Cria e salva novo produto
app.post('/api/obj-prod', (req, res) => {
    console.log("📥 Recebida requisição para criar produto:", req.body);

    try {
        // Cria nova instância da classe produto
        const novoProduto = new produto(req.body);
        // console.log("🏗️ Objeto produto criado:", novoProduto);//mensagem para mostrar os produtos no terminal

        // Validação básica - verifica se nome do produto foi fornecido
        if (!novoProduto.nomeProd || novoProduto.nomeProd.trim() === '') {
            console.log("❌ Dados do produto inválidos - nome obrigatório");
            LogManager.addLog('AVISO', 'Tentativa de criar produto sem nome');

            return res.status(400).json({
                success: false,
                message: 'Nome do produto é obrigatório'
            });
        }

        console.log("✅ Dados do produto validados");

        // Configuração dos caminhos de arquivo
        const pastaData = path.join(__dirname, 'data');
        const filePath = path.join(pastaData, 'produtos.json');

        // Cria pasta data se não existir
        if (!fs.existsSync(pastaData)) {
            fs.mkdirSync(pastaData, { recursive: true });
            console.log("📁 Pasta 'data' criada");
        }

        // Lê arquivo existente ou cria array vazio
        fs.readFile(filePath, 'utf8', (err, data) => {
            let produtos = [];

            if (!err && data.trim()) {
                try {
                    produtos = JSON.parse(data);
                    console.log(`📖 Arquivo JSON lido - ${produtos.length} produtos existentes`);
                } catch (parseError) {
                    console.error("❌ Erro ao fazer parse do JSON existente:", parseError);
                    LogManager.addLog('ERRO', `Erro ao fazer parse do JSON: ${parseError.message}`);

                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao ler arquivo de produtos existente'
                    });
                }
            } else {
                console.log("📄 Criando novo arquivo de produtos");
            }

            // Gera ID único se não fornecido
            if (!novoProduto.idprod) {
                novoProduto.idprod = produtos.length > 0 ?
                    Math.max(...produtos.map(p => p.idprod || 0)) + 1 :
                    1;
                console.log(`🔢 ID gerado automaticamente: ${novoProduto.idprod}`);
            }

            // Adiciona o novo produto
            produtos.push(novoProduto);
            console.log(`➕ Produto adicionado - Total: ${produtos.length} produtos`);

            // Salva no arquivo JSON
            fs.writeFile(filePath, JSON.stringify(produtos, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error("❌ Erro ao salvar produto no arquivo:", writeErr);
                    LogManager.addLog('ERRO', `Erro ao salvar produto: ${writeErr.message}`);

                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao salvar produto no arquivo'
                    });
                }

                // Sucesso!
                console.log("✅ Produto salvo com sucesso no arquivo JSON!");
                console.log(`📊 Produto registrado: ID ${novoProduto.idprod} - ${novoProduto.nomeProd}`);

                LogManager.addLog('INFO', `Novo produto criado: ID ${novoProduto.idprod} - ${novoProduto.nomeProd}`);

                res.json({
                    success: true,
                    message: 'Produto registrado com sucesso no arquivo JSON!',
                    produto: novoProduto,
                    totalProdutos: produtos.length
                });
            });
        });

    } catch (error) {
        console.error("❌ Erro geral ao criar produto:", error);
        LogManager.addLog('ERRO', `Erro geral ao criar produto: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// API para listar clientes salvos
app.get('/api/clientes', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'clientes.json');

        console.log("📋 Solicitação para listar clientes");

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log("📄 Arquivo de clientes não encontrado - retornando lista vazia");
                    return res.json({
                        success: true,
                        message: 'Nenhum cliente registrado ainda',
                        clientes: []
                    });
                }

                console.error("❌ Erro ao ler arquivo de clientes:", err);
                LogManager.addLog('ERRO', `Erro ao ler clientes: ${err.message}`);

                return res.status(500).json({
                    success: false,
                    message: 'Erro ao ler clientes'
                });
            }

            try {
                const clientes = data.trim() ? JSON.parse(data) : [];
                console.log(`✅ Lista de clientes obtida - ${clientes.length} clientes encontrados`);

                res.json({
                    success: true,
                    message: `${clientes.length} clientes encontrados`,
                    clientes: clientes,
                    total: clientes.length
                });

            } catch (parseError) {
                console.error("❌ Erro ao fazer parse dos clientes:", parseError);
                LogManager.addLog('ERRO', `Erro ao fazer parse dos clientes: ${parseError.message}`);

                res.status(500).json({
                    success: false,
                    message: 'Erro ao processar dados dos clientes'
                });
            }
        });

    } catch (error) {
        console.error("❌ Erro geral ao listar clientes:", error);
        LogManager.addLog('ERRO', `Erro geral ao listar clientes: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// API GET - Lista produtos salvos no arquivo JSON
// envia os dados do produto.json para o
app.get('/api/produtos-salvos', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'produtos.json');

        console.log("📋 Solicitação para listar produtos salvos");

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log("📄 Arquivo de produtos não encontrado - retornando lista vazia");
                    return res.json({
                        success: true,
                        message: 'Nenhum produto salvo ainda',
                        produtos: []
                    });
                }

                console.error("❌ Erro ao ler arquivo de produtos:", err);
                LogManager.addLog('ERRO', `Erro ao ler produtos salvos: ${err.message}`);

                return res.status(500).json({
                    success: false,
                    message: 'Erro ao ler produtos salvos'
                });
            }

            try {
                const produtos = data.trim() ? JSON.parse(data) : [];
                console.log(`✅ Lista de produtos obtida - ${produtos.length} produtos encontrados`);

                res.json({
                    success: true,
                    message: `${produtos.length} produtos encontrados`,
                    produtos: produtos,
                    total: produtos.length
                });

            } catch (parseError) {
                console.error("❌ Erro ao fazer parse dos produtos salvos:", parseError);
                LogManager.addLog('ERRO', `Erro ao fazer parse dos produtos: ${parseError.message}`);

                res.status(500).json({
                    success: false,
                    message: 'Erro ao processar dados dos produtos'
                });
            }
        });

    } catch (error) {
        console.error("❌ Erro geral ao listar produtos:", error);
        LogManager.addLog('ERRO', `Erro geral ao listar produtos: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
/*
 * API DO DASHBOARD
 * ================
 * 
 * Retorna estatísticas e métricas para o painel de controle.
 */
app.get('/api/admin/dashboard', (req, res) => {
    try {
        const stats = DashboardManager.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Erro ao obter dados do dashboard:', error);
        LogManager.addLog('ERRO', `Erro ao obter dados do dashboard: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE PEDIDOS EM TEMPO REAL
 * =============================
 * 
 * Retorna lista de pedidos sendo processados no momento.
 */
app.get('/api/pedidoEspera', (req, res) => {
    try {
        const clienteJsonPath = path.join(__dirname, 'data', 'cliente.json');
        
        // Verifica se o arquivo existe
        if (!fs.existsSync(clienteJsonPath)) {
            return res.json({
                success: true,
                message: 'Nenhum pedido encontrado',
                pedidos: []
            });
        }

        // Lê o arquivo cliente.json
        const data = fs.readFileSync(clienteJsonPath, 'utf8');
        const clienteData = JSON.parse(data);
        
        // Converte os dados para o formato esperado pelo frontend
        const pedidos = clienteData.map(cliente => ({
            id: cliente.idPedido || Math.random().toString(36).substr(2, 9),
            status: cliente.statusPedido || 'aguardando_pagamento',
            dataHora: cliente.dataHora || new Date().toISOString(),
            cliente: {
                nome: cliente.nomeCliente || 'Cliente',
                cpf: cliente.cpfCliente || 'null'
            },
            itens: cliente.itensPedido || [],
            total: cliente.totalPedido || 0,
            pagamento: {
                metodo: cliente.metodoPagamento || 'Não informado'
            }
        }));

        console.log(`📋 ${pedidos.length} pedidos encontrados no cliente.json`);
        
        res.json({
            success: true,
            message: `${pedidos.length} pedidos encontrados`,
            pedidos: pedidos
        });

    } catch (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        LogManager.addLog('ERRO', `Erro ao buscar pedidos: ${error.message}`);
        
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            pedidos: []
        });
    }
});

/*
app.get('/api/admin/orders', (req, res) => {
    try {
        const orders = DashboardManager.getRealtimeOrders();
        res.json(orders);
    } catch (error) {
        console.error('Erro ao obter pedidos:', error);
        LogManager.addLog('ERRO', `Erro ao obter pedidos: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
*/
/*
 * API DE PRODUTOS - LISTAR
 * =========================
 * 
 * Retorna todos os produtos do cardápio.
 */
app.get('/api/admin/products', (req, res) => {
    try {
        const products = ProductManager.getAllProducts();
        res.json(products);
    } catch (error) {
        console.error('Erro ao obter produtos:', error);
        LogManager.addLog('ERRO', `Erro ao obter produtos: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE PRODUTOS - ADICIONAR
 * ============================
 * 
 * Adiciona um novo produto ao cardápio.
 */
app.post('/api/admin/products', (req, res) => {
    try {
        const newProduct = ProductManager.addProduct(req.body);
        LogManager.addLog('INFO', `Novo produto adicionado: ${newProduct.nome}`);
        res.json(newProduct);
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        LogManager.addLog('ERRO', `Erro ao adicionar produto: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE PRODUTOS - ATUALIZAR
 * ============================
 * 
 * Atualiza um produto existente.
 */
app.put('/api/admin/products/:id', (req, res) => {
    try {
        const updatedProduct = ProductManager.updateProduct(req.params.id, req.body);
        if (updatedProduct) {
            LogManager.addLog('INFO', `Produto atualizado: ${updatedProduct.nome}`);
            res.json(updatedProduct);
        } else {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        LogManager.addLog('ERRO', `Erro ao atualizar produto: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE PRODUTOS - ATIVAR/DESATIVAR
 * ===================================
 * 
 * Alterna o status de um produto (ativo/inativo).
 */
app.patch('/api/admin/products/:id/toggle', (req, res) => {
    try {
        const product = ProductManager.toggleProductStatus(req.params.id);
        if (product) {
            const status = product.ativo ? 'ativado' : 'desativado';
            LogManager.addLog('INFO', `Produto ${product.nome} foi ${status}`);
            res.json(product);
        } else {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
    } catch (error) {
        console.error('Erro ao alterar status do produto:', error);
        LogManager.addLog('ERRO', `Erro ao alterar status do produto: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE LOGS
 * ===========
 * 
 * Retorna logs do sistema para auditoria.
 */
app.get('/api/admin/logs', (req, res) => {
    try {
        const logs = LogManager.getAllLogs();
        res.json(logs);
    } catch (error) {
        console.error('Erro ao obter logs:', error);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE EVENTOS DO SISTEMA
 * =========================
 * 
 * Retorna eventos administrativos importantes.
 */
app.get('/api/admin/system-events', (req, res) => {
    try {
        const events = LogManager.getSystemEvents();
        res.json(events);
    } catch (error) {
        console.error('Erro ao obter eventos do sistema:', error);
        LogManager.addLog('ERRO', `Erro ao obter eventos do sistema: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * API DE LOGOUT ADMINISTRATIVO
 * ============================
 * 
 * Registra o logout de um administrador.
 */
app.post('/api/admin/logout', (req, res) => {
    try {
        const { username } = req.body;
        LogManager.addLog('INFO', `Logout administrativo realizado por ${username || 'usuário desconhecido'}`);
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    } catch (error) {
        console.error('Erro no logout:', error);
        LogManager.addLog('ERRO', `Erro no logout: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/*
 * MIDDLEWARE DE TRATAMENTO DE ERROS
 * =================================
 * 
 * Captura erros não tratados e registra no sistema de logs.
 */
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.stack);
    LogManager.addLog('ERRO', `Erro não tratado no servidor: ${err.message}`);

    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

/*
 * INICIALIZAÇÃO DO SERVIDOR
 * =========================
 * 
 * Inicia o servidor e registra informações importantes.
 */
app.listen(PORT, '0.0.0.0', () => {
    // Banner de inicialização (mantém o estilo original do Café Quente)
    console.log('='.repeat(50));
    console.log(' SERVIDOR CAFÉ QUENTE INICIADO');
    console.log('='.repeat(50));
    console.log(` Porta: ${PORT}`);
    console.log(` URL Principal: http://localhost:${PORT}`);
    console.log(` URL Admin: http://localhost:${PORT}/kb/minda/two/paineel`);
    console.log(` Horário: ${new Date().toLocaleString('pt-BR')}`);
    console.log(` Versão: 2.0.0 (com painel administrativo integrado)`);
    console.log('='.repeat(50));


    // Registra a inicialização no sistema de logs
    LogManager.addLog('INFO', `Servidor Café Quente iniciado na porta ${PORT} com painel administrativo integrado`);
});