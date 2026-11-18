---
id: 02-isla-web
title: Isla 2 — Isla Web
start: COM-30
target: COM-51
objective: Destino: COM-51 (sigan la flecha)
reward_item: cofre-web
roof_color: #0C88CA
roof_logo: logos-cursos/web.svg
---

## CUTSCENE_INICIO
left: equipo
right: nacho
bg: Llamada desde Isla Web

- VIDEO: videos/02-isla-web-inicio-1.mp4
- Nacho: ¡Equipo! Acá Nacho, tutor de Desarrollo web. Me contó Rosario que vienen bien.
- Nacho: Tengo una página rota y un cliente apurado. Los espero en la Isla Web.
- Equipo: ¡Vamos para allá!

## CUTSCENE_FIM
left: equipo
right: nacho
bg: Interior de COM-51

- VIDEO: videos/02-isla-web-fin-1.mp4
- Nacho: Bienvenidos a la Isla Web. En Desarrollo web aprenden cómo viaja la información por internet, a armar páginas con HTML, a darles estilo con CSS y a usar frameworks modernos.
- Nacho: Para ganarse el cofre, resuelvan los desafíos del laboratorio. Cuando terminen, les va a dar un código de desbloqueo.
- LINK: Abrir laboratorio -> puzzles/web.html
- Nacho: ¿Qué código les dio el laboratorio?
- OPCION: ETIQUETA -> CORRECTO: ¡Ese es! Terminaron los desafíos de Isla Web.
- OPCION: UMBRAL -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: BUCLE -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: SELECT -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: Volver a abrir el laboratorio -> ATRAS
- VIDEO: videos/02-isla-web-fin-2.mp4
- Nacho: Para la bitácora: HTML es el esqueleto, CSS la ropa y JS los músculos de una página.
- Nacho: Acá está el cofre de Isla Web. Adentro hay una letra: R. ¡Anótenla!
