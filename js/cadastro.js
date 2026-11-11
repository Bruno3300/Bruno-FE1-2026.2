
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

    const nomeValido = validarNome();


    if (!nomeValido) {
        campoNome.focus();
        return;
    }

});

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