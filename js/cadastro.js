
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


// Validações
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

    for (let o = 0; i < 11; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = soma % 11;
    let digitoVerificadorDois = resto < 2 ? 0 : 11 - resto;

    // verifica se os digitos verificadores estão corretos
    if (Number(cpf[10]) !== digitoVerificadorUm || Number(cpf[11]) !== digitoVerificadorDois) {
        erroCpf.textContent = 'CPF inválido.';
        return false;
    }

    erroCpf.textContent = '';

    return true;
}

