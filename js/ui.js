// Exibir toast
let tempoToast;

export function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');

    if (!toast) {
        return;
    }

    toast.textContent = mensagem;
    toast.className = `toast ${tipo} mostrar`;

    clearTimeout(tempoToast);

    tempoToast = setTimeout(function () {
        toast.classList.remove('mostrar');
    }, 3000);
}


// Abrir e fechar modal
export function abrirModal(id) {
    document.getElementById(id).showModal();
}

export function fecharModal(id) {
    document.getElementById(id).close();
}


// Exibir mensagens de erro dos formulários
// Recebe uma lista de [campo, elementoDeErro, mensagem].
// Mostra todas as mensagens, foca o primeiro campo com erro
// e retorna true se houver algum erro.
export function exibirErros(validacoes) {
    validacoes.forEach(function ([, elementoErro, mensagem]) {
        elementoErro.textContent = mensagem;
    });

    const primeiroErro = validacoes.find(validacao => validacao[2]);

    if (primeiroErro) {
        primeiroErro[0].focus();
        return true;
    }

    return false;
}
