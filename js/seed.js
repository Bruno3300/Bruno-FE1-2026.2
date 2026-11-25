import { carregarClientes, salvarClientes } from './storage.js';
import { gerarSalt, gerarHash, gerarID } from './utils.js';

const ADMIN_EMAIL = 'admin@mangabox.com.br';
const ADMIN_SENHA = 'admin123';

export async function criarAdminPadrao() {
    const existeAdmin = carregarClientes().some(
        cliente => cliente.perfil === 'admin'
    );

    if (existeAdmin) {
        return;
    }

    const salt = gerarSalt();

    salvarClientes({
        id: gerarID(),
        nome: 'Administrador',
        cpf: '52998224725',
        email: ADMIN_EMAIL,
        telefone: '48999999999',
        perfil: 'admin',
        senhaHash: await gerarHash(ADMIN_SENHA, salt),
        salt: salt
    });
}