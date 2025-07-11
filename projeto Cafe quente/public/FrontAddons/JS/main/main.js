import { armazenarNome } from './nomes.js';
import { CarProdutos } from './ApiProdutos.js';
import { showCarrossel, startInactivityTimer, resetInatividadeTimer, stopInactivityTimer, pararCarrossel, voltarParaApp, iniciarCarrossel } from './carrossel.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pedidoForm');
    const initialScreen = document.getElementById('initial-screen');
    const mainApp = document.getElementById('main-app');
    const carrossel = document.getElementById('carroça');
    const cancelar = document.getElementById('botao-cancelar');
    const finalizar = document.getElementById('botao-pedido') || document.getElementById('finalizar');
    const pedido = localStorage.getItem('pedido') || localStorage.getItem('nomeCliente');
    const btnEnviar = document.getElementById("btn-enviar");

    let inactivityTimer;
    let showFormTimer;

    console.log('JS conectado');

    function hideCarrosselAndShowForm() {
        if (carrossel) {
            carrossel.classList.remove('show');
            carrossel.style.display = 'none';
            pararCarrossel();
        }
        if (initialScreen) {
            initialScreen.style.display = 'flex';
        }
        stopInactivityTimer();
    }

    function showInitialForm() {
        if (showFormTimer) {
            clearTimeout(showFormTimer);
            showFormTimer = null;
        }
        if (carrossel) {
            carrossel.classList.remove('show');
            carrossel.style.display = 'none';
            pararCarrossel();
        }
        if (initialScreen) {
            initialScreen.style.display = 'flex';
        }
        startInactivityTimer();
    }

    function configurarListenersInteracao() {
        document.addEventListener('click', handleClick, true);
        document.addEventListener('touchstart', handleClick, true);
        document.addEventListener('keypress', handleClick, true);
        document.addEventListener('scroll', handleClick, true);
    }

    function handleClick(event) {
        if (carrossel && carrossel.style.display !== 'none') {
            console.log('Clique detectado - saindo do carrossel');
            voltarParaApp();
            setTimeout(() => {
                configurarListenersInteracao();
            }, 100);
        }
    }

    if (cancelar) {
        cancelar.addEventListener('click', () => {
            localStorage.removeItem("nomeCliente");
            localStorage.removeItem("pedido");
            location.reload();
        });
    }

    // Quando não houver pedido no localStorage (novo usuário ou estado inicial)
    if (!pedido) {
        console.warn("Não existe usuário - mostrando carrossel primeiro");

        // Limpa o localStorage logo antes de exibir o carrossel
        localStorage.removeItem("nomeCliente");
        localStorage.removeItem("pedido");

        // Exibe o carrossel sem depender do pedido ou nome
        if (carrossel) {
            carrossel.style.display = 'flex';
            setTimeout(() => {
                carrossel.classList.add('show');
            }, 10);
            stopInactivityTimer();
            iniciarCarrossel(); // Inicia o carrossel
        }

        if (initialScreen) {
            initialScreen.style.display = 'none'; // Esconde o form
        }

        showFormTimer = setTimeout(showInitialForm, 10000); // 10 segundos

        // Define comportamento após interação do usuário
        const showFormOnInteraction = () => {
            showInitialForm();
            document.removeEventListener('click', showFormOnInteraction);
            document.removeEventListener('touchstart', showFormOnInteraction);
            document.removeEventListener('keypress', showFormOnInteraction);
        };

        document.addEventListener('click', showFormOnInteraction);
        document.addEventListener('touchstart', showFormOnInteraction);
        document.addEventListener('keypress', showFormOnInteraction);

        document.addEventListener('click', handleClick);

        if (form) {
            form.addEventListener('submit', async function(event) {
                event.preventDefault();
                const nomeArmazenado = armazenarNome();

                if (nomeArmazenado) {
                    if (initialScreen) {
                        initialScreen.style.opacity = '0';
                        initialScreen.style.transition = 'opacity 0.5s ease';

                        setTimeout(() => {
                            initialScreen.style.display = 'none';
                            if (mainApp) {
                                mainApp.style.display = 'flex';
                                mainApp.style.opacity = '0';
                                mainApp.style.transition = 'opacity 0.5s ease';

                                setTimeout(() => {
                                    mainApp.style.opacity = '1';
                                }, 50);

                                stopInactivityTimer();
                                CarProdutos();
                                startInactivityTimer();
                            }
                        }, 500);
                    }
                }
            });
        }

        if (btnEnviar) {
            btnEnviar.addEventListener("click", function() {
                if (showFormTimer) {
                    clearTimeout(showFormTimer);
                    showFormTimer = null;
                }

                // Adiciona as informações ao localStorage
                localStorage.setItem("nomeCliente", document.getElementById("nomeCliente").value);
                localStorage.setItem("mesaCliente", document.getElementById("mesaCliente").value);
                localStorage.setItem("pedido", "true");

                hideCarrosselAndShowForm();

                // Redireciona após a configuração inicial
                setTimeout(() => {
                    window.location.href = "/"; // Redireciona para a página principal
                }, 500);
            });
        }
    } else {
        // Caso o pedido já tenha sido feito
        console.log("Usuário já existe:", pedido);

        if (initialScreen) initialScreen.style.display = "none"; // Esconde a tela inicial
        if (carrossel) {
            carrossel.classList.remove('show');
            carrossel.style.display = "none";
        }
        if (mainApp) {
            mainApp.style.display = "flex";
            stopInactivityTimer();
            CarProdutos();
            if (finalizar) {
                finalizar.addEventListener("click", () => {
                    console.warn("Botão finalizar funcionando corretamente");
                    window.location.href = "/carrinho";
                });
            }
            startInactivityTimer();
        }
    }

    configurarListenersInteracao();

    // Resetando o timer de inatividade
    document.addEventListener('touchstart', resetInatividadeTimer);
    document.addEventListener('keypress', resetInatividadeTimer);
});