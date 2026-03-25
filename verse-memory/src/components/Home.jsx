export default function Home({ onSelectMode }) {
  return (
    <div className="glass-panel animate-fade-in flex-col gap-6" style={{marginTop: '20px'}}>
      <div className="text-center">
        <h2>¿Qué deseas hacer hoy?</h2>
      </div>

      <div className="flex-col gap-4">
        <button 
          className="btn btn-primary delay-1 animate-fade-in" 
          onClick={() => onSelectMode('study')}
          style={{padding: '20px', fontSize: '1.2rem'}}
        >
          📖 Estudiar Devocionales
        </button>
        
        <button 
          className="btn delay-2 animate-fade-in" 
          onClick={() => onSelectMode('practice')}
          style={{padding: '20px', fontSize: '1.2rem', backgroundColor: 'rgba(255, 255, 255, 0.15)'}}
        >
          🎯 Practicar Memorización
        </button>
      </div>
    </div>
  );
}
