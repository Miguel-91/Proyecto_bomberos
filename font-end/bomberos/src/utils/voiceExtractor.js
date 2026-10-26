/**
 * Extracción de datos de una llamada de emergencia a partir del texto transcrito.
 * Pensado para español de Guatemala (Antigua Guatemala, Sacatepéquez).
 *
 * extractCallData(texto) => {
 *   name, phone, address,
 *   emergencyType, priority, confidence, matchedKeywords
 * }
 * Solo incluye las claves que pudo detectar.
 */

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const norm = (s) => stripAccents(String(s || '').toLowerCase());

const capitalize = (s) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (['de', 'del', 'la', 'los', 'las', 'y'].includes(w.toLowerCase())
      ? w.toLowerCase()
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');

const NUMBER_WORDS = {
  cero: '0', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5',
  seis: '6', siete: '7', ocho: '8', nueve: '9',
  diez: '10', once: '11', doce: '12', trece: '13', catorce: '14', quince: '15',
  dieciseis: '16', diecisiete: '17', dieciocho: '18', diecinueve: '19', veinte: '20',
  treinta: '30', cuarenta: '40', cincuenta: '50', sesenta: '60', setenta: '70',
  ochenta: '80', noventa: '90',
};

// ---------------------------------------------------------------------------
// Teléfono (Guatemala: 8 dígitos, opcional +502)
// ---------------------------------------------------------------------------
export const extractPhone = (text) => {
  let t = norm(text);
  // "cincuenta y cinco" -> "55"
  t = t.replace(/\b(veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/g,
    (_, a, b) => String(Number(NUMBER_WORDS[a]) + Number(NUMBER_WORDS[b])));
  t = t.replace(/\b[a-z]+\b/g, (w) => (NUMBER_WORDS[w] !== undefined ? NUMBER_WORDS[w] : w));
  // Unir grupos de dígitos separados por espacios, guiones o puntos
  const runs = t.match(/\+?\d[\d\s.\-]{6,}\d/g) || [];
  for (const run of runs) {
    let digits = run.replace(/\D/g, '');
    if (digits.startsWith('502') && digits.length === 11) digits = digits.slice(3);
    if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 8) {
      const m = digits.match(/[2-7]\d{7}/);
      if (m) return `${m[0].slice(0, 4)}-${m[0].slice(4)}`;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Nombre
// ---------------------------------------------------------------------------
const NAME_TRIGGERS = [
  'mi nombre es', 'me llamo', 'le habla', 'les habla', 'habla', 'soy el senor', 'soy la senora',
  'soy el', 'soy la', 'soy',
];

const NAME_STOP = new Set([
  'y', 'e', 'estoy', 'vivo', 'mi', 'tengo', 'hay', 'necesito', 'necesitamos', 'por', 'en', 'desde',
  'que', 'con', 'es', 'numero', 'telefono', 'celular', 'aqui', 'aca', 'llamo', 'llamando', 'le',
  'les', 'para', 'porque', 'pues', 'este', 'esta', 'buenas', 'buenos', 'hola', 'senor', 'senora',
  'vecino', 'vecina', 'un', 'una', 'el', 'la', 'los', 'las', 'se', 'no', 'si', 'muy', 'urgente',
  'ayuda', 'auxilio', 'donde', 'cuando', 'como', 'al', 'a', 'hubo', 'paso', 'ocurrio', 'sucedio',
  'tuvo', 'acaba', 'acabo', 'mire', 'oiga', 'fijese', 'quiero', 'queria', 'reportar', 'avisar',
]);

const NAME_CONNECTORS = new Set(['de', 'del']);

export const extractName = (text) => {
  const original = String(text || '');
  const n = norm(original);
  for (const trigger of NAME_TRIGGERS) {
    const re = new RegExp(`(?:^|[\\s,.;])${trigger}\\s+`, 'g');
    let m;
    while ((m = re.exec(n)) !== null) {
      const start = m.index + m[0].length;
      const restNorm = n.slice(start).split(/[,.;:!?¿¡\n]/)[0];
      const restOrig = original.slice(start, start + restNorm.length);
      const wordsN = restNorm.split(/\s+/).filter(Boolean);
      const wordsO = restOrig.split(/\s+/).filter(Boolean);
      const picked = [];
      for (let i = 0; i < wordsN.length && picked.length < 6; i++) {
        const w = wordsN[i];
        if (/\d/.test(w)) break;
        if (NAME_CONNECTORS.has(w) && picked.length > 0) {
          // "de", "del", "de la", "de los", "de las" dentro de un nombre
          const art = ['la', 'los', 'las'].includes(wordsN[i + 1]) ? 1 : 0;
          const next = wordsN[i + 1 + art];
          if (next && !NAME_STOP.has(next) && !/\d/.test(next)) {
            for (let k = 0; k <= art; k++) picked.push(wordsO[i + k] || wordsN[i + k]);
            i += art;
            continue;
          }
          break;
        }
        if (NAME_STOP.has(w)) break;
        picked.push(wordsO[i] || w);
      }
      // quitar conectores finales
      while (picked.length && ['de', 'del', 'la', 'los', 'las'].includes(norm(picked[picked.length - 1]))) picked.pop();
      // "soy" suele ir seguido de otras cosas ("soy vecino"); exigir al menos 1 palabra válida
      if (picked.length >= 1 && picked.join(' ').length >= 3) {
        // Con "soy" a secas pedimos que parezca nombre propio (2+ palabras o mayúscula)
        if (trigger === 'soy' && picked.length < 2 && !/^[A-ZÁÉÍÓÚÑ]/.test(picked[0])) continue;
        return capitalize(picked.join(' '));
      }
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Dirección
// ---------------------------------------------------------------------------
const ADDRESS_LEADS = [
  'la direccion es', 'mi direccion es', 'direccion', 'estoy en', 'estamos en', 'vivo en', 'vivimos en',
  'queda en', 'es en', 'fue en', 'ubicado en', 'ubicada en', 'sucedio en', 'paso en', 'esta pasando en',
];

const ADDRESS_KEYWORDS = [
  'calle', 'avenida', 'av', 'callejon', 'colonia', 'aldea', 'zona', 'barrio', 'residencial',
  'residenciales', 'lotificacion', 'kilometro', 'km', 'carretera', 'finca', 'canton', 'sector',
  'manzana', 'lote', 'caserio', 'condominio', 'frente a', 'frente al', 'cerca de', 'cerca del',
  'a la par de', 'a la par del', 'atras de', 'atras del', 'esquina', 'parque', 'mercado',
  'iglesia', 'escuela', 'gasolinera',
];

const PLACES = [
  'antigua guatemala', 'antigua', 'jocotenango', 'ciudad vieja', 'san felipe de jesus', 'san felipe',
  'san pedro las huertas', 'san juan del obispo', 'santa ana', 'san bartolome becerra',
  'san cristobal el alto', 'santa catarina barahona', 'san miguel duenas', 'alotenango',
  'pastores', 'sumpango', 'santo domingo xenacoj', 'santiago sacatepequez', 'san lucas sacatepequez',
  'santa lucia milpas altas', 'magdalena milpas altas', 'santa maria de jesus', 'san antonio aguas calientes',
  'santa catarina barahona', 'el hato', 'san mateo milpas altas', 'san gaspar vivar', 'chimaltenango',
];

const ADDRESS_STOP = [
  ' y hay ', ' hay ', ' se esta ', ' se estan ', ' mi nombre', ' me llamo', ' mi telefono', ' mi numero',
  ' el numero', ' mi celular', ' por favor', ' necesito', ' necesitamos', ' ayuda', ' auxilio', ' urgente',
  ' vengan', ' manden', ' rapido', ' pronto', ' porque ', ' donde hay', ' y esta ', ' y se ', ' y un ',
  ' y una ', ' tengo ', ' habla ', ' soy ',
];

export const extractAddress = (text) => {
  const original = String(text || '');
  const n = norm(original);

  const candidates = [];
  for (const lead of ADDRESS_LEADS) {
    const re = new RegExp(`(?:^|[\\s,.;])${lead}\\s+`, 'g');
    let m;
    while ((m = re.exec(n)) !== null) candidates.push({ start: m.index + m[0].length, lead: true });
  }
  for (const kw of ADDRESS_KEYWORDS) {
    const re = new RegExp(`(?:^|[\\s,.;])(${kw})(?=[\\s.,]|$)`, 'g');
    let m;
    while ((m = re.exec(n)) !== null) candidates.push({ start: m.index + (m[0].length - m[1].length), lead: false });
  }
  if (!candidates.length) return null;

  // Preferir la primera aparición; los "leads" (estoy en...) valen solo si lo que sigue parece dirección
  candidates.sort((a, b) => a.start - b.start);

  for (const c of candidates) {
    let seg = n.slice(c.start);
    let end = seg.search(/[.;!?\n]/);
    if (end === -1) end = seg.length;
    seg = seg.slice(0, end);
    let cut = seg.length;
    for (const stop of ADDRESS_STOP) {
      const i = (` ${seg} `).indexOf(stop);
      if (i !== -1 && i - 1 < cut) cut = Math.max(0, i - 1);
    }
    seg = seg.slice(0, cut).trim();
    const words = seg.split(/\s+/).filter(Boolean).slice(0, 14);
    seg = words.join(' ').replace(/[,\s]+$/, '');
    if (!seg) continue;

    const looksLikeAddress = ADDRESS_KEYWORDS.some((k) => new RegExp(`(^|\\s)${k}(\\s|$)`).test(seg))
      || PLACES.some((p) => seg.includes(p))
      || /\d/.test(seg);
    if (c.lead && !looksLikeAddress) continue;

    // Recuperar el texto original (con tildes) en la misma posición
    const startIdx = c.start;
    const origSeg = original.slice(startIdx, startIdx + seg.length);
    const out = origSeg.trim() || seg;
    return out.charAt(0).toUpperCase() + out.slice(1);
  }
  return null;
};

// ---------------------------------------------------------------------------
// Tipo de emergencia y prioridad
// ---------------------------------------------------------------------------
const TYPE_RULES = [
  { type: 'incendio', label: 'Incendio', words: ['incendio', 'fuego', 'se quema', 'se esta quemando', 'quemando', 'llamas', 'humo', 'quemazon', 'explosion', 'exploto', 'arde'] },
  { type: 'materiales-peligrosos', label: 'Materiales Peligrosos', words: ['fuga de gas', 'olor a gas', 'huele a gas', 'gas propano', 'cilindro', 'quimico', 'derrame', 'toxico', 'gasolina regada'] },
  { type: 'accidente', label: 'Accidente de Tránsito', words: ['accidente', 'choque', 'chocaron', 'choco', 'atropell', 'volco', 'volcado', 'colision', 'motorista', 'camioneta', 'bus', 'trailer', 'carro', 'moto'] },
  { type: 'medica', label: 'Emergencia Médica', words: ['desmay', 'infarto', 'no respira', 'inconsciente', 'convulsi', 'sangr', 'dolor de pecho', 'embarazada', 'parto', 'dar a luz', 'ataque', 'fractura', 'se cayo', 'herido', 'herida', 'golpe', 'enfermo', 'enferma', 'presion', 'diabet', 'intoxic', 'ambulancia', 'mordida', 'quemadura'] },
  { type: 'rescate', label: 'Rescate', words: ['atrapad', 'rescate', 'rescatar', 'barranco', 'ahog', 'se perdio', 'extraviad', 'pozo', 'encerrad', 'colgado', 'volcan'] },
  { type: 'inundacion', label: 'Inundación', words: ['inundac', 'se inundo', 'inundando', 'agua subiendo', 'crecida', 'desbord', 'correntada', 'rio crecido'] },
  { type: 'derrumbe', label: 'Derrumbe/Colapso', words: ['derrumbe', 'deslave', 'colaps', 'se derrumbo', 'se cayo la casa', 'se cayo el techo', 'se cayo una pared', 'alud', 'hundimiento', 'se vino abajo', 'arbol caido', 'se cayo un arbol'] },
];

const CRITICAL_WORDS = ['no respira', 'inconsciente', 'atrapad', 'explosion', 'exploto', 'ninos adentro', 'nino adentro', 'personas adentro', 'gente adentro', 'muchos heridos', 'varios heridos', 'se esta quemando la casa', 'sangra mucho', 'mucha sangre', 'muerto', 'fallecido', 'infarto', 'convulsi', 'ahog'];
const HIGH_WORDS = ['herido', 'herida', 'heridos', 'urgente', 'rapido', 'grave', 'mucho humo', 'se esta extendiendo', 'casa', 'vivienda', 'fuga de gas', 'parto', 'fractura'];
const LOW_WORDS = ['ya se apago', 'ya paso', 'sin heridos', 'no hay heridos', 'solo humo', 'pequeno', 'poquito'];

export const classifyEmergency = (text) => {
  const n = norm(text);
  let best = null;
  for (const rule of TYPE_RULES) {
    const hits = rule.words.filter((w) => n.includes(w));
    if (hits.length && (!best || hits.length > best.hits.length)) best = { ...rule, hits };
  }
  if (!best) return null;

  let priority;
  if (CRITICAL_WORDS.some((w) => n.includes(w))) priority = 'critical';
  else if (LOW_WORDS.some((w) => n.includes(w))) priority = 'low';
  else if (HIGH_WORDS.some((w) => n.includes(w)) || ['incendio', 'materiales-peligrosos', 'derrumbe', 'rescate'].includes(best.type)) priority = 'high';
  else priority = 'medium';

  const riskLevel = { critical: 'Muy Alto', high: 'Alto', medium: 'Moderado', low: 'Bajo' }[priority];
  const resourcesNeeded = { critical: 'Máximo', high: 'Reforzado', medium: 'Estándar', low: 'Mínimo' }[priority];

  return {
    emergencyType: best.type,
    emergencyLabel: best.label,
    priority,
    riskLevel,
    resourcesNeeded,
    confidence: Math.min(95, 55 + best.hits.length * 15),
    matchedKeywords: best.hits,
  };
};

// ---------------------------------------------------------------------------
// Todo junto
// ---------------------------------------------------------------------------
export const extractCallData = (text) => {
  const out = {};
  const name = extractName(text);
  const phone = extractPhone(text);
  const address = extractAddress(text);
  const cls = classifyEmergency(text);
  if (name) out.name = name;
  if (phone) out.phone = phone;
  if (address) out.address = address;
  if (cls) Object.assign(out, cls);
  return out;
};

export default extractCallData;
