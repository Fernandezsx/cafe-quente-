const modal = document.getElementById('shw-pag');
const qrCodePlaceholder = document.getElementById('qr-code');

// Gera e injeta o QR Code
function gerarQrCode(link) {
    qrCodePlaceholder.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
        new QRCode(qrCodePlaceholder, { text: link });
    } else {
        // Fallback: usa API externa se QRCode.js não estiver presente
        qrCodePlaceholder.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(link)}" alt="QR Code">`;
    }
}

// Abre modal e envia o pedido para gerar QR
function abrirQrCode(pedido) {
    modal.classList.add('active');

    // Fecha ao clicar fora da área do conteúdo
    modal.addEventListener('click', e => {
        if (e.target === modal) fecharQrCode();
    });

    // Envia o pedido
    fetch('/api/pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        })
        .then(res => res.json())
        .then(resposta => {
            if (resposta.success) {
                gerarQrCode(resposta.linkPagamento);
            } else {
                alert("Erro ao gerar pagamento.");
            }
        })
        .catch(err => {
            console.error("Erro ao requisitar QR:", err);
            alert("Erro ao conectar com o servidor.");
        });
}

// Fecha o modal
function fecharQrCode() {
    modal.classList.remove('active');
    qrCodePlaceholder.innerHTML = ''; // limpa QR anterior
}

// Exporta se estiver usando módulos
export { abrirQrCode, fecharQrCode };