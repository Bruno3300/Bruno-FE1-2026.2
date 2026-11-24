import { produtos } from '../data/produtos.js';
import { mostrarToast } from './ui.js';
import { carregarCarrinho, salvarCarrinho, removerCarrinho } from './storage.js';
import { obterClienteLogado } from './sessao.js';
import { formatarMoeda } from './utils.js';


// Elementos do HTML
const tabelaCarrinho = document.getElementById('itens-carrinho');
const totalCarrinho = document.getElementById('carrinho-total');
const secaoCarrinho = document.getElementById('carrinho');


// Carrinho do cliente logado (ou do visitante, se não houver login)
function obterCarrinhoAtual() {
    return carregarCarrinho(obterClienteLogado()?.id);
}

function salvarCarrinhoAtual(carrinho) {
    salvarCarrinho(carrinho, obterClienteLogado()?.id);
}

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
    const item = carrinho.find(item => item.produtoId === idProduto);

    if (item) {
        item.quantidade = Math.min(item.quantidade + quantidade, produto.estoque);
    } else {
        carrinho.push({
            produtoId: idProduto,
            quantidade: Math.min(quantidade, produto.estoque)
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
    const carrinho = obterCarrinhoAtual();
    const item = carrinho.find(item => item.produtoId === idProduto);

    if (!produto || !item) {
        return;
    }

    if (quantidade <= 0) {
        removerDoCarrinho(idProduto);
        return;
    }

    item.quantidade = Math.min(quantidade, produto.estoque);

    salvarCarrinhoAtual(carrinho);
    renderizarCarrinho();
}


// Remover produto do carrinho
export function removerDoCarrinho(idProduto) {
    const carrinho = obterCarrinhoAtual().filter(
        item => item.produtoId !== idProduto
    );

    salvarCarrinhoAtual(carrinho);
    renderizarCarrinho();
}


// Atualizar contador do menu e a tabela do carrinho
export function renderizarCarrinho() {
    const carrinho = obterCarrinhoAtual();

    // Contador do menu
    const contador = document.getElementById('contador-carrinho');

    if (contador) {
        contador.textContent = carrinho.reduce(
            (soma, item) => soma + item.quantidade,
            0
        );
    }

    // Páginas sem tabela de carrinho
    if (!tabelaCarrinho) {
        return;
    }

    if (secaoCarrinho) {
        secaoCarrinho.hidden = carrinho.length === 0;
    }

    let linhas = '';
    let total = 0;

    carrinho.forEach(item => {
        const produto = buscarProduto(item.produtoId);

        if (!produto) {
            return;
        }

        const subtotal = produto.preco * item.quantidade;
        const semMaisEstoque = item.quantidade >= produto.estoque;

        total += subtotal;

        linhas += `
            <tr>
                <td>${produto.nome}</td>
                <td>
                    <button type="button" data-acao="diminuir" data-produto-id="${produto.id}">−</button>
                    <span>${item.quantidade}</span>
                    <button type="button" data-acao="aumentar" data-produto-id="${produto.id}" ${semMaisEstoque ? 'disabled' : ''}>+</button>
                </td>
                <td>${formatarMoeda(produto.preco)}</td>
                <td>${formatarMoeda(subtotal)}</td>
                <td>
                    <button type="button" data-acao="remover" data-produto-id="${produto.id}">Remover</button>
                </td>
            </tr>`;
    });

    tabelaCarrinho.innerHTML = linhas;

    if (totalCarrinho) {
        totalCarrinho.textContent = formatarMoeda(total);
    }
}


// Mesclar carrinho do visitante com o do cliente
export function mesclarCarrinhoVisitante(idCliente) {
    const carrinhoCliente = carregarCarrinho(idCliente);

    carregarCarrinho().forEach(itemVisitante => {
        const produto = buscarProduto(itemVisitante.produtoId);

        if (!produto || produto.estoque <= 0) {
            return;
        }

        const itemCliente = carrinhoCliente.find(
            item => item.produtoId === itemVisitante.produtoId
        );

        if (itemCliente) {
            itemCliente.quantidade = Math.min(
                itemCliente.quantidade + itemVisitante.quantidade,
                produto.estoque
            );
        } else {
            carrinhoCliente.push({
                produtoId: itemVisitante.produtoId,
                quantidade: Math.min(itemVisitante.quantidade, produto.estoque)
            });
        }
    });

    salvarCarrinho(carrinhoCliente, idCliente);
    removerCarrinho();
}


// Botões da tabela do carrinho
if (tabelaCarrinho) {
    tabelaCarrinho.addEventListener('click', function (evento) {
        const botao = evento.target.closest('button');

        if (!botao) {
            return;
        }

        const { acao, produtoId } = botao.dataset;

        const item = obterCarrinhoAtual().find(
            item => item.produtoId === produtoId
        );

        if (acao === 'remover') {
            removerDoCarrinho(produtoId);
        }

        if (acao === 'aumentar' && item) {
            alterarQuantidade(produtoId, item.quantidade + 1);
        }

        if (acao === 'diminuir' && item) {
            alterarQuantidade(produtoId, item.quantidade - 1);
        }
    });
}


// Botões de adicionar ao carrinho (catálogo e modal de detalhes)
document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button');

    if (!botao) {
        return;
    }

    const idProduto = botao.dataset.produtoId;

    // Cards do catálogo
    if (botao.classList.contains('botao-comprar') && idProduto) {
        adicionarAoCarrinho(idProduto);
    }

    // Modal de detalhes
    if (botao.id === 'detalhe-adicionar' && idProduto) {
        const quantidade = Number(
            document.getElementById('detalhe-quantidade').value
        );

        if (adicionarAoCarrinho(idProduto, quantidade)) {
            document.getElementById('dialog-produto').close();
        }
    }
});


// Exibir carrinho ao abrir a página
renderizarCarrinho();
