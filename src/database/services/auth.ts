import { getDb } from "../db";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'fisioterapeuta' | 'tecnico';
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