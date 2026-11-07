import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { EVALUATION_CORPUS, TEST_CORPUS, WER_SENTENCES } from '../../utils/evaluationCorpus';
import { evaluateClassifier, computeWER, CLASS_ORDER, CLASS_LABELS } from '../../utils/evaluation';
import { useIncidents } from '../../utils/dataStore';
import { getPriority } from '../../utils/emergencyData';

const WER_STORAGE_KEY = 'emergencyWerResults';
const CONDITIONS = [
  { value: 'tranquilo', label: 'Ambiente tranquilo' },
  { value: 'ruido', label: 'Con ruido de fondo' },
  { value: 'alterada', label: 'Voz alterada o rápida' },
];

const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const loadWer = () => {
  try { return JSON.parse(localStorage.getItem(WER_STORAGE_KEY) || '[]'); } catch { return []; }
};

const Metric = ({ label, value, hint, tone = 'text-foreground' }) => (
  <div className="bg-card rounded-lg border border-border p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const downloadCSV = (filename, header, rows) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const SystemEvaluation = () => {
  const { incidents } = useIncidents();

  // ---------------- Clasificador ----------------
  const [corpusName, setCorpusName] = useState('test');
  const corpus = corpusName === 'test' ? TEST_CORPUS : EVALUATION_CORPUS;
  const result = useMemo(() => evaluateClassifier(corpus), [corpus]);
  const errors = result.rows.filter((r) => !r.correct || r.underTriage);

  const exportClassifier = () => {
    downloadCSV(
      `evaluacion_clasificador_${corpusName}.csv`,
      ['frase', 'tipo_real', 'tipo_ia', 'acierto', 'prioridad_real', 'prioridad_ia', 'subtriaje', 'pide_confirmacion', 'confianza'],
      result.rows.map((r) => [r.text, r.type, r.predicted, r.correct ? 1 : 0, r.priority, r.predictedPriority || 'pendiente',
        r.underTriage ? 1 : 0, r.needsConfirmation ? 1 : 0, r.confidence]),
    );
  };

  // ---------------- Prueba de voz (WER) ----------------
  const [werResults, setWerResults] = useState(loadWer);
  const [condition, setCondition] = useState('tranquilo');
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [heard, setHeard] = useState('');
  const [werError, setWerError] = useState('');
  const recRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(WER_STORAGE_KEY, JSON.stringify(werResults)); } catch { /* sin almacenamiento */ }
  }, [werResults]);

  useEffect(() => () => { try { recRef.current?.abort(); } catch { /* nada */ } }, []);

  const reference = WER_SENTENCES[sentenceIndex];

  const recordSentence = () => {
    setWerError('');
    setHeard('');
    if (!SpeechRecognitionAPI) {
      setWerError('Este navegador no tiene reconocimiento de voz. Use Chrome o Edge.');
      return;
    }
    const rec = new SpeechRecognitionAPI();
    rec.lang = 'es-GT';
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += `${e.results[i][0].transcript} `;
        else interim += e.results[i][0].transcript;
      }
      setHeard((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') setWerError(`Error del micrófono: ${e.error}`);
    };
    rec.onend = () => {
      setRecording(false);
      const text = finalText.trim();
      if (!text) return;
      const m = computeWER(reference, text);
      setWerResults((prev) => [...prev, {
        id: Date.now(), at: new Date().toISOString(), condition, reference, heard: text, ...m,
      }]);
      setSentenceIndex((i) => (i + 1) % WER_SENTENCES.length);
    };
    recRef.current = rec;
    try { rec.start(); setRecording(true); } catch (e) { setWerError(String(e?.message || e)); }
  };

  const werByCondition = CONDITIONS.map((c) => {
    const rows = werResults.filter((r) => r.condition === c.value);
    const words = rows.reduce((s, r) => s + r.words, 0);
    const errs = rows.reduce((s, r) => s + r.errors, 0);
    return { ...c, n: rows.length, wer: words ? Math.round((errs / words) * 1000) / 10 : null };
  });

  const exportWer = () => {
    downloadCSV('prueba_reconocimiento_voz.csv',
      ['fecha', 'condicion', 'frase_esperada', 'texto_reconocido', 'palabras', 'errores', 'wer_porcentaje'],
      werResults.map((r) => [r.at, r.condition, r.reference, r.heard, r.words, r.errors, r.wer]));
  };

  const clearWer = () => {
    if (window.confirm('¿Borrar todos los resultados de la prueba de voz?')) setWerResults([]);
  };

  // ---------------- Auditoría de uso real ----------------
  const audited = incidents?.filter((i) => i?.classificationAudit?.aiType) || [];
  const changed = audited.filter((i) => i?.classificationAudit?.changedByOperator);
  const agreement = audited.length ? Math.round(((audited.length - changed.length) / audited.length) * 1000) / 10 : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <Breadcrumb />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evaluación del sistema</h1>
            <p className="text-muted-foreground text-sm">
              Mide qué tan bien clasifica las emergencias, qué tan bien reconoce la voz y cuánto corrige el operador a la IA.
            </p>
          </div>

          {/* ===================== 1. Clasificador ===================== */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Icon name="Tags" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">1. Clasificación de emergencias</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={corpusName}
                  onChange={(e) => setCorpusName(e?.target?.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="test">Conjunto de prueba ({TEST_CORPUS.length} llamadas, no usado para ajustar)</option>
                  <option value="dev">Conjunto de desarrollo ({EVALUATION_CORPUS.length} llamadas, usado para ajustar)</option>
                </select>
                <Button variant="outline" size="sm" iconName="Download" onClick={exportClassifier}>CSV</Button>
              </div>
            </div>

            <div className={`text-xs rounded-md p-3 border ${corpusName === 'test' ? 'bg-primary/5 border-primary/20 text-foreground' : 'bg-warning/10 border-warning/30 text-foreground'}`}>
              {corpusName === 'test'
                ? 'Conjunto de prueba: frases redactadas después de ajustar el clasificador. Es la estimación más honesta disponible sin llamadas reales.'
                : 'Conjunto de desarrollo: se usó para ajustar las palabras clave, por eso su resultado es optimista y no debe reportarse como precisión del sistema.'}
              {' '}Ambos fueron redactados por el autor; para una medición válida se requieren llamadas reales anonimizadas de la estación.
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Exactitud del tipo" value={`${result.accuracy}%`} hint={`${result.total} llamadas`} />
              <Metric
                label="Sub-triaje (prioridad menor a la real)"
                value={`${result.underTriageRate}%`}
                hint="El error peligroso: debe ser lo más bajo posible"
                tone={result.underTriageRate > 10 ? 'text-destructive' : 'text-success'}
              />
              <Metric label="Prioridad dejada al operador" value={`${result.priorityPendingRate}%`} hint="La IA no reconoció el tipo y no asignó prioridad" />
              <Metric
                label="Errores marcados para confirmar"
                value={`${result.errorsFlagged}%`}
                hint="De los tipos mal clasificados, cuántos la IA marcó como inciertos"
                tone="text-success"
              />
              <Metric
                label="Aciertos cuando la IA no duda"
                value={result.confidentShare ? `${result.accuracyWhenConfident}%` : '—'}
                hint={result.confidentShare
                  ? `La IA no pidió confirmación en el ${result.confidentShare}% de las llamadas`
                  : 'La IA pidió confirmación en todas las llamadas de este conjunto'}
              />
              <Metric label="Dirección detectada" value={`${result.addressRate}%`} hint="De las frases que incluían dirección" />
              <Metric label="Nombre detectado" value={`${result.nameRate}%`} />
              <Metric label="Teléfono detectado" value={`${result.phoneRate}%`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg border border-border p-4 overflow-x-auto">
                <h3 className="text-sm font-semibold text-foreground mb-2">Precisión y sensibilidad por tipo</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-1">Tipo</th><th>Llamadas</th><th>Precisión</th><th>Sensibilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.perClass.map((c) => (
                      <tr key={c.type} className="border-b border-border/50">
                        <td className="py-1">{c.label}</td><td>{c.support}</td><td>{c.precision}%</td><td>{c.recall}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Precisión: de lo que la IA llamó así, cuánto era correcto. Sensibilidad: de los casos reales, cuántos encontró.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-4 overflow-x-auto">
                <h3 className="text-sm font-semibold text-foreground mb-2">Matriz de confusión (filas: real, columnas: IA)</h3>
                <table className="text-xs">
                  <thead>
                    <tr>
                      <th></th>
                      {CLASS_ORDER.map((c) => <th key={c} className="px-1 font-medium text-muted-foreground">{CLASS_LABELS[c].slice(0, 6)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {CLASS_ORDER.map((real) => (
                      <tr key={real}>
                        <td className="pr-2 text-muted-foreground whitespace-nowrap">{CLASS_LABELS[real]}</td>
                        {CLASS_ORDER.map((pred) => {
                          const v = result.confusion[real][pred];
                          const cls = !v ? 'text-muted-foreground/40' : real === pred ? 'bg-success/20 font-semibold' : 'bg-destructive/15';
                          return <td key={pred} className={`px-2 py-1 text-center ${cls}`}>{v}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Llamadas con error ({errors.length})</h3>
              {errors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin errores en este conjunto.</p>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {errors.map((r) => (
                    <div key={r.text} className="text-xs p-2 rounded bg-muted/40">
                      <span className="text-foreground">"{r.text}"</span>
                      <div className="text-muted-foreground mt-0.5">
                        Real: <strong>{CLASS_LABELS[r.type]}</strong> / {getPriority(r.priority).label} · IA:{' '}
                        <strong className={r.correct ? '' : 'text-destructive'}>{CLASS_LABELS[r.predicted]}</strong> /{' '}
                        <span className={r.underTriage ? 'text-destructive font-semibold' : ''}>
                          {r.predictedPriority ? getPriority(r.predictedPriority).label : 'pendiente (operador)'}
                        </span>
                        {r.needsConfirmation && <span className="ml-2 text-warning">· marcada para confirmar</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ===================== 2. Prueba de voz ===================== */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Icon name="Mic" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">2. Precisión del reconocimiento de voz (WER)</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" iconName="Download" onClick={exportWer} disabled={!werResults.length}>CSV</Button>
                <Button variant="ghost" size="sm" iconName="Trash2" onClick={clearWer} disabled={!werResults.length}>Borrar</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Lea en voz alta la frase indicada. El sistema compara lo transcrito con el texto esperado y calcula el
              <strong> WER</strong> (porcentaje de palabras mal reconocidas: menos es mejor). Repita con distintas personas y
              condiciones para responder "¿qué precisión tiene con acento, ruido y estrés?" con datos propios.
            </p>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-card rounded-lg border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Condición:</span>
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCondition(c.value)}
                      className={`px-3 py-1 rounded-full border text-xs ${condition === c.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-md bg-muted/40">
                  <p className="text-xs text-muted-foreground">Frase {sentenceIndex + 1} de {WER_SENTENCES.length}. Léala en voz alta:</p>
                  <p className="text-lg font-semibold text-foreground">"{reference}"</p>
                </div>
                {heard && <p className="text-sm"><span className="text-muted-foreground">Escuchado: </span>{heard}</p>}
                {werError && <p className="text-sm text-destructive">{werError}</p>}
                <div className="flex gap-2">
                  <Button variant={recording ? 'destructive' : 'default'} iconName={recording ? 'Square' : 'Mic'}
                    onClick={recording ? () => recRef.current?.stop() : recordSentence}>
                    {recording ? 'Detener' : 'Grabar frase'}
                  </Button>
                  <Button variant="outline" iconName="SkipForward" disabled={recording}
                    onClick={() => setSentenceIndex((i) => (i + 1) % WER_SENTENCES.length)}>
                    Otra frase
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {werByCondition.map((c) => (
                  <Metric
                    key={c.value}
                    label={`WER · ${c.label}`}
                    value={c.wer === null ? '—' : `${c.wer}%`}
                    hint={`${c.n} frases grabadas`}
                    tone={c.wer === null ? 'text-muted-foreground' : c.wer <= 15 ? 'text-success' : c.wer <= 30 ? 'text-warning' : 'text-destructive'}
                  />
                ))}
              </div>
            </div>

            {werResults.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-1">Condición</th><th>Esperado</th><th>Reconocido</th><th>WER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...werResults].reverse().slice(0, 30).map((r) => (
                      <tr key={r.id} className="border-b border-border/50 align-top">
                        <td className="py-1 pr-2 whitespace-nowrap">{CONDITIONS.find((c) => c.value === r.condition)?.label}</td>
                        <td className="pr-2">{r.reference}</td>
                        <td className="pr-2">{r.heard}</td>
                        <td className="font-semibold">{r.wer}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ===================== 3. Auditoría ===================== */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon name="ShieldCheck" size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">3. Auditoría: IA frente a decisión del operador</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Tickets con sugerencia de IA" value={audited.length} />
              <Metric label="Coincidencia IA y operador" value={agreement === null ? '—' : `${agreement}%`} />
              <Metric label="Corregidos por el operador" value={changed.length} tone={changed.length ? 'text-warning' : 'text-foreground'} />
              <Metric label="Desde simulación" value={audited.filter((i) => i?.classificationAudit?.source === 'simulacion').length}
                hint="No cuentan como uso real" />
            </div>
            {changed.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4 text-xs space-y-1">
                {changed.map((i) => (
                  <div key={i.id}>
                    <strong>{i.id}</strong>: IA sugirió {CLASS_LABELS[i.classificationAudit.aiType] || i.classificationAudit.aiType},
                    el operador lo cambió a {CLASS_LABELS[i.classificationAudit.finalType] || i.classificationAudit.finalType}
                    ({i.classificationAudit.confirmedBy})
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Cada ticket guarda qué sugirió la IA y qué decidió el operador. Con el uso real, este indicador muestra
              cuánto se puede confiar en la sugerencia y en qué tipos se equivoca.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SystemEvaluation;
