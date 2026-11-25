import { lerDados, salvarDados } from './storage.js';


// Máscaras
export function formatarCpf(cpf) {
    return cpf
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatarTelefone(telefone) {
    return telefone
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatarCep(cep) {
    return cep
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2')
}

// Validações (retornam '' quando válido)

export function valiadarCep(cep) {
    cep = cep.replace(/\D/g, '');

    if (cep.length < 8) {
        return 'Digite um CEP válido.';
    }

    return '';
}

export function validarNome(nome) {
    const partes = nome.trim().split(/\s+/);

    if (nome.trim().length < 3 || partes.length < 2) {
        return 'Digite seu nome completo (nome e sobrenome).';
    }

    return '';
}

export function validarEmail(email, clientes) {
    email = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Digite um e-mail válido.';
    }

    if (clientes.some(cliente => cliente.email === email)) {
        return 'Este e-mail já está cadastrado.';
    }

    return '';
}

export function validarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');

    if (!/^\d{10,11}$/.test(telefone)) {
        return 'Digite um telefone válido.';
    }

    return '';
}

export function validarSenha(senha) {
    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    if (senha.length < 8 || !temLetra || !temNumero) {
        return 'Senha inválida. Mínimo de 8 caracteres e deve conter letras e números.';
    }

    return '';
}

export function verificarForcaSenha(senha) {
    // Senha vazia: nenhum aviso
    if (senha === '') {
        return { minimo: '', letra: '', numero: '' };
    }

    return {
        minimo: senha.length < 8 ? 'Tamanho mínimo da senha é 8 caracteres.' : '',
        letra: /[a-zA-Z]/.test(senha) ? '' : 'A senha deve conter letras.',
        numero: /[0-9]/.test(senha) ? '' : 'A senha deve conter números.'
    };
}

export function validarConfirmacaoSenha(senha, confirmacaoSenha) {
    if (confirmacaoSenha === '') {
        return 'Confirme sua senha.';
    }

    if (confirmacaoSenha !== senha) {
        return 'As senhas não coincidem.';
    }

    return '';
}

// Calcula um dígito verificador do CPF (tamanho 9 → 1º dígito, 10 → 2º dígito)
function calcularDigitoCpf(cpf, tamanho) {
    let soma = 0;

    for (let i = 0; i < tamanho; i++) {
        soma += Number(cpf[i]) * (tamanho + 1 - i);
    }

    const resto = soma % 11;

    return resto < 2 ? 0 : 11 - resto;
}

export function validarCpf(cpf, clientes) {
    cpf = cpf.replace(/\D/g, '');

    if (
        cpf.length !== 11 ||
        /^(\d)\1{10}$/.test(cpf) ||
        Number(cpf[9]) !== calcularDigitoCpf(cpf, 9) ||
        Number(cpf[10]) !== calcularDigitoCpf(cpf, 10)
    ) {
        return 'Digite um CPF válido.';
    }

    if (clientes.some(cliente => cliente.cpf === cpf)) {
        return 'Este CPF já está cadastrado.';
    }

    return '';
}


// Cartão de crédito
export function formatarCartao(numero) {
    return numero
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatarValidade(validade) {
    return validade
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/^(\d{2})(\d)/, '$1/$2');
}

// Algoritmo de Luhn
export function validarNumeroCartao(numero) {
    numero = numero.replace(/\D/g, '');

    if (numero.length < 13 || numero.length > 16) {
        return 'Digite um número de cartão válido.';
    }

    let soma = 0;

    for (let i = 0; i < numero.length; i++) {
        let digito = Number(numero[numero.length - 1 - i]);

        if (i % 2 === 1) {
            digito *= 2;

            if (digito > 9) {
                digito -= 9;
            }
        }

        soma += digito;
    }

    return soma % 10 === 0 ? '' : 'Digite um número de cartão válido.';
}

export function validarValidadeCartao(validade) {
    const partes = /^(\d{2})\/(\d{2})$/.exec(validade);

    if (!partes) {
        return 'Informe a validade no formato MM/AA.';
    }

    const mes = Number(partes[1]);
    const ano = 2000 + Number(partes[2]);
    const hoje = new Date();

    if (mes < 1 || mes > 12) {
        return 'Mês de validade inválido.';
    }

    if (ano < hoje.getFullYear() || (ano === hoje.getFullYear() && mes < hoje.getMonth() + 1)) {
        return 'Cartão vencido.';
    }

    return '';
}

export function validarCvv(cvv) {
    return /^\d{3,4}$/.test(cvv) ? '' : 'Digite um CVV válido.';
}


// Segurança
export function gerarID() {
    const contador = Number(lerDados('contadorClientes', 0)) + 1;

    salvarDados('contadorClientes', contador);

    return 'C' + String(contador).padStart(3, '0');
}

// Converter bytes em texto hexadecimal
function paraHex(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export function gerarSalt() {
    return paraHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function gerarHash(senha, salt) {
    const dados = new TextEncoder().encode(senha + salt);
    const resultado = await crypto.subtle.digest('SHA-256', dados);

    return paraHex(new Uint8Array(resultado));
}


// Formatar valor como moeda brasileira
export function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}