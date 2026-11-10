const formCadastro = document.getElementById('form-cadastro');

formCadastro.addEventListener('submit', function (event) {
    event.preventDefault();

    // Nome
    const nome = document.getElementById('nomecad').value.trim();
    const partesNome = nome.split(' ');


    const cpf = document.getElementById('cpf').value;
    const email = document.getElementById('emailcad').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('senha-confirma').value;

    console.log(nome);
    console.log(cpf);
    console.log(email);
    console.log(telefone);
    console.log(senha);
    console.log(confirmaSenha);

});
