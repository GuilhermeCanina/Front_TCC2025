import { useEffect, useState } from "react";
import "../styles/medalha.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaAward, 
  FaCrown, 
  FaGem, 
  FaShieldAlt,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft
} from "react-icons/fa";

export default function Medalhas() {
  const [medalhas, setMedalhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (!usuario || !token) {
      setError("Você precisa estar logado para ver suas medalhas.");
      setLoading(false);
      return;
    }

    axios.get(`https://api-tcc-senai2025.vercel.app/usuarios/${usuario.id}/medalhas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMedalhas(res.data))
    .catch(err => setError("Erro ao carregar medalhas."))
    .finally(() => setLoading(false));
  }, []);

  const voltarParaHome = () => {
    navigate("/dashboard");
  };

  const getMedalIcon = (medalha, index) => {
    if (medalha.icone) return medalha.icone;
    
    const icons = [FaTrophy, FaMedal, FaStar, FaAward, FaCrown, FaGem, FaShieldAlt];
    const IconComponent = icons[index % icons.length];
    return <IconComponent />;
  };

  if (loading) return (
    <div className="loading-container">
      <FaSpinner className="loading-spinner" />
      <p>Carregando medalhas...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <FaExclamationTriangle className="error-icon" />
      <h2>Ops! Algo deu errado</h2>
      <p>{error}</p>
      <button onClick={voltarParaHome} className="btn-voltar">
        <FaArrowLeft className="btn-icon" />
        Voltar para Home
      </button>
    </div>
  );

  const medalhasGanhas = medalhas;
  const medalhasPendentes = [];

  return (
    <div className="medalhas-container">
      <button onClick={voltarParaHome} className="btn-voltar">
        <FaArrowLeft className="btn-icon" />
        Voltar
      </button>

      <div className="medalhas-header">
        <h1>
          <FaTrophy className="header-icon" />
          Minhas Medalhas
        </h1>
        <p className="medalhas-subtitle">Conquiste todas e mostre seu progresso!</p>
      </div>

      <div className="medalhas-stats">
        <div className="stat-card">
          <div className="stat-number">{medalhasGanhas.length}</div>
          <div className="stat-label">Conquistadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{medalhasPendentes.length}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{medalhas.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {medalhas.length === 0 ? (
        <div className="medalhas-empty">
          <FaTrophy className="medalhas-empty-icon" />
          <h2>Nenhuma medalha ainda</h2>
          <p>Continue estudando e complete desafios para ganhar suas primeiras medalhas!</p>
          <button onClick={voltarParaHome} className="btn-voltar-empty">
            <FaArrowLeft className="btn-icon" />
            Voltar para os Estudos
          </button>
        </div>
      ) : (
        <div className="medalhas-grid">
          {medalhas.map((m, index) => (
            <div 
              key={m.id} 
              className="medalha-card ganha"
            >
              <div className="medalha-icone">
                {getMedalIcon(m, index)}
              </div>
              <h3 className="medalha-titulo">{m.titulo}</h3>
              <p className="medalha-descricao">{m.descricao}</p>
              <div className="medalha-badge ganha">
                <FaCheck className="badge-icon" />
                Conquistada
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}