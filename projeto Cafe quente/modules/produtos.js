class produto {
    constructor({ idprod = null, nomeProd = null, idCategoria = null, preco = null, imgProd = null, disponivel = null } = {}) {
        this.idprod = idprod;
        this.nomeProd = nomeProd;
        this.idCategoria = idCategoria;
        this.preco = preco;
        this.imgProd = imgProd;
        this.disponivel = disponivel;
    }
}
module.exports = produto;