
import { useState, useEffect } from 'react';
import './App.css';

function getRandomQuestion(questions, type) {
  const filtered = questions.filter(q => q.type === type);
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [mode, setMode] = useState(null); // 'action' ou 'verite'
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetch('./src/questions.json')
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, []);

  const handleMode = (type) => {
    setMode(type);
    const q = getRandomQuestion(questions, type);
    setCurrent(q);
  };

  const nextQuestion = () => {
    if (mode) {
      const q = getRandomQuestion(questions, mode);
      setCurrent(q);
    }
  };

  return (
    <div className="container">
      <h1>Action ou Vérité</h1>
      {!mode && (
        <div className="choose-mode">
          <button onClick={() => handleMode('action')}>Action</button>
          <button onClick={() => handleMode('verite')}>Vérité</button>
        </div>
      )}
      {mode && current && (
        <div className="game">
          <h2>{mode === 'action' ? 'Action' : 'Vérité'}</h2>
          <p className="question">{current.question}</p>
          <button onClick={nextQuestion}>Question suivante</button>
          <button onClick={() => { setMode(null); setCurrent(null); }}>Changer de mode</button>
        </div>
      )}
      {mode && !current && <p>Aucune question trouvée pour ce mode.</p>}
    </div>
  );
}

export default App;
