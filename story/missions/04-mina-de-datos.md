---
id: 04-mina-de-datos
title: Isla 4 — Mina de Datos
start: COM-74
target: COM-73
objective: Destino: COM-73 (sigan la flecha)
reward_item: cofre-datos
roof_color: #30A936
roof_logo: logos-cursos/datos.png
---

## CUTSCENE_INICIO
left: equipo
right: joaquin
bg: Llamada desde Mina de Datos

- VIDEO: videos/04-mina-de-datos-inicio-1.mp4
- Joaquín: ¡Buenas! Soy Joaquín, de Datos para la acción. Tengo una base de datos llena de cursos y nadie sabe preguntarle.
- Joaquín: Los espero en la Mina de Datos. Hoy se convierten en hackers... de los buenos.

## CUTSCENE_FIM
left: equipo
right: joaquin
bg: Interior de COM-73

- VIDEO: videos/04-mina-de-datos-fin-1.mp4
- Joaquín: Esta es la Mina de Datos. En Datos para la acción recolectan, organizan y analizan datos con herramientas digitales para decidir mejor y contar historias visuales.
- Joaquín: Para ganarse el cofre, resuelvan los desafíos del laboratorio. Cuando terminen, les va a dar un código de desbloqueo.
- LINK: Abrir laboratorio -> puzzles/datos.html
- Joaquín: ¿Qué código les dio el laboratorio?
- OPCION: UMBRAL -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: EVENTO -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: SELECT -> CORRECTO: ¡Ese es! Terminaron los desafíos de Mina de Datos.
- OPCION: ACCESO -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: Volver a abrir el laboratorio -> ATRAS
- VIDEO: videos/04-mina-de-datos-fin-2.mp4
- Joaquín: Para la bitácora: SELECT dice qué columnas quieren, FROM de qué tabla y WHERE qué filas.
- Joaquín: Acá está el cofre de Mina de Datos. Adentro hay una letra: O. ¡Anótenla!
