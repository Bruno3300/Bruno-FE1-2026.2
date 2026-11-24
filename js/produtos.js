import { produtos } from '../data/produtos.js';
import { formatarMoeda } from './utils.js';


// Elementos do catálogo
const gradeProdutos = document.getElementById('grade-produtos');

// Elementos dos filtros
const formularioFiltros = document.getElementById('form-filtros');
const campoBusca = document.getElementById('busca');
const campoCategoria = document.getElementById('categoria');
const campoPrecoMin = document.getElementById('preco-min');
const campoPrecoMax = document.getElementById('preco-max');
const campoOrdem = document.getElementById('ordem');

// Elementos do modal
const dialogProduto = document.getElementById('dialog-produto');

const detalheImagem = document.getElementById('detalhe-imagem');
const detalheNome = document.getElementById('detalhe-nome');
const detalheCategoria = document.getElementById('detalhe-categoria');
const detalheDescricao = document.getElementById('detalhe-descricao');
const detalhePreco = document.getElementById('detalhe-preco');
const detalheEstoque = document.getElementById('detalhe-estoque');
const detalheQuantidade = document.getElementById('detalhe-quantidade');
const detalheAdicionar = document.getElementById('detalhe-adicionar');

const quantidadeMenos = document.getElementById('quantidade-menos');
const quantidadeMais = document.getElementById('quantidade-mais');


// Categorias
const categorias = {
    acao: 'Ação',
    aventura: 'Aventura',
    comedia: 'Comédia',
    fantasia: 'Fantasia',
    ficcao: 'Ficção Científica',
    esporte: 'Esporte'
};

function nomeCategoria(produto) {
    return categorias[produto.categoria] || produto.categoria;
}

let produtoSelecionado = null;


// Exibir produtos na página
function renderizarProdutos(listaProdutos) {
    gradeProdutos.innerHTML = '';

    if (listaProdutos.length === 0) {
        gradeProdutos.textContent = 'Nenhum produto encontrado.';
        return;
    }

    listaProdutos.forEach(produto => {
        const semEstoque = produto.estoque <= 0;

        const card = document.createElement('article');
        card.classList.add('card-produto');

        card.innerHTML = `
            <img class="card-produto-imagem" src="${produto.imagem}" alt="${produto.nome}">
            <h2 class="card-produto-titulo">${produto.nome}</h2>
            <p class="card-produto-categoria">${nomeCategoria(produto)}</p>
            <p class="card-produto-preco">${formatarMoeda(produto.preco)}</p>
            <button type="button" class="botao botao-vermelho botao-comprar" data-produto-id="${produto.id}" ${semEstoque ? 'disabled' : ''}>
                ${semEstoque ? 'Sem estoque' : 'Adicionar ao carrinho'}
            </button>
            ${dialogProduto ? '<button type="button" class="botao botao-detalhes">Ver detalhes</button>' : ''}`;

        const botaoDetalhes = card.querySelector('.botao-detalhes');

        if (botaoDetalhes) {
            botaoDetalhes.addEventListener('click', function () {
                abrirDetalhesProduto(produto);
            });
        }

        gradeProdutos.append(card);
    });
}


// Modal: ajustar quantidade (respeitando 1 e o estoque) e os botões − / +
function definirQuantidade(valor) {
    const maximo = Math.max(1, produtoSelecionado.estoque);

    let quantidade = Number(valor);

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        quantidade = 1;
    }

    quantidade = Math.min(quantidade, maximo);

    detalheQuantidade.value = quantidade;
    quantidadeMenos.disabled = quantidade <= 1;
    quantidadeMais.disabled = quantidade >= maximo;
}

// Modal: abrir detalhes do produto
function abrirDetalhesProduto(produto) {
    produtoSelecionado = produto;

    detalheImagem.src = produto.imagem;
    detalheImagem.alt = produto.nome;
    detalheNome.textContent = produto.nome;
    detalheCategoria.textContent = nomeCategoria(produto);
    detalheDescricao.textContent = produto.descricao;
    detalhePreco.textContent = formatarMoeda(produto.preco);

    const semEstoque = produto.estoque <= 0;

    detalheEstoque.textContent = semEstoque
        ? 'Produto sem estoque'
        : `Estoque disponível: ${produto.estoque}`;

    detalheQuantidade.min = 1;
    detalheQuantidade.max = Math.max(1, produto.estoque);

    // Identificar o produto para o carrinho.js
    detalheAdicionar.dataset.produtoId = produto.id;
    detalheAdicionar.disabled = semEstoque;
    detalheAdicionar.textContent = semEstoque ? 'Sem estoque' : 'Adicionar ao carrinho';

    definirQuantidade(1);

    dialogProduto.showModal();
}

if (dialogProduto) {
    document.getElementById('fechar-dialog').addEventListener('click', function () {
        dialogProduto.close();
    });

    quantidadeMenos.addEventListener('click', function () {
        definirQuantidade(Number(detalheQuantidade.value) - 1);
    });

    quantidadeMais.addEventListener('click', function () {
        definirQuantidade(Number(detalheQuantidade.value) + 1);
    });

    // Quantidade digitada manualmente
    detalheQuantidade.addEventListener('change', function () {
        definirQuantidade(detalheQuantidade.value);
    });
}


// Aplicar filtros e ordenação
function aplicarFiltros() {
    const busca = campoBusca.value.trim().toLowerCase();
    const categoria = campoCategoria.value;
    const precoMin = campoPrecoMin.value;
    const precoMax = campoPrecoMax.value;
    const ordem = campoOrdem.value;

    const lista = produtos.filter(produto =>
        [produto.nome, produto.descricao, nomeCategoria(produto)]
            .some(texto => texto.toLowerCase().includes(busca)) &&
        (!categoria || produto.categoria === categoria) &&
        (precoMin === '' || produto.preco >= Number(precoMin)) &&
        (precoMax === '' || produto.preco <= Number(precoMax))
    );

    if (ordem === 'nome') {
        lista.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    if (ordem === 'menor-preco') {
        lista.sort((a, b) => a.preco - b.preco);
    }

    if (ordem === 'maior-preco') {
        lista.sort((a, b) => b.preco - a.preco);
    }

    renderizarProdutos(lista);
}


if (formularioFiltros) {
    // Impedir envio do formulário
    formularioFiltros.addEventListener('submit', function (evento) {
        evento.preventDefault();
        aplicarFiltros();
    });

    // Busca com pequeno atraso
    let temporizadorBusca;

    campoBusca.addEventListener('input', function () {
        clearTimeout(temporizadorBusca);
        temporizadorBusca = setTimeout(aplicarFiltros, 300);
    });

    // Demais filtros aplicam na hora
    [campoCategoria, campoPrecoMin, campoPrecoMax, campoOrdem].forEach(campo => {
        campo.addEventListener('input', aplicarFiltros);
    });
}


// Exibir catálogo inicial
renderizarProdutos(produtos);
