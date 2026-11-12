
const formCadastro = document.getElementById('form-cadastro');

const campoNome = document.getElementById('nomecad');
const campoCpf = document.getElementById('cpf');
const campoEmail = document.getElementById('emailcad');
const campoTelefone = document.getElementById('telefone');
const campoSenha = document.getElementById('senha');
const campoConfirma = document.getElementById('senha-confirma');

const erroNome = document.getElementById('erro-nome');
const erroCpf = document.getElementById('erro-cpf');
const erroEmail = document.getElementById('erro-email');
const erroTelefone = document.getElementById('erro-telefone');
const erroSenha = document.getElementById('erro-senha');
const naoMinimo = document.getElementById('nao-minimo');
const naoLetra = document.getElementById('nao-letra');
const naoNumero = document.getElementById('nao-numero');
const erroConfirma = document.getElementById('erro-confirma');


formCadastro.addEventListener('submit', function (event) {

    event.preventDefault();

    validarCpf();

});

// Máscaras
campoCpf.addEventListener('input', function () {
    let cpf = campoCpf.value;

    cpf = cpf.replace(/\D/g, '');

    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    campoCpf.value = cpf;

});

campoSenha.addEventListener('input', function () {
    let senha = campoSenha.value;

    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    if (senha != '') {

        // Tamanho
        if (senha.length < 8) {
            naoMinimo.textContent = 'A senha não contém o tamanho mínimo.'
        } else {
            naoMinimo.textContent = ''
        }

        // Letras
        if (!temLetra) {
            naoLetra.textContent = 'A senha não contém letras.'
        } else {
            naoLetra.textContent = ''
        }

        // Números
        if (!temNumero) {
            naoNumero.textContent = 'A senha não contém números.'
        } else {
            naoNumero.textContent = ''
        }
    }





});

// Validações

// Nome
function validarNome() {
    const nome = campoNome.value.trim();
    const partesNome = nome.split(/\s+/);

    if (nome.length < 3 || partesNome.length < 2) {
        erroNome.textContent = 'Digite seu nome completo (nome e sobrenome).';
        return false;
    }

    erroNome.textContent = '';
    return true;
}

// Email
function validarEmail() {

    const email = campoEmail.value.trim();

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
        erroEmail.textContent = 'Digite um e-mail válido.';
        return false;

    }

    erroEmail.textContent = '';
    return true;
}

// Telefone
function validarTelefone() {

    const telefone = campoTelefone.value;

    const formatoTelefone = /^\d{10,11}$/;

    if (!formatoTelefone.test(telefone)) {
        erroTelefone.textContent = 'Digite um telefone válido.';
        return false;
    }

    erroTelefone.textContent = '';
    return true;
}


// Senha
function validarSenha() {
    const senha = campoSenha.value;

    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    if (senha.length < 8 || !temLetra || !temNumero) {
        erroSenha.textContent = 'Senha inválida. Mínimo de 8 caracteres e deve conter letras e números.';
        return false;
    }

    erroSenha.textContent = '';
    return true
}

// CPF
function validarCpf() {
    const cpf = campoCpf.value.replace(/\D/g, '');

    if (cpf.length != 11) {
        erroCpf.textContent = 'Digite um CPF válido.';
        return false
    }

    // calculo do primeiro digito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }
    let resto = soma % 11;
    let digitoVerificadorUm = resto < 2 ? 0 : 11 - resto;

    // calculo do segundo digito verificador
    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = soma % 11;
    let digitoVerificadorDois = resto < 2 ? 0 : 11 - resto;

    // verifica se os digitos verificadores estão corretos
    if (Number(cpf[9]) !== digitoVerificadorUm || Number(cpf[10]) !== digitoVerificadorDois) {
        erroCpf.textContent = 'CPF inválido.';
        return false;
    }

    erroCpf.textContent = '';
    return true;
}

