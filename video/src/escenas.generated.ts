// Generado por scripts/sync-story.mjs a partir de story/. No editar a mano:
// cambien el texto en story/missions/*.md y vuelvan a correr "npm run sync".
import type {Escena} from './tipos';

export const ESCENAS: Escena[] = [
  {
    "id": "01-puerto-inicio-1",
    "missionId": "01-puerto",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 1,
    "title": "Isla 1 — Puerto de partida",
    "color": "#00A096",
    "logo": "logos-cursos/intro.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "¡Hola, equipo! Soy Rosario, del programa Ciencias de la Computación de Ceibal. Bienvenidos a la Expedición CC."
      },
      {
        "speaker": "equipo",
        "name": "Equipo explorador",
        "text": "¿Expedición? ¿Y qué tenemos que hacer?"
      },
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "En la ciudad hay seis edificios, uno por cada curso del programa. En cada uno los espera un tutor o tutora con un laboratorio y un cofre."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        210,
        115,
        210
      ],
      "outro": 15,
      "total": 625
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "01-puerto-inicio-2",
    "missionId": "01-puerto",
    "kind": "mission",
    "section": "inicio",
    "order": 2,
    "missionNumber": 1,
    "title": "Isla 1 — Puerto de partida",
    "color": "#00A096",
    "logo": "logos-cursos/intro.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Primera parada: el Puerto de partida. Suban al auto y sigan la flecha. Piloto: ¡manejen con cuidado!"
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "01-puerto-fin-1",
    "missionId": "01-puerto",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 1,
    "title": "Isla 1 — Puerto de partida",
    "color": "#00A096",
    "logo": "logos-cursos/intro.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Este es el Puerto de partida: acá empieza la Fase 1, con Introducción a las CC e IA desde cero. Son cursos online y autoasistidos, con webinars optativos."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "01-puerto-fin-2",
    "missionId": "01-puerto",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 1,
    "title": "Isla 1 — Puerto de partida",
    "color": "#00A096",
    "logo": "logos-cursos/intro.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Para la bitácora: Pueden anotarse estudiantes de 1.°, 2.° y 3.° de bachillerato público de Secundaria y UTU."
      },
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Acá está el cofre de Puerto de partida. Adentro hay una letra: U. ¡Anótenla!"
      }
    ],
    "reward": {
      "name": "Cofre Puerto de partida · letra U",
      "image": "assets/item-cofre-puerto.svg",
      "letter": "U"
    },
    "timing": {
      "intro": 20,
      "perLine": [
        210,
        182
      ],
      "outro": 120,
      "total": 532
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "02-isla-web-inicio-1",
    "missionId": "02-isla-web",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 2,
    "title": "Isla 2 — Isla Web",
    "color": "#0C88CA",
    "logo": "logos-cursos/web.svg",
    "left": "equipo",
    "right": "nacho",
    "lines": [
      {
        "speaker": "nacho",
        "name": "Nacho",
        "text": "¡Equipo! Acá Nacho, tutor de Desarrollo web. Me contó Rosario que vienen bien."
      },
      {
        "speaker": "nacho",
        "name": "Nacho",
        "text": "Tengo una página rota y un cliente apurado. Los espero en la Isla Web."
      },
      {
        "speaker": "equipo",
        "name": "Equipo explorador",
        "text": "¡Vamos para allá!"
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        186,
        172,
        78
      ],
      "outro": 15,
      "total": 526
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "nacho",
        "name": "Nacho",
        "profile": "Tutor de Desarrollo web"
      }
    ]
  },
  {
    "id": "02-isla-web-fin-1",
    "missionId": "02-isla-web",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 2,
    "title": "Isla 2 — Isla Web",
    "color": "#0C88CA",
    "logo": "logos-cursos/web.svg",
    "left": "equipo",
    "right": "nacho",
    "lines": [
      {
        "speaker": "nacho",
        "name": "Nacho",
        "text": "Bienvenidos a la Isla Web. En Desarrollo web aprenden cómo viaja la información por internet, a armar páginas con HTML, a darles estilo con CSS y a usar frameworks modernos."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "nacho",
        "name": "Nacho",
        "profile": "Tutor de Desarrollo web"
      }
    ]
  },
  {
    "id": "02-isla-web-fin-2",
    "missionId": "02-isla-web",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 2,
    "title": "Isla 2 — Isla Web",
    "color": "#0C88CA",
    "logo": "logos-cursos/web.svg",
    "left": "equipo",
    "right": "nacho",
    "lines": [
      {
        "speaker": "nacho",
        "name": "Nacho",
        "text": "Para la bitácora: HTML es el esqueleto, CSS la ropa y JS los músculos de una página."
      },
      {
        "speaker": "nacho",
        "name": "Nacho",
        "text": "Acá está el cofre de Isla Web. Adentro hay una letra: R. ¡Anótenla!"
      }
    ],
    "reward": {
      "name": "Cofre Isla Web · letra R",
      "image": "assets/item-cofre-web.svg",
      "letter": "R"
    },
    "timing": {
      "intro": 20,
      "perLine": [
        196,
        166
      ],
      "outro": 120,
      "total": 502
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "nacho",
        "name": "Nacho",
        "profile": "Tutor de Desarrollo web"
      }
    ]
  },
  {
    "id": "03-volcan-python-inicio-1",
    "missionId": "03-volcan-python",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 3,
    "title": "Isla 3 — Volcán Python",
    "color": "#F39219",
    "logo": "logos-cursos/prog.svg",
    "left": "equipo",
    "right": "martina",
    "lines": [
      {
        "speaker": "martina",
        "name": "Martina",
        "text": "Hola, equipo, soy Martina, tutora de Programación. Tengo un programa que da resultados raros y un bucle que no para."
      },
      {
        "speaker": "martina",
        "name": "Martina",
        "text": "Vengan al Volcán Python. Traigan paciencia, yo pongo el café."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        210,
        156
      ],
      "outro": 15,
      "total": 456
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "martina",
        "name": "Martina",
        "profile": "Tutora de Programación 1, 2 y 3"
      }
    ]
  },
  {
    "id": "03-volcan-python-fin-1",
    "missionId": "03-volcan-python",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 3,
    "title": "Isla 3 — Volcán Python",
    "color": "#F39219",
    "logo": "logos-cursos/prog.svg",
    "left": "equipo",
    "right": "martina",
    "lines": [
      {
        "speaker": "martina",
        "name": "Martina",
        "text": "Este es el Volcán Python: Programación 1, 2 y 3. Arrancan con sus primeros programas, siguen con estructuras de datos y terminan con programación orientada a objetos."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "martina",
        "name": "Martina",
        "profile": "Tutora de Programación 1, 2 y 3"
      }
    ]
  },
  {
    "id": "03-volcan-python-fin-2",
    "missionId": "03-volcan-python",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 3,
    "title": "Isla 3 — Volcán Python",
    "color": "#F39219",
    "logo": "logos-cursos/prog.svg",
    "left": "equipo",
    "right": "martina",
    "lines": [
      {
        "speaker": "martina",
        "name": "Martina",
        "text": "Para la bitácora: Un for repite el bloque con sangría. range(4) da cuatro vueltas: 0, 1, 2 y 3."
      },
      {
        "speaker": "martina",
        "name": "Martina",
        "text": "Acá está el cofre de Volcán Python. Adentro hay una letra: F. ¡Anótenla!"
      }
    ],
    "reward": {
      "name": "Cofre Volcán Python · letra F",
      "image": "assets/item-cofre-python.svg",
      "letter": "F"
    },
    "timing": {
      "intro": 20,
      "perLine": [
        210,
        175
      ],
      "outro": 120,
      "total": 525
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "martina",
        "name": "Martina",
        "profile": "Tutora de Programación 1, 2 y 3"
      }
    ]
  },
  {
    "id": "04-mina-de-datos-inicio-1",
    "missionId": "04-mina-de-datos",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 4,
    "title": "Isla 4 — Mina de Datos",
    "color": "#30A936",
    "logo": "logos-cursos/datos.png",
    "left": "equipo",
    "right": "joaquin",
    "lines": [
      {
        "speaker": "joaquin",
        "name": "Joaquín",
        "text": "¡Buenas! Soy Joaquín, de Datos para la acción. Tengo una base de datos llena de cursos y nadie sabe preguntarle."
      },
      {
        "speaker": "joaquin",
        "name": "Joaquín",
        "text": "Los espero en la Mina de Datos. Hoy se convierten en hackers... de los buenos."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        210,
        186
      ],
      "outro": 15,
      "total": 486
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "joaquin",
        "name": "Joaquín",
        "profile": "Tutor de Datos para la acción"
      }
    ]
  },
  {
    "id": "04-mina-de-datos-fin-1",
    "missionId": "04-mina-de-datos",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 4,
    "title": "Isla 4 — Mina de Datos",
    "color": "#30A936",
    "logo": "logos-cursos/datos.png",
    "left": "equipo",
    "right": "joaquin",
    "lines": [
      {
        "speaker": "joaquin",
        "name": "Joaquín",
        "text": "Esta es la Mina de Datos. En Datos para la acción recolectan, organizan y analizan datos con herramientas digitales para decidir mejor y contar historias visuales."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "joaquin",
        "name": "Joaquín",
        "profile": "Tutor de Datos para la acción"
      }
    ]
  },
  {
    "id": "04-mina-de-datos-fin-2",
    "missionId": "04-mina-de-datos",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 4,
    "title": "Isla 4 — Mina de Datos",
    "color": "#30A936",
    "logo": "logos-cursos/datos.png",
    "left": "equipo",
    "right": "joaquin",
    "lines": [
      {
        "speaker": "joaquin",
        "name": "Joaquín",
        "text": "Para la bitácora: SELECT dice qué columnas quieren, FROM de qué tabla y WHERE qué filas."
      },
      {
        "speaker": "joaquin",
        "name": "Joaquín",
        "text": "Acá está el cofre de Mina de Datos. Adentro hay una letra: O. ¡Anótenla!"
      }
    ],
    "reward": {
      "name": "Cofre Mina de Datos · letra O",
      "image": "assets/item-cofre-datos.svg",
      "letter": "O"
    },
    "timing": {
      "intro": 20,
      "perLine": [
        203,
        175
      ],
      "outro": 120,
      "total": 518
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "joaquin",
        "name": "Joaquín",
        "profile": "Tutor de Datos para la acción"
      }
    ]
  },
  {
    "id": "05-torre-ia-inicio-1",
    "missionId": "05-torre-ia",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 5,
    "title": "Isla 5 — Torre IA",
    "color": "#9225A5",
    "logo": "logos-cursos/ia2.svg",
    "left": "equipo",
    "right": "camila",
    "lines": [
      {
        "speaker": "camila",
        "name": "Camila",
        "text": "Hola, equipo, soy Camila, tutora de IA. Un videojuego necesita un anti-cheat y al grupo de la clase le llega spam."
      },
      {
        "speaker": "camila",
        "name": "Camila",
        "text": "Vengan a la Torre IA a entrenar una inteligencia artificial. Ojo: la IA también se equivoca."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        210,
        210
      ],
      "outro": 15,
      "total": 510
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "camila",
        "name": "Camila",
        "profile": "Tutora de IA desde cero y Profundización en IA"
      }
    ]
  },
  {
    "id": "05-torre-ia-fin-1",
    "missionId": "05-torre-ia",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 5,
    "title": "Isla 5 — Torre IA",
    "color": "#9225A5",
    "logo": "logos-cursos/ia2.svg",
    "left": "equipo",
    "right": "camila",
    "lines": [
      {
        "speaker": "camila",
        "name": "Camila",
        "text": "Esta es la Torre IA. IA desde cero (Fase 1) explica qué es y cómo funciona. Profundización en IA (Fase 2) trabaja técnicas, aplicaciones y desafíos éticos."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "camila",
        "name": "Camila",
        "profile": "Tutora de IA desde cero y Profundización en IA"
      }
    ]
  },
  {
    "id": "05-torre-ia-fin-2",
    "missionId": "05-torre-ia",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 5,
    "title": "Isla 5 — Torre IA",
    "color": "#9225A5",
    "logo": "logos-cursos/ia2.svg",
    "left": "equipo",
    "right": "camila",
    "lines": [
      {
        "speaker": "camila",
        "name": "Camila",
        "text": "Para la bitácora: Un modelo ajusta su regla mirando ejemplos. Cuando se equivoca, una persona tiene que revisar."
      },
      {
        "speaker": "camila",
        "name": "Camila",
        "text": "Acá está el cofre de Torre IA. Adentro hay una letra: T. ¡Anótenla!"
      }
    ],
    "reward": {
      "name": "Cofre Torre IA · letra T",
      "image": "assets/item-cofre-ia.svg",
      "letter": "T"
    },
    "timing": {
      "intro": 20,
      "perLine": [
        210,
        166
      ],
      "outro": 120,
      "total": 516
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "camila",
        "name": "Camila",
        "profile": "Tutora de IA desde cero y Profundización en IA"
      }
    ]
  },
  {
    "id": "06-taller-microbit-inicio-1",
    "missionId": "06-taller-microbit",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 6,
    "title": "Isla 6 — Taller Micro:bit",
    "color": "#FFC800",
    "logo": "logos-cursos/microbit.svg",
    "left": "equipo",
    "right": "facundo",
    "lines": [
      {
        "speaker": "facundo",
        "name": "Facundo",
        "text": "¡Eu, equipo! Facundo, del Taller Micro:bit. Tengo una placa con una señal escondida y otra esperando que la programen."
      },
      {
        "speaker": "facundo",
        "name": "Facundo",
        "text": "Última isla: el Taller Micro:bit. ¡Ya casi tienen las seis letras!"
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        210,
        164
      ],
      "outro": 15,
      "total": 464
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "facundo",
        "name": "Facundo",
        "profile": "Tutor de Micro:bit"
      }
    ]
  },
  {
    "id": "06-taller-microbit-fin-1",
    "missionId": "06-taller-microbit",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 6,
    "title": "Isla 6 — Taller Micro:bit",
    "color": "#FFC800",
    "logo": "logos-cursos/microbit.svg",
    "left": "equipo",
    "right": "facundo",
    "lines": [
      {
        "speaker": "facundo",
        "name": "Facundo",
        "text": "Este es el Taller Micro:bit. Programan la placa micro:bit, simulan en MakeCode y resuelven problemas cotidianos combinando código y hardware."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210
      ],
      "outro": 15,
      "total": 245
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "facundo",
        "name": "Facundo",
        "profile": "Tutor de Micro:bit"
      }
    ]
  },
  {
    "id": "06-taller-microbit-fin-2",
    "missionId": "06-taller-microbit",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 6,
    "title": "Isla 6 — Taller Micro:bit",
    "color": "#FFC800",
    "logo": "logos-cursos/microbit.svg",
    "left": "equipo",
    "right": "facundo",
    "lines": [
      {
        "speaker": "facundo",
        "name": "Facundo",
        "text": "Para la bitácora: La micro:bit trabaja con eventos: espera que pase algo, como agitarla o presionar A, y responde."
      },
      {
        "speaker": "facundo",
        "name": "Facundo",
        "text": "Acá está el cofre de Taller Micro:bit. Adentro hay una letra: U. ¡Anótenla!"
      }
    ],
    "reward": {
      "name": "Cofre Taller Micro:bit · letra U",
      "image": "assets/item-cofre-microbit.svg",
      "letter": "U"
    },
    "timing": {
      "intro": 20,
      "perLine": [
        210,
        180
      ],
      "outro": 120,
      "total": 530
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "facundo",
        "name": "Facundo",
        "profile": "Tutor de Micro:bit"
      }
    ]
  },
  {
    "id": "07-cierre-inicio-1",
    "missionId": "07-cierre",
    "kind": "mission",
    "section": "inicio",
    "order": 1,
    "missionNumber": 7,
    "title": "Cierre — La palabra secreta",
    "color": "#05428F",
    "logo": "assets/ceibal-hoja.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "¡Equipo! Ya recorrieron las seis islas. Vengan al Centro Ceibal para el cierre de la expedición."
      },
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Mientras manejan, la escriba puede ir ordenando las letras de los cofres. Las ven en el inventario (tecla I o el botón de la mochila)."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 75,
      "perLine": [
        210,
        210
      ],
      "outro": 15,
      "total": 510
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "07-cierre-fin-1",
    "missionId": "07-cierre",
    "kind": "mission",
    "section": "fin",
    "order": 1,
    "missionNumber": 7,
    "title": "Cierre — La palabra secreta",
    "color": "#05428F",
    "logo": "assets/ceibal-hoja.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "¡Llegaron! Juntaron seis letras: U, R, F, O, T y U. Ordénenlas en la bitácora."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        186
      ],
      "outro": 15,
      "total": 221
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "07-cierre-fin-2",
    "missionId": "07-cierre",
    "kind": "mission",
    "section": "fin",
    "order": 2,
    "missionNumber": 7,
    "title": "Cierre — La palabra secreta",
    "color": "#05428F",
    "logo": "assets/ceibal-hoja.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Equipo: digan en voz alta su palabra y cuántas islas completaron. ¡Atentos a la próxima convocatoria en ceibal.edu.uy!"
      },
      {
        "speaker": "equipo",
        "name": "Equipo explorador",
        "text": "¡Nos anotamos!"
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        210,
        73
      ],
      "outro": 15,
      "total": 318
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  },
  {
    "id": "extra-mesa-inscripciones-escena-1",
    "missionId": "extra-mesa-inscripciones",
    "kind": "encounter",
    "section": "escena",
    "order": 1,
    "missionNumber": 0,
    "title": "",
    "color": "#00A096",
    "logo": "assets/ceibal-hoja.svg",
    "left": "equipo",
    "right": "rosario",
    "lines": [
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "¡Hola! Esta es la mesa de inscripciones del programa Ciencias de la Computación."
      },
      {
        "speaker": "equipo",
        "name": "Equipo explorador",
        "text": "¿Quiénes se pueden anotar?"
      },
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Estudiantes de 1.°, 2.° y 3.° de bachillerato público de Secundaria y UTU. En UTU no incluye Enseñanza Media Profesional."
      },
      {
        "speaker": "equipo",
        "name": "Equipo explorador",
        "text": "¿Y cómo es la cursada?"
      },
      {
        "speaker": "rosario",
        "name": "Rosario",
        "text": "Primero la Fase 1, online y autoasistida. Si la aprueban, pasan a la Fase 2: cursos con tutoría y encuentros en vivo."
      }
    ],
    "reward": null,
    "timing": {
      "intro": 20,
      "perLine": [
        189,
        94,
        210,
        87,
        210
      ],
      "outro": 15,
      "total": 825
    },
    "characters": [
      {
        "id": "equipo",
        "name": "Equipo explorador",
        "profile": "Estudiantes de bachillerato en expedición"
      },
      {
        "id": "rosario",
        "name": "Rosario",
        "profile": "Coordinadora del Puerto de partida · Fase 1"
      }
    ]
  }
];
