
/**
 * Classe responsável por padronizar respostas da API
 * Princípio Single Responsibility: Uma única responsabilidade - formatar respostas
 */
class ResponseHandler {
    
    // Resposta de sucesso
    static success(res, data, message = 'Operação realizada com sucesso') {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    }

    // Resposta de erro
    static error(res, message = 'Erro interno do servidor', statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: true
        });
    }

    // Resposta de validação
    static validationError(res, message = 'Dados inválidos') {
        return res.status(400).json({
            success: false,
            message,
            error: true,
            type: 'validation'
        });
    }
}

module.exports = ResponseHandler;
