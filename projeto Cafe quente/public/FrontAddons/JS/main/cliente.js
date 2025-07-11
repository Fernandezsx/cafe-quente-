// Lista com todos os usuários salvos
let usuarios = [];

// Objeto temporário que armazena o usuário sendo preenchido
let usuarioAtual = null;

// Gera o próximo ID automaticamente
function proxID() {
    if (usuarios.length === 0) return 1;
    return Math.max(...usuarios.map((u) => u.id)) + 1;
}

// Cria um novo usuário, se ainda não houver um sendo preenchido
function createUser() {
    if (usuarioAtual === null) {
        usuarioAtual = {
            id: proxID(),
            nome: null,
            cpf: null,
        };
    }
    return usuarioAtual;
}

function gerarIDPedido() {
    return "PED-" + Date.now();
}

// Preenche o nome do usuário atual
async function attNome(nome) {
    const usuario = createUser(); // garante que o usuário atual exista
    usuario.nome = nome; // define o nome
    console.warn(
        `nome do usuário registrado ${usuario.nome}\n nome digitado ${nome}`,
    );
    localStorage.setItem("nomeCliente", nome);
    console.error("todos itens do usuário", usuario);
    verificarSePodeSalvar(); // verifica se já pode salvar
}

// Preenche o CPF do usuário atual
async function attCpf(cpf) {
    console.error("Cpf registrado", cpf);

    const usuario = createUser(); // garante que o usuário atual exista
    usuario.cpf = cpf; // define o CPF
    console.error("todos itens do usuário atual", usuario);
    localStorage.setItem("cpf", cpf);
    verificarSePodeSalvar(); // verifica se já pode salvará pode salvar
}

function gerarEmailCliente(usuario) {
    // Se o cliente já tem e-mail, usa ele
    if (usuario && usuario.email) {
        return usuario.email;
    }

    // Se não tem, gera um e-mail fake único com timestamp
    const nomeBase =
        usuario && usuario.nome
            ? usuario.nome.trim().replace(/\s+/g, "").toLowerCase()
            : "anonimo";

    const timestamp = Date.now();
    return `${nomeBase}_${timestamp}@totem.com`;
}

function criarPedido() {
    const carrinhoItens = JSON.parse(localStorage.getItem("cartItems") || "[]");
    console.log("Carrinho lido:", carrinhoItens);
    const total = carrinhoItens.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0,
    );
    const usuarioNome = localStorage.getItem("nomeCliente") || null;
    console.log("Usuario nome lido:", usuarioNome);
    const usuarioCpf = localStorage.getItem("cpf") || null;
    console.log("Usuario CPF lido:", usuarioCpf);
    const email = gerarEmailCliente({ nome: usuarioNome, cpf: usuarioCpf });
    const mPagamento = localStorage.getItem("metodoPag") || "pix";
    console.log("Método de pagamento:", mPagamento);

    const pedido = {
        id: gerarIDPedido(),
        cliente: {
            nome: usuarioNome,
            cpf: usuarioCpf,
            email: email,
        },
        itens: carrinhoItens.map((item) => ({
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade,
            subtotal: item.preco * item.quantidade,
        })),
        total: total,
        dataHora: new Date().toISOString(),
        pagamento: {
            metodo: mPagamento,
            cpfNaNota: usuarioCpf ? true : false,
        },
    };

    localStorage.setItem("pedidoAtual", JSON.stringify(pedido));
    console.warn("Pedido criado:", pedido);

    return pedido;
}

// Verifica se o usuário atual está completo (nome + cpf)
// Se estiver, salva no array e no localStorage
async function verificarSePodeSalvar() {
    const usuario = usuarioAtual;

    if (usuario && usuario.nome && usuario.cpf) {
        usuarios.push(usuario); // adiciona ao array de usuários
        localStorage.setItem("usuarioAtual", JSON.stringify(usuario)); // salva no localStorage
        console.log("Usuário salvo:", usuario);
        usuarioAtual = null; // limpa para permitir o cadastro de outro
    } else {
        console.log("Aguardando mais informações...");
    }
}

// Envia os dados do cliente para o backend usando fetch()
async function iniciarPagamento() {
    const nomeCliente = localStorage.getItem("nomeCliente");
    const cpfCliente = localStorage.getItem("cpf");

    if (nomeCliente || cpfCliente) {
        const pedido = criarPedido();

        try {
            const response = await fetch("/api/pedido", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(pedido),
            });

            const result = await response.json();

            if (result.success) {
                const linkPagamento = result.linkPagamento;

                // Redireciona o usuário para o checkout do Mercado Pago
                window.location.href = linkPagamento;
            } else {
                console.error("Erro ao iniciar pagamento:", result.message);
            }
        } catch (error) {
            console.error("Erro ao iniciar pagamento:", error);
        }
    } else {
        console.log("Informações do cliente incompletas.");
    }
}

async function finalizarPedido() {
    const usuario =
        usuarioAtual || JSON.parse(localStorage.getItem("usuarioAtual")) || {};

    if (usuario && usuario.nome && usuario.cpf) {
        const pedido = criarPedido();
        // await enviarBackend(pedido);
        console.log("Pedido finalizado:", pedido);

        // Limpa o carrinho e o cliente atual
        localStorage.removeItem("carrinhoItens");
        usuarioAtual = null;
    } else {
        console.log("Informações do cliente incompletas.");
    }
}

// Exporta as funções para serem usadas em outro arquivo (caso esteja usando módulos)
export {
    createUser,
    attNome,
    attCpf,
    usuarios,
    criarPedido,
    iniciarPagamento,
    finalizarPedido
};