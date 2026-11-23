// imports
import { lerDados, salvarDados } from './storage.js';

// Máscaras

// CPF
export function formatarCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');

    cpf = cpf.slice(0, 11);

    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    return cpf;
}

// Telefone
export function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');

    telefone = telefone.slice(0, 11);

    telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
    telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');

    return telefone;
}




// validações

// Nome
export function validarNome(nome) {
    nome = nome.trim();

    const partesNome = nome.split(/\s+/);

    if (nome.length < 3 || partesNome.length < 2) {
        return 'Digite seu nome completo (nome e sobrenome).';
    }

    return '';
}

// E-mail
export function validarEmail(email, clientes) {
    email = email.trim().toLowerCase();

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
        return 'Digite um e-mail válido.';
    }

    if (clientes.some(cliente => cliente.email === email)) {
        return 'Este e-mail já está cadastrado.';
    }

    return '';
}

// Telefone
export function validarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');

    const formatoTelefone = /^\d{10,11}$/;

    if (!formatoTelefone.test(telefone)) {
        return 'Digite um telefone válido.';
    }

    return '';
}

// Senha
export function validarSenha(senha) {
    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    if (senha.length < 8 || !temLetra || !temNumero) {
        return 'Senha inválida. Mínimo de 8 caracteres e deve conter letras e números.';
    }

    return '';
}

// Força da senha
export function verificarForcaSenha(senha) {
    let minimo = '';
    let letra = '';
    let numero = '';

    if (senha === '') {
        return {
            minimo,
            letra,
            numero
        };
    }

    if (senha.length < 8) {
        minimo = 'Tamanho mínimo da senha é 8 caracteres.';
    }

    if (!/[a-zA-Z]/.test(senha)) {
        letra = 'A senha deve conter letras.';
    }

    if (!/[0-9]/.test(senha)) {
        numero = 'A senha deve conter números.';
    }

    return {
        minimo,
        letra,
        numero
    };
}

// Confirmação de senha
export function validarConfirmacaoSenha(senha, confirmacaoSenha) {
    if (confirmacaoSenha === '') {
        return 'Confirme sua senha.';
    }

    if (confirmacaoSenha !== senha) {
        return 'As senhas não coincidem.';
    }

    return '';
}

// CPF
export function validarCpf(cpf, clientes) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return 'Digite um CPF válido.';
    }

    // Cálculo do primeiro dígito verificador
    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = soma % 11;
    let digitoUm = resto < 2 ? 0 : 11 - resto;

    // Cálculo do segundo dígito verificador
    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = soma % 11;
    let digitoDois = resto < 2 ? 0 : 11 - resto;

    // Verificar os dígitos
    if (
        Number(cpf[9]) !== digitoUm ||
        Number(cpf[10]) !== digitoDois
    ) {
        return 'CPF inválido.';
    }

    // Verificar CPF duplicado
    if (clientes.some(cliente => cliente.cpf === cpf)) {
        return 'Este CPF já está cadastrado.';
    }

    return '';
}


// Gerar ID
export function gerarID() {
    let contador = Number(lerDados('contadorClientes', 0));

    contador++;

    salvarDados('contadorClientes', contador);

    return 'C' + String(contador).padStart(3, '0');
}

// Gerar salt
export function gerarSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16));

    return Array.from(salt)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

// Gerar hash da senha
export async function gerarHash(senha, salt) {
    const dados = new TextEncoder().encode(senha + salt);

    const resultado = await crypto.subtle.digest('SHA-256', dados);

    const hash = Array.from(new Uint8Array(resultado))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    return hash;
}


