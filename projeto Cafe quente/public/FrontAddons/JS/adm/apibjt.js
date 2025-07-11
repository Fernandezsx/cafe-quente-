async function getObjtData() { // ta importando do backend os dados dos usuarios admins
    try {
        const response = await fetch('/api/obj-data')
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`)
        }
        const result = await response.json();
        if (result.success) {
            return result.data;
        } else {
            console.error('Erro no servidor ao obter obj.js');
            return null;
        }
    } catch (error) {
        console.error('Erro do servidor ao obter dados do obj.js ', error);
        return null;
    }
}

async function getObjProduto() {
    try {
        const response = await fetch('/api/obj-prod');
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}


export { getObjtData, getObjProduto };