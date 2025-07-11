/**
 * Serviço responsável pelo gerenciamento do localStorage
 * Princípio Single Responsibility: Uma única responsabilidade - gerenciar armazenamento local
 */
class LocalStorageService {

    // Salva nome do pedido no localStorage
    static saveOrderName(nome) {
        try {
            localStorage.setItem('nomeCliente', nome);
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    // Obtém nome do pedido do localStorage
    static getOrderName() {
        try {
            return localStorage.getItem('nomeCliente');
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return null;
        }
    }

    // Remove nome do pedido do localStorage
    static clearOrderName() {
        try {
            localStorage.removeItem('nomeCliente');
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
        }
    }
}

export default LocalStorageService;