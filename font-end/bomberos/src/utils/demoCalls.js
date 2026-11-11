// Llamadas de ejemplo para la demostración del sistema.
// Se reproducen por el MISMO flujo que la voz real (transcripción parcial → frase final → análisis),
// así la demostración no depende del micrófono, de internet ni del ruido del salón.
// Cada llamada indica qué se espera que detecte el sistema, para poder comprobarlo en vivo.

export const DEMO_CALLS = [
  {
    id: 'incendio-ninos',
    title: 'Incendio con niños adentro',
    description: 'Llamante en pánico, vivienda en llamas.',
    expected: { type: 'fire', priority: 'critical', emotion: 'Pánico' },
    lines: [
      { speaker: 'Operador', text: 'Bomberos Voluntarios, ¿cuál es su emergencia?' },
      { speaker: 'Llamante', text: 'Auxilio auxilio, se está quemando la casa de mi vecina y hay niños adentro', volume: 70 },
      { speaker: 'Operador', text: '¿Cuál es la dirección exacta?' },
      { speaker: 'Llamante', text: 'Estamos en la quinta avenida norte número 12, Antigua Guatemala, hay mucho humo, por favor rápido', volume: 65 },
      { speaker: 'Operador', text: '¿Me da su nombre y un número de teléfono?' },
      { speaker: 'Llamante', text: 'Me llamo Rosa de la Cruz, mi teléfono es 5512 3456' },
    ],
  },
  {
    id: 'medica-desmayo',
    title: 'Adulto mayor inconsciente',
    description: 'Familiar nervioso, emergencia médica.',
    expected: { type: 'medical', priority: 'critical', emotion: 'Nervioso' },
    lines: [
      { speaker: 'Operador', text: 'Bomberos Voluntarios, ¿cuál es su emergencia?' },
      { speaker: 'Llamante', text: 'Buenas noches, le habla Jorge Ramírez, mi papá se desmayó y está inconsciente, ayúdeme por favor', volume: 40 },
      { speaker: 'Operador', text: '¿Está respirando?' },
      { speaker: 'Llamante', text: 'Sí respira pero no reacciona, tiene setenta y ocho años y es diabético' },
      { speaker: 'Operador', text: '¿Dónde se encuentran?' },
      { speaker: 'Llamante', text: 'En la aldea San Juan del Obispo, frente a la iglesia. Mi número es cinco cuatro siete ocho dos uno nueve cero' },
    ],
  },
  {
    id: 'accidente-moto',
    title: 'Accidente de tránsito con heridos',
    description: 'Testigo calmado en carretera.',
    expected: { type: 'traffic', priority: 'high', emotion: 'Calmado' },
    lines: [
      { speaker: 'Operador', text: 'Bomberos Voluntarios, ¿cuál es su emergencia?' },
      { speaker: 'Llamante', text: 'Hola, quiero reportar un choque entre una moto y un carro' },
      { speaker: 'Llamante', text: 'Es en la carretera a Ciudad Vieja kilómetro 3, hay dos heridos y el motorista sangra de la pierna' },
      { speaker: 'Operador', text: '¿Su nombre y teléfono?' },
      { speaker: 'Llamante', text: 'Mi nombre es Luis Hernández, mi celular es 3021 8899' },
    ],
  },
  {
    id: 'fuga-gas',
    title: 'Fuga de gas en el mercado',
    description: 'Materiales peligrosos, sin heridos todavía.',
    expected: { type: 'hazmat', priority: 'high', emotion: 'Nervioso' },
    lines: [
      { speaker: 'Operador', text: 'Bomberos Voluntarios, ¿cuál es su emergencia?' },
      { speaker: 'Llamante', text: 'Hay una fuga de gas en un cilindro en el Mercado Municipal, hay un olor fuerte' },
      { speaker: 'Llamante', text: 'Vengan pronto por favor, hay mucha gente. Habla Ana Gómez, mi número es 4789 1234' },
    ],
  },
  {
    id: 'ambigua',
    title: 'Caso ambiguo (muestra la confirmación)',
    description: 'Al inicio la IA duda entre accidente e incendio; con la siguiente respuesta se aclara.',
    expected: { type: 'Incierto → Incendio', priority: 'high', emotion: 'Calmado' },
    lines: [
      { speaker: 'Operador', text: 'Bomberos Voluntarios, ¿cuál es su emergencia?' },
      { speaker: 'Llamante', text: 'Hay un carro que se está quemando en la calle', volume: 35 },
      { speaker: 'Operador', text: '¿Hay personas adentro del vehículo?' },
      { speaker: 'Llamante', text: 'No, el señor ya salió, pero hay fuego en el motor y mucho humo, ya llega a los cables de la luz' },
      { speaker: 'Operador', text: '¿Dónde exactamente?' },
      { speaker: 'Llamante', text: 'En la calle ancha de los herreros, frente a la gasolinera. Habla Pedro Morales, mi número es 5590 1122' },
    ],
  },
];

export const getDemoCall = (id) => DEMO_CALLS?.find((c) => c?.id === id);
