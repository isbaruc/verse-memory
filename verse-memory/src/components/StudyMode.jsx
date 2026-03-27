import { useRef, useState } from 'react';

// ── Shared: a single tappable field row ────────────────────────────────────
function FieldRow({ label, value, hidden, onToggle, italic = false }) {
  return (
    <div
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: '12px',
        marginBottom: '8px',
        background: hidden ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.08)',
        border: `1px solid ${hidden ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.3)'}`,
        transition: 'all 0.25s ease',
        userSelect: 'none',
        textAlign: 'left',
      }}
    >
      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: '4px', fontWeight: 600 }}>
        {label}
      </div>
      {hidden ? (
        <div style={{ fontSize: '0.8rem', opacity: 0.35, fontStyle: 'italic', letterSpacing: '2px' }}>
          •••••••• (toca para revelar)
        </div>
      ) : (
        <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#fff', fontStyle: italic ? 'italic' : 'normal' }}>
          {value}
        </div>
      )}
    </div>
  );
}

// ── Card for the scrollable list view ─────────────────────────────────────
function ListCard({ item }) {
  const [hidden, setHidden] = useState({ fecha: false, titulo: false, versiculo: false, cita: false });
  const toggle = (field) => setHidden(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="glass-panel" style={{ marginBottom: '10px', padding: '14px' }}>
      <FieldRow label="📅 Fecha"     value={item.fecha}               hidden={hidden.fecha}     onToggle={() => toggle('fecha')} />
      <FieldRow label="✏️ Título"    value={item.titulo}              hidden={hidden.titulo}    onToggle={() => toggle('titulo')} />
      <FieldRow label="📖 Versículo" value={`"${item.versiculo}"`}    hidden={hidden.versiculo} onToggle={() => toggle('versiculo')} italic />
      <FieldRow label="🔖 Cita"      value={item.cita}                hidden={hidden.cita}      onToggle={() => toggle('cita')} />
    </div>
  );
}

// ── Card for the carousel view ─────────────────────────────────────────────
function CarouselCard({ item, index }) {
  const [hidden, setHidden] = useState({ fecha: false, titulo: false, versiculo: false, cita: false });
  const toggle = (field) => setHidden(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <div
      className={`glass-panel delay-${(index % 4) + 1} animate-fade-in`}
      style={{
        flex: '0 0 100%',
        scrollSnapAlign: 'center',
        scrollSnapStop: 'always',
        height: 'auto',
        maxHeight: '100%',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        gap: '4px',
      }}
    >
      <FieldRow label="📅 Fecha"     value={item.fecha}               hidden={hidden.fecha}     onToggle={() => toggle('fecha')} />
      <FieldRow label="✏️ Título"    value={item.titulo}              hidden={hidden.titulo}    onToggle={() => toggle('titulo')} />
      <FieldRow label="📖 Versículo" value={`"${item.versiculo}"`}    hidden={hidden.versiculo} onToggle={() => toggle('versiculo')} italic />
      <FieldRow label="🔖 Cita"      value={item.cita}                hidden={hidden.cita}      onToggle={() => toggle('cita')} />

      <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.68rem', letterSpacing: '1px', marginTop: '16px', textTransform: 'uppercase' }}>
        • • •
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function StudyMode({ data, onBack }) {
  const scrollRef = useRef(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'

  if (!data || data.length === 0) {
    return (
      <div className="flex-col flex-center animate-fade-in" style={{ height: '100%', gap: '16px' }}>
        <p className="text-center">Cargando devocionales...</p>
        <button className="btn" onClick={onBack}>Volver</button>
      </div>
    );
  }

  const handleNext = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="flex-col animate-fade-in" style={{ flex: 1, minHeight: 0, width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.2rem' }}>
          {viewMode === 'cards' ? '📖 Devocionales' : '📋 Lista'}
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode(v => v === 'cards' ? 'list' : 'cards')}
            title={viewMode === 'cards' ? 'Ver como lista' : 'Ver tarjetas'}
            style={{
              background: viewMode === 'list' ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {viewMode === 'cards' ? '📋' : '🃏'}
          </button>
          <button
            onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* hint */}
      <p style={{ fontSize: '0.7rem', opacity: 0.4, textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Toca cada campo para ocultarlo o revelarlo
      </p>

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div
          className="no-scrollbar animate-fade-in"
          style={{
            flex: 1,
            overflowY: 'scroll', /* force scrollable even inside fixed body */
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '16px',
            minHeight: 0, /* needed for flex child to shrink and scroll */
          }}
        >
          {data.map(item => <ListCard key={item.id} item={item} />)}
        </div>
      )}

      {/* ── CARD CAROUSEL VIEW ── */}
      {viewMode === 'cards' && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', flex: 1, minHeight: 0 }}>
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
              alignItems: 'center',   /* vertical center */
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              gap: '20px',
              height: '100%',         /* fill the flex parent */
              width: '100%',
              scrollBehavior: 'smooth',
            }}
          >
            {data.map((item, i) => (
              <CarouselCard key={item.id} item={item} index={i} />
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
      )}
    </div>
  );
}
