import { mesclarCarrinhoVisitante } from './carrinho.js';
import { carregarClientes, lerDados, salvarDados, removerDados } from './storage.js';
import { gerarHash } from './utils.js';


// Formulário e campos
const formLogin = document.getElementById('form-login');
const campoEmail = document.getElementById('emaillogin');
const campoSenha = document.getElementById('senha');
const erroLogin = document.getElementById('erro-login');
const botaoLogin = document.getElementById('botao-login');


// Página de retorno (somente páginas protegidas previstas)
const retorno = new URLSearchParams(window.location.search).get('retorno');

const paginaDestino = ['perfil.html', 'relatorios.html'].includes(retorno)
    ? retorno
    : 'index.html';


// Tentativas e bloqueio
let tentativasFalhas = lerDados('tentativasFalhas', 0);
let bloqueioAte = lerDados('bloqueioAte', 0);

function limparTentativas() {
    tentativasFalhas = 0;
    bloqueioAte = 0;

    removerDados('tentativasFalhas');
    removerDados('bloqueioAte');
}

// Retorna true se estiver bloqueado
function verificarBloqueio() {
    const tempoRestante = Math.ceil((bloqueioAte - Date.now()) / 1000);

    if (tempoRestante > 0) {
        botaoLogin.disabled = true;
        erroLogin.textContent =
            `Muitas tentativas. Tente novamente em ${tempoRestante} segundos.`;

        return true;
    }

    // Bloqueio terminou: zerar tentativas
    if (bloqueioAte > 0) {
        limparTentativas();
        erroLogin.textContent = '';
    }

    botaoLogin.disabled = false;

    return false;
}

function registrarTentativaFalha() {
    tentativasFalhas++;
    salvarDados('tentativasFalhas', tentativasFalhas);

    if (tentativasFalhas >= 3) {
        bloqueioAte = Date.now() + 60 * 1000;
        salvarDados('bloqueioAte', bloqueioAte);

        verificarBloqueio();
        return;
    }

    erroLogin.textContent =
        `E-mail ou senha incorretos. Tentativa ${tentativasFalhas} de 3.`;
}

// Verificar ao abrir a página e atualizar a contagem a cada segundo
verificarBloqueio();
setInterval(verificarBloqueio, 1000);


// Realizar login
formLogin.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (verificarBloqueio()) {
        return;
    }

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    const cliente = carregarClientes().find(c => c.email === email);

    // Cliente inexistente ou senha incorreta
    const hash = cliente ? await gerarHash(senha, cliente.salt) : null;

    if (!cliente || hash !== cliente.senhaHash) {
        registrarTentativaFalha();
        return;
    }

    // Login realizado com sucesso
    limparTentativas();

    salvarDados('clienteLogado', cliente.id);
    salvarDados('mensagemLogin', 'login-sucesso');

    mesclarCarrinhoVisitante(cliente.id);

    window.location.href = paginaDestino;
});
