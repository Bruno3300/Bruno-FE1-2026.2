import { salvarClientes, carregarClientes } from './storage.js';

import {
    validarNome,
    validarCpf,
    validarEmail,
    validarTelefone,
    validarSenha,
    verificarForcaSenha,
    validarConfirmacaoSenha,
    formatarCpf,
    formatarTelefone,
    gerarSalt,
    gerarHash,
    gerarID
} from './utils.js';

import { mostrarToast, exibirErros } from './ui.js';


// Formulário e campos
const formCadastro = document.getElementById('form-cadastro');

const campoNome = document.getElementById('nomecad');
const campoCpf = document.getElementById('cpf');
const campoEmail = document.getElementById('emailcad');
const campoTelefone = document.getElementById('telefone');
const campoSenha = document.getElementById('senha');
const campoConfirma = document.getElementById('senha-confirma');

// Mensagens de erro
const erroNome = document.getElementById('erro-nome');
const erroCpf = document.getElementById('erro-cpf');
const erroEmail = document.getElementById('erro-email');
const erroTelefone = document.getElementById('erro-telefone');
const erroSenha = document.getElementById('erro-senha');
const erroConfirma = document.getElementById('erro-confirma');

// Indicadores de senha
const naoMinimo = document.getElementById('nao-minimo');
const naoLetra = document.getElementById('nao-letra');
const naoNumero = document.getElementById('nao-numero');


// Máscaras
campoCpf.addEventListener('input', function () {
    campoCpf.value = formatarCpf(campoCpf.value);
});

campoTelefone.addEventListener('input', function () {
    campoTelefone.value = formatarTelefone(campoTelefone.value);
});


// Indicador de requisitos da senha
campoSenha.addEventListener('input', function () {
    const forca = verificarForcaSenha(campoSenha.value);

    naoMinimo.textContent = forca.minimo;
    naoLetra.textContent = forca.letra;
    naoNumero.textContent = forca.numero;
});


// Envio do formulário
formCadastro.addEventListener('submit', async function (event) {
    event.preventDefault();

    const clientes = carregarClientes();

    const nome = campoNome.value.trim();
    const cpf = campoCpf.value.replace(/\D/g, '');
    const email = campoEmail.value.trim().toLowerCase();
    const telefone = campoTelefone.value.replace(/\D/g, '');
    const senha = campoSenha.value;

    // Validar campos (mostra os erros e foca o primeiro inválido)
    const temErro = exibirErros([
        [campoNome, erroNome, validarNome(nome)],
        [campoCpf, erroCpf, validarCpf(cpf, clientes)],
        [campoEmail, erroEmail, validarEmail(email, clientes)],
        [campoTelefone, erroTelefone, validarTelefone(telefone)],
        [campoSenha, erroSenha, validarSenha(senha)],
        [campoConfirma, erroConfirma, validarConfirmacaoSenha(senha, campoConfirma.value)]
    ]);

    if (temErro) {
        return;
    }

    // Criar e salvar cliente
    const salt = gerarSalt();

    salvarClientes({
        id: gerarID(),
        nome: nome,
        cpf: cpf,
        email: email,
        telefone: telefone,
        perfil: 'cliente',
        senhaHash: await gerarHash(senha, salt),
        salt: salt
    });

    mostrarToast(
        'Conta criada com sucesso! Redirecionando para o login.',
        'sucesso'
    );

    setTimeout(function () {
        window.location.href = 'login.html';
    }, 3000);

    formCadastro.reset();
});
