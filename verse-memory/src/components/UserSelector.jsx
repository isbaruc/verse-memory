export default function UserSelector({ onSelect }) {
  const users = ["Karen", "Baruc", "Gaby", "Arely", "Beto", "Fredy"];

  return (
    <div className="glass-panel animate-fade-in flex-col gap-4" style={{marginTop: '20px'}}>
      <div className="text-center mb-4">
        <h2>¿Quién eres?</h2>
        <p className="text-muted" style={{marginTop: '8px'}}>Selecciona tu nombre para continuar</p>
      </div>
      
      <div className="flex-col gap-3">
        {users.map((u, i) => (
          <button 
            key={u} 
            className={`btn delay-${(i % 4) + 1} animate-fade-in`} 
            onClick={() => onSelect(u)}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
