/*
 * ===================================================================
 * MÓDULO DE DADOS ADMINISTRATIVOS - PROJETO CAFÉ QUENTE
 * ===================================================================
 * 
 * Este arquivo contém todos os dados relacionados à administração do sistema de totem.
 * Ele funciona como uma "base de dados" simples em memória, armazenando informações
 * sobre usuários administradores, configurações do sistema e dados de referência.
 * 
 * IMPORTANTE: Em um sistema de produção real, essas informações estariam em um
 * banco de dados seguro, não em um arquivo JavaScript. Este é apenas um exemplo
 * para desenvolvimento e demonstração.
 * 
 * ESTRUTURA DO ARQUIVO:
 * 1. Dados dos administradores (usuários que podem acessar o painel)
 * 2. Configurações gerais do sistema
 * 3. Categorias de produtos disponíveis
 * 4. Status possíveis para pedidos
 * 5. Métodos de pagamento aceitos
 */

/*
 * DADOS DOS ADMINISTRADORES
 * ========================
 * 
 * Esta lista contém todos os usuários que têm permissão para acessar o painel
 * administrativo do totem. Cada administrador tem:
 * - usuarioAdm: Nome de usuário para login
 * - senhaAdmin: Senha para login (em produção, seria criptografada!)
 * - role: Função/cargo do administrador (usado para controle de permissões)
 * 
 * COMO FUNCIONA:
 * Quando alguém tenta fazer login no painel administrativo, o sistema verifica
 * se o usuário e senha digitados existem nesta lista. Se existir, o login é
 * permitido; caso contrário, é negado.
 */
const adminData = [{
        usuarioAdm: 'Camavinga', // Nome de usuário
        senhaAdmin: '12345', // Senha (NUNCA faça isso em produção!)
        role: 'Apoiador Moral' // Função/cargo
    },
    {
        usuarioAdm: 'wl',
        senhaAdmin: '731',
        role: 'Pré Programador'
    },
    {
        usuarioAdm: 'jh',
        senhaAdmin: 'zeDamanga',
        role: 'Gestor de Código'
    },
    {
        usuarioAdm: 'admin',
        senhaAdmin: 'admin123',
        role: 'Super Administrador'
    }
];

/*
 * CONFIGURAÇÕES DO SISTEMA
 * ========================
 * 
 * Este objeto contém configurações gerais que controlam o comportamento
 * do sistema de totem. Essas configurações podem ser usadas tanto pelo
 * backend quanto pelo frontend para personalizar a experiência.
 * 
 * PROPRIEDADES:
 * - appName: Nome da aplicação (exibido na interface)
 * - version: Versão atual do software
 * - maxLoginAttempts: Quantas tentativas de login incorretas são permitidas
 * - sessionTimeout: Tempo em minutos que uma sessão fica ativa
 * - supportedLanguages: Idiomas suportados pelo sistema
 * - themes: Temas visuais disponíveis
 */
const systemConfig = {
    appName: 'Sistema de Gestão do Totem Café Quente',
    version: '1.0.0',
    maxLoginAttempts: 3, // Após 3 tentativas erradas, bloqueia temporariamente
    sessionTimeout: 30, // Sessão expira em 30 minutos de inatividade
    supportedLanguages: ['pt-BR', 'en-US', 'es-ES'],
    themes: ['light', 'dark']
};

/*
 * CATEGORIAS DE PRODUTOS
 * ======================
 * 
 * Define as categorias de produtos que podem ser vendidos no totem.
 * Cada categoria tem um ID único, nome amigável e um ícone emoji.
 * 
 * COMO É USADO:
 * - No painel administrativo: Para organizar produtos por categoria
 * - No totem do cliente: Para exibir produtos organizados por tipo
 * - Na validação: Para garantir que produtos sejam adicionados a categorias válidas
 */
const productCategories = [{
        id: 'lanche', // Identificador único da categoria
        nome: 'Lanche', // Nome exibido para o usuário
        icone: '🍔' // Ícone emoji para representar a categoria
    },
    {
        id: 'bebida',
        nome: 'Bebida',
        icone: '🥤'
    },
    {
        id: 'acompanhamento',
        nome: 'Acompanhamento',
        icone: '🍟'
    },
    {
        id: 'sobremesa',
        nome: 'Sobremesa',
        icone: '🍰'
    }
];

/*
 * STATUS DE PEDIDOS
 * =================
 * 
 * Define todos os possíveis status que um pedido pode ter durante seu ciclo de vida.
 * Cada status tem nome amigável, cor para exibição e ícone representativo.
 * 
 * FLUXO TÍPICO DE UM PEDIDO:
 * 1. selecting (cliente escolhendo produtos)
 * 2. payment (processando pagamento)
 * 3. preparing (cozinha preparando)
 * 4. ready (pronto para retirada)
 * 5. completed (entregue ao cliente)
 * 
 * COMO É USADO:
 * - Interface do totem: Para mostrar o progresso do pedido ao cliente
 * - Painel administrativo: Para acompanhar pedidos em tempo real
 * - Sistema de cozinha: Para organizar a fila de produção
 */
const orderStatus = {
    selecting: {
        nome: 'Selecionando', // Nome amigável do status
        cor: '#ffc107', // Cor amarela (atenção)
        icone: '🛒' // Ícone de carrinho de compras
    },
    payment: {
        nome: 'Pagamento',
        cor: '#17a2b8', // Cor azul (informação)
        icone: '💳'
    },
    preparing: {
        nome: 'Preparando',
        cor: '#fd7e14', // Cor laranja (em progresso)
        icone: '👨‍🍳'
    },
    ready: {
        nome: 'Pronto',
        cor: '#20c997', // Cor verde claro (quase concluído)
        icone: '✅'
    },
    completed: {
        nome: 'Concluído',
        cor: '#28a745', // Cor verde (sucesso)
        icone: '📦'
    },
    cancelled: {
        nome: 'Cancelado',
        cor: '#dc3545', // Cor vermelha (erro/cancelamento)
        icone: '❌'
    }
};

/*
 * MÉTODOS DE PAGAMENTO
 * ====================
 * 
 * Lista todos os métodos de pagamento aceitos pelo totem.
 * Cada método tem ID único, nome amigável e ícone representativo.
 * 
 * COMO É USADO:
 * - Interface do totem: Para exibir opções de pagamento ao cliente
 * - Processamento de pagamento: Para validar o método escolhido
 * - Relatórios: Para analisar preferências de pagamento dos clientes
 */
const paymentMethods = [{
        id: 'credit', // Identificador único do método
        nome: 'Cartão de Crédito', // Nome exibido ao cliente
        icone: '💳' // Ícone representativo
    },
    {
        id: 'debit',
        nome: 'Cartão de Débito',
        icone: '💳'
    },
    {
        id: 'pix',
        nome: 'PIX',
        icone: '📱'
    },
    {
        id: 'cash',
        nome: 'Dinheiro',
        icone: '💵'
    }
];

/*
 * EXPORTAÇÃO DOS MÓDULOS
 * ======================
 * 
 * Torna todos os dados disponíveis para outros arquivos do projeto.
 * Usando module.exports (padrão CommonJS) para compatibilidade com o
 * estilo do projeto Café Quente.
 */
module.exports = {
    adminData,
    systemConfig,
    productCategories,
    orderStatus,
    paymentMethods
};