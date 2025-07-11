/*
 * ===================================================================
 * GERENCIADORES DO SISTEMA - PROJETO CAFÉ QUENTE
 * ===================================================================
 * 
 * Este arquivo contém todas as classes responsáveis por gerenciar diferentes
 * aspectos do sistema de totem. Cada classe é especializada em uma área específica:
 * 
 * 1. AuthManager - Gerencia autenticação e sessões de usuários
 * 2. DashboardManager - Fornece dados para o painel de controle
 * 3. ProductManager - Gerencia produtos do cardápio
 * 4. LogManager - Registra e gerencia logs do sistema
 * 
 * PADRÃO DE DESIGN:
 * Todas as classes usam métodos estáticos, funcionando como "singletons"
 * (uma única instância global). Isso simplifica o uso e garante que todos
 * os dados sejam compartilhados entre diferentes partes do sistema.
 */

// Importa os dados administrativos
const { adminData, orderStatus } = require('./adminData');

/*
 * GERENCIADOR DE AUTENTICAÇÃO
 * ===========================
 * 
 * Responsável por validar credenciais de login e gerenciar sessões de usuários.
 * 
 * FUNCIONALIDADES:
 * - Validar usuário e senha contra a base de dados
 * - Gerar sessões únicas para usuários logados
 * - Controlar acesso ao painel administrativo
 */
class AuthManager {
    /*
     * VALIDAR CREDENCIAIS
     * ===================
     * 
     * Verifica se o usuário e senha fornecidos existem na base de dados.
     * 
     * PARÂMETROS:
     * - username: Nome de usuário digitado
     * - password: Senha digitada
     * 
     * RETORNO:
     * - Objeto do usuário se as credenciais estiverem corretas
     * - null se as credenciais estiverem incorretas
     * 
     * COMO FUNCIONA:
     * 1. Procura na lista adminData por um usuário com o nome fornecido
     * 2. Verifica se a senha confere
     * 3. Retorna o usuário completo (com role) ou null
     */
    static validateCredentials(username, password) {
        return adminData.find(admin => 
            admin.usuarioAdm === username && admin.senhaAdmin === password
        ) || null;
    }

    /*
     * GERAR SESSÃO
     * ============
     * 
     * Cria uma sessão única para um usuário que fez login com sucesso.
     * 
     * PARÂMETROS:
     * - user: Objeto do usuário (retornado por validateCredentials)
     * 
     * RETORNO:
     * - Objeto de sessão com ID único, dados do usuário e timestamp
     * 
     * COMO FUNCIONA:
     * 1. Gera um ID aleatório para a sessão
     * 2. Armazena os dados do usuário
     * 3. Registra o momento da criação da sessão
     * 
     * USO DA SESSÃO:
     * O ID da sessão pode ser usado para manter o usuário logado
     * e verificar permissões em requisições futuras.
     */
    static generateSession(user) {
        return {
            id: Math.random().toString(36).substr(2, 9),    // ID aleatório
            user: user,                                      // Dados do usuário
            timestamp: new Date().toISOString()             // Momento da criação
        };
    }
}

/*
 * GERENCIADOR DO DASHBOARD
 * ========================
 * 
 * Fornece dados estatísticos e informações em tempo real para o painel
 * de controle administrativo.
 * 
 * FUNCIONALIDADES:
 * - Estatísticas gerais do dia (vendas, pedidos, etc.)
 * - Lista de pedidos em tempo real
 * - Métricas de desempenho do totem
 */
class DashboardManager {
    /*
     * OBTER ESTATÍSTICAS DO DASHBOARD
     * ===============================
     * 
     * Retorna as principais métricas do dia para exibir no painel.
     * 
     * RETORNO:
     * - Objeto com estatísticas do dia atual
     * 
     * DADOS INCLUÍDOS:
     * - pedidosHoje: Número de pedidos realizados hoje
     * - faturamentoHoje: Valor total faturado hoje
     * - tempoMedioPedido: Tempo médio para completar um pedido (em minutos)
     * - produtosAtivos: Número de produtos disponíveis no cardápio
     * - timestamp: Momento da consulta
     * 
     * NOTA: Em um sistema real, esses dados viriam de um banco de dados
     * com consultas que filtram por data, calculam médias, etc.
     */
    static getDashboardStats() {
        return {
            pedidosHoje: 150,                               // Pedidos do dia
            faturamentoHoje: 2500.00,                       // Faturamento em R$
            tempoMedioPedido: 3,                            // Tempo em minutos
            produtosAtivos: 45,                             // Produtos disponíveis
            timestamp: new Date().toISOString()             // Momento da consulta
        };
    }

    /*
     * OBTER PEDIDOS EM TEMPO REAL
     * ===========================
     * 
     * Retorna uma lista dos pedidos que estão sendo processados no momento.
     * 
     * RETORNO:
     * - Array de objetos representando pedidos ativos
     * 
     * DADOS DE CADA PEDIDO:
     * - id: Número único do pedido
     * - status: Status atual (selecting, payment, preparing, etc.)
     * - tempo: Tempo decorrido desde o início do pedido
     * - itens: Descrição dos produtos pedidos
     * - valor: Valor total do pedido
     * - pagamento: Método de pagamento escolhido
     * 
     * COMO É USADO:
     * - Painel administrativo: Para acompanhar pedidos em andamento
     * - Sistema de cozinha: Para organizar a fila de produção
     * - Atendimento: Para auxiliar clientes com dúvidas sobre seus pedidos
     */
    static getRealtimeOrders() {
        return [
            {
                id: 12345,
                status: 'selecting',                        // Cliente ainda escolhendo
                tempo: '00:05',                             // 5 minutos no totem
                itens: '1x Lanche X, 1x Refri Y',
                valor: 20.00,
                pagamento: 'Cartão de Crédito'
            },
            {
                id: 12346,
                status: 'payment',                          // Processando pagamento
                tempo: '00:02',
                itens: '2x Lanche Z',
                valor: 30.00,
                pagamento: 'Pix'
            },
            {
                id: 12347,
                status: 'completed',                        // Pedido finalizado
                tempo: '00:08',
                itens: '1x Acompanhamento A',
                valor: 10.00,
                pagamento: 'Dinheiro'
            }
        ];
    }
}

/*
 * GERENCIADOR DE PRODUTOS
 * =======================
 * 
 * Gerencia o cardápio do totem: adicionar, editar, ativar/desativar produtos.
 * 
 * FUNCIONALIDADES:
 * - Listar todos os produtos
 * - Adicionar novos produtos
 * - Editar produtos existentes
 * - Ativar/desativar produtos
 * 
 * ESTRUTURA DE UM PRODUTO:
 * - id: Identificador único
 * - nome: Nome do produto
 * - preco: Preço em reais
 * - categoria: Categoria do produto (lanche, bebida, etc.)
 * - ativo: Se o produto está disponível para venda
 * - imagem: URL da imagem do produto
 */
class ProductManager {
    /*
     * LISTA DE PRODUTOS
     * =================
     * 
     * Array estático que armazena todos os produtos do cardápio.
     * Em um sistema real, isso seria uma tabela no banco de dados.
     */
    static products = [
        {
            id: 1,
            nome: 'X-Burger Café Quente',
            preco: 15.00,
            categoria: 'lanche',
            ativo: true,
            imagem: 'https://via.placeholder.com/100x100?text=X-Burger'
        },
        {
            id: 2,
            nome: 'Refrigerante Cola',
            preco: 7.00,
            categoria: 'bebida',
            ativo: true,
            imagem: 'https://via.placeholder.com/100x100?text=Cola'
        },
        {
            id: 3,
            nome: 'Batata Frita',
            preco: 8.50,
            categoria: 'acompanhamento',
            ativo: true,
            imagem: 'https://via.placeholder.com/100x100?text=Batata'
        }
    ];

    /*
     * OBTER TODOS OS PRODUTOS
     * =======================
     * 
     * Retorna a lista completa de produtos do cardápio.
     * 
     * RETORNO:
     * - Array com todos os produtos (ativos e inativos)
     * 
     * USO:
     * - Painel administrativo: Para exibir e gerenciar o cardápio
     * - Interface do totem: Para mostrar produtos disponíveis (filtrar apenas ativos)
     */
    static getAllProducts() {
        return this.products;
    }

    /*
     * ADICIONAR PRODUTO
     * =================
     * 
     * Adiciona um novo produto ao cardápio.
     * 
     * PARÂMETROS:
     * - productData: Objeto com dados do produto (nome, preço, categoria, etc.)
     * 
     * RETORNO:
     * - Objeto do produto criado (com ID gerado automaticamente)
     * 
     * COMO FUNCIONA:
     * 1. Gera um novo ID baseado no tamanho atual da lista
     * 2. Combina os dados fornecidos com valores padrão
     * 3. Adiciona o produto à lista
     * 4. Retorna o produto criado
     */
    static addProduct(productData) {
        const newProduct = {
            id: this.products.length + 1,                  // ID sequencial
            ...productData,                                 // Dados fornecidos
            ativo: true                                     // Novo produto sempre ativo
        };
        this.products.push(newProduct);
        return newProduct;
    }

    /*
     * ATUALIZAR PRODUTO
     * =================
     * 
     * Atualiza as informações de um produto existente.
     * 
     * PARÂMETROS:
     * - id: ID do produto a ser atualizado
     * - updates: Objeto com as propriedades a serem atualizadas
     * 
     * RETORNO:
     * - Produto atualizado se encontrado
     * - null se o produto não existir
     * 
     * COMO FUNCIONA:
     * 1. Procura o produto pelo ID
     * 2. Se encontrado, mescla as atualizações com os dados existentes
     * 3. Retorna o produto atualizado
     */
    static updateProduct(id, updates) {
        const productIndex = this.products.findIndex(p => p.id === parseInt(id));
        if (productIndex !== -1) {
            // Mescla os dados existentes com as atualizações
            this.products[productIndex] = { 
                ...this.products[productIndex], 
                ...updates 
            };
            return this.products[productIndex];
        }
        return null;
    }

    /*
     * ALTERNAR STATUS DO PRODUTO
     * ==========================
     * 
     * Ativa ou desativa um produto (toggle).
     * 
     * PARÂMETROS:
     * - id: ID do produto
     * 
     * RETORNO:
     * - Produto com status alterado se encontrado
     * - null se o produto não existir
     * 
     * USO PRÁTICO:
     * Quando um ingrediente acaba, o produto pode ser desativado temporariamente.
     * Quando o ingrediente é reposto, o produto é reativado.
     */
    static toggleProductStatus(id) {
        const product = this.products.find(p => p.id === parseInt(id));
        if (product) {
            product.ativo = !product.ativo;                // Inverte o status
            return product;
        }
        return null;
    }
}

/*
 * GERENCIADOR DE LOGS
 * ===================
 * 
 * Registra e gerencia todos os eventos que acontecem no sistema.
 * 
 * FUNCIONALIDADES:
 * - Registrar eventos do sistema (logins, erros, ações administrativas)
 * - Listar logs para auditoria
 * - Categorizar logs por tipo (INFO, ERRO, AVISO)
 * 
 * TIPOS DE LOG:
 * - INFO: Informações gerais (login, logout, ações normais)
 * - AVISO: Situações que merecem atenção (tentativas de login falhadas)
 * - ERRO: Problemas que afetam o funcionamento (falhas de hardware, erros de sistema)
 */
class LogManager {
    /*
     * LISTA DE LOGS
     * =============
     * 
     * Array estático que armazena todos os logs do sistema.
     * Em produção, isso seria uma tabela de banco de dados com milhares de registros.
     */
    static logs = [
        { 
            tipo: 'ERRO', 
            timestamp: '2025-06-19 14:30:01', 
            mensagem: 'Falha na conexão com a impressora de recibos.' 
        },
        { 
            tipo: 'INFO', 
            timestamp: '2025-06-19 14:25:00', 
            mensagem: 'Sistema Café Quente inicializado com sucesso.' 
        },
        { 
            tipo: 'AVISO', 
            timestamp: '2025-06-19 14:15:30', 
            mensagem: 'Baixo nível de papel na impressora.' 
        },
        { 
            tipo: 'ERRO', 
            timestamp: '2025-06-19 13:50:10', 
            mensagem: 'Falha ao processar pagamento do pedido #12340.' 
        }
    ];

    /*
     * OBTER TODOS OS LOGS
     * ===================
     * 
     * Retorna a lista completa de logs do sistema.
     * 
     * RETORNO:
     * - Array com todos os logs, ordenados do mais recente para o mais antigo
     * 
     * USO:
     * - Painel administrativo: Para monitorar a saúde do sistema
     * - Auditoria: Para investigar problemas ou comportamentos suspeitos
     * - Manutenção: Para identificar padrões de falhas
     */
    static getAllLogs() {
        return this.logs;
    }

    /*
     * ADICIONAR LOG
     * =============
     * 
     * Registra um novo evento no sistema.
     * 
     * PARÂMETROS:
     * - tipo: Tipo do log (INFO, AVISO, ERRO)
     * - mensagem: Descrição do evento
     * 
     * RETORNO:
     * - Objeto do log criado
     * 
     * COMO FUNCIONA:
     * 1. Cria um novo objeto de log com timestamp atual
     * 2. Adiciona no início da lista (logs mais recentes primeiro)
     * 3. Retorna o log criado
     * 
     * EXEMPLO DE USO:
     * LogManager.addLog('INFO', 'Usuário admin fez login');
     * LogManager.addLog('ERRO', 'Falha ao conectar com o banco de dados');
     */
    static addLog(tipo, mensagem) {
        const newLog = {
            tipo,
            timestamp: new Date().toLocaleString('pt-BR'),  // Data/hora em português
            mensagem
        };
        this.logs.unshift(newLog);                          // Adiciona no início da lista
        return newLog;
    }

    /*
     * OBTER EVENTOS DO SISTEMA
     * ========================
     * 
     * Retorna eventos importantes do sistema (diferentes dos logs técnicos).
     * 
     * RETORNO:
     * - Array de eventos administrativos importantes
     * 
     * DIFERENÇA ENTRE LOGS E EVENTOS:
     * - Logs: Registros técnicos detalhados (para desenvolvedores/técnicos)
     * - Eventos: Ações administrativas importantes (para gerentes/supervisores)
     * 
     * EXEMPLOS DE EVENTOS:
     * - Produtos ativados/desativados
     * - Promoções aplicadas
     * - Mudanças de configuração
     */
    static getSystemEvents() {
        return [
            { 
                timestamp: '2025-06-19 14:35:10', 
                evento: 'Produto "X-Burger Café Quente" desativado por admin.' 
            },
            { 
                timestamp: '2025-06-19 14:32:05', 
                evento: 'Nova promoção "Combo Café Quente - 15% de desconto" aplicada.' 
            },
            { 
                timestamp: '2025-06-19 10:00:00', 
                evento: 'Modo de atendimento ativado para o turno da manhã.' 
            }
        ];
    }
}

/*
 * EXPORTAÇÃO DOS GERENCIADORES
 * ============================
 * 
 * Torna todas as classes disponíveis para outros arquivos do projeto.
 * Usando module.exports (padrão CommonJS) para compatibilidade.
 */
module.exports = {
    AuthManager,
    DashboardManager,
    ProductManager,
    LogManager
};

