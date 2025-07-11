import { Produto } from "./produto.js";
import { idprod, nome, categoria, preco, imagem } from "./gProduto.js";
const produto = new Produto();
Produto.preencher({ idprod, nome, categoria, preco, imagem });
Produto.GotoBackend();
