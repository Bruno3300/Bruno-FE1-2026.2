
import { produtos } from '../data/produtos.js';

import { mostrarToast } from './ui.js';

import {
    carregarCarrinho,
    salvarCarrinho,
    removerCarrinho
} from './storage.js';

import {
    obterClienteLogado
} from './sessao.js';

import {
    formatarMoeda
} from './utils.js';


// Elementos do HTML
const tabelaCarrinho = document.getElementById('itens-carrinho');
const totalCarrinho = document.getElementById('carrinho-total');
const secaoCarrinho = document.getElementById('carrinho');


// Recuperar cliente logado
function obterIdCliente() {
    const cliente = obterClienteLogado();

    if (!cliente) {
        return null;
    }

    return cliente.id;
}


// Recuperar carrinho atual
function obterCarrinhoAtual() {
    const idCliente = obterIdCliente();

    return carregarCarrinho(idCliente);
}


// Salvar carrinho atual
function salvarCarrinhoAtual(carrinho) {
    const idCliente = obterIdCliente();

    salvarCarrinho(carrinho, idCliente);
}


// Procurar produto pelo ID
function buscarProduto(id) {
    return produtos.find(produto => produto.id === id) || null;
}


// Adicionar produto ao carrinho
export function adicionarAoCarrinho(idProduto, quantidade = 1) {
    const produto = buscarProduto(idProduto);

    if (!produto || produto.estoque <= 0) {
        return false;
    }

    const carrinho = obterCarrinhoAtual();

    const item = carrinho.find(
        item => item.produtoId === idProduto
    );

    if (item) {
        if (item.quantidade + quantidade > produto.estoque) {
            item.quantidade = produto.estoque;
        } else {
            item.quantidade += quantidade;
        }
    } else {
        if (quantidade > produto.estoque) {
            quantidade = produto.estoque;
        }

        carrinho.push({
            produtoId: idProduto,
            quantidade: quantidade
        });
    }

    salvarCarrinhoAtual(carrinho);
    renderizarCarrinho();

    mostrarToast('Produto adicionado ao carrinho!', 'info');

    return true;
}


// Alterar quantidade de um produto
export function alterarQuantidade(idProduto, quantidade) {
    const produto = buscarProduto(idProduto);

    if (!produto) {
        return;
    }

    const carrinho = obterCarrinhoAtual();

    const item = carrinho.find(
        item => item.produtoId === idProduto
    );

    if (!item) {
        return;
    }

    if (quantidade <= 0) {
        removerDoCarrinho(idProduto);
        return;
    }

    if (quantidade > produto.estoque) {
        quantidade = produto.estoque;
    }

    item.quantidade = quantidade;

    salvarCarrinhoAtual(carrinho);
    renderizarCarrinho();
}


// Remover produto do carrinho
export function removerDoCarrinho(idProduto) {
    const carrinho = obterCarrinhoAtual();

    const novoCarrinho = carrinho.filter(
        item => item.produtoId !== idProduto
    );

    salvarCarrinhoAtual(novoCarrinho);
    renderizarCarrinho();
}


// Atualizar contador do menu
function atualizarContador() {
    const carrinho = obterCarrinhoAtual();

    let quantidadeTotal = 0;

    carrinho.forEach(item => {
        quantidadeTotal += item.quantidade;
    });

    const contador = document.getElementById('contador-carrinho');

    if (contador) {
        contador.textContent = quantidadeTotal;
    }
}


// Renderizar produtos na tabela
export function renderizarCarrinho() {
    if (!tabelaCarrinho) {
        atualizarContador();
        return;
    }

    const carrinho = obterCarrinhoAtual();

    if (secaoCarrinho) {
        secaoCarrinho.hidden = carrinho.length === 0;
    }

    tabelaCarrinho.innerHTML = '';

    let total = 0;

    carrinho.forEach(item => {
        const produto = buscarProduto(item.produtoId);

        if (!produto) {
            return;
        }

        const subtotal = produto.preco * item.quantidade;

        total += subtotal;

        const linha = document.createElement('tr');

        // Nome do produto
        const colunaProduto = document.createElement('td');
        colunaProduto.textContent = produto.nome;

        // Quantidade
        const colunaQuantidade = document.createElement('td');

        const botaoMenos = document.createElement('button');
        botaoMenos.type = 'button';
        botaoMenos.textContent = '−';
        botaoMenos.dataset.acao = 'diminuir';
        botaoMenos.dataset.produtoId = produto.id;

        const quantidade = document.createElement('span');
        quantidade.textContent = item.quantidade;

        const botaoMais = document.createElement('button');
        botaoMais.type = 'button';
        botaoMais.textContent = '+';
        botaoMais.dataset.acao = 'aumentar';
        botaoMais.dataset.produtoId = produto.id;

        if (item.quantidade >= produto.estoque) {
            botaoMais.disabled = true;
        }

        colunaQuantidade.append(
            botaoMenos,
            quantidade,
            botaoMais
        );

        // Preço unitário
        const colunaPreco = document.createElement('td');
        colunaPreco.textContent = formatarMoeda(produto.preco);

        // Subtotal
        const colunaSubtotal = document.createElement('td');
        colunaSubtotal.textContent = formatarMoeda(subtotal);

        // Remover
        const colunaRemover = document.createElement('td');

        const botaoRemover = document.createElement('button');
        botaoRemover.type = 'button';
        botaoRemover.textContent = 'Remover';
        botaoRemover.dataset.acao = 'remover';
        botaoRemover.dataset.produtoId = produto.id;

        colunaRemover.append(botaoRemover);

        linha.append(
            colunaProduto,
            colunaQuantidade,
            colunaPreco,
            colunaSubtotal,
            colunaRemover
        );

        tabelaCarrinho.append(linha);
    });

    if (totalCarrinho) {
        totalCarrinho.textContent = formatarMoeda(total);
    }

    atualizarContador();
}


// Mesclar carrinho do visitante com o do cliente
export function mesclarCarrinhoVisitante(idCliente) {
    const carrinhoVisitante = carregarCarrinho();
    const carrinhoCliente = carregarCarrinho(idCliente);

    carrinhoVisitante.forEach(itemVisitante => {
        const produto = buscarProduto(itemVisitante.produtoId);

        if (!produto || produto.estoque <= 0) {
            return;
        }

        const itemCliente = carrinhoCliente.find(
            item => item.produtoId === itemVisitante.produtoId
        );

        if (itemCliente) {
            itemCliente.quantidade += itemVisitante.quantidade;

            if (itemCliente.quantidade > produto.estoque) {
                itemCliente.quantidade = produto.estoque;
            }
        } else {
            let quantidade = itemVisitante.quantidade;

            if (quantidade > produto.estoque) {
                quantidade = produto.estoque;
            }

            carrinhoCliente.push({
                produtoId: itemVisitante.produtoId,
                quantidade: quantidade
            });
        }
    });

    salvarCarrinho(carrinhoCliente, idCliente);
    removerCarrinho();

    renderizarCarrinho();
}


// Eventos dos botões do carrinho
if (tabelaCarrinho) {
    tabelaCarrinho.addEventListener('click', function (evento) {
        const botao = evento.target.closest('button');

        if (!botao) {
            return;
        }

        const idProduto = botao.dataset.produtoId;
        const acao = botao.dataset.acao;

        if (acao === 'aumentar') {
            const carrinho = obterCarrinhoAtual();

            const item = carrinho.find(
                item => item.produtoId === idProduto
            );

            if (item) {
                alterarQuantidade(idProduto, item.quantidade + 1);
            }
        }

        if (acao === 'diminuir') {
            const carrinho = obterCarrinhoAtual();

            const item = carrinho.find(
                item => item.produtoId === idProduto
            );

            if (item) {
                alterarQuantidade(idProduto, item.quantidade - 1);
            }
        }

        if (acao === 'remover') {
            removerDoCarrinho(idProduto);
        }
    });
}


// Evento dos botões de adicionar ao carrinho
document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button');

    if (!botao) {
        return;
    }

    // Botão dos cards do catálogo
    if (botao.classList.contains('botao-comprar')) {
        const idProduto = botao.dataset.produtoId;

        if (idProduto) {
            adicionarAoCarrinho(idProduto);
        }
    }

    // Botão do modal de detalhes
    if (botao.id === 'detalhe-adicionar') {
        const idProduto = botao.dataset.produtoId;
        const campoQuantidade = document.getElementById('detalhe-quantidade');

        if (idProduto && campoQuantidade) {
            const adicionado = adicionarAoCarrinho(
                idProduto,
                Number(campoQuantidade.value)
            );

            if (adicionado) {
                document.getElementById('dialog-produto').close();
            }
        }
    }
});


// Exibir carrinho ao abrir a página
renderizarCarrinho();
