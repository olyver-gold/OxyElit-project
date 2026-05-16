import { getDb } from "../db";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

interface DadosCadastro {
  nome:  string;
  email: string;
  senha: string;
  papel: string;
}

export async function verificarSetup(): Promise<boolean> {
  const db = await getDb();
  const resultado = await db.select<{ total: number }[]>(
    'SELECT COUNT(*) as total FROM usuarios'
  );
  return resultado[0].total > 0;
}

export async function autenticar(
  email: string,
  senha: string
): Promise<Usuario> {
  const db = await getDb();

  const resultado = await db.select<Usuario[]>(
    `SELECT id, nome, email, papel 
    FROM usuarios 
    WHERE email = ? AND senha_hash = ? AND ativo = 1`,
    [email, senha]
  );

  if (!resultado || resultado.length === 0) {
    throw new Error("Credenciais inválidas");
  }

  return resultado[0];
}

export async function cadastrarUsuario(dados: DadosCadastro): Promise<void> {
  const db = await getDb();

  const existente = await db.select<{ total: number }[]>(
    'SELECT COUNT(*) as total FROM usuarios WHERE email = ?',
    [dados.email]
  );
  if (existente[0].total > 0) {
    throw new Error('Este email já está cadastrado');
  }

  await db.execute(
    `INSERT INTO usuarios (nome, email, senha_hash, papel, ativo)
     VALUES (?, ?, ?, 'fisioterapeuta', 1)`,
    [dados.nome, dados.email, dados.senha]
  );
}

export async function buscarOutrosUsuarios(usuario: number): Promise<Usuario[]> {
  const db = await getDb();

  return await db.select<Usuario[]> (
    `
    SELECT id, nome, email, papel
    FROM usuarios
    WHERE id <> ?
    AND ativo = 1
    ORDER BY nome ASC
    `,
    [usuario]
  );
}