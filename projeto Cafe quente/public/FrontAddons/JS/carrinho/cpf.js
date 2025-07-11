const preenchercpf = document.getElementById('preenchercpf');
const cancelar = document.getElementById('cancelar');
const inputCpf = document.getElementById('preenchercpf')

// 🟢 Abrir o modal
function openCPFModal() {
    const modal = document.getElementById('sessaoCpf');
    console.warn("Abriu o bauio");

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    preenchercpf.focus();
}

// 🔴 Fechar o modal
function closeCPFModal() {
    const modal = document.getElementById('sessaoCpf');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// 🎯 Aplicar máscara de CPF enquanto digita
preenchercpf.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    let formatted = '';
    if (value.length > 0) formatted = value.substring(0, 3);
    if (value.length >= 4) formatted += '.' + value.substring(3, 6);
    if (value.length >= 7) formatted += '.' + value.substring(6, 9);
    if (value.length >= 10) formatted += '-' + value.substring(9, 11);

    e.target.value = formatted;
});

// ✅ Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove pontos e traços

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Rejeita todos iguais

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    if (digito1 !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    if (digito2 !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// 🔴 Botão de cancelar


export {
    openCPFModal,
    closeCPFModal,
    validarCPF
}