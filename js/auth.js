// Imports
import {
    carregarClientes,
    lerDados,
    salvarDados,
    removerDados
} from './storage.js';

import {
    gerarHash
} from './utils.js';


// Captação do formulário e campos
const formLogin = document.getElementById('form-login');

// Campos
const campoEmail = document.getElementById('emaillogin');
const campoSenha = document.getElementById('senha');

// Mensagens de erro
const erroLogin = document.getElementById('erro-login');
const botaoLogin = document.getElementById('botao-login');


// Recuperar tentativas e bloqueio
let tentativasFalhas = Number(lerDados('tentativasFalhas', 0));

let bloqueioAte = Number(lerDados('bloqueioAte', 0));

let intervalo;


// Envio do formulário
formLogin.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Verificar se há bloqueio
    if (Date.now() < bloqueioAte) {
        return;
    }

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    // Recuperar clientes atualizados
    const clientes = carregarClientes();

    // Procurar cliente pelo e-mail
    const cliente = clientes.find(c => c.email === email);

    if (!cliente) {
        registrarTentativaFalha();
        return;
    }

    // Gerar hash da senha informada
    const hash = await gerarHash(senha, cliente.salt);

    // Comparar hashes
    if (hash !== cliente.senhaHash) {
        registrarTentativaFalha();
        return;
    }

    // Login realizado
    tentativasFalhas = 0;
    bloqueioAte = 0;

    removerDados('tentativasFalhas');
    removerDados('bloqueioAte');

    erroLogin.textContent = '';

    // Registrar cliente logado
    salvarDados('clienteLogado', cliente.id);

    window.location.href = 'index.html';
});


// Registrar tentativa de login incorreta
function registrarTentativaFalha() {
    tentativasFalhas++;

    salvarDados('tentativasFalhas', tentativasFalhas);

    if (tentativasFalhas >= 3) {
        bloqueioAte = Date.now() + 60000;

        salvarDados('bloqueioAte', bloqueioAte);

        verificarBloqueio();
    } else {
        erroLogin.textContent = 'E-mail ou senha inválidos.';
    }
}


// Verificar bloqueio de login
function verificarBloqueio() {
    const agora = Date.now();

    if (agora < bloqueioAte) {
        botaoLogin.disabled = true;

        if (intervalo) {
            clearInterval(intervalo);
        }

        intervalo = setInterval(() => {
            const restante = Math.ceil((bloqueioAte - Date.now()) / 1000);

            if (restante <= 0) {
                clearInterval(intervalo);

                tentativasFalhas = 0;
                bloqueioAte = 0;

                removerDados('tentativasFalhas');
                removerDados('bloqueioAte');

                erroLogin.textContent = '';

                botaoLogin.disabled = false;

                return;
            }

            erroLogin.textContent =
                `Muitas tentativas. Tente novamente em ${restante} segundos.`;

        }, 1000);
    }
}


// Verificar se já existe um bloqueio
verificarBloqueio();