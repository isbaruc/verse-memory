import { useState, useMemo } from 'react';

// ── Normalization ──────────────────────────────────────────────────────────
// General text: strip accents + ALL punctuation
const nrm = (s = '') =>
  s.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')          // remove accents
    .replace(/[^\wáéíóúüñ\s]/gi, '')           // keep only letters, digits, spaces
    .toLowerCase().trim().replace(/\s+/g, ' ');

// Date comparison: accept partial dates (day + month), ignore year & day-of-week
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function extractDayMonth(s) {
  const base = nrm(s);
  const day = (base.match(/\b([1-9]|[12]\d|3[01])\b/) || [])[1];
  const month = MONTHS.find(m => base.includes(m));
  if (day && month) return `${day} de ${month}`; // canonical form
  return base; // fallback: compare as-is
}

function matchFecha(userAnswer, correctAnswer) {
  // Correct if full match OR partial (day+month) matches
  const u = nrm(userAnswer);
  const c = nrm(correctAnswer);
  if (u === c) return true;
  return extractDayMonth(u) === extractDayMonth(c);
}

// ── Helpers ────────────────────────────────────────────────────────────────
const shuf = a => [...a].sort(() => Math.random() - 0.5);
const pick = (a, n) => shuf(a).slice(0, n);
const rnd = len => Math.floor(Math.random() * len);

function distractors(all, dev, field, n = 3) {
  const pool = [...new Set(all.filter(d => d.id !== dev.id).map(d => d[field]))];
  return pick(pool, Math.min(n, pool.length));
}

function makeBlanks(dev, pct) {
  const words = dev.versiculo.split(' ');
  const n = Math.max(1, Math.floor(words.length * pct));
  const cands = words.map((w, i) => ({ i, c: w.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '') }))
    .filter(x => x.c.length > 2);
  const hide = new Set(pick(cands, Math.min(n, cands.length)).map(x => x.i));
  return words.map((w, i) => ({
    id: i, original: w,
    clean: w.replace(/[.,;:!?"'()¡¿«»]/g, ''),
    hidden: hide.has(i),
  }));
}

// ── Question generators ────────────────────────────────────────────────────
function genEasy(dev, all) {
  const types = ['fill_partial', 'mc_titulo', 'mc_fecha', 'mc_cita'];
  const t = types[rnd(4)];
  if (t === 'fill_partial') return { type: t, dev, blanks: makeBlanks(dev, 0.25) };
  const field = { mc_titulo: 'titulo', mc_fecha: 'fecha', mc_cita: 'cita' }[t];
  return { type: t, dev, field, opts: shuf([...distractors(all, dev, field), dev[field]]) };
}

function genMedium(dev, all) {
  const types = ['fill_heavy', 'write_titulo', 'mc_two', 'write_fecha_from_cita'];
  const t = types[rnd(4)];
  if (t === 'fill_heavy') return { type: t, dev, blanks: makeBlanks(dev, 0.5) };
  if (t === 'mc_two') return {
    type: t, dev,
    optsTitulo: shuf([...distractors(all, dev, 'titulo'), dev.titulo]),
    optsCita: shuf([...distractors(all, dev, 'cita'), dev.cita]),
  };
  return { type: t, dev };
}

function genHard(dev) {
  return { type: ['write_verse', 'guess_all', 'write_verse_from_date'][rnd(3)], dev };
}

function buildExam(all) {
  const pool = shuf(all);
  const ext = pool.length >= 30 ? pool : [...pool, ...shuf(pool), ...shuf(pool)];
  return [
    ...ext.slice(0, 10).map(d => genEasy(d, all)),
    ...ext.slice(10, 20).map(d => genMedium(d, all)),
    ...ext.slice(20, 30).map(d => genHard(d)),
  ];
}

// ── Score checker ──────────────────────────────────────────────────────────
function checkAnswer(q, ans) {
  switch (q.type) {
    case 'fill_partial': case 'fill_heavy':
      return q.blanks.filter(b => b.hidden).every(b => nrm(ans[b.id] || '') === nrm(b.clean));
    case 'mc_titulo': case 'mc_fecha': case 'mc_cita':
      return ans.sel === q.dev[q.field];
    case 'write_titulo':
      return nrm(ans.text || '') === nrm(q.dev.titulo);
    case 'mc_two':
      return ans.titulo === q.dev.titulo && ans.cita === q.dev.cita;
    case 'write_fecha_from_cita':
      return matchFecha(ans.text || '', q.dev.fecha);
    case 'write_verse': case 'write_verse_from_date':
      return nrm(ans.verse || '') === nrm(q.dev.versiculo);
    case 'guess_all':
      return nrm(ans.titulo || '') === nrm(q.dev.titulo)
        && matchFecha(ans.fecha || '', q.dev.fecha)
        && nrm(ans.cita || '') === nrm(q.dev.cita);
    default: return false;
  }
}

// ── Reusable UI atoms ──────────────────────────────────────────────────────
const BLOCK_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const BLOCK_LABELS = ['🟢 Fácil', '🟡 Medio', '🔴 Difícil'];

function ProgressBar({ qIndex }) {
  const block = Math.floor(qIndex / 10);
  const qInBlock = (qIndex % 10) + 1;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.65, marginBottom: '5px' }}>
        <span>{BLOCK_LABELS[block]} · Pregunta {qInBlock}/10</span>
        <span>Total: {qIndex + 1}/30</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '99px', height: '5px' }}>
        <div style={{
          background: BLOCK_COLORS[block],
          width: `${(qInBlock / 10) * 100}%`,
          height: '100%', borderRadius: '99px', transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
}

function McBtn({ label, onClick, isSel, isCorrect, isWrong, submitted, disabled }) {
  let bg = 'rgba(255,255,255,0.07)';
  let border = '1px solid rgba(255,255,255,0.15)';
  let color = 'white';

  if (isSel && !submitted) { bg = 'rgba(16,185,129,0.2)'; border = '1px solid var(--accent)'; }
  if (isSel && isCorrect) { bg = 'var(--success)'; border = '1px solid var(--success)'; color = '#000'; }
  if (isSel && isWrong) { bg = 'rgba(248,113,113,0.15)'; border = '1px solid var(--error)'; color = 'var(--error)'; }
  if (!isSel && isCorrect) { bg = 'rgba(52,211,153,0.12)'; border = '1px solid var(--success)'; }

  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: bg, border, color, padding: '10px 14px', borderRadius: '12px',
        cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
        fontSize: '0.88rem', transition: 'all 0.2s', fontFamily: 'inherit', lineHeight: 1.4
      }}>
      {label}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, multiline = false, disabled = false }) {
  const s = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px', padding: '10px 12px', color: 'white', width: '100%',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: multiline ? 'vertical' : 'none',
  };
  return multiline
    ? <textarea rows={3} style={s} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />
    : <input type="text" style={s} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />;
}

function FillBlanks({ blanks, answers, setAnswers, submitted }) {
  return (
    <div style={{ fontSize: '1rem', lineHeight: 2.2, display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
      {blanks.map(b => {
        if (!b.hidden) return <span key={b.id}>{b.original}</span>;
        const val = answers[b.id] || '';
        const punct = b.original.slice(b.clean.length);
        let bg = 'rgba(255,255,255,0.12)', col = 'white', fw = 'normal';
        if (submitted) {
          const ok = nrm(val) === nrm(b.clean);
          bg = ok ? 'var(--success)' : 'var(--error)'; col = '#000'; fw = 'bold';
        }
        return (
          <span key={b.id} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '1px' }}>
            <input type="text" value={val} disabled={submitted}
              onChange={e => setAnswers(p => ({ ...p, [b.id]: e.target.value }))}
              style={{
                background: bg, color: col, fontWeight: fw,
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px',
                padding: '2px 5px', width: `${Math.max(b.clean.length * 10, 48)}px`,
                textAlign: 'center', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
              }} />
            {punct && <span>{punct}</span>}
          </span>
        );
      })}
    </div>
  );
}

// ── Question renderer ──────────────────────────────────────────────────────
function QuestionBody({ q, answers, setAnswers, submitted }) {
  const { dev } = q;
  const Verse = () => (
    <blockquote style={{
      fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6,
      margin: '8px 0', padding: '8px 12px',
      borderLeft: '3px solid var(--accent)', opacity: 0.9, textAlign: 'left'
    }}>
      "{dev.versiculo}"
    </blockquote>
  );
  const Label = ({ t }) => (
    <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.55, marginBottom: '8px' }}>{t}</p>
  );
  const McGroup = ({ opts, selKey, correctVal }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {opts.map((opt, i) => (
        <McBtn key={i} label={opt}
          onClick={() => !submitted && setAnswers(p => ({ ...p, [selKey]: opt }))}
          isSel={answers[selKey] === opt}
          isCorrect={submitted && opt === correctVal}
          isWrong={submitted && answers[selKey] === opt && opt !== correctVal}
          submitted={submitted}
          disabled={submitted} />
      ))}
    </div>
  );

  switch (q.type) {
    case 'fill_partial':
      return (<><Label t="📝 Completa las palabras que faltan" />
        <FillBlanks blanks={q.blanks} answers={answers} setAnswers={setAnswers} submitted={submitted} /></>);

    case 'mc_titulo': case 'mc_fecha': case 'mc_cita': {
      const labels = { mc_titulo: 'el título', mc_fecha: 'la fecha', mc_cita: 'la cita' };
      return (<><Label t={`📌 Identifica ${labels[q.type]}`} /><Verse />
        <McGroup opts={q.opts} selKey="sel" correctVal={dev[q.field]} /></>);
    }

    case 'fill_heavy':
      return (<><Label t="📝 Completa las palabras (nivel medio)" />
        <FillBlanks blanks={q.blanks} answers={answers} setAnswers={setAnswers} submitted={submitted} /></>);

    case 'write_titulo':
      return (<><Label t="✏️ Escribe el título del versículo" /><Verse />
        <TextInput placeholder="Escribe el título..." value={answers.text || ''}
          onChange={e => setAnswers({ text: e.target.value })} disabled={submitted} /></>);

    case 'mc_two':
      return (<>
        <Label t="📌 Selecciona el título Y la cita correctos" /><Verse />
        <p style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', margin: '6px 0 4px' }}>Título</p>
        <McGroup opts={q.optsTitulo} selKey="titulo" correctVal={dev.titulo} />
        <p style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', margin: '10px 0 4px' }}>Cita</p>
        <McGroup opts={q.optsCita} selKey="cita" correctVal={dev.cita} />
      </>);

    case 'write_fecha_from_cita':
      return (<><Label t="📅 Escribe la fecha de esta cita" />
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', margin: '6px 0 10px' }}>{dev.cita}</p>
        <TextInput placeholder="Ej: 01 de febrero 2026" value={answers.text || ''}
          onChange={e => setAnswers({ text: e.target.value })} disabled={submitted} /></>);

    case 'write_verse':
      return (<><Label t="📖 Escribe el versículo completo" />
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)', margin: '4px 0 2px' }}>{dev.titulo}</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0 0 10px' }}>{dev.cita} · {dev.fecha}</p>
        <TextInput multiline placeholder="Escribe el versículo aquí..." value={answers.verse || ''}
          onChange={e => setAnswers({ verse: e.target.value })} disabled={submitted} /></>);

    case 'write_verse_from_date':
      return (<><Label t="📖 Escribe el versículo de esta fecha" />
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', margin: '6px 0 10px' }}>{dev.fecha}</p>
        <TextInput multiline placeholder="Escribe el versículo aquí..." value={answers.verse || ''}
          onChange={e => setAnswers({ verse: e.target.value })} disabled={submitted} /></>);

    case 'guess_all':
      return (<><Label t="🔍 Dado el versículo, identifica título, fecha y cita" /><Verse />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <TextInput placeholder="Título..." value={answers.titulo || ''}
            onChange={e => setAnswers(p => ({ ...p, titulo: e.target.value }))} disabled={submitted} />
          <TextInput placeholder="Fecha (ej: 01 de febrero 2026)..." value={answers.fecha || ''}
            onChange={e => setAnswers(p => ({ ...p, fecha: e.target.value }))} disabled={submitted} />
          <TextInput placeholder="Cita (ej: Juan 3:16)..." value={answers.cita || ''}
            onChange={e => setAnswers(p => ({ ...p, cita: e.target.value }))} disabled={submitted} />
        </div></>);

    default: return null;
  }
}

function FeedbackBox({ q, correct }) {
  const { dev } = q;
  return (
    <div className="animate-fade-in" style={{
      marginTop: '12px', padding: '12px 14px', borderRadius: '12px',
      background: correct ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
      border: `1px solid ${correct ? 'var(--success)' : 'var(--error)'}`,
    }}>
      <p style={{ fontWeight: 700, color: correct ? 'var(--success)' : 'var(--error)', marginBottom: '8px', fontSize: '0.9rem' }}>
        {correct ? '✅ ¡Correcto!' : '❌ Incorrecto — respuesta correcta:'}
      </p>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{dev.titulo}</p>
      <p style={{ fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.85, margin: '2px 0' }}>"{dev.versiculo}"</p>
      <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{dev.cita} · {dev.fecha}</p>
    </div>
  );
}

// ── Block result screen ──────────────────────────────────────────────────────────
function BlockResult({ blockIndex, scores, onNext }) {
  const score = scores[blockIndex];
  const emoji = score >= 9 ? '🏆' : score >= 7 ? '⭐' : score >= 5 ? '👍' : '💪';
  const isAfterMedium = blockIndex === 1; // after block 1, before hard

  const ScoreRow = ({ i }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
      borderRadius: '10px', marginBottom: '8px'
    }}>
      <span style={{ fontSize: '0.88rem' }}>{BLOCK_LABELS[i]}</span>
      <span style={{ fontWeight: 800, color: BLOCK_COLORS[i], fontSize: '1.1rem' }}>{scores[i]}/10</span>
    </div>
  );

  return (
    <div className="glass-panel flex-col flex-center text-center animate-fade-in">
      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{BLOCK_LABELS[blockIndex]}</p>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 32px' }}>
        <p style={{ fontSize: '3.5rem', fontWeight: 800, color: BLOCK_COLORS[blockIndex], lineHeight: 1 }}>{score}</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>de 10 correctas</p>
      </div>
      <button className="btn btn-primary" onClick={onNext} style={{ padding: '14px', width: '100%' }}>
        {blockIndex === 2 ? '🏁 Ver resultados finales' : '➡️ Siguiente bloque'}
      </button>
    </div>
  );
}

// ── Final results screen ───────────────────────────────────────────────────
function FinalResult({ scores, onBack, onRetry }) {
  const total = scores.reduce((a, b) => a + b, 0);
  const pct = Math.round((total / 30) * 100);
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '👍' : '💪';
  return (
    <div className="no-scrollbar animate-fade-in" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div className="glass-panel flex-col text-center" style={{ padding: '24px 20px', marginBottom: '12px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{emoji}</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>¡Evaluación completada!</h2>
        <p style={{ opacity: 0.55, fontSize: '0.85rem', marginBottom: '16px' }}>{pct}% de aciertos totales</p>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '3.8rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{total}</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>de 30 correctas</p>
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.88rem' }}>{BLOCK_LABELS[i]}</span>
            <span style={{ fontWeight: 800, color: BLOCK_COLORS[i], fontSize: '1.1rem' }}>{scores[i]}/10</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '8px' }}>
        <button className="btn btn-primary" onClick={onRetry} style={{ padding: '13px' }}>🔄 Repetir evaluación</button>
        <button className="btn" onClick={onBack} style={{ padding: '13px' }}>🏠 Volver al menú</button>
      </div>
    </div>
  );
}

// ── Main ExamMode component ────────────────────────────────────────────────
export default function ExamMode({ allData, onBack }) {
  const [questions, setQuestions] = useState(() => buildExam(allData));
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | playing | block_end | done
  const [scores, setScores] = useState([0, 0, 0]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [lastBlock, setLastBlock] = useState(0);

  const block = Math.floor(qIndex / 10);
  const q = questions[qIndex];

  const canSubmit = () => {
    if (!q) return false;
    if (q.type === 'fill_partial' || q.type === 'fill_heavy')
      return q.blanks.filter(b => b.hidden).some(b => (answers[b.id] || '').trim().length > 0);
    if (q.type === 'mc_titulo' || q.type === 'mc_fecha' || q.type === 'mc_cita')
      return answers.sel !== undefined;
    if (q.type === 'mc_two')
      return answers.titulo !== undefined && answers.cita !== undefined;
    return true;
  };

  const handleSubmit = () => {
    const ok = checkAnswer(q, answers);
    setCorrect(ok);
    setSubmitted(true);
    if (ok) setScores(prev => { const n = [...prev]; n[block]++; return n; });
  };

  const handleNext = () => {
    const justEndedBlock = block;
    const nextIndex = qIndex + 1;
    setAnswers({});
    setSubmitted(false);
    setCorrect(null);

    if (nextIndex % 10 === 0 && nextIndex < 30) {
      setLastBlock(justEndedBlock);
      setQIndex(nextIndex);
      setPhase('block_end');
    } else if (nextIndex >= 30) {
      setLastBlock(justEndedBlock);
      setQIndex(nextIndex);
      setPhase('done');
    } else {
      setQIndex(nextIndex);
    }
  };

  const handleRetry = () => {
    setQuestions(buildExam(allData));
    setQIndex(0);
    setScores([0, 0, 0]);
    setAnswers({});
    setSubmitted(false);
    setCorrect(null);
    setPhase('intro');
  };

  const CloseBtn = () => (
    <button onClick={onBack} style={{
      background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
      fontSize: '1.1rem', cursor: 'pointer', borderRadius: '50%',
      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>✕</button>
  );

  // ── INTRO ──
  if (phase === 'intro') return (
    <div className="flex-col animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>🏆 Evaluación General</h2>
        <CloseBtn />
      </div>
      <div className="glass-panel flex-col flex-center text-center animate-fade-in"
        style={{ flex: 1, gap: '14px', padding: '24px 20px', minHeight: 0, overflowY: 'auto' }}>
        <div style={{ fontSize: '3rem' }}>🏆</div>
        <h2 style={{ fontSize: '1.3rem' }}>Evaluación General</h2>
        <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: '0.88rem' }}>
          30 preguntas sobre <strong>todos los devocionales</strong>, divididas en 3 bloques de dificultad progresiva.
        </p>
        <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', width: '100%' }}>
          {[['🟢', 'Fácil', 'Completar palabras y selección múltiple'], ['🟡', 'Medio', 'Escribir título y selección doble'], ['🔴', 'Difícil', 'Escribir el versículo completo']].map(([e, n, d]) => (
            <div key={n} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', lineHeight: 1.4 }}>
              <span>{e}</span>
              <div><strong>{n}</strong> — {d} <span style={{ opacity: 0.5 }}>(10 preguntas)</span></div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.72rem', opacity: 0.45 }}>Los acentos y signos de puntuación no se evaluarán en respuestas de texto libre.</p>
        <button className="btn btn-primary" onClick={() => setPhase('playing')} style={{ padding: '14px', width: '100%', fontSize: '1rem' }}>
          🚀 Comenzar evaluación
        </button>
      </div>
    </div>
  );

  // ── BLOCK END ──
  if (phase === 'block_end') return (
    <div className="flex-col animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>🏆 Evaluación General</h2>
        <CloseBtn />
      </div>
      <BlockResult
        blockIndex={lastBlock}
        scores={scores}
        onNext={() => setPhase('playing')}
      />
    </div>
  );

  // ── DONE ──
  if (phase === 'done') return (
    <div className="flex-col animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>🏆 Resultados</h2>
        <CloseBtn />
      </div>
      <FinalResult scores={scores} onBack={onBack} onRetry={handleRetry} />
    </div>
  );

  // ── PLAYING ──
  return (
    <div className="flex-col animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>🏆 Evaluación</h2>
        <CloseBtn />
      </div>

      <ProgressBar qIndex={qIndex} />

      <div className="glass-panel no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', minHeight: 0 }}>
        {q && <QuestionBody q={q} answers={answers} setAnswers={setAnswers} submitted={submitted} />}

        {submitted && q && <FeedbackBox q={q} correct={correct} />}

        <div style={{ marginTop: '14px' }}>
          {!submitted ? (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit()}
              style={{ padding: '12px', opacity: canSubmit() ? 1 : 0.4 }}>
              ✅ Verificar
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext} style={{ padding: '12px' }}>
              {qIndex + 1 >= 30 ? '🏁 Ver resultados' : (qIndex + 1) % 10 === 0 ? '📊 Ver resultado del bloque' : '➡️ Siguiente pregunta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
