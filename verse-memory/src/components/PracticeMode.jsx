import { useState, useEffect } from 'react';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItems = (arr, num) => [...arr].sort(() => 0.5 - Math.random()).slice(0, num);

export default function PracticeMode({ data, onBack }) {
  const [currentDev, setCurrentDev] = useState(null);
  const [gameType, setGameType] = useState(null); // 'multiple_choice' or 'fill_blanks'
  const [options, setOptions] = useState([]);
  const [targetField, setTargetField] = useState(''); // 'cita', 'titulo', 'fecha'
  const [blanksData, setBlanksData] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [status, setStatus] = useState('playing'); // playing, won, lost
  const [feedback, setFeedback] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      startNewChallenge();
    }
  }, [data]);

  const startNewChallenge = () => {
    const dev = data[getRandomInt(0, data.length - 1)];
    setCurrentDev(dev);

    const type = Math.random() > 0.5 ? 'multiple_choice' : 'fill_blanks';
    setGameType(type);
    setStatus('playing');
    setFeedback('');

    if (type === 'multiple_choice') {
      const fields = ['cita', 'titulo', 'fecha'];
      const field = fields[getRandomInt(0, fields.length - 1)];
      setTargetField(field);
      setSelectedOption(null);

      const allValues = data.map(d => d[field]).filter(val => val !== dev[field]);
      const uniqueValues = [...new Set(allValues)]; // remove duplicates
      const wrongOptions = getRandomItems(uniqueValues, Math.min(3, uniqueValues.length));

      const allOptions = getRandomItems([...wrongOptions, dev[field]], wrongOptions.length + 1);
      setOptions(allOptions);
    } else {
      const words = dev.versiculo.split(' ');
      const blanksCount = Math.max(1, Math.floor(words.length * 0.3));

      const indicesToHide = getRandomItems(Array.from({ length: words.length }, (_, i) => i), blanksCount);

      const bd = words.map((w, i) => {
        const cleanWord = w.replace(/[.,;!?"()]/g, '');
        if (indicesToHide.includes(i) && cleanWord.length > 2) {
          return { original: w, hidden: true, word: cleanWord, id: i };
        }
        return { original: w, hidden: false, id: i };
      });

      setBlanksData(bd);
      setUserAnswers({});
    }
  };

  const handleOptionClick = (option) => {
    if (status !== 'playing') return;

    setSelectedOption(option);

    if (option === currentDev[targetField]) {
      setStatus('won');
      setFeedback('¡Correcto! 🎉');
    } else {
      setStatus('lost');
      setFeedback('Respuesta incorrecta 😔');
    }
  };

  const handleBlankChange = (id, value) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }));
  };

  const checkBlanks = () => {
    let allCorrect = true;
    blanksData.forEach(item => {
      if (item.hidden) {
        const userAnswer = (userAnswers[item.id] || '').toLowerCase().trim();
        // Ignore accents/diacritics for a fairer comparion
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (normalize(userAnswer) !== normalize(item.word)) {
          allCorrect = false;
        }
      }
    });

    if (allCorrect) {
      setStatus('won');
      setFeedback('¡Excelente! Memorización perfecta 🎉');
    } else {
      setStatus('lost');
      setFeedback('Una o más palabras son incorrectas. ¡Sigue intentando!');
    }
  };

  if (!currentDev) return (
    <div className="flex-col flex-center animate-fade-in" style={{ height: '100%', gap: '16px' }}>
      <p>Cargando reto...</p>
      <button className="btn" onClick={onBack}>Volver</button>
    </div>
  );

  return (
    <div className="flex-col animate-fade-in" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>🎯 Práctica</h2>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>
      </div>

      <div className="glass-panel flex-col gap-3 flex-center text-center delay-1 animate-fade-in no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', justifyContent: 'center' }}>

        {/* MULTIPLE CHOICE UI */}
        {gameType === 'multiple_choice' && (
          <>
            <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
              Identifica {targetField === 'fecha' ? 'la fecha' : targetField === 'cita' ? 'la cita' : 'el título'}
            </p>
            <h3 style={{ fontSize: '1.4rem', lineHeight: '1.5', margin: '12px 0' }}>"{currentDev.versiculo}"</h3>

            <div className="w-full flex-col gap-3 mt-4">
              {options.map((opt, i) => {
                let btnStyle = {};
                if (status !== 'playing') {
                  if (opt === currentDev[targetField]) {
                    btnStyle = { backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#000' };
                  } else if (opt === selectedOption) {
                    btnStyle = { borderColor: 'var(--error)', backgroundColor: 'rgba(248, 113, 113, 0.1)', color: 'var(--error)' };
                  } else if (status === 'lost') {
                    btnStyle = { opacity: 0.5 };
                  }
                }

                return (
                  <button
                    key={i}
                    className="btn"
                    style={{ ...btnStyle, padding: '12px 16px', fontSize: '0.95rem', whiteSpace: 'wrap' }}
                    onClick={() => handleOptionClick(opt)}
                    disabled={status !== 'playing'}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* FILL BLANKS UI */}
        {gameType === 'fill_blanks' && (
          <>
            <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
              Completa el versículo
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 'bold' }}>{currentDev.cita}</p>

            <div style={{ fontSize: '1.15rem', lineHeight: '1.8', marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {blanksData.map((item, i) => {
                if (!item.hidden) {
                  return <span key={i}>{item.original}</span>;
                }

                const punctuationMatch = item.original.match(/[.,;!?"()]+$/);
                const punctuation = punctuationMatch ? punctuationMatch[0] : '';

                return (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                    <input
                      type="text"
                      value={userAnswers[item.id] || ''}
                      onChange={(e) => handleBlankChange(item.id, e.target.value)}
                      disabled={status !== 'playing'}
                      style={{
                        background: status !== 'playing' ? (((userAnswers[item.id] || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() === item.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()) ? 'var(--success)' : 'var(--error)') : 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: '8px',
                        color: status !== 'playing' ? '#000' : 'white',
                        fontWeight: status !== 'playing' ? 'bold' : 'normal',
                        padding: '4px 8px',
                        width: `${Math.max(item.word.length * 12, 60)}px`,
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    {punctuation && <span>{punctuation}</span>}
                  </span>
                )
              })}
            </div>

            {status === 'playing' && (
              <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={checkBlanks}>
                Verificar
              </button>
            )}
          </>
        )}

        {/* FEEDBACK */}
        {status !== 'playing' && (
          <div className="animate-fade-in flex-col flex-center" style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            <h3 style={{ marginBottom: '8px', color: status === 'won' ? 'var(--success)' : 'var(--error)', fontSize: '1.1rem' }}>
              {feedback}
            </h3>

            <div style={{ marginBottom: '8px', fontSize: '0.85rem', color: 'white', opacity: 0.9, width: '100%' }}>
              <strong style={{ display: 'block', color: 'var(--accent)', marginBottom: '2px' }}>{currentDev.titulo}</strong>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{currentDev.fecha}</span>
            </div>

            {status === 'lost' && gameType === 'fill_blanks' && (
              <p style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'white', opacity: 0.9 }}>
                <strong>Respuesta:</strong> "{currentDev.versiculo}"
              </p>
            )}
            <button className="btn btn-primary" onClick={startNewChallenge} style={{ marginTop: '4px', padding: '12px' }}>
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
