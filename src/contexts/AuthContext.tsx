import { createContext, useContext, useState, ReactNode } from 'react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'fisioterapeuta' | 'tecnico';
}

// Contexto de autenticação para gerenciar o estado do usuário logado
interface AuthContextType {
  usuario: Usuario | null;
  salvarUsuario: (u: Usuario) => void;
  logout: () => void;
}

const STORAGE_KEY = "oxy-elit-usuario";
const AuthContext = createContext<AuthContextType | null>(null);

// Componente provedor de autenticação para envolver a aplicação e fornecer o estado de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>( () => {
    try {
      const usuarioSalvo = localStorage.getItem(STORAGE_KEY);
      return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch (e) {
      console.error("Erro ao carregar usuário do localStorage:", e);
      return null;
    }
  });

  const salvarUsuario = (u: Usuario) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUsuario(u);
  };
  
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, salvarUsuario, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acessar o contexto de autenticação de forma mais fácil
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}