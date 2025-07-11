// modules/MandarJson.js
const path = require('path');
const fs = require('fs').promises;

async function salvarPedidoNoBanco(pedido) {
    const caminhoArquivo = path.join(__dirname, '..', 'data', 'cliente.json');

    try {
        let dadosExistentes = [];

        try {
            const conteudo = await fs.readFile(caminhoArquivo, 'utf-8');
            dadosExistentes = JSON.parse(conteudo);
        } catch (erroLeitura) {
            console.log('Arquivo cliente.json não encontrado ou vazio. Será criado.');
        }

        dadosExistentes.push(pedido);

        await fs.writeFile(caminhoArquivo, JSON.stringify(dadosExistentes, null, 2));

        console.log('Pedido salvo com sucesso no cliente.json');
    } catch (erro) {
        console.error('Erro ao salvar pedido no cliente.json:', erro);
    }
}

module.exports = { salvarPedidoNoBanco };