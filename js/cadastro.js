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

let clientes = JSON.parse(localStorage.getItem('clientes')) || [];


formCadastro.addEventListener('submit', async function (event) {

    event.preventDefault();

    // Informações do formulário
    const nome = campoNome.value;
    const cpf = campoCpf.value;
    const email = campoEmail.value;
    const telefone = campoTelefone.value;
    const senha = campoSenha.value;
    const confirmacaoSenha = campoConfirma.value;

    const nomeValido = validarNome(nome);
    const cpfValido = validarCpf(cpf);
    const emailValido = validarEmail(email);
    const telefoneValido = validarTelefone(telefone);
    const senhaValida = validarSenha(senha);
    const confirmacaoValida = validarConfirmacaoSenha(senha, confirmacaoSenha);



    //    if (nomeValido && cpfValido && emailValido && telefoneValido && senhaValida && confirmacaoValida) {
    //        const cliente = {
    //            id: gerarID(),
    //            nome: campoNome.value,
    //            cpf: campoCpf.value.replace(/\D/g, ''),
    //            email: campoEmail.value,
    //            telefone: campoTelefone.value
    //        };
    //    }

    if (!(nomeValido && cpfValido && emailValido && telefoneValido && senhaValida && confirmacaoValida)) {
        if (!nomeValido) campoNome.focus();
        else if (!cpfValido) campoCpf.focus();
        else if (!emailValido) campoEmail.focus();
        else if (!telefoneValido) campoTelefone.focus();
        else if (!senhaValida) campoSenha.focus();
        else campoConfirma.focus();
        return;
    }

    const id = gerarID();
    const salt = gerarSalt();
    const hash = await gerarHash(senha, salt);

    const cliente = {
        id: gerarID(),
        nome: nome,
        cpf: cpf,
        email: email,
        telefone: telefone,
        senhaHash: hash,
        salt: salt
    };

    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    formCadastro.reset();
});

// Nome
function validarNome(nome) {
    nome = nome.trim();
    const partesNome = nome.split(/\s+/);

    if (nome.length < 3 || partesNome.length < 2) {
        erroNome.textContent = 'Digite seu nome completo (nome e sobrenome).';
        return false;
    }

    erroNome.textContent = '';
    return true;
}

// Email
//TODO melhorar validação
function validarEmail(email) {
    email = email.trim().toLowerCase();

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
        erroEmail.textContent = 'Digite um e-mail válido.';
        return false;
    }

    if (clientes.some(cliente => cliente.email === email)) {
        erroEmail.textContent = 'Este e-mail já está cadastrado.';
        return false;
    }

    erroEmail.textContent = '';
    return true;
}

// Telefone
function validarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');

    const formatoTelefone = /^\d{10,11}$/;

    if (!formatoTelefone.test(telefone)) {
        erroTelefone.textContent = 'Digite um telefone válido.';
        return false;
    }

    erroTelefone.textContent = '';
    return true;
}

campoTelefone.addEventListener('input', function () {
    let telefone = campoTelefone.value.replace(/\D/g, '');

    telefone = telefone.slice(0, 11);

    telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
    telefone = telefone.replace(/(\d{4,5})(\d{4})$/, '$1-$2');

    campoTelefone.value = telefone;
});


// Senha
function validarSenha(senha) {

    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    if (senha.length < 8 || !temLetra || !temNumero) {
        erroSenha.textContent = 'Senha inválida. Mínimo de 8 caracteres e deve conter letras e números.';
        return false;
    }

    erroSenha.textContent = '';
    return true
}

function validarConfirmacaoSenha(senha, confirmacaoSenha) {

    if (confirmacaoSenha === '') {
        erroConfirma.textContent = 'Confirme sua senha.';
        return false;
    }

    if (confirmacaoSenha !== senha) {
        erroConfirma.textContent = 'As senhas não coincidem.';
        return false;
    }

    erroConfirma.textContent = '';
    return true;
}

campoSenha.addEventListener('input', function () {
    let senha = campoSenha.value;

    if (senha === '') {
        naoMinimo.textContent = '';
        naoLetra.textContent = '';
        naoNumero.textContent = '';
        return;
    }

    if (senha.length < 8) {
        naoMinimo.textContent = 'Tamanho mínimo da senha é 8 caracteres.';
    } else {
        naoMinimo.textContent = '';
    }

    if (!/[a-zA-Z]/.test(senha)) {
        naoLetra.textContent = 'A senha deve conter letras.';
    } else {
        naoLetra.textContent = '';
    }

    if (!/[0-9]/.test(senha)) {
        naoNumero.textContent = 'A senha deve conter números.';
    } else {
        naoNumero.textContent = '';
    }

});

// Hash Senha
function gerarSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(salt).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function gerarHash(senha, salt) {
    const dados = new TextEncoder().encode(senha + salt);

    const resultado = await crypto.subtle.digest('SHA-256', dados);

    const hash = Array.from(new Uint8Array(resultado))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    return hash;

}

// CPF
function validarCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length != 11 || /^(\d)\1{10}$/.test(cpf)) {
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

    if (clientes.some(cliente => cliente.cpf === cpf)) {
        erroCpf.textContent = 'Este CPF já está cadastrado.';
        return false;
    }

    erroCpf.textContent = '';
    return true;
}

campoCpf.addEventListener('input', function () {
    let cpf = campoCpf.value;

    cpf = cpf.replace(/\D/g, '');

    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    campoCpf.value = cpf;

});

// id
function gerarID() {
    let contador = Number(localStorage.getItem('contadorClientes')) || 0;

    contador++;

    localStorage.setItem('contadorClientes', contador);

    return 'C' + String(contador).padStart(3, '0');
}