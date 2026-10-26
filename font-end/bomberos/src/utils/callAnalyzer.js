// Análisis local de la transcripción de una llamada (sin enviar datos a internet).
// Detecta tipo de emergencia, prioridad, dirección y datos clave por palabras clave.

const normalize = (text) =>
  text?.toLowerCase()?.normalize('NFD')?.replace(/[̀-ͯ]/g, '') || '';

const TYPE_KEYWORDS = {
  fire: ['incendio', 'fuego', 'humo', 'llamas', 'se quema', 'quemando', 'ardiendo', 'cortocircuito'],
  medical: ['herido', 'herida', 'desmay', 'no respira', 'inconsciente', 'convulsion', 'infarto', 'dolor de pecho', 'sangra', 'embarazada', 'parto', 'ambulancia', 'fractura', 'diabetic', 'presion', 'enfermo'],
  traffic: ['choque', 'accidente', 'atropell', 'colision', 'volco', 'moto', 'carro', 'vehiculo', 'bus', 'camion', 'trailer'],
  rescue: ['atrapad', 'rescate', 'barranco', 'cayo', 'se cayo', 'pozo', 'rio', 'ahog', 'perdido', 'extraviado', 'derrumbe', 'escombros'],
  hazmat: ['gas', 'quimico', 'fuga', 'derrame', 'toxico', 'cilindro', 'olor fuerte'],
  natural: ['deslave', 'inundacion', 'sismo', 'terremoto', 'temblor', 'erupcion', 'volcan', 'tormenta', 'arbol caido', 'lahar'],
};

const TYPE_LABELS = {
  fire: 'Incendio',
  medical: 'Emergencia médica',
  traffic: 'Accidente de tránsito',
  rescue: 'Rescate',
  hazmat: 'Materiales peligrosos',
  natural: 'Desastre natural',
};

const CRITICAL_KEYWORDS = ['atrapad', 'no respira', 'inconsciente', 'explosion', 'colaps', 'ninos', 'muchas personas', 'varios heridos', 'mucha sangre', 'se esta quemando la casa', 'no reacciona', 'paro'];
const HIGH_KEYWORDS = ['herido', 'sangra', 'fuego', 'incendio', 'humo', 'atropell', 'gas', 'quimico', 'fractura', 'convulsion', 'infarto'];

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
    words?.filter((w) => normalizedText?.includes(w))?.length,
  ]);
  // Si hay empate, "heridos" no debe ganarle al tipo de incidente (choque, incendio...)
  scores?.sort((a, b) => (b?.[1] - a?.[1]) || ((a?.[0] === 'medical') - (b?.[0] === 'medical')));
  const [bestType, bestScore] = scores?.[0];
  const totalHits = scores?.reduce((acc, [, n]) => acc + n, 0);
  const type = bestScore > 0 ? bestType : null;
  const confidence = type ? Math.min(95, Math.round(55 + (bestScore / Math.max(totalHits, 1)) * 25 + bestScore * 5)) : 0;

  let priority = 'medium';
  if (CRITICAL_KEYWORDS?.some((w) => normalizedText?.includes(w))) priority = 'critical';
  else if (HIGH_KEYWORDS?.some((w) => normalizedText?.includes(w))) priority = 'high';
  else if (!type) priority = 'low';

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
    trapped,
    injured,
    people,
    keyFacts,
    estimatedUnits: (UNITS_BY_TYPE?.[type] || 1) + (priority === 'critical' ? 1 : 0),
    estimatedTime: TIME_BY_PRIORITY?.[priority],
    riskLevel: priority === 'critical' ? 'Muy alto' : priority === 'high' ? 'Alto' : priority === 'medium' ? 'Moderado' : 'Bajo',
  };
};
