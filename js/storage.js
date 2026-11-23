export function lerDados(chave, valorPadrao = null) {
    const dados = localStorage.getItem(chave);

    if (dados === null) {
        return valorPadrao;
    }

    return JSON.parse(dados);
}

export function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

export function removerDados(chave) {
    localStorage.removeItem(chave);
}

export function carregarClientes() {
    const clientes = lerDados('clientes', []);

    if (!Array.isArray(clientes)) {
        return [];
    }

    return clientes;
}

export function salvarClientes(cliente) {
    const clientes = carregarClientes();

    clientes.push(cliente);

    salvarDados('clientes', clientes);
}

export function buscarClientePorId(id) {
    const clientes = carregarClientes();

    return clientes.find(cliente => cliente.id === id) || null;
}

// Atualizar cliente
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


// Remover cliente
export function removerCliente(id) {
    const clientes = carregarClientes();

    const novosClientes = clientes.filter(
        cliente => cliente.id !== id
    );

    if (novosClientes.length === clientes.length) {
        return false;
    }

    salvarDados('clientes', novosClientes);

    return true;
}