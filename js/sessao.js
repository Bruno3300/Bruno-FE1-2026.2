// Imports
import {
    lerDados,
    buscarClientePorId
} from './storage.js';


// Recuperar cliente logado
export function obterClienteLogado() {
    const id = lerDados('clienteLogado');

    if (!id) {
        return null;
    }

    return buscarClientePorId(id);
}


// Verificar se o cliente está logado
export function exigirLogin() {
    const cliente = obterClienteLogado();

    if (!cliente) {
        window.location.href = 'login.html';
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

// Verifica se o usuário está logado e esconde as páginas que não podem ser acessadas por ele
const cliente = obterClienteLogado();

const navCadastro = document.getElementById('nav-cadastro');
const navLogin = document.getElementById('nav-login');
const navPerfil = document.getElementById('nav-perfil');
const navRelatorios = document.getElementById('nav-relatorios');

// Cadastre e Login disponíveis apenas para usuários sem conta
if (navCadastro) {
    navCadastro.hidden = cliente !== null;
}

if (navLogin) {
    navLogin.hidden = cliente !== null;
}

// Perfil disponível somente para usuários logados
if (navPerfil) {
    navPerfil.hidden = cliente === null;
}

// Relatórios disponível somente para administradores
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
