import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaChartBar,
  FaComments,
  FaStar,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/redacao.css";

export default function Redacao() {
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const [linhas, setLinhas] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const linhasArray = texto.split("\n");
    setLinhas(Math.min(linhasArray.length, 30));
  }, [texto]);

  const handleTextoChange = (e) => {
    let novoTexto = e.target.value;

    novoTexto = novoTexto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const linhasArray = novoTexto.split("\n");
    if (linhasArray.length > 30) {
      novoTexto = linhasArray.slice(0, 30).join("\n");
    }

    setTexto(novoTexto);
  };

  const enviarRedacao = async () => {
    if (!texto.trim()) return alert("Digite a redação antes de enviar.");
    if (linhas > 30) return alert("A redação não pode ultrapassar 30 linhas.");

    setLoading(true);
    try {
      const res = await axios.post(
        "https://api-tcc-senai2025.vercel.app/api/redacao",
        { texto }
      );
      setResultado(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao corrigir redação. Tente novamente.");
    }
    setLoading(false);
  };

  const limparRedacao = () => {
    setTexto("");
    setResultado(null);
    setLinhas(0);
  };

  const voltarParaHome = () => {
    if (texto && !resultado) {
      if (
        window.confirm(
          "Tem certeza que deseja voltar? Sua redação não foi corrigida ainda."
        )
      ) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const getNotaColor = (nota) => {
    if (nota >= 180) return "excelente";
    if (nota >= 120) return "bom";
    if (nota >= 60) return "regular";
    return "insuficiente";
  };

  return (
    <div className="redacao-container">
      <div className="redacao-header">
        <div className="header-top">
          <button onClick={voltarParaHome} className="btn-voltar">
            <FaArrowLeft className="btn-icon" />
            Voltar
          </button>
          <h1>
            <FaEdit className="header-icon" />
            Corretor de Redação ENEM
          </h1>
          <div className="header-spacer"></div>
        </div>
        <p className="subtitle">
          Escreva sua redação e receba feedback detalhado
        </p>
      </div>

      <div className="redacao-content">
        <div className="escrita-section">
          <div className="controle-tema">
            <label>
              Tema da Redação:
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Desafios para a valorização da cultura indígena no Brasil..."
                className="tema-input"
              />
            </label>
          </div>

          <div className="area-texto-container">
            <div className="indicador-linhas">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={`linha-numero ${
                    i + 1 === 30 ? "ultima-linha" : ""
                  } ${i < linhas ? "linha-preenchida" : ""}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={texto}
              onChange={handleTextoChange}
              placeholder="Digite sua redação aqui..."
              className="redacao-textarea"
              maxLength={5000}
            />
          </div>

          <div className="contador-info">
            <span className="contador-linhas">Linhas: {linhas}/30</span>
            <span className="contador-caracteres">
              Caracteres: {texto.length}
            </span>
          </div>

          <div className="botoes-acao">
            <button
              onClick={enviarRedacao}
              disabled={loading || !texto.trim()}
              className="btn-enviar"
            >
              <FaChartBar className="btn-icon" />
              {loading ? "Corrigindo..." : "Enviar para Correção"}
            </button>

            <button
              onClick={limparRedacao}
              disabled={loading}
              className="btn-limpar"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="feedback-section">
          {!resultado ? (
            <div className="placeholder-feedback">
              <FaComments className="placeholder-icon" />
              <h3>Feedback da Redação</h3>
              <p>
                Envie sua redação para receber uma correção detalhada baseada
                nas 5 competências do ENEM.
              </p>

              <div className="competencias-info">
                <h4>Competências Avaliadas:</h4>
                <ul>
                  <li>
                    <FaCheck className="competencia-icon" /> Domínio da norma
                    culta
                  </li>
                  <li>
                    <FaCheck className="competencia-icon" /> Compreensão do tema
                  </li>
                  <li>
                    <FaCheck className="competencia-icon" /> Argumentação e
                    organização
                  </li>
                  <li>
                    <FaCheck className="competencia-icon" /> Coesão textual
                  </li>
                  <li>
                    <FaCheck className="competencia-icon" /> Proposta de
                    intervenção
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="resultado-correcao">
              <div className="nota-final">
                <FaStar className="nota-icon" />
                <div className="nota-info">
                  <span className="nota-label">NOTA FINAL</span>
                  <span className="nota-valor">{resultado.notaFinal}</span>
                </div>
              </div>

              <div className="competencias-grid">
                <div
                  className={`competencia ${getNotaColor(
                    resultado.competencia1
                  )}`}
                >
                  <span className="competencia-numero">C1</span>
                  <div className="competencia-info">
                    <span className="competencia-titulo">
                      Domínio da Norma Culta
                    </span>
                    <span className="competencia-nota">
                      {resultado.competencia1} pontos
                    </span>
                  </div>
                </div>

                <div
                  className={`competencia ${getNotaColor(
                    resultado.competencia2
                  )}`}
                >
                  <span className="competencia-numero">C2</span>
                  <div className="competencia-info">
                    <span className="competencia-titulo">
                      Compreensão do Tema
                    </span>
                    <span className="competencia-nota">
                      {resultado.competencia2} pontos
                    </span>
                  </div>
                </div>

                <div
                  className={`competencia ${getNotaColor(
                    resultado.competencia3
                  )}`}
                >
                  <span className="competencia-numero">C3</span>
                  <div className="competencia-info">
                    <span className="competencia-titulo">
                      Seleção de Argumentos
                    </span>
                    <span className="competencia-nota">
                      {resultado.competencia3} pontos
                    </span>
                  </div>
                </div>

                <div
                  className={`competencia ${getNotaColor(
                    resultado.competencia4
                  )}`}
                >
                  <span className="competencia-numero">C4</span>
                  <div className="competencia-info">
                    <span className="competencia-titulo">Coesão Textual</span>
                    <span className="competencia-nota">
                      {resultado.competencia4} pontos
                    </span>
                  </div>
                </div>

                <div
                  className={`competencia ${getNotaColor(
                    resultado.competencia5
                  )}`}
                >
                  <span className="competencia-numero">C5</span>
                  <div className="competencia-info">
                    <span className="competencia-titulo">
                      Proposta de Intervenção
                    </span>
                    <span className="competencia-nota">
                      {resultado.competencia5} pontos
                    </span>
                  </div>
                </div>
              </div>

              {resultado.comentarios && (
                <div className="comentarios">
                  <h4>
                    <FaComments className="comentarios-icon" />
                    Comentários do Corretor
                  </h4>
                  {/* Para exibir quebras de linha corretamente */}
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {resultado.comentarios}
                  </p>
                </div>
              )}

              <button onClick={limparRedacao} className="btn-nova-redacao">
                <FaEdit className="btn-icon" />
                Nova Redação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
