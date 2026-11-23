
const formLogin = document.getElementById('form-login');

const campoEmail = document.getElementById('emaillogin');
const campoSenha = document.getElementById('senha');

const erroLogin = document.getElementById('erro-login');
const botaoLogin = document.getElementById('botao-login');

let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

let tentativasFalhas = Number(localStorage.getItem('tentativasFalhas')) || 0;

let bloqueioAte = Number(localStorage.getItem('bloqueioAte')) || 0;

let intervalo;

formLogin.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Verificar se há bloqueio
    if (Date.now() < bloqueioAte) {
        return;
    }

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    const cliente = clientes.find(c => c.email === email);

    if (!cliente) {
        registrarTentativaFalha();
        return;
    }

    const hash = await gerarHash(senha, cliente.salt);

    if (hash !== cliente.senhaHash) {
        registrarTentativaFalha();
        return;
    }

    tentativasFalhas = 0;
    bloqueioAte = 0;

    localStorage.removeItem('tentativasFalhas');
    localStorage.removeItem('bloqueioAte');

    erroLogin.textContent = '';

    localStorage.setItem('clienteLogado', cliente.id);

    window.location.href = 'index.html';
});

function registrarTentativaFalha() {
    tentativasFalhas++;

    localStorage.setItem('tentativasFalhas', tentativasFalhas);

    if (tentativasFalhas >= 3) {
        bloqueioAte = Date.now() + 60000;

        localStorage.setItem('bloqueioAte', bloqueioAte);

        verificarBloqueio();
    } else {
        erroLogin.textContent = 'E-mail ou senha inválidos.';
    }
}

async function gerarHash(senha, salt) {
    const dados = new TextEncoder().encode(senha + salt);

    const resultado = await crypto.subtle.digest('SHA-256', dados);

    const hash = Array.from(new Uint8Array(resultado))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    return hash;
}

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

                localStorage.removeItem('tentativasFalhas');
                localStorage.removeItem('bloqueioAte');

                erroLogin.textContent = '';

                botaoLogin.disabled = false;

                return;
            }

            erroLogin.textContent = `Muitas tentativas. Tente novamente em ${restante} segundos.`;

        }, 1000);
    }
}

verificarBloqueio();
