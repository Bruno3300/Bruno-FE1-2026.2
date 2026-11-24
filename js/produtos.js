
import {
    produtos
} from '../data/produtos.js';

import {
    formatarMoeda
} from './utils.js';


// Elementos do HTML
const gradeProdutos = document.getElementById('grade-produtos');
const formularioFiltros = document.getElementById('filtros');

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


// Nomes das categorias
const categorias = {
    acao: 'Ação',
    aventura: 'Aventura',
    comedia: 'Comédia',
    fantasia: 'Fantasia',
    ficcao: 'Ficção Científica',
    esporte: 'Esporte'
};


// Variáveis
let temporizadorBusca;
let produtoSelecionado = null;


// Exibir produtos
function renderizarProdutos(listaProdutos) {

    gradeProdutos.innerHTML = '';

    if (listaProdutos.length === 0) {
        gradeProdutos.textContent = 'Nenhum produto encontrado.';
        return;
    }

    listaProdutos.forEach(function (produto) {

        // Criar card
        const card = document.createElement('article');
        card.className = 'card-produto';

        // Imagem
        const imagem = document.createElement('img');
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.className = 'card-produto-imagem';

        // Nome
        const titulo = document.createElement('h3');
        titulo.className = 'card-produto-titulo';
        titulo.textContent = produto.nome;

        // Categoria
        const categoria = document.createElement('p');
        categoria.className = 'card-produto-categoria';
        categoria.textContent = categorias[produto.categoria];

        // Preço
        const preco = document.createElement('p');
        preco.className = 'card-produto-preco';
        preco.textContent = formatarMoeda(produto.preco);

        // Botão de adicionar ao carrinho
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'botao botao-vermelho botao-comprar';

        if (produto.estoque > 0) {
            botao.textContent = 'Adicionar ao carrinho';
        } else {
            botao.textContent = 'Sem estoque';
            botao.disabled = true;
        }

        // Montar card
        card.append(
            imagem,
            titulo,
            categoria,
            preco,
            botao
        );

        // Botão de detalhes
        if (dialogProduto) {

            const botaoDetalhes = document.createElement('button');
            botaoDetalhes.type = 'button';
            botaoDetalhes.className = 'botao';
            botaoDetalhes.textContent = 'Ver detalhes';

            botaoDetalhes.addEventListener('click', function () {
                abrirDetalhesProduto(produto);
            });

            card.appendChild(botaoDetalhes);
        }

        // Adicionar card à grade
        gradeProdutos.appendChild(card);
    });
}


// Atualizar botões de quantidade
function atualizarBotoesQuantidade() {

    const quantidade = Number(detalheQuantidade.value);
    const estoque = Number(detalheQuantidade.max);

    quantidadeMenos.disabled = quantidade <= 1;
    quantidadeMais.disabled = quantidade >= estoque;
}


// Abrir detalhes do produto
function abrirDetalhesProduto(produto) {

    produtoSelecionado = produto;

    detalheImagem.src = produto.imagem;
    detalheImagem.alt = produto.nome;

    detalheNome.textContent = produto.nome;
    detalheCategoria.textContent = categorias[produto.categoria];
    detalheDescricao.textContent = produto.descricao;
    detalhePreco.textContent = formatarMoeda(produto.preco);

    detalheEstoque.textContent =
        'Estoque disponível: ' + produto.estoque;

    detalheQuantidade.value = 1;
    detalheQuantidade.min = 1;
    detalheQuantidade.max = produto.estoque;

    detalheQuantidade.disabled = produto.estoque === 0;

    detalheAdicionar.disabled = produto.estoque === 0;

    if (produto.estoque === 0) {
        detalheAdicionar.textContent = 'Sem estoque';
    } else {
        detalheAdicionar.textContent = 'Adicionar';
    }

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
            detalheQuantidade.value = quantidade - 1;
        }

        atualizarBotoesQuantidade();

    });

}


// Aumentar quantidade
if (quantidadeMais) {

    quantidadeMais.addEventListener('click', function () {

        let quantidade = Number(detalheQuantidade.value);
        const estoque = Number(detalheQuantidade.max);

        if (quantidade < estoque) {
            detalheQuantidade.value = quantidade + 1;
        }

        atualizarBotoesQuantidade();

    });

}


// Impedir quantidade inválida digitada manualmente
if (detalheQuantidade) {

    detalheQuantidade.addEventListener('change', function () {

        let quantidade = Number(detalheQuantidade.value);
        const estoque = Number(detalheQuantidade.max);

        if (quantidade < 1 || detalheQuantidade.value === '') {
            quantidade = 1;
        }

        if (quantidade > estoque) {
            quantidade = estoque;
        }

        detalheQuantidade.value = quantidade;

        atualizarBotoesQuantidade();

    });

}


// Aplicar busca e filtros
function aplicarFiltros() {

    const busca = campoBusca.value.toLowerCase().trim();
    const categoriaSelecionada = campoCategoria.value;

    const precoMin = campoPrecoMin.value;
    const precoMax = campoPrecoMax.value;

    const ordem = campoOrdem.value;


    // Filtrar produtos
    let produtosFiltrados = produtos.filter(function (produto) {

        // Texto pesquisável
        const textoProduto = (
            produto.nome + ' ' +
            produto.descricao + ' ' +
            categorias[produto.categoria]
        ).toLowerCase();

        if (!textoProduto.includes(busca)) {
            return false;
        }

        // Categoria
        if (
            categoriaSelecionada !== '' &&
            produto.categoria !== categoriaSelecionada
        ) {
            return false;
        }

        // Preço mínimo
        if (
            precoMin !== '' &&
            produto.preco < Number(precoMin)
        ) {
            return false;
        }

        // Preço máximo
        if (
            precoMax !== '' &&
            produto.preco > Number(precoMax)
        ) {
            return false;
        }

        return true;
    });


    // Ordenar produtos
    if (ordem === 'titulo') {

        produtosFiltrados.sort(function (a, b) {
            return a.nome.localeCompare(b.nome);
        });

    }

    if (ordem === 'menor-preco') {

        produtosFiltrados.sort(function (a, b) {
            return a.preco - b.preco;
        });

    }

    if (ordem === 'maior-preco') {

        produtosFiltrados.sort(function (a, b) {
            return b.preco - a.preco;
        });

    }


    // Atualizar catálogo
    renderizarProdutos(produtosFiltrados);
}


// Configurar filtros
if (formularioFiltros) {

    // Impedir envio tradicional do formulário
    formularioFiltros.addEventListener('submit', function (event) {
        event.preventDefault();

        aplicarFiltros();
    });


    // Busca em tempo real com debounce
    campoBusca.addEventListener('input', function () {

        clearTimeout(temporizadorBusca);

        temporizadorBusca = setTimeout(function () {
            aplicarFiltros();
        }, 300);

    });


    // Atualizar ao mudar categoria
    campoCategoria.addEventListener('change', aplicarFiltros);


    // Atualizar ao mudar preços
    campoPrecoMin.addEventListener('input', aplicarFiltros);
    campoPrecoMax.addEventListener('input', aplicarFiltros);


    // Atualizar ao mudar ordenação
    campoOrdem.addEventListener('change', aplicarFiltros);

}


// Exibir catálogo inicial
renderizarProdutos(produtos);
