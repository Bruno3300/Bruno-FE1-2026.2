import { produtos } from '../data/produtos.js';
import { mostrarToast } from './ui.js';
import { carregarCarrinho, salvarCarrinho, removerCarrinho } from './storage.js';
import { obterClienteLogado } from './sessao.js';
import { formatarCep, formatarMoeda, valiadarCep } from './utils.js';


// Elementos do HTML
const tabelaCarrinho = document.getElementById('itens-carrinho');
const totalCarrinho = document.getElementById('carrinho-total');
const secaoCarrinho = document.getElementById('carrinho');

const campoCep = document.getElementById('cep')
const botaoCalcularFrete = document.getElementById('botao-calcular-frete');
const erroCep = document.getElementById('erro-cep');
const resultadoFrete = document.getElementById('resultado-frete');

const resumoProdutos = document.getElementById('resumo-produtos');
const resumoFrete = document.getElementById('resumo-frete');
const resumoDesconto = document.getElementById('resumo-desconto');
const resumoTotal = document.getElementById('resumo-total');

const campoCupom = document.getElementById('cupom');
const botaoAplicarCupom = document.getElementById('botao-aplicar-cupom');
const erroCupom = document.getElementById('erro-cupom');

const FRETE_GRATIS_ACIMA = 250;


let cepAtual = null;
let totalProdutosAtual = 0;
let cupomAplicado = null;
let descontoAtual = 0;

// Cupons 
const cupons = {
    MANGA10: {
        tipo: 'percentual',
        valor: 10,
        minimo: 100,
        validade: '2026-10-31'
    },

    MANGA20: {
        tipo: 'fixo',
        valor: 20,
        minimo: 150,
        validade: '2027-12-31'
    },

    FRETEGRATIS: {
        tipo: 'frete',
        valor: 0,
        minimo: 80,
        validade: '2027-12-31'
    },

    PROMO15: {
        tipo: 'percentual',
        valor: 15,
        minimo: 50,
        validade: '2027-12-31'
    }
};

// Frete
campoCep.addEventListener('input', function () {
    campoCep.value = formatarCep(campoCep.value);
});



function calcularCep(total, cep) {
    if (total >= FRETE_GRATIS_ACIMA) {
        return 0;
    }
    if (cep >= 80000000 && cep <= 99999999) {
        return 15;
    } else if (cep >= 20000000 && cep <= 79999999) {
        return 25;
    } else if (cep >= 0 && cep <= 19999999) {
        return 40;
    }

    return null;
}

botaoCalcularFrete.addEventListener('click', function () {
    const cep = campoCep.value.replace(/\D/g, '');

    const erro = valiadarCep(cep);

    erroCep.textContent = erro;

    if (erro) {
        cepAtual = null;
    } else {
        cepAtual = Number(cep);
    }

    atualizarResumo(totalProdutosAtual);
});

botaoAplicarCupom.addEventListener('click', function () {
    const codigo = campoCupom.value.trim().toUpperCase();

    if (codigo === '') {
        erroCupom.textContent = 'Digite um código de cupom.';
        return;
    }

    const cupom = cupons[codigo];

    if (!cupom) {
        erroCupom.textContent = 'Cupom inválido ou inexistente.';
        return;
    }

    const dataAtual = new Date();
    const dataValidade = new Date(cupom.validade + 'T23:59:59');

    if (dataAtual > dataValidade) {
        erroCupom.textContent = 'Este cupom está fora da validade.';
        return;
    }

    if (totalProdutosAtual < cupom.minimo) {
        erroCupom.textContent =
            `Compra mínima de ${formatarMoeda(cupom.minimo)} para utilizar este cupom.`;
        return;
    }

    cupomAplicado = cupom;

    erroCupom.textContent = '';

    atualizarResumo(totalProdutosAtual);

    mostrarToast('Cupom aplicado com sucesso!', 'info');
});

campoCep.addEventListener('input', function () {
    campoCep.value = formatarCep(campoCep.value);

    cepAtual = null;
    erroCep.textContent = '';
    resultadoFrete.textContent = '';

    atualizarResumo(totalProdutosAtual);
});

campoCupom.addEventListener('input', function () {
    erroCupom.textContent = '';
});


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

    atualizarResumo(total);
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

function atualizarResumo(totalProdutos) {
    totalProdutosAtual = totalProdutos;

    let valorFrete = 0;
    let valorDesconto = 0;

    // Calcular frete
    if (cepAtual !== null) {
        const frete = calcularCep(totalProdutos, cepAtual);

        if (frete !== null) {
            valorFrete = frete;
        }
    }

    // Aplicar regras do cupom
    if (cupomAplicado) {
        if (cupomAplicado.tipo === 'percentual') {
            valorDesconto = totalProdutos * cupomAplicado.valor / 100;
        }

        if (cupomAplicado.tipo === 'fixo') {
            valorDesconto = Math.min(cupomAplicado.valor, totalProdutos);
        }

        if (cupomAplicado.tipo === 'frete') {
            valorDesconto = valorFrete;
        }
    }

    descontoAtual = valorDesconto;

    // Exibir resultado do frete
    if (cepAtual === null) {
        resultadoFrete.textContent = '';
    } else if (valorFrete === 0) {
        resultadoFrete.textContent = 'Frete grátis!';
    } else {
        resultadoFrete.textContent = `Frete: ${formatarMoeda(valorFrete)}`;
    }

    resumoProdutos.textContent = formatarMoeda(totalProdutos);
    resumoFrete.textContent = formatarMoeda(valorFrete);
    resumoDesconto.textContent = formatarMoeda(valorDesconto);

    const total = Math.max(0, totalProdutos + valorFrete - valorDesconto);

    resumoTotal.textContent = formatarMoeda(total);
}
// Exibir carrinho ao abrir a página

renderizarCarrinho();

