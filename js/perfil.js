import {
    carregarClientes,
    atualizarCliente,
    removerCliente,
    removerDados,
    salvarDados
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

import { exigirLogin } from './sessao.js';
import { mostrarToast, abrirModal, fecharModal, exibirErros } from './ui.js';


// Recuperar cliente logado
const cliente = exigirLogin();

if (cliente) {

    // Formulário e campos
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


    // Preencher campos com os dados do cliente
    campoId.value = cliente.id;
    campoNome.value = cliente.nome;
    campoCpf.value = formatarCpf(cliente.cpf);
    campoEmail.value = cliente.email;
    campoTelefone.value = formatarTelefone(cliente.telefone);

    campoTelefone.addEventListener('input', function () {
        campoTelefone.value = formatarTelefone(campoTelefone.value);
    });


    // Salvar alterações
    formPerfil.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Ignorar o próprio cliente na verificação de e-mail repetido
        const outrosClientes = carregarClientes().filter(
            c => c.id !== cliente.id
        );

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim().toLowerCase();
        const telefone = campoTelefone.value.replace(/\D/g, '');
        const senha = campoSenha.value;
        const confirmacao = campoConfirma.value;

        // Senha só é validada se o cliente quiser alterá-la
        const alterarSenha = senha !== '' || confirmacao !== '';

        const temErro = exibirErros([
            [campoNome, erroNome, validarNome(nome)],
            [campoEmail, erroEmail, validarEmail(email, outrosClientes)],
            [campoTelefone, erroTelefone, validarTelefone(telefone)],
            [campoSenha, erroSenha, alterarSenha ? validarSenha(senha) : ''],
            [campoConfirma, erroConfirma, alterarSenha ? validarConfirmacaoSenha(senha, confirmacao) : '']
        ]);

        if (temErro) {
            return;
        }

        // Criar objeto atualizado
        const clienteAtualizado = { ...cliente, nome, email, telefone };

        if (senha !== '') {
            clienteAtualizado.salt = gerarSalt();
            clienteAtualizado.senhaHash = await gerarHash(senha, clienteAtualizado.salt);
        }

        // Verificar se houve alguma alteração
        if (JSON.stringify(clienteAtualizado) === JSON.stringify(cliente)) {
            mostrarToast('Nenhuma alteração foi realizada.', 'info');
            return;
        }

        if (atualizarCliente(clienteAtualizado)) {
            Object.assign(cliente, clienteAtualizado);

            campoSenha.value = '';
            campoConfirma.value = '';

            mostrarToast('Alterações salvas com sucesso!', 'sucesso');
        }
    });


    // Encerrar sessão e voltar para a página inicial
    function sair(mensagem) {
        removerDados('clienteLogado');
        salvarDados('mensagemLogin', mensagem);

        window.location.href = 'index.html';
    }

    // Sair da conta
    document.getElementById('botao-sair').addEventListener('click', function () {
        sair('logout-sucesso');
    });

    // Remover conta (com confirmação)
    document.getElementById('botao-remover-conta').addEventListener('click', function () {
        abrirModal('dialog-remover');
    });

    document.getElementById('cancelar-remocao').addEventListener('click', function () {
        fecharModal('dialog-remover');
    });

    document.getElementById('confirmar-remocao').addEventListener('click', function () {
        if (removerCliente(cliente.id)) {
            sair('conta-removida');
        }
    });
}
