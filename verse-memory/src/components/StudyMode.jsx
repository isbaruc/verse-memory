export default function StudyMode({ data, onBack }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex-col flex-center animate-fade-in" style={{height: '100%', gap: '16px'}}>
        <p className="text-center">Cargando devocionales...</p>
        <button className="btn" onClick={onBack}>Volver</button>
      </div>
    );
  }

  return (
    <div className="flex-col animate-fade-in" style={{height: '100%'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <h2>Tus Devocionales</h2>
        <button onClick={onBack} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          ✕
        </button>
      </div>
      
      <div style={{
        display: 'flex', 
        alignItems: 'center',
        overflowX: 'auto', 
        overflowY: 'hidden', 
        scrollSnapType: 'x mandatory', 
        gap: '16px', 
        paddingBottom: '20px', 
        height: 'calc(100vh - 120px)'
      }}>
        {data.map((item, i) => (
          <div key={item.id} className={`glass-panel delay-${(i % 4) + 1} animate-fade-in`} style={{
            flex: '0 0 100%', 
            scrollSnapAlign: 'center', 
            height: 'auto', 
            maxHeight: '100%',
            overflowY: 'auto',
            padding: '36px 24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            <div style={{color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              📅 {item.fecha}
            </div>
            <h3 style={{marginBottom: '20px', fontSize: '1.8rem', lineHeight: '1.2'}}>{item.titulo}</h3>
            
            <div style={{marginBottom: '24px'}}>
              <p style={{fontSize: '1.3rem', lineHeight: '1.6', opacity: 0.95, fontStyle: 'italic'}}>
                "{item.versiculo}"
              </p>
            </div>
            
            <div style={{textAlign: 'right', fontWeight: '800', color: 'var(--text-secondary)', fontSize: '1.2rem'}}>
              — {item.cita}
            </div>
            
            <div style={{textAlign: 'center', opacity: 0.4, fontSize: '0.75rem', letterSpacing: '1px', marginTop: '32px'}}>
              ← DESLIZA PARA CONTINUAR →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
