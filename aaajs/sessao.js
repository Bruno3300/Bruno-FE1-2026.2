
import {
    lerDados,
    salvarDados,
    buscarClientePorId,
    removerDados
} from './storage.js';

import {
    mostrarToast
} from './ui.js';


// Recuperar mensagem salva
const mensagemLogin = lerDados('mensagemLogin');

if (mensagemLogin === 'login-necessario') {
    mostrarToast(
        'Você precisa entrar na sua conta para acessar esta página.',
        'info'
    );

    removerDados('mensagemLogin');
}

if (mensagemLogin === 'login-sucesso') {
    mostrarToast(
        'Login realizado com sucesso!',
        'sucesso'
    );

    removerDados('mensagemLogin');
}

if (mensagemLogin === 'logout-sucesso') {
    mostrarToast(
        'Você saiu da sua conta com sucesso!',
        'sucesso'
    );


    removerDados('mensagemLogin');
}

if (mensagemLogin === 'conta-removida') {
    mostrarToast(
        'Sua conta foi removida com sucesso!',
        'sucesso'
    );

    removerDados('mensagemLogin');
}

// Recuperar cliente logado
export function obterClienteLogado() {
    const id = lerDados('clienteLogado');

    if (!id) {
        return null;
    }

    return buscarClientePorId(id);
}


// Redirecionar para o login
function redirecionarLogin() {
    const paginaAtual = window.location.pathname.split('/').pop();

    salvarDados(
        'mensagemLogin',
        'login-necessario'
    );

    window.location.href =
        `login.html?retorno=${encodeURIComponent(paginaAtual)}`;
}


// Verificar se o cliente está logado
export function exigirLogin() {
    const cliente = obterClienteLogado();

    if (!cliente) {
        redirecionarLogin();
        return null;
    }

    return cliente;
}


// Verificar se o cliente é administrador
export function exigirAdmin() {
    const cliente = exigirLogin();

    if (!cliente) {
        return null;
    }

    if (cliente.perfil !== 'admin') {
        window.location.href = 'index.html';
        return null;
    }

    return cliente;
}


// Controlar navegação
const cliente = obterClienteLogado();

const navCadastro = document.getElementById('nav-cadastro');
const navLogin = document.getElementById('nav-login');
const navPerfil = document.getElementById('nav-perfil');
const navRelatorios = document.getElementById('nav-relatorios');

if (navCadastro) {
    navCadastro.hidden = cliente !== null;
}

if (navLogin) {
    navLogin.hidden = cliente !== null;
}

if (navPerfil) {
    navPerfil.hidden = cliente === null;
}

if (navRelatorios) {
    navRelatorios.hidden = !cliente || cliente.perfil !== 'admin';
}


// Proteger páginas
const permissao = document.body.dataset.permissao;

if (permissao === 'cliente') {
    exigirLogin();
}

if (permissao === 'admin') {
    exigirAdmin();
}
