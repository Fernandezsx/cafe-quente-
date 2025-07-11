
/**
 * Serviço responsável por gerenciar dados do administrador
 * Princípio Single Responsibility: Uma única responsabilidade - gerenciar admin
 */
class AdminService {
    constructor() {
        this.admin = {
            tempoEntrePedidos: null,
            senhaAdmin: null
        };
    }

    // Atualiza dados do admin
    updateAdmin(newData) {
        if (!newData || typeof newData !== 'object') {
            throw new Error('Dados inválidos para atualização do admin');
        }
        
        Object.assign(this.admin, newData);
        return this.admin;
    }

    // Obtém dados do admin
    getAdmin() {
        return { ...this.admin }; // Retorna uma cópia para evitar modificações diretas
    }

    // Valida senha do admin
    validatePassword(senha) {
        return senha === this.admin.senhaAdmin;
    }
}

module.exports = AdminService;
