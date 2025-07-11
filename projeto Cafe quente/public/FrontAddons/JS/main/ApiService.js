
/**
 * Serviço responsável pela comunicação com a API
 * Princípio Single Responsibility: Uma única responsabilidade - comunicação HTTP
 */
class ApiService {
    
    // Envia nome do usuário para o backend
    static async updateUserName(nome) {
        try {
            const response = await fetch('/api/update-user', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ nome })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na comunicação com a API:', error);
            throw error;
        }
    }

    // Obtém dados do usuário do backend
    static async getUserData() {
        try {
            const response = await fetch('/api/user');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            throw error;
        }
    }
}

export default ApiService;
