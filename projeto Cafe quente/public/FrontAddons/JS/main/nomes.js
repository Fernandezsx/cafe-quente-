import { createUser, attNome, attCpf, usuarios } from './cliente.js'

function armazenarNome() {
    const nameInput = document.querySelector('input[name="nome"]');

    if (!nameInput) {
        console.error("Campo de nome não encontrado!");
        return false;
    }

    const nome = nameInput.value.trim();

    if (!nome || nome.length === 0) {
        alert("Por favor, digite seu nome!");
        return false;
    }

    // Armazena o nome no localStorage
    localStorage.setItem("nomeCliente", nome);
    console.log("Nome armazenado:", nome);
    createUser();
    attNome(nome);

    return true;
}

function obterNome() {
    return localStorage.getItem("nomeCliente") || "";
}

export { armazenarNome, obterNome };