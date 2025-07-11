import { getObjProduto } from "./apibjt.js";
const dados = await getObjProduto();
const produto = new Produto(dados);
class Produto {
    constructor({ idprod = null, nomeprod = null, idcategoria = null, imgprod = null, disponivel = null } = {}) {
        this.idprod = idprod;
        this.nomeprod = nomeprod;
        this.idcategoria = idcategoria;
        this.imgprod = imgprod;
        this.disponivel = disponivel;
    }
    preencher({ idprod, nomeprod, idcategoria, disponivel }) {
        this.idprod = idprod;
        this.nomeprod = nomeprod;
        this.idcategoria = idcategoria;
        this.disponivel = disponivel;
        console.log(`dados preenchido sao:\n
            id: ${this.idprod}\n
            nome: ${this.nomeprod}\n
            categoria: ${this.idcategoria}\n
            `)
    }
    DAProduto() { //desativa ou ativa o produto
        if (this.disponivel == true) {
            this.disponivel = false
            console.warn("Produto desativado");
        } else if (this.disponivel == false) {
            this.disponivel = true
            console.warn("Produto ativado");
        }
    }
    async GoToBackend() {
        try {
            const response = await fetch('/api/obj-prod', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this)
            });
            const result = await response.json();
            if (result.success) {
                console.log('Produto salvo com sucesso');
                return true;
            } else {
                console.warn("Falha ao salvar o servidor ", result.message)
                return false;
            }
        } catch (error) {
            console.error('Erro ao enviar produto', error);
            return false;
        }
    }
    getImagemUrl() {
        return `/imagens/${this.imgprod}`;
    }
}

export { Produto }