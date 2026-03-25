export default function Home({ onSelectMode }) {
  return (
    <div className="glass-panel animate-fade-in flex-col gap-4" style={{marginTop: '10px'}}>
      <div className="text-center">
        <h2 style={{fontSize: '1.4rem'}}>¿Qué deseas hacer?</h2>
      </div>

      <div className="flex-col gap-3">
        <button 
          className="btn btn-primary delay-1 animate-fade-in" 
          onClick={() => onSelectMode('study')}
          style={{padding: '16px', fontSize: '1.1rem'}}
        >
          📖 Estudiar
        </button>
        
        <button 
          className="btn delay-2 animate-fade-in" 
          onClick={() => onSelectMode('practice')}
          style={{padding: '16px', fontSize: '1.1rem', backgroundColor: 'rgba(255, 255, 255, 0.15)'}}
        >
          🎯 Practicar
        </button>
      </div>
    </div>
  );
}
