export default function UserSelector({ onSelect }) {
  const users = ["Karen", "Baruc", "Gaby", "Arely", "Beto", "Fredy"];

  return (
    <div className="glass-panel animate-fade-in flex-col gap-3" style={{marginTop: '10px'}}>
      <div className="text-center mb-2">
        <h2 style={{fontSize: '1.4rem'}}>¿Quién eres?</h2>
        <p className="text-muted" style={{marginTop: '4px', fontSize: '0.9rem'}}>Selecciona tu nombre</p>
      </div>
      
      <div className="flex-col gap-2">
        {users.map((u, i) => (
          <button 
            key={u} 
            className={`btn delay-${(i % 4) + 1} animate-fade-in`} 
            style={{padding: '12px 20px', fontSize: '1rem'}}
            onClick={() => onSelect(u)}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
