// Exibir toast
let tempoToast;

export function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');

    if (!toast) {
        return;
    }

    toast.textContent = mensagem;
    toast.className = 'toast ' + tipo + ' mostrar';

    clearTimeout(tempoToast);

    tempoToast = setTimeout(function () {
        toast.classList.remove('mostrar');
    }, 3000);
}


// Abrir modal
export function abrirModal(id) {
    const modal = document.getElementById(id);

    modal.showModal();
}


// Fechar modal
export function fecharModal(id) {
    const modal = document.getElementById(id);

    modal.close();
}
