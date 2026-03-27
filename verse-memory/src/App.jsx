import { useState, useEffect } from 'react'
import './App.css'
import UserSelector from './components/UserSelector'
import Home from './components/Home'
import StudyMode from './components/StudyMode'
import PracticeMode from './components/PracticeMode'

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('select_user'); // select_user, home, study, practice
  const [devocionales, setDevocionales] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}devocionales.json`)
      .then(res => res.json())
      .then(data => {
        if (data && data.devocionales) {
          setDevocionales(data.devocionales);
        }
      })
      .catch(err => console.error("Error loading devocionales:", err));
  }, []);

  const getUserData = () => {
    if (!user) return [];

    const ranges = {
      "Karen": [1, 10],
      "Baruc": [11, 20],
      "Gaby": [21, 29],
      "Arely": [30, 39],
      "Beto": [40, 49],
      "Fredy": [50, 59]
    };

    const [start, end] = ranges[user] || [0, 0];
    return devocionales.filter(d => d.id >= start && d.id <= end);
  };

  const handleUserSelect = (selectedUser) => {
    setUser(selectedUser);
    setMode('home');
  };

  const resetUser = () => {
    setUser(null);
    setMode('select_user');
  };

  const goHome = () => setMode('home');

  const userData = getUserData();

  return (
    <>
      <header className="app-header animate-fade-in" style={{marginBottom: '16px'}}>
        {mode !== 'practice' && <h1 className="app-title">Aviva Matutina</h1>}
        {mode === 'practice' && <h1 className="app-title" style={{ fontSize: '1.5rem' }}>Modo Práctica</h1>}

        {user && mode !== 'select_user' && (
          <p className="text-muted">
            👋 ¡Hola, {user}!
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.7, cursor: 'pointer', textDecoration: 'underline' }} onClick={resetUser}>
              (Cambiar nombre)
            </span>
          </p>
        )}
      </header>

      <main className="flex-col w-full" style={{ flex: 1, minHeight: 0 }}>
        {mode === 'select_user' && <UserSelector onSelect={handleUserSelect} />}
        {mode === 'home' && <Home onSelectMode={setMode} />}
        {mode === 'study' && <StudyMode data={userData} onBack={goHome} />}
        {mode === 'practice' && <PracticeMode data={userData} onBack={goHome} />}
      </main>
    </>
  )
}

export default App
