console.error('JS CONECTADO');

import { getObjtData } from './apibjt.js';


// Seleciona o botão de login pelo ID
const loginButton = document.getElementById('login-button');

loginButton.addEventListener('click', async function(event) {
    event.preventDefault(); // Previne comportamento padrão

    const usuarioInput = document.getElementById('username');
    const senhaInput = document.getElementById('password');

    const usuarioDigitado = usuarioInput.value;
    const senhaDigitada = senhaInput.value;

    if (!usuarioDigitado || !senhaDigitada) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Aguarda os dados do backend
    const todosObjs = await getObjtData();

    let adminEncontrado = null;
    if (todosObjs) { // Verifica se veio algum dado
        adminEncontrado = todosObjs.find(admin =>
            admin.usuarioAdm === usuarioDigitado &&
            admin.senhaAdmin === senhaDigitada
        );
    }

    if (adminEncontrado) {
        alert(`Login bem-sucedido! Bem-vindo, ${adminEncontrado.usuarioAdm} (${adminEncontrado.role}).`);
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        senhaInput.value = '';

        // ATIVA PRIMEIRA SEÇÃO DO MENU
        const menuItems = document.querySelectorAll('.menu-item');
        const contentSections = document.querySelectorAll('.content-section');
        menuItems.forEach(btn => btn.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));

        if (menuItems.length > 0) {
            menuItems[0].classList.add('active');
            const firstSectionId = menuItems[0].dataset.target;
            const firstSection = document.getElementById(firstSectionId);
            if (firstSection) {
                firstSection.classList.add('active');
            }
        }
    } else {
        alert("Usuário ou senha incorretos.");
        senhaInput.value = '';
    }
});


// --- Lógica para navegação do menu e exibição das seções (mantida da versão anterior) ---
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const logoutButton = document.getElementById('logout-button');

    // Função para mostrar a seção ativa e esconder as outras
    function showSection(targetId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Adiciona event listeners aos itens do menu lateral
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove a classe 'active' de todos os itens do menu
            menuItems.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao item clicado
            item.classList.add('active');
            // Mostra a seção correspondente usando o atributo data-target
            showSection(item.dataset.target);
        });
    });

    // Define o primeiro item do menu como ativo por padrão e mostra sua seção ao carregar
    // Garante que a tela principal só seja ativada após o login
    // Esta parte só deve ser executada se a tela principal já estiver ativa (após login)
    // Ou pode ser movida para dentro do bloco de sucesso do login.
    // Por enquanto, vamos manter aqui, mas o display: none inicial do #main-app garante que não apareça antes.
    if (menuItems.length > 0) {
        // Não ative a primeira seção aqui, pois a tela principal começa escondida.
        // A ativação da primeira seção ocorrerá quando o #main-app for ativado após o login.
        // Apenas para garantir que o primeiro item do menu tenha a classe 'active' se o usuário já estiver logado
        // e recarregar a página (o que não acontece neste setup simples, mas é boa prática).
        // Para este cenário, a ativação da primeira seção deve ser feita após o login bem-sucedido.
    }


    // Lógica para o botão de sair
    logoutButton.addEventListener('click', () => {
        alert("Saindo..."); // Mensagem de saída
        // Esconde a tela principal e mostra a tela de login
        document.getElementById('main-app').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        // Limpar campos de login
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        // Remove a classe 'active' de todos os itens do menu ao sair
        menuItems.forEach(btn => btn.classList.remove('active'));
        // Esconde todas as seções de conteúdo ao sair
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
    });

    // Adiciona esta parte para garantir que a primeira seção seja exibida
    // APENAS QUANDO A TELA PRINCIPAL FOR ATIVADA (após o login)
    // Isso pode ser feito de forma mais elegante, mas para este setup,
    // podemos adicionar uma verificação ou chamar showSection após o login.
    // Por simplicidade, vou adicionar uma chamada aqui que só terá efeito
    // se o #main-app estiver visível.
    // Melhor abordagem: Chamar showSection('dashboard') dentro do bloco de sucesso do login.
    // Vou mover essa lógica para lá.
});

// Modificação: Chamar showSection('dashboard') após o login bem-sucedido
// (Isso já está feito no bloco do loginButton.addEventListener)
// Para garantir que o primeiro item do menu seja selecionado ao entrar:
// No bloco de sucesso do login:
// const menuItems = document.querySelectorAll('.menu-item');
// if (menuItems.length > 0) {
//     menuItems[0].classList.add('active');
//     showSection(menuItems[0].dataset.target); // Chama a função para exibir a primeira seção
// }
// Vou adicionar isso ao código do login.

// --- Refatorando a parte de ativação inicial da seção após o login ---
// O código abaixo é uma melhoria para garantir que a primeira seção do menu
// seja ativada e exibida corretamente após um login bem-sucedido.
loginButton.addEventListener('click', function(event) {
    // ... (código de validação de login existente) ...

    if (adminEncontrado) {
        alert(`Login bem-sucedido! Bem-vindo, ${adminEncontrado.usuarioAdm} (${adminEncontrado.role}).`);
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        senhaInput.value = '';

        // ATIVAÇÃO DA PRIMEIRA SEÇÃO DO MENU APÓS O LOGIN
        const menuItems = document.querySelectorAll('.menu-item');
        const contentSections = document.querySelectorAll('.content-section');

        // Remove 'active' de todos os itens do menu e seções de conteúdo
        menuItems.forEach(btn => btn.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));

        // Ativa o primeiro item do menu e sua seção correspondente
        if (menuItems.length > 0) {
            menuItems[0].classList.add('active');
            const firstSectionId = menuItems[0].dataset.target;
            const firstSection = document.getElementById(firstSectionId);
            if (firstSection) {
                firstSection.classList.add('active');
            }
        }

    } else {
        alert("Usuário ou senha incorretos.");
        senhaInput.value = '';
    }
});

// O bloco document.addEventListener('DOMContentLoaded') agora só precisa do logout e da lógica de navegação do menu
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const logoutButton = document.getElementById('logout-button');

    // Função para mostrar a seção ativa e esconder as outras
    function showSection(targetId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Adiciona event listeners aos itens do menu lateral
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            showSection(item.dataset.target);
        });
    });

    // Lógica para o botão de sair
    logoutButton.addEventListener('click', () => {
        alert("Saindo...");
        document.getElementById('main-app').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        menuItems.forEach(btn => btn.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
    });
});