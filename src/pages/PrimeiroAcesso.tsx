import '../styles/pages/setup.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarUsuario } from '../database/services/auth';
import logo from '../assets/upOxyElit.png';

interface Props {
  onConcluido: () => void;
}

function PrimeiroAcesso({ onConcluido }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome:   '',
    email:  '',
    senha:  '',
    confirma: '',
  });
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  const atualizar = (campo: string, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleCadastro = async () => {
    if (!form.nome || !form.email || !form.senha) {
      setErro('Preencha todos os campos');
      return;
    }
    if (form.senha !== form.confirma) {
      setErro('As senhas não coincidem');
      return;
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      await cadastrarUsuario({
        nome:      form.nome,
        email:     form.email,
        senha:     form.senha,
        papel:     'fisioterapeuta',
      });
      onConcluido();
      navigate('/login');
    } catch (e: any) {
      setErro(e.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCadastro();
  };

  return (
    <div className="setup-background">
      <div className="setup-card">

        <div className="setup-left">

          <div className="login-logo">
            <div className="login-logo-icon">
              <img src={logo} alt="Logo OxyElit" width={26} />
            </div>
            <div className="login-logo-textos">
              <h1>OXYELIT</h1>
              <p>Monitoramento respiratório clínico</p>
            </div>
          </div>

          <div className="setup-body">
            <div className='titulo-config'>
                <h2>Criar sua conta</h2>
                <div className="setup-step-badge">Configuração inicial</div>
            </div>
            <p>Esta tela aparece apenas uma vez. Configure sua conta de acesso ao sistema.</p>

            <div className="login-campo">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                placeholder="Dr. Nome Sobrenome"
                value={form.nome}
                onChange={e => atualizar('nome', e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="login-campo">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => atualizar('email', e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="login-campo">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={e => atualizar('senha', e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="login-campo">
              <label htmlFor="confirma">Confirmar senha</label>
              <input
                id="confirma"
                type="password"
                placeholder="Repita a senha"
                value={form.confirma}
                onChange={e => atualizar('confirma', e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {erro && (
              <span className="setup-erro">{erro}</span>
            )}

            <div className="login-button">
              <button
                className="btn btn-primary-white"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={handleCadastro}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta e entrar'}
              </button>
            </div>
          </div>

          <div className="login-credits">
            <p>Esta conta terá acesso completo ao sistema</p>
            <p>2026 OxyElit · Fisioterapia Respiratória</p>
          </div>

        </div>

        <div className="login-right">
          {/* mesmo SVG do login */}
        </div>

      </div>
    </div>
  );
}

export default PrimeiroAcesso;