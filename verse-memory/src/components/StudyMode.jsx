import { useRef } from 'react';

export default function StudyMode({ data, onBack }) {
  const scrollRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex-col flex-center animate-fade-in" style={{ height: '100%', gap: '16px' }}>
        <p className="text-center">Cargando devocionales...</p>
        <button className="btn" onClick={onBack}>Volver</button>
      </div>
    );
  }

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-col animate-fade-in" style={{ height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Tus Devocionales</h2>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', flex: 1 }}>
        {/* Navigation Arrows for Desktop */}
        <button 
          className="nav-arrow desktop-only animate-fade-in" 
          onClick={handlePrev} 
          style={{ position: 'absolute', left: '-65px', zIndex: 20 }}
          title="Anterior"
        >
          ←
        </button>

        <div 
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            gap: '20px',
            height: 'calc(100vh - 120px)',
            width: '100%',
            scrollBehavior: 'smooth'
          }}
        >
          {data.map((item, i) => (
            <div 
              key={item.id} 
              className={`glass-panel delay-${(i % 4) + 1} animate-fade-in`} 
              style={{
                flex: '0 0 100%', 
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
                height: 'auto',
                maxHeight: '100%',
                overflowY: 'auto',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📅 {item.fecha}
              </div>
              <h3 style={{ marginBottom: '20px', fontSize: '1.7rem', lineHeight: '1.2' }}>{item.titulo}</h3>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '1.25rem', lineHeight: '1.6', opacity: 0.95, fontStyle: 'italic' }}>
                  "{item.versiculo}"
                </p>
              </div>

              <div style={{ textAlign: 'right', fontWeight: '800', color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 'auto' }}>
                — {item.cita}
              </div>

              <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.7rem', letterSpacing: '1px', marginTop: '32px', textTransform: 'uppercase' }}>
                {/* Visual indicator for swipe if arrows are hidden */}
                • • •
              </div>
            </div>
          ))}
        </div>

        <button 
          className="nav-arrow desktop-only animate-fade-in" 
          onClick={handleNext} 
          style={{ position: 'absolute', right: '-65px', zIndex: 20 }}
          title="Siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}

