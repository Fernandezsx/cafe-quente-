
/**
 * Serviço responsável por gerenciar dados do usuário
 * Princípio Single Responsibility: Uma única responsabilidade - gerenciar usuários
 */
class UserService {
    constructor() {
        this.user = {
            nome: null,
            numeroPedido: null,
            cpf: null,
            precoPedido: null
        };
    }

    // Atualiza dados do usuário
    updateUser(newData) {
        if (!newData || typeof newData !== 'object') {
            throw new Error('Dados inválidos para atualização do usuário');
        }
        
        Object.assign(this.user, newData);
        return this.user;
    }

    // Obtém dados do usuário
    getUser() {
        return { ...this.user }; // Retorna uma cópia para evitar modificações diretas
    }

    // Valida se o nome é válido
    isValidName(nome) {
        return nome && typeof nome === 'string' && nome.trim().length > 0;
    }

    // Limpa dados do usuário
    clearUser() {
        this.user = {
            nome: null,
            numeroPedido: null,
            cpf: null,
            precoPedido: null
        };
    }
}

module.exports = UserService;
