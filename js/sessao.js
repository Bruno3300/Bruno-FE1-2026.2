import {
    lerDados,
    salvarDados,
    removerDados,
    buscarClientePorId
} from './storage.js';

import { mostrarToast } from './ui.js';


// Mensagens guardadas entre páginas: [texto, tipo]
const mensagens = {
    'login-necessario': ['Você precisa entrar na sua conta para acessar esta página.', 'info'],
    'login-sucesso': ['Login realizado com sucesso!', 'sucesso'],
    'logout-sucesso': ['Você saiu da sua conta com sucesso!', 'sucesso'],
    'conta-removida': ['Sua conta foi removida com sucesso!', 'sucesso']
};

const mensagemLogin = lerDados('mensagemLogin');

if (mensagens[mensagemLogin]) {
    mostrarToast(...mensagens[mensagemLogin]);
    removerDados('mensagemLogin');
}


// Recuperar cliente logado
export function obterClienteLogado() {
    const id = lerDados('clienteLogado');

    return id ? buscarClientePorId(id) : null;
}


// Exigir que o cliente esteja logado
export function exigirLogin() {
    const cliente = obterClienteLogado();

    if (!cliente) {
        const paginaAtual = window.location.pathname.split('/').pop();

        salvarDados('mensagemLogin', 'login-necessario');

        window.location.href =
            `login.html?retorno=${encodeURIComponent(paginaAtual)}`;
    }

    return cliente;
}


// Exigir que o cliente seja administrador
export function exigirAdmin() {
    const cliente = exigirLogin();

    if (cliente && cliente.perfil !== 'admin') {
        window.location.href = 'index.html';
        return null;
    }

    return cliente;
}


// Controlar navegação
const cliente = obterClienteLogado();

function mostrarNav(id, visivel) {
    const item = document.getElementById(id);

    if (item) {
        item.hidden = !visivel;
    }
}

mostrarNav('nav-cadastro', !cliente);
mostrarNav('nav-login', !cliente);
mostrarNav('nav-perfil', cliente);
mostrarNav('nav-relatorios', cliente?.perfil === 'admin');


// Proteger páginas
const permissao = document.body.dataset.permissao;

if (permissao === 'admin') {
    exigirAdmin();
} else if (permissao === 'cliente') {
    exigirLogin();
}
