
// Funções importadas
import {
    carregarClientes,
    atualizarCliente,
    removerCliente,
    removerDados
} from './storage.js';

import {
    validarNome,
    validarEmail,
    validarTelefone,
    validarSenha,
    validarConfirmacaoSenha,
    formatarCpf,
    formatarTelefone,
    gerarSalt,
    gerarHash
} from './utils.js';

import {
    exigirLogin
} from './sessao.js';

import {
    mostrarToast,
    abrirModal,
    fecharModal
} from './ui.js';

// Recuperar cliente logado
const cliente = exigirLogin();

if (cliente) {

    // Capturar formulário e campos
    const formPerfil = document.getElementById('form-perfil');

    const campoId = document.getElementById('id-cliente');
    const campoNome = document.getElementById('nomecad');
    const campoCpf = document.getElementById('cpf');
    const campoEmail = document.getElementById('emailcad');
    const campoTelefone = document.getElementById('telefone');
    const campoSenha = document.getElementById('senha');
    const campoConfirma = document.getElementById('senha-confirma');

    // Mensagens de erro
    const erroNome = document.getElementById('erro-nome');
    const erroEmail = document.getElementById('erro-email');
    const erroTelefone = document.getElementById('erro-telefone');
    const erroSenha = document.getElementById('erro-senha');
    const erroConfirma = document.getElementById('erro-confirma');

    // Botões
    const botaoRemover = document.getElementById('botao-remover-conta');
    const botaoSair = document.getElementById('botao-sair');
    const botaoCancelar = document.getElementById('cancelar-remocao');
    const botaoConfirmar = document.getElementById('confirmar-remocao');


    // Preencher campos com os dados do cliente
    campoId.value = cliente.id;
    campoNome.value = cliente.nome;
    campoCpf.value = formatarCpf(cliente.cpf);
    campoEmail.value = cliente.email;
    campoTelefone.value = formatarTelefone(cliente.telefone);


    // Aplicar máscara no telefone
    campoTelefone.addEventListener('input', function () {
        campoTelefone.value = formatarTelefone(campoTelefone.value);
    });


    // Salvar alterações
    formPerfil.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Recuperar clientes atualizados
        const clientes = carregarClientes();

        // Informações do formulário
        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim().toLowerCase();
        const telefone = campoTelefone.value;
        const senha = campoSenha.value;
        const confirmacaoSenha = campoConfirma.value;

        // Excluir o próprio cliente da verificação de e-mail
        const outrosClientes = clientes.filter(
            c => c.id !== cliente.id
        );

        // Validar campos
        erroNome.textContent = validarNome(nome);
        erroEmail.textContent = validarEmail(email, outrosClientes);
        erroTelefone.textContent = validarTelefone(telefone);

        erroSenha.textContent = '';
        erroConfirma.textContent = '';

        // Validar senha somente se quiser alterá-la
        if (senha !== '' || confirmacaoSenha !== '') {
            erroSenha.textContent = validarSenha(senha);

            erroConfirma.textContent =
                validarConfirmacaoSenha(senha, confirmacaoSenha);
        }

        // Verificar erros
        if (
            erroNome.textContent ||
            erroEmail.textContent ||
            erroTelefone.textContent ||
            erroSenha.textContent ||
            erroConfirma.textContent
        ) {
            if (erroNome.textContent) campoNome.focus();
            else if (erroEmail.textContent) campoEmail.focus();
            else if (erroTelefone.textContent) campoTelefone.focus();
            else if (erroSenha.textContent) campoSenha.focus();
            else campoConfirma.focus();

            return;
        }

        // Criar objeto atualizado
        const clienteAtualizado = {
            ...cliente,
            nome: nome,
            email: email,
            telefone: telefone
        };

        // Atualizar senha se foi preenchida
        if (senha !== '') {
            const salt = gerarSalt();
            const hash = await gerarHash(senha, salt);

            clienteAtualizado.salt = salt;
            clienteAtualizado.senhaHash = hash;
        }

        // Verificar se houve alguma alteração
        const houveAlteracao =
            clienteAtualizado.nome !== cliente.nome ||
            clienteAtualizado.email !== cliente.email ||
            clienteAtualizado.telefone !== cliente.telefone ||
            clienteAtualizado.senhaHash !== cliente.senhaHash;

        if (!houveAlteracao) {
            mostrarToast('Nenhuma alteração foi realizada.', 'info');
            return;
        }

        // Salvar alterações
        const atualizado = atualizarCliente(clienteAtualizado);

        if (atualizado) {
            Object.assign(cliente, clienteAtualizado);

            campoSenha.value = '';
            campoConfirma.value = '';

            mostrarToast('Alterações salvas com sucesso!', 'sucesso');
        }
    });


    // Abrir diálogo de remoção
    botaoRemover.addEventListener('click', function () {
        abrirModal('dialog-remover');
    });


    // Cancelar remoção
    botaoCancelar.addEventListener('click', function () {
        fecharModal('dialog-remover');
    });


    // Confirmar remoção
    botaoConfirmar.addEventListener('click', function () {
        const removido = removerCliente(cliente.id);

        if (removido) {
            removerDados('clienteLogado');

            window.location.href = 'index.html';
        }
    });


    // Sair da conta
    botaoSair.addEventListener('click', function () {
        removerDados('clienteLogado');

        window.location.href = 'index.html';
    });
}
