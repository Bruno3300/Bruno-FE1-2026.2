// Dados genéricos
export function lerDados(chave, valorPadrao = null) {
    const dados = localStorage.getItem(chave);

    return dados === null ? valorPadrao : JSON.parse(dados);
}

export function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

export function removerDados(chave) {
    localStorage.removeItem(chave);
}


// Clientes
export function carregarClientes() {
    return lerDados('clientes', []);
}

export function salvarClientes(cliente) {
    const clientes = carregarClientes();

    clientes.push(cliente);

    salvarDados('clientes', clientes);
}

export function buscarClientePorId(id) {
    return carregarClientes().find(cliente => cliente.id === id) || null;
}

export function atualizarCliente(clienteAtualizado) {
    const clientes = carregarClientes();

    const indice = clientes.findIndex(
        cliente => cliente.id === clienteAtualizado.id
    );

    if (indice === -1) {
        return false;
    }

    clientes[indice] = clienteAtualizado;

    salvarDados('clientes', clientes);

    return true;
}

export function removerCliente(id) {
    const clientes = carregarClientes();

    const novosClientes = clientes.filter(cliente => cliente.id !== id);

    if (novosClientes.length === clientes.length) {
        return false;
    }

    salvarDados('clientes', novosClientes);

    return true;
}


// Carrinhos (um único objeto: { visitante: [...], C001: [...], ... })
export function carregarCarrinho(id = 'visitante') {
    return lerDados('carrinhos', {})[id] || [];
}

export function salvarCarrinho(carrinho, id = 'visitante') {
    const carrinhos = lerDados('carrinhos', {});

    carrinhos[id] = carrinho;

    salvarDados('carrinhos', carrinhos);
}

export function removerCarrinho(id = 'visitante') {
    const carrinhos = lerDados('carrinhos', {});

    delete carrinhos[id];

    salvarDados('carrinhos', carrinhos);
}
