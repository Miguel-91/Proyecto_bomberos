// Análisis local de la transcripción de una llamada (sin enviar datos a internet).
// Detecta tipo de emergencia, prioridad, dirección y datos clave por palabras clave.

const normalize = (text) =>
  text?.toLowerCase()?.normalize('NFD')?.replace(/[̀-ͯ]/g, '') || '';

const TYPE_KEYWORDS = {
  fire: ['incendio', 'incendi', 'fuego', 'humo', 'llamas', 'se quema', 'quemando', 'ardiendo', 'cortocircuito', 'corto circuito', 'chispas'],
  medical: ['herido', 'herida', 'desmay', 'no respira', 'inconsciente', 'convulsi', 'infarto', 'dolor de pecho', 'sangra', 'embarazada', 'parto', 'se le rompio la fuente', 'ambulancia', 'fractura', 'quebr', 'diabetic', 'presion', 'enfermo', 'mareado', 'palid', 'le dio un ataque', 'alacran', 'picadura', 'le pico', 'mordi', 'traslado'],
  traffic: ['choque', 'chocaron', 'accidente', 'atropell', 'colision', 'volco', 'moto', 'motorista', 'carro', 'vehiculo', 'bus', 'camion', 'trailer', 'pickup', 'tuc tuc', 'piloto', 'derrap', 'se fue contra'],
  rescue: ['atrapad', 'rescate', 'barranco', 'se cayo a', 'pozo', 'ahog', 'perdid', 'se perdieron', 'extraviad', 'derrumb', 'escombros', 'encerrad', 'no puede subir', 'no puede salir'],
  hazmat: ['gas', 'quimico', 'fuga', 'derram', 'toxico', 'cilindro', 'olor fuerte', 'huele', 'combustible', 'cisterna', 'gasolina', 'diesel', 'intoxic', 'fumig'],
  natural: ['deslave', 'inund', 'sismo', 'terremoto', 'temblor', 'erupcion', 'volcan', 'tormenta', 'arbol', 'lahar', 'crecio', 'crecida', 'viento', 'agriet', 'rio'],
};

// Busca palabras clave al INICIO de una palabra (evita que "Mario" cuente como "río")
const keywordRegexCache = {};
const hasKeyword = (normalizedText, keyword) => {
  if (!keywordRegexCache[keyword]) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    keywordRegexCache[keyword] = new RegExp(`(^|[^a-z0-9])${escaped}`);
  }
  return keywordRegexCache[keyword].test(normalizedText);
};

const TYPE_LABELS = {
  fire: 'Incendio',
  medical: 'Emergencia médica',
  traffic: 'Accidente de tránsito',
  rescue: 'Rescate',
  hazmat: 'Materiales peligrosos',
  natural: 'Desastre natural',
};

// Criterios de prioridad basados en protocolos de triaje telefónico:
// riesgo vital inmediato o personas expuestas al peligro = Crítica
const CRITICAL_KEYWORDS = [
  'atrapad', 'no respira', 'inconsciente', 'no reacciona', 'no responde', 'explosion', 'colaps', 'muchas personas',
  'varios heridos', 'mucha sangre', 'se esta quemando la casa', 'paro', 'convulsi', 'dolor de pecho', 'infarto',
  'ahog', 'barranco', 'atropell', 'intoxic', 'mareando', 'gente adentro', 'personas adentro', 'esta adentro',
  'estan adentro', 'ninos adentro', 'nino adentro', 'escombros',
];
const HIGH_KEYWORDS = [
  'herido', 'sangra', 'fuego', 'incendi', 'humo', 'llamas', 'ardiendo', 'gas', 'quimico', 'combustible', 'derram',
  'fractura', 'quebr', 'golpead', 'embarazada', 'parto', 'diabetic', 'mareado', 'deslave', 'inund', 'crecio',
  'arbol', 'perdid', 'se perdieron', 'derrumb', 'volco', 'derrap', 'accidente de moto',
];
// Personas en un lugar de peligro (casa en llamas, vehículo volcado...)
const PEOPLE_INSIDE = /(gente|personas?|nin[oa]s?|abuel[oa]|alguien|senor[a]?|bebe|familia)\s+(?:\w+\s+){0,2}adentro|hay gente adentro/;

// Por debajo de esta confianza el operador debe confirmar el tipo con el llamante
export const CONFIRMATION_THRESHOLD = 75;

const UNITS_BY_TYPE = { fire: 2, medical: 1, traffic: 2, rescue: 2, hazmat: 2, natural: 3 };
const TIME_BY_PRIORITY = { critical: '5-8', high: '8-12', medium: '10-15', low: '15-20' };

// Lugares conocidos de Antigua Guatemala y sus alrededores
const KNOWN_PLACES = [
  'Parque Central', 'Calle del Arco', 'Arco de Santa Catalina', 'Catedral', 'La Merced', 'Mercado Municipal',
  'Cerro de la Cruz', 'Alameda Santa Lucía', 'Jocotenango', 'Ciudad Vieja', 'San Felipe de Jesús',
  'San Pedro Las Huertas', 'Santa Ana', 'San Bartolomé Becerra', 'San Cristóbal El Bajo', 'San Cristóbal El Alto',
  'San Juan del Obispo', 'San Gaspar Vivar', 'El Hato', 'Pastores', 'San Miguel Dueñas', 'Santa Catarina Bobadilla',
  'San Mateo Milpas Altas', 'Santa Inés del Monte Pulciano', 'San Lorenzo El Tejar', 'Calle Ancha de los Herreros',
];

const ORDINALS = 'primera|segunda|tercera|cuarta|quinta|sexta|s[eé]ptima|octava|novena|d[eé]cima|\\d+\\s*(?:a|ª|era|ra|da|ta|va|na)?';
const STREET_TYPES = 'calle|avenida|av\\.|callej[oó]n|colonia|aldea|lotificaci[oó]n|residencial|barrio|cant[oó]n|sector|kil[oó]metro|km|carretera|camino';
const ADDRESS_REGEX = new RegExp(`((?:(?:${ORDINALS})\\s+)?(?:${STREET_TYPES})\\b[^.,;!?\\n]{0,60})`, 'gi');
// Corta la dirección cuando la frase continúa con otra idea
const ADDRESS_STOP = /\s(?:y\s(?:hay|se|est|tien|no)|hay|porque|por favor|que\s(?:se|hay|est)|se\s(?:est|cay|qu)|est[aá]n?\s|tiene|donde|r[aá]pido|ayuda|urgente)\b.*$/i;

const extractAddress = (text) => {
  const candidates = [];
  let match;
  ADDRESS_REGEX.lastIndex = 0;
  while ((match = ADDRESS_REGEX.exec(text)) !== null) {
    const value = match?.[1]?.replace(ADDRESS_STOP, '')?.trim();
    if (value?.split(' ')?.length >= 2) candidates.push(value);
  }

  const normalizedText = normalize(text);
  const place = KNOWN_PLACES?.find((p) => normalizedText?.includes(normalize(p)));

  // Se prefiere la última dirección mencionada (suele ser la corrección del llamante)
  let address = candidates?.[candidates?.length - 1] || null;
  if (address && place && !normalize(address)?.includes(normalize(place))) {
    address = `${address}, ${place}`;
  } else if (!address && place) {
    address = place;
  }
  return address ? address?.charAt(0)?.toUpperCase() + address?.slice(1) : null;
};

const NUMBER_WORDS = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };

const extractPeople = (normalizedText) => {
  const match = normalizedText?.match(/(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(?:personas?|heridos?|lesionados?|ninos?|adultos?|pacientes?)/);
  if (!match) return null;
  return Number(match?.[1]) || NUMBER_WORDS?.[match?.[1]] || null;
};

// ---------------------------------------------------------------------------
// Teléfono (Guatemala: 8 dígitos, opcional +502). Acepta "5512 3456" o "cinco cinco uno dos..."
// ---------------------------------------------------------------------------
const DIGIT_WORDS = {
  cero: '0', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7',
  ocho: '8', nueve: '9', diez: '10', once: '11', doce: '12', trece: '13', catorce: '14', quince: '15',
  dieciseis: '16', diecisiete: '17', dieciocho: '18', diecinueve: '19', veinte: '20', treinta: '30',
  cuarenta: '40', cincuenta: '50', sesenta: '60', setenta: '70', ochenta: '80', noventa: '90',
};

export const extractPhone = (text) => {
  let t = normalize(text);
  t = t.replace(/\b(veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/g,
    (_, a, b) => String(Number(DIGIT_WORDS[a]) + Number(DIGIT_WORDS[b])));
  t = t.replace(/\b[a-z]+\b/g, (w) => (DIGIT_WORDS[w] !== undefined ? DIGIT_WORDS[w] : w));
  const runs = t.match(/\+?\d[\d\s.-]{6,}\d/g) || [];
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
// Nombre: "mi nombre es...", "me llamo...", "habla...", "soy..."
// ---------------------------------------------------------------------------
const NAME_TRIGGERS = ['mi nombre es', 'me llamo', 'le habla', 'les habla', 'habla', 'soy el senor', 'soy la senora', 'soy'];
const NAME_STOP = new Set([
  'y', 'e', 'estoy', 'vivo', 'mi', 'tengo', 'hay', 'necesito', 'necesitamos', 'por', 'en', 'desde', 'que',
  'con', 'es', 'numero', 'telefono', 'celular', 'aqui', 'aca', 'llamo', 'llamando', 'le', 'les', 'para',
  'porque', 'pues', 'este', 'esta', 'buenas', 'buenos', 'hola', 'senor', 'senora', 'vecino', 'vecina', 'un',
  'una', 'el', 'la', 'los', 'las', 'se', 'no', 'si', 'muy', 'urgente', 'ayuda', 'auxilio', 'donde', 'cuando',
  'como', 'al', 'a', 'hubo', 'paso', 'ocurrio', 'sucedio', 'tuvo', 'acaba', 'acabo', 'mire', 'oiga', 'fijese',
  'quiero', 'queria', 'reportar', 'avisar', 'del', 'de',
]);

const capitalizeName = (s) => s.split(/\s+/).filter(Boolean).map((w) => (
  ['de', 'del', 'la', 'los', 'las'].includes(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
)).join(' ');

export const extractName = (text) => {
  const original = String(text || '');
  const n = normalize(original);
  // normalize() conserva la longitud (NFD + quitar tildes), pero por seguridad se reconstruye por palabras
  for (const trigger of NAME_TRIGGERS) {
    const re = new RegExp(`(?:^|[\\s,.;])${trigger}\\s+`, 'g');
    let m;
    while ((m = re.exec(n)) !== null) {
      const restNorm = n.slice(m.index + m[0].length).split(/[,.;:!?\n]/)[0];
      const wordsN = restNorm.split(/\s+/).filter(Boolean);
      // Palabras originales (con tildes) en la misma posición
      const origWords = original.split(/\s+/).filter(Boolean);
      const normWords = origWords.map((w) => normalize(w).replace(/[,.;:!?]/g, ''));
      const offset = n.slice(0, m.index + m[0].length).split(/\s+/).filter(Boolean).length;
      const picked = [];
      for (let i = 0; i < wordsN.length && picked.length < 6; i++) {
        const w = wordsN[i];
        if (/\d/.test(w)) break;
        if ((w === 'de' || w === 'del') && picked.length > 0) {
          const art = ['la', 'los', 'las'].includes(wordsN[i + 1]) ? 1 : 0;
          const next = wordsN[i + 1 + art];
          if (next && !NAME_STOP.has(next) && !/\d/.test(next)) {
            for (let k = 0; k <= art; k++) picked.push(wordsN[i + k]);
            i += art;
            continue;
          }
          break;
        }
        if (NAME_STOP.has(w)) break;
        // Recuperar la palabra con tildes si coincide
        const orig = origWords[offset + i];
        picked.push(orig && normWords[offset + i] === w ? orig.replace(/[,.;:!?]/g, '') : w);
      }
      if (!picked.length || picked.join(' ').length < 3) continue;
      // Con "soy" a secas se exige que parezca un nombre (2+ palabras)
      if (trigger === 'soy' && picked.length < 2) continue;
      return capitalizeName(picked.join(' '));
    }
  }
  return null;
};

// Resumen de lo que dijo el llamante para "Información adicional"
const buildSummary = (text) => String(text || '').replace(/\s+/g, ' ').replace(/^\.\s*|\.\s*$/g, '').trim();

export const analyzeTranscript = (text) => {
  const normalizedText = normalize(text);
  if (!normalizedText?.trim()) return null;

  // Tipo de emergencia por número de coincidencias
  const scores = Object.entries(TYPE_KEYWORDS)?.map(([type, words]) => [
    type,
    words?.filter((w) => hasKeyword(normalizedText, w))?.length,
  ]);
  // Si hay empate, "heridos" no debe ganarle al tipo de incidente (choque, incendio...)
  scores?.sort((a, b) => (b?.[1] - a?.[1]) || ((a?.[0] === 'medical') - (b?.[0] === 'medical')));
  const [bestType, bestScore] = scores?.[0];
  const totalHits = scores?.reduce((acc, [, n]) => acc + n, 0);
  const type = bestScore > 0 ? bestType : null;
  // Certeza estimada (heurística, no es una probabilidad calibrada):
  // crece con el número de palabras clave del tipo ganador y baja si otros tipos compiten.
  // 1 palabra ≈ 45 %, 2 ≈ 60 %, 3 ≈ 75 %, 4 o más ≈ 90 % (si no hay competencia).
  const share = bestScore / Math.max(totalHits, 1);
  const confidence = type ? Math.min(95, Math.round(30 + 15 * Math.min(bestScore, 4) * share)) : 0;

  let priority = 'medium';
  if (CRITICAL_KEYWORDS?.some((w) => hasKeyword(normalizedText, w)) || PEOPLE_INSIDE.test(normalizedText)) priority = 'critical';
  else if (HIGH_KEYWORDS?.some((w) => hasKeyword(normalizedText, w))) priority = 'high';
  // Si no se reconoce el tipo, la IA NO asigna prioridad (antes asignaba "baja": era el error más peligroso).
  // Queda pendiente para que el operador la defina.
  else if (!type) priority = null;

  // ---- Salvaguardas: explicación, alternativas y ambigüedad -------------------
  // Palabras que llevaron a la clasificación (para que el operador vea el "por qué")
  const evidence = type ? TYPE_KEYWORDS?.[type]?.filter((w) => hasKeyword(normalizedText, w)) : [];
  // Otros tipos posibles (segunda opción)
  const alternatives = scores
    ?.filter(([t, n]) => n > 0 && t !== type)
    ?.slice(0, 2)
    ?.map(([t, n]) => ({ type: t, label: TYPE_LABELS?.[t], hits: n }));
  const secondScore = alternatives?.[0]?.hits || 0;
  // Ambigua: la segunda opción está cerca de la primera, o hay muy poca evidencia
  const ambiguous = !!type && (secondScore >= bestScore * 0.75 || bestScore < 2);
  const lowConfidence = !!type && confidence < CONFIRMATION_THRESHOLD;
  // Regla conservadora: ante la duda, la prioridad nunca queda en "media" o "baja"
  const priorityRaisedByDoubt = ambiguous && (priority === 'medium' || priority === 'low');
  if (priorityRaisedByDoubt) priority = 'high';

  const trapped = normalizedText?.includes('atrapad');
  const injured = /herid|lesionad|sangra|inconsciente|no respira/.test(normalizedText);
  const people = extractPeople(normalizedText);

  const keyFacts = [];
  if (trapped) keyFacts.push('Se reportan personas atrapadas');
  if (injured) keyFacts.push('Se reportan personas heridas');
  if (people) keyFacts.push(`Personas involucradas: ${people}`);

  return {
    type,
    typeLabel: TYPE_LABELS?.[type] || null,
    confidence,
    priority,
    address: extractAddress(text),
    name: extractName(text),
    phone: extractPhone(text),
    summary: buildSummary(text),
    evidence,
    alternatives,
    ambiguous,
    lowConfidence,
    needsConfirmation: ambiguous || lowConfidence,
    priorityRaisedByDoubt,
    trapped,
    injured,
    people,
    keyFacts,
    estimatedUnits: (UNITS_BY_TYPE?.[type] || 1) + (priority === 'critical' ? 1 : 0),
    estimatedTime: TIME_BY_PRIORITY?.[priority] || '-',
    riskLevel: priority === 'critical' ? 'Muy alto' : priority === 'high' ? 'Alto' : priority === 'medium' ? 'Moderado' : priority === 'low' ? 'Bajo' : 'Por definir',
  };
};

// ---------------------------------------------------------------------------
// Estado emocional del llamante (¿la llamada está alterada?)
// Se combina lo que dice (palabras de angustia, repeticiones, frases cortas)
// con el volumen de la voz medido por el micrófono (0-100).
// ---------------------------------------------------------------------------
const DISTRESS_STRONG = [
  'auxilio', 'socorro', 'se va a morir', 'se esta muriendo', 'se muere', 'me muero', 'me estoy muriendo',
  'no se que hacer', 'dios mio', 'por el amor de dios', 'apurense', 'apurese', 'desesperad', 'ya no aguanto',
  'no respira', 'esta muerto', 'esta muerta', 'mi hijo', 'mi hija', 'mi bebe', 'mis hijos', 'nos vamos a morir',
  'gritando', 'llorando', 'grita', 'llora',
];
const DISTRESS_MILD = [
  'ayuda', 'rapido', 'urgente', 'por favor', 'vengan', 'manden', 'pronto', 'miedo', 'asustad',
  'nervios', 'preocupad', 'no puedo', 'que alguien', 'ay', 'ayudeme', 'ayudenme',
];
const CALM_WORDS = ['ya esta controlado', 'ya se apago', 'todo esta bien', 'no es grave', 'solo queria reportar', 'tranquilo'];

const EMOTION_LEVELS = [
  { min: 70, value: 'panic', label: 'Pánico', description: 'Llamante en pánico: hable despacio, dé instrucciones cortas y confirme la dirección.' },
  { min: 45, value: 'agitated', label: 'Alterado', description: 'Llamante alterado: tranquilícelo y haga una pregunta a la vez.' },
  { min: 20, value: 'nervous', label: 'Nervioso', description: 'Llamante nervioso, pero puede dar información.' },
  { min: 0, value: 'calm', label: 'Calmado', description: 'Llamante tranquilo.' },
];

export const analyzeEmotion = (text, { volume = 0 } = {}) => {
  const n = normalize(text);
  if (!n?.trim()) return null;
  const signals = [];
  let score = 0;

  const strong = DISTRESS_STRONG.filter((w) => new RegExp(`(^|[^a-z])${w}`).test(n));
  if (strong.length) {
    score += Math.min(50, strong.length * 25);
    signals.push(`Palabras de angustia: "${strong.slice(0, 3).join('", "')}"`);
  }
  const mild = DISTRESS_MILD.filter((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(n));
  if (mild.length) {
    score += Math.min(30, mild.length * 10);
    signals.push(`Pide urgencia: "${mild.slice(0, 3).join('", "')}"`);
  }

  // Repeticiones: "ayuda ayuda", "rápido rápido"
  const words = n.split(/[^a-z]+/).filter((w) => w.length > 2);
  let repeats = 0;
  for (let i = 1; i < words.length; i++) if (words[i] === words[i - 1]) repeats++;
  if (repeats) {
    score += Math.min(20, repeats * 10);
    signals.push('Repite palabras');
  }

  // Frases muy cortas y entrecortadas
  const phrases = String(text).split(/[.!?\n]+/).map((p) => p.trim()).filter(Boolean);
  const shortPhrases = phrases.filter((p) => p.split(/\s+/).length <= 3).length;
  if (phrases.length >= 3 && shortPhrases / phrases.length >= 0.5) {
    score += 10;
    signals.push('Frases cortas y entrecortadas');
  }

  if (/[!¡]/.test(text)) {
    score += 5;
  }

  // Volumen de la voz (medido por el micrófono)
  if (volume >= 60) {
    score += 25;
    signals.push('Voz muy alta (posibles gritos)');
  } else if (volume >= 35) {
    score += 10;
    signals.push('Voz elevada');
  }

  if (CALM_WORDS.some((w) => n.includes(w))) {
    score -= 25;
    signals.push('Indica que la situación está controlada');
  }

  score = Math.max(0, Math.min(100, score));
  const level = EMOTION_LEVELS.find((l) => score >= l.min);
  return { ...level, score, signals };
};
