
import { exigirLogin } from './sessao.js';

import {
    carregarCarrinho,
    carregarPedidos,
    salvarPedido
} from './storage.js';

import {
    obterResumoPedido,
    reiniciarPedido
} from './carrinho.js';

import { exibirErros } from './ui.js';

import {
    formatarCartao,
    formatarValidade,
    validarNumeroCartao,
    validarValidadeCartao,
    validarCvv
} from './utils.js';


// Elementos do checkout
const botaoContinuar = document.getElementById('botao-continuar')
    || document.getElementById('botao-finalizar');

const botaoVoltarCarrinho = document.getElementById('botao-voltar-carrinho');
const botaoConfirmar = document.getElementById('botao-confirmar-compra');

const secaoCarrinho = document.getElementById('carrinho');
const checkout = document.getElementById('checkout');
const confirmacao = document.getElementById('confirmacao');

const etapas = document.querySelectorAll('.checkout-etapa');
const indicadores = document.querySelectorAll('[data-indicador]');


// Formulários
const formEndereco = document.getElementById('form-endereco');
const formPagamento = document.getElementById('form-pagamento');


// Campos do endereço
const campoRua = document.getElementById('endereco-rua');
const campoNumero = document.getElementById('endereco-numero');
const campoComplemento = document.getElementById('endereco-complemento');
const campoBairro = document.getElementById('endereco-bairro');
const campoCidade = document.getElementById('endereco-cidade');
const campoEstado = document.getElementById('endereco-estado');


// Campos do pagamento
const campoForma = document.getElementById('forma-pagamento');
const dadosCartao = document.getElementById('dados-cartao');

const campoCartao = document.getElementById('cartao-numero');
const campoValidade = document.getElementById('cartao-validade');
const campoCvv = document.getElementById('cartao-cvv');


// Mensagens de erro do pagamento
const erroForma = document.getElementById('erro-forma-pagamento');
const erroCartao = document.getElementById('erro-cartao-numero');
const erroValidade = document.getElementById('erro-cartao-validade');
const erroCvv = document.getElementById('erro-cartao-cvv');


// Etapas: 1 = endereço, 2 = pagamento
let etapaAtual = 1;


// Impedir envio dos formulários
[formEndereco, formPagamento].forEach(form => {
    if (form) {
        form.addEventListener('submit', evento => {
            evento.preventDefault();
        });
    }
});


// Mostrar uma etapa do checkout
function mostrarEtapa(numero) {
    etapaAtual = numero;

    etapas.forEach(etapa => {
        etapa.hidden = Number(etapa.dataset.etapa) !== numero;
    });

    indicadores.forEach(indicador => {
        const numeroIndicador = Number(indicador.dataset.indicador);

        indicador.classList.toggle(
            'ativa',
            numeroIndicador === numero
        );
    });

    checkout.scrollIntoView({ behavior: 'smooth' });
}


// Iniciar checkout
if (botaoContinuar) {
    botaoContinuar.addEventListener('click', function () {
        const cliente = exigirLogin();

        if (!cliente) {
            return;
        }

        const carrinho = carregarCarrinho(cliente.id);

        if (carrinho.length === 0) {
            return;
        }

        const resumo = obterResumoPedido();

        // Exigir CEP e cálculo do frete
        if (resumo.cep === null || resumo.cep === undefined) {
            const erroCep = document.getElementById('erro-cep');
            const campoCep = document.getElementById('cep');

            erroCep.textContent =
                'Informe e calcule o frete com seu CEP antes de continuar.';

            campoCep.focus();
            return;
        }

        secaoCarrinho.hidden = true;
        checkout.hidden = false;

        mostrarEtapa(1);
    });
}


// Voltar do checkout para o carrinho
if (botaoVoltarCarrinho) {
    botaoVoltarCarrinho.addEventListener('click', function () {
        checkout.hidden = true;
        secaoCarrinho.hidden = false;

        secaoCarrinho.scrollIntoView({ behavior: 'smooth' });
    });
}


// Validar endereço
function validarEndereco() {
    const campos = [
        {
            input: campoRua,
            erro: 'erro-endereco-rua',
            mensagem: 'Informe a rua.'
        },
        {
            input: campoNumero,
            erro: 'erro-endereco-numero',
            mensagem: 'Informe o número.'
        },
        {
            input: campoBairro,
            erro: 'erro-endereco-bairro',
            mensagem: 'Informe o bairro.'
        },
        {
            input: campoCidade,
            erro: 'erro-endereco-cidade',
            mensagem: 'Informe a cidade.'
        },
        {
            input: campoEstado,
            erro: 'erro-endereco-estado',
            mensagem: 'Informe a UF com duas letras.'
        }
    ];

    let valido = true;
    let primeiroCampoInvalido = null;

    campos.forEach(campo => {
        const elementoErro = document.getElementById(campo.erro);

        let mensagem = '';

        if (!campo.input.value.trim()) {
            mensagem = campo.mensagem;
        } else if (
            campo.input === campoEstado &&
            !/^[A-Za-z]{2}$/.test(campo.input.value.trim())
        ) {
            mensagem = 'Informe uma UF válida com duas letras.';
        }

        elementoErro.textContent = mensagem;

        if (mensagem) {
            valido = false;

            if (!primeiroCampoInvalido) {
                primeiroCampoInvalido = campo.input;
            }
        }
    });

    if (primeiroCampoInvalido) {
        primeiroCampoInvalido.focus();
    }

    return valido;
}


// Limpar mensagens de erro do endereço ao corrigir
[
    campoRua,
    campoNumero,
    campoBairro,
    campoCidade,
    campoEstado
].forEach(campo => {
    campo.addEventListener('input', function () {
        const erro = document.getElementById(
            'erro-' + campo.id
        );

        if (erro) {
            erro.textContent = '';
        }
    });
});


// Mostrar campos do cartão somente quando necessário
if (campoForma) {
    campoForma.addEventListener('change', function () {
        dadosCartao.hidden = campoForma.value !== 'cartao';

        erroForma.textContent = '';
        erroCartao.textContent = '';
        erroValidade.textContent = '';
        erroCvv.textContent = '';
    });
}


// Máscara do cartão
if (campoCartao) {
    campoCartao.addEventListener('input', function () {
        campoCartao.value = formatarCartao(campoCartao.value);
        erroCartao.textContent = '';
    });
}


// Máscara da validade
if (campoValidade) {
    campoValidade.addEventListener('input', function () {
        campoValidade.value = formatarValidade(campoValidade.value);
        erroValidade.textContent = '';
    });
}


// Permitir somente números no CVV
if (campoCvv) {
    campoCvv.addEventListener('input', function () {
        campoCvv.value = campoCvv.value.replace(/\D/g, '').slice(0, 4);
        erroCvv.textContent = '';
    });
}


// Validar pagamento
function validarPagamento() {
    const forma = campoForma.value;

    // Pix e boleto não precisam de dados de cartão
    if (forma === 'pix' || forma === 'boleto') {
        erroForma.textContent = '';
        return {
            metodo: forma
        };
    }

    const temErro = exibirErros([
        [
            campoForma,
            erroForma,
            forma ? '' : 'Escolha uma forma de pagamento.'
        ],
        [
            campoCartao,
            erroCartao,
            forma === 'cartao'
                ? validarNumeroCartao(campoCartao.value)
                : ''
        ],
        [
            campoValidade,
            erroValidade,
            forma === 'cartao'
                ? validarValidadeCartao(campoValidade.value)
                : ''
        ],
        [
            campoCvv,
            erroCvv,
            forma === 'cartao'
                ? validarCvv(campoCvv.value)
                : ''
        ]
    ]);

    if (temErro) {
        return null;
    }

    // Extrair somente os números do cartão
    const numero = campoCartao.value.replace(/\D/g, '');

    // Nunca retornar o número completo ou o CVV
    return {
        metodo: 'cartao',
        ultimosDigitos: numero.slice(-4)
    };
}


// Navegação entre as etapas
document.addEventListener('click', function (evento) {
    const botaoProxima = evento.target.closest('[data-proxima]');
    const botaoVoltar = evento.target.closest('[data-voltar]');

    if (botaoProxima) {
        const proximaEtapa = Number(botaoProxima.dataset.proxima);

        if (etapaAtual === 1 && !validarEndereco()) {
            return;
        }

        mostrarEtapa(proximaEtapa);
    }

    if (botaoVoltar) {
        mostrarEtapa(Number(botaoVoltar.dataset.voltar));
    }
});


// Mensagens de confirmação
const mensagensPagamento = {
    pix: 'Pagamento via Pix simulado. Aguarde a confirmação do pagamento.',
    cartao: 'Pagamento no cartão aprovado.',
    boleto: 'Boleto gerado. O vencimento é em 3 dias úteis. O envio ocorrerá após a compensação.'
};


// Confirmar compra
if (botaoConfirmar) {
    botaoConfirmar.addEventListener('click', function () {
        const cliente = exigirLogin();

        if (!cliente) {
            return;
        }

        const pagamento = validarPagamento();

        if (!pagamento) {
            return;
        }

        // Atualizar resumo antes de registrar o pedido
        const resumo = obterResumoPedido();

        if (!resumo.itens.length) {
            return;
        }

        if (resumo.cep === null || resumo.cep === undefined) {
            return;
        }

        // Verificar se o carrinho ainda existe
        const carrinho = carregarCarrinho(cliente.id);

        if (carrinho.length === 0) {
            return;
        }

        botaoConfirmar.disabled = true;

        const forma = pagamento.metodo;

        const pedido = {
            cliente: {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email
            },

            data: new Date().toISOString(),

            itens: resumo.itens,

            totalProdutos: resumo.totalProdutos,
            frete: resumo.frete,
            desconto: resumo.desconto,
            total: resumo.total,

            endereco: {
                rua: campoRua.value.trim(),
                numero: campoNumero.value.trim(),
                complemento: campoComplemento.value.trim(),
                bairro: campoBairro.value.trim(),
                cidade: campoCidade.value.trim(),
                estado: campoEstado.value.trim().toUpperCase()
            },

            pagamento,

            status: forma === 'cartao'
                ? 'pago'
                : 'aguardando pagamento'
        };

        // Salvar pedido e obter o ID gerado
        const pedidoSalvo = salvarPedido(pedido);

        // Limpar o carrinho e os dados temporários do pedido
        reiniciarPedido(cliente.id);

        // Limpar formulários
        formEndereco.reset();
        formPagamento.reset();

        dadosCartao.hidden = true;

        // Exibir confirmação
        document.getElementById('numero-pedido').textContent =
            pedidoSalvo.id;

        document.getElementById('mensagem-pagamento').textContent =
            mensagensPagamento[forma];

        checkout.hidden = true;
        secaoCarrinho.hidden = true;
        confirmacao.hidden = false;

        confirmacao.scrollIntoView({ behavior: 'smooth' });

        botaoConfirmar.disabled = false;
    });
}
