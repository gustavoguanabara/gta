---
id: 03-volcan-python
title: Isla 3 — Volcán Python
start: COM-51
target: COM-74
objective: Destino: COM-74 (sigan la flecha)
reward_item: cofre-python
roof_color: #F39219
roof_logo: logos-cursos/prog.svg
---

## CUTSCENE_INICIO
left: equipo
right: martina
bg: Llamada desde Volcán Python

- VIDEO: videos/03-volcan-python-inicio-1.mp4
- Martina: Hola, equipo, soy Martina, tutora de Programación. Tengo un programa que da resultados raros y un bucle que no para.
- Martina: Vengan al Volcán Python. Traigan paciencia, yo pongo el café.

## CUTSCENE_FIM
left: equipo
right: martina
bg: Interior de COM-74

- VIDEO: videos/03-volcan-python-fin-1.mp4
- Martina: Este es el Volcán Python: Programación 1, 2 y 3. Arrancan con sus primeros programas, siguen con estructuras de datos y terminan con programación orientada a objetos.
- Martina: Para ganarse el cofre, resuelvan los desafíos del laboratorio. Cuando terminen, les va a dar un código de desbloqueo.
- LINK: Abrir laboratorio -> puzzles/python.html
- Martina: ¿Qué código les dio el laboratorio?
- OPCION: ACCESO -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: UMBRAL -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: SELECT -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: BUCLE -> CORRECTO: ¡Ese es! Terminaron los desafíos de Volcán Python.
- OPCION: Volver a abrir el laboratorio -> ATRAS
- VIDEO: videos/03-volcan-python-fin-2.mp4
- Martina: Para la bitácora: Un for repite el bloque con sangría. range(4) da cuatro vueltas: 0, 1, 2 y 3.
- Martina: Acá está el cofre de Volcán Python. Adentro hay una letra: F. ¡Anótenla!
