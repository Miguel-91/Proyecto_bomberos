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

export const analyzeTranscript = (text) => {
  const normalizedText = normalize(text);
  if (!normalizedText?.trim()) return null;

  // Tipo de emergencia por número de coincidencias
  const scores = Object.entries(TYPE_KEYWORDS)?.map(([type, words]) => [
    type,
    words?.filter((w) => normalizedText?.includes(w))?.length,
  ]);
  scores?.sort((a, b) => b?.[1] - a?.[1]);
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
    trapped,
    injured,
    people,
    keyFacts,
    estimatedUnits: (UNITS_BY_TYPE?.[type] || 1) + (priority === 'critical' ? 1 : 0),
    estimatedTime: TIME_BY_PRIORITY?.[priority],
    riskLevel: priority === 'critical' ? 'Muy alto' : priority === 'high' ? 'Alto' : priority === 'medium' ? 'Moderado' : 'Bajo',
  };
};
