---
id: 05-torre-ia
title: Isla 5 — Torre IA
start: COM-73
target: COM-50
objective: Vayan a COM-50: sigan la flecha
reward_item: cofre-ia
roof_color: #9225A5
roof_logo: logos-cursos/ia2.svg
---

## CUTSCENE_INICIO
left: equipo
right: camila
bg: Llamada desde Torre IA

- Camila: Hola, equipo, soy Camila, tutora de IA. Un videojuego necesita un anti-cheat y al grupo de la clase le llega spam.
- Camila: Vengan a la Torre IA a entrenar una inteligencia artificial. Ojo: la IA también se equivoca.

## CUTSCENE_FIM
left: equipo
right: camila
bg: Interior de COM-50

- Camila: Esta es la Torre IA. IA desde cero (Fase 1) explica qué es y cómo funciona. Profundización en IA (Fase 2) trabaja técnicas, aplicaciones y desafíos éticos.
- Camila: Para ganarse el cofre, resuelvan los desafíos del laboratorio. Cuando terminen, les va a dar un código de desbloqueo.
- LINK: Abrir laboratorio -> puzzles/ia.html
- Camila: ¿Qué código les dio el laboratorio?
- OPCION: ETIQUETA -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: SELECT -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: ACCESO -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: UMBRAL -> CORRECTO: ¡Ese es! Terminaron los desafíos de Torre IA.
- OPCION: Volver a abrir el laboratorio -> ATRAS
- Camila: Para la bitácora: Un modelo ajusta su regla mirando ejemplos. Cuando se equivoca, una persona tiene que revisar.
- Camila: Acá está el cofre de Torre IA. Adentro hay una letra: T. ¡Anótenla!
