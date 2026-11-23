// Imports
import {
    salvarClientes,
    carregarClientes
} from './storage.js';

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


// Captação de formulário e campos
const formCadastro = document.getElementById('form-cadastro');

// Campos
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
// CPF

campoCpf.addEventListener('input', function () {
    campoCpf.value = formatarCpf(campoCpf.value);
});

// telefone
campoTelefone.addEventListener('input', function () {
    campoTelefone.value = formatarTelefone(campoTelefone.value);
});


// Indicador de requisitos da senha
campoSenha.addEventListener('input', function () {
    const senha = campoSenha.value;

    const forca = verificarForcaSenha(senha);

    naoMinimo.textContent = forca.minimo;
    naoLetra.textContent = forca.letra;
    naoNumero.textContent = forca.numero;
});


// Envio do formulário
formCadastro.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Recuperar clientes atualizados
    const clientes = carregarClientes();

    // Informações do formulário
    const nome = campoNome.value.trim();
    const cpf = campoCpf.value.replace(/\D/g, '');
    const email = campoEmail.value.trim().toLowerCase();
    const telefone = campoTelefone.value.replace(/\D/g, '');
    const senha = campoSenha.value;
    const confirmacaoSenha = campoConfirma.value;

    // Validar campos
    erroNome.textContent = validarNome(nome);
    erroCpf.textContent = validarCpf(cpf, clientes);
    erroEmail.textContent = validarEmail(email, clientes);
    erroTelefone.textContent = validarTelefone(telefone);
    erroSenha.textContent = validarSenha(senha);
    erroConfirma.textContent = validarConfirmacaoSenha(senha, confirmacaoSenha);

    // Verificar se os campos são válidos
    if (
        erroNome.textContent || erroCpf.textContent || erroEmail.textContent || erroTelefone.textContent || erroSenha.textContent || erroConfirma.textContent) {
        if (erroNome.textContent) campoNome.focus();
        else if (erroCpf.textContent) campoCpf.focus();
        else if (erroEmail.textContent) campoEmail.focus();
        else if (erroTelefone.textContent) campoTelefone.focus();
        else if (erroSenha.textContent) campoSenha.focus();
        else campoConfirma.focus();

        return;
    }

    // Gerar ID, salt e hash
    const id = gerarID();
    const salt = gerarSalt();
    const hash = await gerarHash(senha, salt);

    // Criar cliente
    const cliente = {
        id: id,
        nome: nome,
        cpf: cpf,
        email: email,
        telefone: telefone,
        perfil: 'cliente',
        senhaHash: hash,
        salt: salt
    };

    // Salvar cliente
    salvarClientes(cliente);

    // Limpar formulário
    formCadastro.reset();

    // Limpar mensagens
    erroNome.textContent = '';
    erroCpf.textContent = '';
    erroEmail.textContent = '';
    erroTelefone.textContent = '';
    erroSenha.textContent = '';
    erroConfirma.textContent = '';

    naoMinimo.textContent = '';
    naoLetra.textContent = '';
    naoNumero.textContent = '';
});


