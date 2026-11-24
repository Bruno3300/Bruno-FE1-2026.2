import { mesclarCarrinhoVisitante } from './carrinho.js';
import { carregarClientes, lerDados, salvarDados, removerDados } from './storage.js';
import { gerarHash } from './utils.js';
import { mostrarToast } from './ui.js';


// Capturar formulário e campos
const formLogin = document.getElementById('form-login');

// Campos
const campoEmail = document.getElementById('emaillogin');
const campoSenha = document.getElementById('senha');

// Mensagens de Erro
const erroLogin = document.getElementById('erro-login');
const botaoLogin = document.getElementById('botao-login');


// Recuperar mensagem salva
const mensagem = lerDados('mensagemLogin');

if (mensagem === 'login-necessario') {
    mostrarToast(
        'Você precisa entrar na sua conta para acessar esta página.',
        'info'
    );

    removerDados('mensagemLogin');
}


// Recuperar página de retorno
const parametros = new URLSearchParams(window.location.search);

const retorno = parametros.get('retorno');

// Permitir somente as páginas protegidas previstas
const paginasPermitidas = [
    'perfil.html',
    'relatorios.html'
];

let paginaDestino = 'index.html';

if (paginasPermitidas.includes(retorno)) {
    paginaDestino = retorno;
}


// Recuperar tentativas e bloqueio
let tentativasFalhas = lerDados('tentativasFalhas', 0);
let bloqueioAte = lerDados('bloqueioAte', 0);


// Controlar bloqueio
function verificarBloqueio() {
    const tempoRestante = Math.ceil(
        (bloqueioAte - Date.now()) / 1000
    );

    if (tempoRestante > 0) {
        botaoLogin.disabled = true;

        erroLogin.textContent =
            `Muitas tentativas. Tente novamente em ${tempoRestante} segundos.`;

        return true;
    }

    botaoLogin.disabled = false;

    return false;
}


// Registrar tentativa incorreta
function registrarTentativaFalha() {
    tentativasFalhas++;

    salvarDados('tentativasFalhas', tentativasFalhas);

    if (tentativasFalhas >= 3) {
        bloqueioAte = Date.now() + (60 * 1000);

        salvarDados('bloqueioAte', bloqueioAte);

        verificarBloqueio();

        return;
    }

    erroLogin.textContent =
        `E-mail ou senha incorretos. Tentativa ${tentativasFalhas} de 3.`;
}


// Atualizar contagem regressiva
const intervaloBloqueio = setInterval(function () {
    if (bloqueioAte > 0) {
        const bloqueado = verificarBloqueio();

        if (!bloqueado) {
            clearInterval(intervaloBloqueio);

            tentativasFalhas = 0;
            bloqueioAte = 0;

            salvarDados('tentativasFalhas', 0);
            salvarDados('bloqueioAte', 0);

            erroLogin.textContent = '';
        }
    }
}, 1000);


// Verificar bloqueio ao abrir a página
verificarBloqueio();


// Realizar login
formLogin.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Verificar se está bloqueado
    if (verificarBloqueio()) {
        return;
    }

    // Recuperar informações
    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    // Recuperar clientes
    const clientes = carregarClientes();

    // Procurar cliente pelo e-mail
    const cliente = clientes.find(
        c => c.email.toLowerCase() === email
    );

    // Verificar se o cliente existe
    if (!cliente) {
        registrarTentativaFalha();
        return;
    }

    // Gerar hash da senha informada
    const hash = await gerarHash(senha, cliente.salt);

    // Verificar senha
    if (hash !== cliente.senhaHash) {
        registrarTentativaFalha();
        return;
    }

    // Login realizado com sucesso

    // Limpar tentativas e bloqueio
    tentativasFalhas = 0;
    bloqueioAte = 0;

    removerDados('tentativasFalhas');
    removerDados('bloqueioAte');

    // Registrar cliente logado
    salvarDados('clienteLogado', cliente.id);

    // Mesclar carrinho do visitante
    mesclarCarrinhoVisitante(cliente.id);

    // Salvar mensagem de sucesso
    salvarDados('mensagemLogin', 'login-sucesso');

    // Redirecionar para a página desejada
    window.location.href = paginaDestino;
});
