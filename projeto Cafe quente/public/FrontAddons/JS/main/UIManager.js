/**
 * Gerenciador responsável pelas operações da interface do usuário
 * Princípio Single Responsibility: Uma única responsabilidade - gerenciar UI
 */
class UIManager {

    // Remove o efeito de blur do fundo
    static removeBlur() {
        document.body.classList.remove('blur-active');
    }

    // Adiciona o efeito de blur do fundo
    static addBlur() {
        document.body.classList.add('blur-active');
    }

    // Remove a caixa do formulário com animação
    static removeFormBox() {
        const totemBox = document.querySelector('.totem-main-box');

        if (totemBox) {
            totemBox.style.opacity = '0';

            // Remove o elemento após a animação
            setTimeout(() => {
                if (totemBox.parentNode) {
                    totemBox.remove();
                }
            }, 300);
        }
    }

    // Obtém o valor do campo nome
    static getNameInput() {
        const nameInput = document.querySelector('input[name="nome"]');
        return nameInput ? nameInput.value.trim() : '';
    }

    // Exibe mensagem de alerta
    static showAlert(message) {
        alert(message);
    }

    // Valida se o nome é válido
    static isValidName(nome) {
        return nome && nome.length > 0;
    }
}

export default UIManager;