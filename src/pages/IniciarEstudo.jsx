import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { FaClock, FaStop, FaSearch, FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/iniciarestudo.css";

export default function IniciarEstudo() {
  const [ano, setAno] = useState(2020);
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respostas, setRespostas] = useState({});
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [materiaSelecionada, setMateriaSelecionada] = useState("Matematica");
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const tkn = localStorage.getItem("token");
    if (usuario?.id && tkn) {
      setUser({ id: usuario.id });
      setToken(tkn);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = secs => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const anoselecionado = async () => {
    if (ano < 2009 || ano > 2023) {
      alert("Ano inválido. Escolha um ano entre 2009 e 2023.");
      return false;
    }
    return true;
  };

  const buscarQuestoes = async () => {
    if (!user || !token) { 
      alert("Você precisa estar logado para buscar questões."); 
      return; 
    }

    const anoValido = await anoselecionado();
    if (!anoValido) return;

    setLoading(true);
    try {
      let url = "https://api-tcc-senai2025.vercel.app/questoes";

      if (ano && materiaSelecionada) {
        url = `https://api-tcc-senai2025.vercel.app/questoes/${ano}/materia/${materiaSelecionada}`;
      } else if (ano) {
        url = `https://api-tcc-senai2025.vercel.app/questoes/${ano}`;
      }

      const response = await axios.get(url);
      setQuestoes(response.data);
      setRespostas({});
      setSeconds(0);
      setIsRunning(true);
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      alert("Erro ao carregar questões. Tente novamente.");
    }
    setLoading(false);
  };

  const encerrarSessao = async () => {
    setIsRunning(false);
    const minutos = Math.floor(seconds / 60);
    if (minutos === 0) { 
      alert("Sessão muito curta, não será salva."); 
      return; 
    }
    try {
      await axios.post(
        "https://api-tcc-senai2025.vercel.app/sessoes",
        { usuarioId: user.id, topico: "Questões ENEM", duracao: minutos },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Sessão salva! Duração: ${minutos} minutos`);
      setSeconds(0);
      setQuestoes([]);
    } catch (err) {
      console.error("Erro ao salvar sessão:", err);
      alert("Erro ao salvar sessão");
    }
  };

  const voltarParaHome = () => {
    if (isRunning) {
      if (window.confirm("Tem certeza que deseja voltar? A sessão atual será perdida.")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const escolherAlternativa = async (index, letra) => {
    setRespostas(prev => ({ ...prev, [index]: letra }));
    const questao = questoes.find(q => q.index === index);
    if (!questao || !user || !token) return;
    const respostaCorreta = questao.alternatives.find(a => a.isCorrect)?.letter;
    const acertou = letra === respostaCorreta;
    try {
      await axios.post(
        "https://api-tcc-senai2025.vercel.app/respostas",
        { usuarioId: user.id, questaoId: questao.index, correta: acertou },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error("Erro ao salvar resposta:", err); }
  };

  const mensagensErradas = ["Não foi dessa vez!", "Ops, tente novamente!", "Quase lá!", "Resposta incorreta!"];

  const markdownComponents = {
    p: ({node, ...props}) => <p className={props.className} {...props} />,
    img: ({node, ...props}) => <img className="questao-img" {...props} />
  };

  return (
    <div className="container">
      <h1>Iniciar Estudo</h1>

      <div className="timer">
        <FaClock className="timer-icon" />
        <span>Tempo: {formatTime(seconds)}</span>
      </div>

      <div className="inputs">
        <label>
          Ano:
          <input 
            type="number" 
            value={ano} 
            onChange={e => setAno(e.target.value)} 
            min="2009" 
            max="2023" 
          />
        </label>
        
        <label>
          Matéria:
          <select 
            value={materiaSelecionada} 
            onChange={e => setMateriaSelecionada(e.target.value)}
          >
            <option value="Matematica">Matemática</option>
            <option value="Linguagens">Português</option>
            <option value="Fisica">Física</option>
            <option value="Quimica">Química</option>
          </select>
        </label>
        
        <div className="botoes-acao">
          <button onClick={buscarQuestoes} disabled={loading}>
            <FaSearch className="button-icon" />
            {loading ? "Buscando..." : "Buscar Questões"}
          </button>
          
          {isRunning && (
            <button onClick={encerrarSessao} className="encerrar">
              <FaStop className="button-icon" />
              Encerrar Sessão
            </button>
          )}
          
          <button onClick={voltarParaHome} className="voltar">
            <FaArrowLeft className="button-icon" />
            Voltar
          </button>
        </div>
      </div>

      {loading && <p className="loading">Carregando questões...</p>}

      {questoes.map(q => {
        const respostaUsuario = respostas[q.index];
        const respostaCorreta = q.alternatives.find(a => a.isCorrect)?.letter;
        const acertou = respostaUsuario === respostaCorreta;
        const mensagem = respostaUsuario ? 
          (acertou ? "Resposta Correta!" : mensagensErradas[Math.floor(Math.random() * mensagensErradas.length)]) : "";

        return (
          <section key={q.index} className="questao-card">
            <h3>Questão {q.index}</h3>
            {q.context && <ReactMarkdown components={markdownComponents}>{q.context}</ReactMarkdown>}
            {q.alternativesIntroduction && <ReactMarkdown components={markdownComponents}>{q.alternativesIntroduction}</ReactMarkdown>}

            <ul className="alternativas">
              {q.alternatives.map(a => {
                const isEscolhida = respostaUsuario === a.letter;
                return (
                  <li key={a.letter}>
                    <button 
                      onClick={() => escolherAlternativa(q.index, a.letter)} 
                      className={`alternativa ${isEscolhida ? "selecionada" : ""}`}
                      disabled={!!respostaUsuario}
                    >
                      <span className="alternativa-text">
                        <strong>{a.letter}:</strong> {a.text}
                      </span>
                      <span className="alternativa-icon">
                        {respostaUsuario && isEscolhida && (acertou ? <FaCheck className="correct" /> : <FaTimes className="wrong" />)}
                        {respostaUsuario && a.isCorrect && !isEscolhida && <FaCheck className="correct" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {respostaUsuario && (
              <div className={`resultado ${acertou ? "correto" : "errado"}`}>
                {acertou ? <FaCheck className="resultado-icon" /> : <FaTimes className="resultado-icon" />}
                <span>{mensagem} {acertou ? "" : `A correta é ${respostaCorreta}.`}</span>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}