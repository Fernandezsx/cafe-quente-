
const express = require('express');
const router = express.Router();
const UserService = require('./UserService');
const ResponseHandler = require('./ResponseHandler');

// Instância única do serviço de usuário (Singleton pattern)
const userService = new UserService();

/**
 * Controlador para atualizar dados do usuário
 * Princípio Single Responsibility: Controla apenas operações de usuário
 * Princípio Dependency Inversion: Depende de abstrações (UserService)
 */
class UserController {
    
    // Atualiza nome do usuário
    static async updateUserName(req, res) {
        try {
            const { nome } = req.body;

            // Validação usando o serviço
            if (!userService.isValidName(nome)) {
                return ResponseHandler.validationError(res, 'Nome inválido. Por favor, forneça um nome válido.');
            }

            // Atualiza o usuário
            const updatedUser = userService.updateUser({ nome: nome.trim() });
            
            console.log(`Nome do usuário atualizado: ${nome}`);
            
            return ResponseHandler.success(res, { user: updatedUser }, 'Nome atualizado com sucesso');
            
        } catch (error) {
            console.error('Erro ao atualizar nome do usuário:', error);
            return ResponseHandler.error(res, 'Erro interno do servidor');
        }
    }

    // Obtém dados do usuário atual
    static async getUserData(req, res) {
        try {
            const userData = userService.getUser();
            return ResponseHandler.success(res, { user: userData }, 'Dados do usuário obtidos com sucesso');
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            return ResponseHandler.error(res, 'Erro interno do servidor');
        }
    }
}

// Rotas da API
router.post('/update-user', UserController.updateUserName);
router.get('/user', UserController.getUserData);

module.exports = router;
