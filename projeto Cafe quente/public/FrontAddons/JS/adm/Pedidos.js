// Função para carregar e exibir pedidos do cliente.json
async function carregarPedidos() {
    try {
        console.log("🔄 Carregando pedidos do cliente.json...");
        
        const response = await fetch('/api/pedidoEspera');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const dados = await response.json();
        
        if (dados.success && dados.pedidos) {
            exibirPedidos(dados.pedidos);
        } else {
            console.log("📋 Nenhum pedido encontrado");
            exibirMensagemVazia();
        }
        
    } catch (error) {
        console.error("❌ Erro ao carregar pedidos:", error);
        exibirErro("Erro ao carregar pedidos. Tente novamente.");
    }
}

// Função para exibir os pedidos na lista
function exibirPedidos(pedidos) {
    const orderList = document.querySelector('.order-list');
    
    if (!orderList) {
        console.error("❌ Elemento .order-list não encontrado");
        return;
    }
    
    // Limpa a lista atual
    orderList.innerHTML = '';
    
    if (pedidos.length === 0) {
        exibirMensagemVazia();
        return;
    }
    
    // Cria os elementos HTML para cada pedido
    pedidos.forEach(pedido => {
        const orderItem = criarItemPedido(pedido);
        orderList.appendChild(orderItem);
    });
    
    console.log(`✅ ${pedidos.length} pedidos exibidos na lista`);
}

// Função para criar o HTML de um item de pedido
function criarItemPedido(pedido) {
    const orderItem = document.createElement('div');
    orderItem.className = `order-item ${obterClasseStatus(pedido.status)}`;
    
    // Formatar itens do pedido
    const itensTexto = pedido.itens.map(item => 
        `${item.quantidade}x ${item.nome}`
    ).join(', ');
    
    // Formatar data/hora
    const dataFormatada = formatarDataHora(pedido.dataHora);
    
    // Formatar valor total
    const valorFormatado = formatarValor(pedido.total);
    
    // Obter nome do método de pagamento
    const metodoPagamento = obterNomeMetodoPagamento(pedido.pagamento?.metodo);
    
    orderItem.innerHTML = `
        <div class="order-header">
            <h4>Pedido Nº ${pedido.id}</h4>
            <span class="order-status">${obterTextoStatus(pedido.status)}</span>
        </div>
        <p>Data/Hora: <span>${dataFormatada}</span></p>
        <p>Cliente: <span>${pedido.cliente.nome}</span></p>
        <div class="order-details">
            <p>Itens: ${itensTexto}</p>
            <p>Valor Total: ${valorFormatado}</p>
            <p>Forma de Pagamento: ${metodoPagamento}</p>
            ${pedido.cliente.cpf !== 'null' ? `<p>CPF: ${pedido.cliente.cpf}</p>` : ''}
        </div>
    `;
    
    return orderItem;
}

// Função para obter a classe CSS baseada no status
function obterClasseStatus(status) {
    const statusMap = {
        'aguardando_pagamento': 'status-payment',
        'pagamento_aprovado': 'status-completed',
        'preparando': 'status-selecting',
        'pronto': 'status-completed',
        'entregue': 'status-completed'
    };
    
    return statusMap[status] || 'status-selecting';
}

// Função para obter o texto do status
function obterTextoStatus(status) {
    const statusMap = {
        'aguardando_pagamento': 'Aguardando Pagamento',
        'pagamento_aprovado': 'Pagamento Aprovado',
        'preparando': 'Preparando',
        'pronto': 'Pronto',
        'entregue': 'Entregue'
    };
    
    return statusMap[status] || 'Processando';
}

// Função para formatar data/hora
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para formatar valor monetário
function formatarValor(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

// Função para obter nome do método de pagamento
function obterNomeMetodoPagamento(metodo) {
    const metodosMap = {
        'Pix': 'PIX',
        'credit': 'Cartão de Crédito',
        'debit': 'Cartão de Débito',
        'cash': 'Dinheiro'
    };
    
    return metodosMap[metodo] || metodo || 'Não informado';
}

// Função para exibir mensagem quando não há pedidos
function exibirMensagemVazia() {
    const orderList = document.querySelector('.order-list');
    if (orderList) {
        orderList.innerHTML = `
            <div class="order-item" style="text-align: center; padding: 2rem;">
                <h4>📋 Nenhum pedido encontrado</h4>
                <p>Quando os clientes fizerem pedidos, eles aparecerão aqui.</p>
            </div>
        `;
    }
}

// Função para exibir erro
function exibirErro(mensagem) {
    const orderList = document.querySelector('.order-list');
    if (orderList) {
        orderList.innerHTML = `
            <div class="order-item" style="text-align: center; padding: 2rem; border-left-color: #dc3545;">
                <h4>❌ Erro</h4>
                <p>${mensagem}</p>
                <button onclick="carregarPedidos()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Função para atualizar pedidos automaticamente
function iniciarAtualizacaoAutomatica() {
    // Carrega os pedidos imediatamente
    carregarPedidos();
    
    // Atualiza a cada 30 segundos
    setInterval(carregarPedidos, 30000);
}

// Exporta as funções para uso em outros arquivos
window.carregarPedidos = carregarPedidos;
window.iniciarAtualizacaoAutomatica = iniciarAtualizacaoAutomatica;

// Inicia a atualização automática quando a seção de pedidos for ativada
document.addEventListener('DOMContentLoaded', () => {
    // Observa quando a seção de pedidos em tempo real é ativada
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const realtimeOrdersSection = document.getElementById('realtime-orders');
                if (realtimeOrdersSection && realtimeOrdersSection.classList.contains('active')) {
                    // Só carrega os pedidos quando a seção estiver ativa
                    carregarPedidos();
                }
            }
        });
    });

    // Observa mudanças na seção de pedidos
    const realtimeOrdersSection = document.getElementById('realtime-orders');
    if (realtimeOrdersSection) {
        observer.observe(realtimeOrdersSection, { attributes: true });
        
        // Se a seção já estiver ativa, carrega os pedidos
        if (realtimeOrdersSection.classList.contains('active')) {
            carregarPedidos();
        }
    }
});

console.log("📋 Sistema de pedidos carregado");