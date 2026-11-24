
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

const botaoFecharDialog = document.getElementById('fechar-dialog');
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


// Variáveis auxiliares
let temporizadorBusca;
let produtoSelecionado = null;


// Exibir produtos na página
function renderizarProdutos(listaProdutos) {
    gradeProdutos.innerHTML = '';

    if (listaProdutos.length === 0) {
        gradeProdutos.textContent = 'Nenhum produto encontrado.';
        return;
    }

    listaProdutos.forEach(produto => {

        const card = document.createElement('article');
        card.classList.add('card-produto');

        // Imagem
        const imagem = document.createElement('img');
        imagem.classList.add('card-produto-imagem');
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;

        // Nome
        const titulo = document.createElement('h2');
        titulo.classList.add('card-produto-titulo');
        titulo.textContent = produto.nome;

        // Categoria
        const categoria = document.createElement('p');
        categoria.classList.add('card-produto-categoria');
        categoria.textContent = categorias[produto.categoria] || produto.categoria;

        // Preço
        const preco = document.createElement('p');
        preco.classList.add('card-produto-preco');
        preco.textContent = formatarMoeda(produto.preco);

        // Botão adicionar ao carrinho
        const botaoAdicionar = document.createElement('button');
        botaoAdicionar.type = 'button';
        botaoAdicionar.classList.add('botao', 'botao-vermelho', 'botao-comprar');

        botaoAdicionar.textContent = 'Adicionar ao carrinho';

        // Identificar o produto para o carrinho.js
        botaoAdicionar.dataset.produtoId = produto.id;

        if (produto.estoque <= 0) {
            botaoAdicionar.disabled = true;
            botaoAdicionar.textContent = 'Sem estoque';
        }

        // Montar card
        card.append(
            imagem,
            titulo,
            categoria,
            preco,
            botaoAdicionar
        );

        // Botão de detalhes
        if (dialogProduto) {
            const botaoDetalhes = document.createElement('button');

            botaoDetalhes.type = 'button';
            botaoDetalhes.classList.add('botao');
            botaoDetalhes.textContent = 'Ver detalhes';

            botaoDetalhes.addEventListener('click', function () {
                abrirDetalhesProduto(produto);
            });

            card.append(botaoDetalhes);
        }

        gradeProdutos.append(card);
    });
}


// Atualizar botões de quantidade do modal
function atualizarBotoesQuantidade() {
    if (!produtoSelecionado) {
        return;
    }

    const quantidade = Number(detalheQuantidade.value);
    const estoque = produtoSelecionado.estoque;

    quantidadeMenos.disabled = quantidade <= 1;
    quantidadeMais.disabled = quantidade >= estoque || estoque <= 0;
}


// Abrir detalhes do produto
function abrirDetalhesProduto(produto) {
    produtoSelecionado = produto;

    detalheImagem.src = produto.imagem;
    detalheImagem.alt = produto.nome;

    detalheNome.textContent = produto.nome;

    detalheCategoria.textContent =
        categorias[produto.categoria] || produto.categoria;

    detalheDescricao.textContent = produto.descricao;

    detalhePreco.textContent = formatarMoeda(produto.preco);

    detalheEstoque.textContent = produto.estoque > 0
        ? `Estoque disponível: ${produto.estoque}`
        : 'Produto sem estoque';

    // Configurar quantidade
    detalheQuantidade.value = 1;
    detalheQuantidade.min = 1;
    detalheQuantidade.max = Math.max(1, produto.estoque);

    // Identificar o produto para o carrinho.js
    detalheAdicionar.dataset.produtoId = produto.id;

    detalheAdicionar.disabled = produto.estoque <= 0;

    detalheAdicionar.textContent = produto.estoque > 0
        ? 'Adicionar ao carrinho'
        : 'Sem estoque';

    atualizarBotoesQuantidade();

    dialogProduto.showModal();
}


// Fechar modal
if (botaoFecharDialog) {
    botaoFecharDialog.addEventListener('click', function () {
        dialogProduto.close();
    });
}


// Diminuir quantidade
if (quantidadeMenos) {
    quantidadeMenos.addEventListener('click', function () {
        let quantidade = Number(detalheQuantidade.value);

        if (quantidade > 1) {
            quantidade--;

            detalheQuantidade.value = quantidade;
        }

        atualizarBotoesQuantidade();
    });
}


// Aumentar quantidade
if (quantidadeMais) {
    quantidadeMais.addEventListener('click', function () {
        let quantidade = Number(detalheQuantidade.value);

        if (produtoSelecionado && quantidade < produtoSelecionado.estoque) {
            quantidade++;

            detalheQuantidade.value = quantidade;
        }

        atualizarBotoesQuantidade();
    });
}


// Validar quantidade digitada manualmente
if (detalheQuantidade) {
    detalheQuantidade.addEventListener('change', function () {
        if (!produtoSelecionado) {
            return;
        }

        let quantidade = Number(detalheQuantidade.value);

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            quantidade = 1;
        }

        if (quantidade > produtoSelecionado.estoque) {
            quantidade = produtoSelecionado.estoque;
        }

        if (produtoSelecionado.estoque <= 0) {
            quantidade = 1;
        }

        detalheQuantidade.value = quantidade;

        atualizarBotoesQuantidade();
    });
}


// Aplicar filtros
function aplicarFiltros() {
    let listaFiltrada = [...produtos];

    // Busca por nome, descrição ou categoria
    const busca = campoBusca.value.trim().toLowerCase();

    if (busca) {
        listaFiltrada = listaFiltrada.filter(produto => {

            const categoria =
                categorias[produto.categoria] || produto.categoria;

            return (
                produto.nome.toLowerCase().includes(busca) ||
                produto.descricao.toLowerCase().includes(busca) ||
                categoria.toLowerCase().includes(busca)
            );
        });
    }

    // Filtro de categoria
    const categoriaSelecionada = campoCategoria.value;

    if (categoriaSelecionada) {
        listaFiltrada = listaFiltrada.filter(
            produto => produto.categoria === categoriaSelecionada
        );
    }

    // Preço mínimo
    const precoMin = campoPrecoMin.value;

    if (precoMin !== '') {
        listaFiltrada = listaFiltrada.filter(
            produto => produto.preco >= Number(precoMin)
        );
    }

    // Preço máximo
    const precoMax = campoPrecoMax.value;

    if (precoMax !== '') {
        listaFiltrada = listaFiltrada.filter(
            produto => produto.preco <= Number(precoMax)
        );
    }

    // Ordenação
    const ordem = campoOrdem.value;

    if (ordem === 'nome') {
        listaFiltrada.sort((a, b) =>
            a.nome.localeCompare(b.nome)
        );
    }

    if (ordem === 'menor-preco') {
        listaFiltrada.sort((a, b) => a.preco - b.preco);
    }

    if (ordem === 'maior-preco') {
        listaFiltrada.sort((a, b) => b.preco - a.preco);
    }

    renderizarProdutos(listaFiltrada);
}


// Impedir envio do formulário de filtros
if (formularioFiltros) {
    formularioFiltros.addEventListener('submit', function (evento) {
        evento.preventDefault();

        aplicarFiltros();
    });
}


// Busca com pequeno atraso
if (campoBusca) {
    campoBusca.addEventListener('input', function () {
        clearTimeout(temporizadorBusca);

        temporizadorBusca = setTimeout(function () {
            aplicarFiltros();
        }, 300);
    });
}


// Aplicar filtros automaticamente
if (campoCategoria) {
    campoCategoria.addEventListener('change', aplicarFiltros);
}

if (campoPrecoMin) {
    campoPrecoMin.addEventListener('input', aplicarFiltros);
}

if (campoPrecoMax) {
    campoPrecoMax.addEventListener('input', aplicarFiltros);
}

if (campoOrdem) {
    campoOrdem.addEventListener('change', aplicarFiltros);
}


// Exibir catálogo inicial
renderizarProdutos(produtos);
