
// Objetos compartilhados (idênticos ao front-end)
let user = {
    nome: null,
    numeroPedido: null,
    cpf: null,
    precoPedido: null
};

let admin = {
    tempoEntrePedidos: null,
    senhaAdmin: null
};

// Exporta os objetos
module.exports = {
    user,
    admin,
    // Funções para manipular os dados
    updateUser: (newData) => {
        Object.assign(user, newData);
        return user;
    },

    updateAdmin: (newData) => {
        Object.assign(admin, newData);
        return admin;
    }
};
