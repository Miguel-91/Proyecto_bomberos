// Métricas de evaluación del sistema: clasificación de emergencias y reconocimiento de voz.
import { analyzeTranscript } from './callAnalyzer';

export const CLASS_ORDER = ['fire', 'medical', 'traffic', 'rescue', 'hazmat', 'natural', 'other'];
export const CLASS_LABELS = {
  fire: 'Incendio', medical: 'Médica', traffic: 'Tránsito', rescue: 'Rescate',
  hazmat: 'Mat. peligrosos', natural: 'Desastre natural', other: 'Otro / sin clasificar',
};
const PRIORITY_RANK = { low: 0, medium: 1, high: 2, critical: 3 };

/**
 * Evalúa el clasificador contra un corpus etiquetado.
 * Devuelve exactitud, precisión/sensibilidad por clase, matriz de confusión,
 * exactitud de prioridad, sub-triaje (prioridad asignada MENOR a la real: el error peligroso)
 * y tasa de extracción de dirección, nombre y teléfono.
 */
export const evaluateClassifier = (corpus) => {
  const confusion = {};
  CLASS_ORDER.forEach((a) => { confusion[a] = {}; CLASS_ORDER.forEach((b) => { confusion[a][b] = 0; }); });

  const rows = corpus.map((item) => {
    const a = analyzeTranscript(item.text);
    const predicted = a?.type || 'other';
    confusion[item.type][predicted] += 1;
    const pending = !a?.priority; // la IA dejó la prioridad para el operador
    const pRank = PRIORITY_RANK[a?.priority];
    const tRank = PRIORITY_RANK[item.priority];
    return {
      ...item,
      predicted,
      predictedPriority: a?.priority,
      confidence: a?.confidence || 0,
      needsConfirmation: !!a?.needsConfirmation,
      correct: predicted === item.type,
      priorityCorrect: a?.priority === item.priority,
      priorityPending: pending,
      underTriage: !pending && pRank < tRank,
      overTriage: !pending && pRank > tRank,
      addressFound: !!a?.address,
      nameFound: !!a?.name,
      phoneFound: !!a?.phone,
    };
  });

  const n = rows.length;
  const pct = (x, total) => (total ? Math.round((x / total) * 1000) / 10 : 0);

  const perClass = CLASS_ORDER.map((c) => {
    const tp = confusion[c][c];
    const actual = CLASS_ORDER.reduce((s, p) => s + confusion[c][p], 0);
    const predicted = CLASS_ORDER.reduce((s, t) => s + confusion[t][c], 0);
    return {
      type: c,
      label: CLASS_LABELS[c],
      support: actual,
      precision: pct(tp, predicted),
      recall: pct(tp, actual),
    };
  }).filter((c) => c.support > 0);

  const wrong = rows.filter((r) => !r.correct);
  const withAddress = rows.filter((r) => r.address);
  const withName = rows.filter((r) => r.name);
  const withPhone = rows.filter((r) => r.phone);

  return {
    total: n,
    accuracy: pct(rows.filter((r) => r.correct).length, n),
    priorityAccuracy: pct(rows.filter((r) => r.priorityCorrect).length, n),
    underTriageRate: pct(rows.filter((r) => r.underTriage).length, n),
    overTriageRate: pct(rows.filter((r) => r.overTriage).length, n),
    priorityPendingRate: pct(rows.filter((r) => r.priorityPending).length, n),
    // Cuando la IA NO pide confirmación, ¿qué tan seguido acierta? (lo que importa para confiar en ella)
    accuracyWhenConfident: pct(
      rows.filter((r) => !r.needsConfirmation && r.predicted !== 'other' && r.correct).length,
      rows.filter((r) => !r.needsConfirmation && r.predicted !== 'other').length,
    ),
    confidentShare: pct(rows.filter((r) => !r.needsConfirmation && r.predicted !== 'other').length, n),
    // De las llamadas mal clasificadas, ¿cuántas quedaron marcadas para confirmar?
    errorsFlagged: pct(wrong.filter((r) => r.needsConfirmation || r.predicted === 'other').length, wrong.length),
    addressRate: pct(withAddress.filter((r) => r.addressFound).length, withAddress.length),
    nameRate: pct(withName.filter((r) => r.nameFound).length, withName.length),
    phoneRate: pct(withPhone.filter((r) => r.phoneFound).length, withPhone.length),
    perClass,
    confusion,
    rows,
  };
};

// ---------------------------------------------------------------------------
// WER (Word Error Rate): proporción de palabras mal reconocidas.
// WER = (sustituciones + eliminaciones + inserciones) / palabras de la referencia
// Se ignoran mayúsculas, tildes y signos de puntuación.
// ---------------------------------------------------------------------------
const NUMBER_MAP = {
  cero: '0', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7',
  ocho: '8', nueve: '9', diez: '10', once: '11', doce: '12',
};

export const werTokens = (text) => String(text || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ñ\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  // "5512" y "cinco cinco uno dos" cuentan igual
  .flatMap((w) => (/^\d+$/.test(w) && w.length > 2 ? w.split('') : [NUMBER_MAP[w] || w]));

export const computeWER = (reference, hypothesis) => {
  const r = werTokens(reference);
  const h = werTokens(hypothesis);
  const d = Array.from({ length: r.length + 1 }, (_, i) => [i, ...Array(h.length).fill(0)]);
  for (let j = 1; j <= h.length; j++) d[0][j] = j;
  for (let i = 1; i <= r.length; i++) {
    for (let j = 1; j <= h.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (r[i - 1] === h[j - 1] ? 0 : 1),
      );
    }
  }
  const errors = d[r.length][h.length];
  return {
    errors,
    words: r.length,
    wer: r.length ? Math.round((errors / r.length) * 1000) / 10 : 0,
  };
};
