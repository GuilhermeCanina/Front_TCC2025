import { useNavigate } from 'react-router-dom';
import AvatarUploader from '../components/MudarAvatar';
import MudarNome from '../components/MudarNome';
import ExcluirConta from '../components/ExcluirConta';
import MudarEmail from '../components/MudarEmail';
import '../styles/config.css';
import { FiArrowLeft } from 'react-icons/fi'; // Importe o ícone

function Config() {
  const navigate = useNavigate();

  return (
    <div className="config-container">
      {/* Cabeçalho com botão de voltar */}
      <div className="config-header">
        <button 
          className="btn-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <FiArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h1>Configurações</h1>
      </div>
      
      <section className="config-section">
        <h2>Alterar Avatar</h2>
        <div className="avatar-uploader-container">
          <AvatarUploader currentAvatar={null} userInitial={""} />
        </div>
      </section>
      
      <section className="config-section">
        <h2>Alterar Nome</h2>
        <div className="name-changer-container">
          <MudarNome />
        </div>
      </section>

      <section className="config-section">
        <h2>Alterar Email</h2>
        <div className="email-changer-container">
          <MudarEmail />
        </div>
      </section>

      <section className="config-section danger-zone">
        <h2>Zona de Perigo</h2>
        <div className="danger-zone-container">
          <p>Essas ações são irreversíveis. Tenha certeza antes de prosseguir.</p>
          <ExcluirConta /> 
        </div>
      </section>
    </div>
  );
};

export default Config;