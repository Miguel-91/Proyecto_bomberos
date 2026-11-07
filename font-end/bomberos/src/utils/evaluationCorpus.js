// Corpus de evaluación del clasificador de llamadas.
//
// Son frases escritas como las devolvería el reconocimiento de voz: sin tildes en algunos casos,
// sin puntuación, con muletillas, errores de transcripción y expresiones de Guatemala.
// Cada frase tiene la clasificación que le daría un operador con experiencia (etiqueta de referencia).
//
// LIMITACIÓN (importante para la defensa): este corpus lo redactó el mismo equipo que diseñó el
// clasificador, por lo que su resultado es una estimación optimista. Para una medición válida
// se debe ampliar con transcripciones reales y anonimizadas de llamadas de la estación,
// etiquetadas por operadores que no conozcan las palabras clave del sistema.
//
// type: fire | medical | traffic | rescue | hazmat | natural | other
// priority: critical | high | medium | low
// Los campos address/name/phone indican si la frase contiene ese dato (para medir la extracción).

// Conjunto de DESARROLLO: se usó para ajustar las palabras clave y las reglas de prioridad.
export const EVALUATION_CORPUS = [
  // ---------------- Incendio ----------------
  { text: 'se esta quemando una casa en la colonia los llanos hay humo negro por todos lados', type: 'fire', priority: 'high', address: true },
  { text: 'hay fuego en el terreno baldio de a la par ya se esta acercando a las casas', type: 'fire', priority: 'high' },
  { text: 'auxilio se quema mi casa y mi abuelita esta adentro no puede caminar', type: 'fire', priority: 'critical' },
  { text: 'buenas tardes es que se ve humo saliendo de la bodega de la tercera calle poniente', type: 'fire', priority: 'high', address: true },
  { text: 'se incendio un poste de luz echa chispas y llamas en la calle ancha', type: 'fire', priority: 'high', address: true },
  { text: 'en la cocina de un comedor del mercado agarro fuego la estufa ya lo apagamos pero sigue el humo', type: 'fire', priority: 'medium' },
  { text: 'esta ardiendo el cerro de la cruz se ven las llamas desde el parque central', type: 'fire', priority: 'high', address: true },
  { text: 'un corto circuito en mi casa y salen llamas del tomacorriente', type: 'fire', priority: 'high' },

  // ---------------- Emergencia médica ----------------
  { text: 'mi esposo se desmayo y no respira por favor manden una ambulancia', type: 'medical', priority: 'critical' },
  { text: 'hay una señora en la calle que le dio un ataque y esta convulsionando', type: 'medical', priority: 'critical' },
  { text: 'mi mama tiene un dolor de pecho muy fuerte y se puso palida', type: 'medical', priority: 'critical' },
  { text: 'mi hija esta embarazada y ya se le rompio la fuente estamos en jocotenango', type: 'medical', priority: 'high', address: true },
  { text: 'un señor se cayo de la escalera y creo que se quebro el brazo', type: 'medical', priority: 'medium' },
  { text: 'mi papa es diabetico y esta muy mareado no responde bien', type: 'medical', priority: 'high' },
  { text: 'hay un muchacho tirado en la banqueta de la sexta avenida esta inconsciente', type: 'medical', priority: 'critical', address: true },
  { text: 'a mi hijo le pico un alacran y se le esta hinchando la mano', type: 'medical', priority: 'medium' },
  { text: 'necesito traslado para mi abuelo que tiene la presion alta le duele la cabeza', type: 'medical', priority: 'medium' },

  // ---------------- Accidente de tránsito ----------------
  { text: 'hubo un choque entre dos carros en la entrada de ciudad vieja', type: 'traffic', priority: 'medium', address: true },
  { text: 'atropellaron a un niño frente a la escuela de san felipe esta sangrando', type: 'traffic', priority: 'critical', address: true },
  { text: 'se volco un pickup en la carretera a pastores hay gente adentro', type: 'traffic', priority: 'critical', address: true },
  { text: 'un motorista se derrapo en la cuesta y esta tirado en el asfalto', type: 'traffic', priority: 'high' },
  { text: 'colision de un bus con un trailer en el kilometro 45 hay varios heridos', type: 'traffic', priority: 'critical', address: true },
  { text: 'se chocaron dos motos aqui por el arco no se ven heridos graves', type: 'traffic', priority: 'medium' },
  { text: 'un tuc tuc se fue contra un poste y el piloto esta golpeado', type: 'traffic', priority: 'high' },

  // ---------------- Rescate ----------------
  { text: 'un señor se cayo a un barranco en la aldea el hato y no puede subir', type: 'rescue', priority: 'critical', address: true },
  { text: 'hay un niño atrapado en un pozo detras de la casa', type: 'rescue', priority: 'critical' },
  { text: 'se perdieron unos turistas en el volcan de agua ya va a oscurecer', type: 'rescue', priority: 'high' },
  { text: 'se derrumbo una pared y hay un trabajador atrapado debajo de los escombros', type: 'rescue', priority: 'critical' },
  { text: 'un muchacho se esta ahogando en el rio guacalate', type: 'rescue', priority: 'critical' },
  { text: 'mi hijo se quedo encerrado en el baño y no podemos abrir la puerta', type: 'rescue', priority: 'low' },

  // ---------------- Materiales peligrosos ----------------
  { text: 'hay una fuga de gas en un cilindro de la tortilleria huele bien fuerte', type: 'hazmat', priority: 'high' },
  { text: 'se volteo un camion cisterna y esta derramando combustible en la calle', type: 'hazmat', priority: 'critical' },
  { text: 'huele a gas en todo el edificio y la gente se esta mareando', type: 'hazmat', priority: 'critical' },
  { text: 'en la finca estaban fumigando y unos trabajadores se intoxicaron con el quimico', type: 'hazmat', priority: 'critical' },
  { text: 'encontramos unos tambos con un liquido raro que suelta un olor fuerte', type: 'hazmat', priority: 'medium' },

  // ---------------- Desastre natural ----------------
  { text: 'hubo un deslave en la carretera a santa maria de jesus y tapo el paso', type: 'natural', priority: 'high', address: true },
  { text: 'con la tormenta se inundo la colonia y el agua ya entro a las casas', type: 'natural', priority: 'high', address: true },
  { text: 'se cayo un arbol encima de una casa por el viento', type: 'natural', priority: 'high' },
  { text: 'despues del temblor se agrieto la iglesia y la gente esta asustada', type: 'natural', priority: 'medium' },
  { text: 'el rio crecio mucho y se esta llevando la tierra de las orillas', type: 'natural', priority: 'high' },

  // ---------------- Otros (no clasificables por el sistema) ----------------
  { text: 'hay un enjambre de abejas en el techo de la escuela y los niños tienen miedo', type: 'other', priority: 'medium' },
  { text: 'buenas solo queria preguntar a que hora abren para donar sangre', type: 'other', priority: 'low' },
  { text: 'hay una culebra grande metida en la cocina', type: 'other', priority: 'low' },
  { text: 'aló aló si me escucha se corta la llamada', type: 'other', priority: 'low' },

  // ---------------- Con datos del llamante (para medir la extracción) ----------------
  { text: 'mi nombre es Ana Lucía Pérez hay un incendio en la cuarta calle oriente numero 10 mi telefono es 5521 7788', type: 'fire', priority: 'high', address: true, name: true, phone: true },
  { text: 'le habla Mario Cifuentes se desmayo mi esposa en la aldea san juan del obispo mi numero es cuatro cinco seis seis uno dos tres cuatro', type: 'medical', priority: 'critical', address: true, name: true, phone: true },
  { text: 'me llamo Julio Batz hubo un accidente de moto en la calzada santa lucia mi cel es 3344 5566', type: 'traffic', priority: 'high', address: true, name: true, phone: true },
  { text: 'soy Karla Mendoza hay olor a gas en el residencial las rosas el numero es 5050 6060', type: 'hazmat', priority: 'high', address: true, name: true, phone: true },
];

// Conjunto de PRUEBA: redactado después de ajustar el clasificador y NO usado para modificarlo.
// Su resultado es la estimación más honesta disponible sin llamadas reales.
export const TEST_CORPUS = [
  { text: 'oiga hay un monton de humo saliendo de una casa en san pedro las huertas', type: 'fire', priority: 'high', address: true },
  { text: 'se nos prendio la cocina de leña y ya agarro el techo de lamina', type: 'fire', priority: 'high' },
  { text: 'esta quemandose un carro en el parqueo del mercado nadie esta adentro', type: 'fire', priority: 'high' },
  { text: 'agarro fuego un monte en la finca y el viento lo esta llevando para las casas', type: 'fire', priority: 'high' },
  { text: 'en el segundo piso hay llamas y una señora esta gritando en la ventana', type: 'fire', priority: 'critical' },
  { text: 'mi abuelito se puso morado y no le sale el aire', type: 'medical', priority: 'critical' },
  { text: 'a mi esposa le dio un derrame no puede mover la mitad del cuerpo', type: 'medical', priority: 'critical' },
  { text: 'un niño se trago una moneda y se esta ahogando', type: 'medical', priority: 'critical' },
  { text: 'mi tia esta con mucha fiebre y vomitando desde ayer', type: 'medical', priority: 'medium' },
  { text: 'un trabajador se corto la mano con una maquina y sangra bastante', type: 'medical', priority: 'high' },
  { text: 'hay un señor borracho tirado que no se mueve en la alameda santa lucia', type: 'medical', priority: 'high', address: true },
  { text: 'a mi vecina le estan dando dolores de parto ya no aguanta', type: 'medical', priority: 'high' },
  { text: 'se pegaron dos camionetas en la entrada a antigua por la gasolinera', type: 'traffic', priority: 'medium' },
  { text: 'un carro le paso encima a un ciclista en la carretera a san lucas', type: 'traffic', priority: 'critical', address: true },
  { text: 'una moto choco contra un muro y el muchacho no se levanta', type: 'traffic', priority: 'critical' },
  { text: 'se embarranco un microbus con pasajeros en la bajada de el hato', type: 'traffic', priority: 'critical' },
  { text: 'se fue un carro al barranco y no sabemos si hay gente', type: 'traffic', priority: 'critical' },
  { text: 'un gato lleva dos dias arriba de un arbol muy alto', type: 'rescue', priority: 'low' },
  { text: 'un señor quedo prensado entre la pared y un camion', type: 'rescue', priority: 'critical' },
  { text: 'unos patojos se metieron a la mina y no han salido', type: 'rescue', priority: 'critical' },
  { text: 'se hundio el piso de una casa vieja y cayo una señora al sotano', type: 'rescue', priority: 'critical' },
  { text: 'en la tienda se rompio el tubo del gas y todo huele', type: 'hazmat', priority: 'high' },
  { text: 'un camion regó pintura y solventes en la calle y el olor marea', type: 'hazmat', priority: 'high' },
  { text: 'se reventaron unos frascos de acido en el laboratorio del colegio', type: 'hazmat', priority: 'high' },
  { text: 'con el aguacero el agua se esta metiendo a las casas de la colonia', type: 'natural', priority: 'high', address: true },
  { text: 'se vino abajo un pedazo de cerro encima del camino', type: 'natural', priority: 'high' },
  { text: 'el volcan de fuego esta tirando ceniza y piedras cerca de la aldea', type: 'natural', priority: 'high', address: true },
  { text: 'hay un panal de avispas en la puerta de la clinica', type: 'other', priority: 'medium' },
  { text: 'se metio un tacuazin a la casa y no lo podemos sacar', type: 'other', priority: 'low' },
  { text: 'nada mas llamaba para saber si me pueden dar una constancia', type: 'other', priority: 'low' },
  { text: 'soy Marta Chávez se me quema la casa en la colonia san jose mi cel es 4433 2211', type: 'fire', priority: 'high', address: true, name: true, phone: true },
  { text: 'me llamo Byron Ajú mi mama no respira estamos en la segunda avenida sur 15 el numero es tres tres dos uno cuatro cuatro cinco cinco', type: 'medical', priority: 'critical', address: true, name: true, phone: true },
];

// Frases para medir la precisión del reconocimiento de voz con el micrófono real (WER).
// El operador lee cada frase en voz alta y el sistema compara lo transcrito con el texto esperado.
export const WER_SENTENCES = [
  'Hay un incendio en la quinta avenida norte número doce',
  'Mi nombre es Carlos Pérez y mi teléfono es cinco cinco uno dos tres cuatro cinco seis',
  'Se chocaron dos motos en la carretera a Ciudad Vieja',
  'Mi papá se desmayó y no respira, manden una ambulancia',
  'Estamos en la aldea San Juan del Obispo frente a la iglesia',
  'Hay una fuga de gas en el mercado de Jocotenango',
  'Un niño se cayó a un barranco en San Felipe de Jesús',
  'Por favor vengan rápido, hay personas atrapadas',
];
