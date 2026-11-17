---
id: 01-puerto
title: Isla 1 — Puerto de partida
start: CASA-01
target: COM-30
objective: Vayan a COM-30: sigan la flecha
reward_item: cofre-puerto
roof_color: #00A096
roof_logo: logos-cursos/intro.svg
---

## CUTSCENE_INICIO
left: equipo
right: rosario
bg: Frente de CASA-01

- Rosario: ¡Hola, equipo! Soy Rosario, del programa Ciencias de la Computación de Ceibal. Bienvenidos a la Expedición CC.
- Equipo: ¿Expedición? ¿Y qué tenemos que hacer?
- Rosario: En la ciudad hay seis edificios, uno por cada curso del programa. En cada uno los espera un tutor o tutora con un laboratorio y un cofre.
- Rosario: Cada cofre trae una letra. Con las seis letras descubren la palabra secreta. La escriba del equipo las anota en la bitácora.
- OPCION: ¡Vamos! -> SIGUIENTE
- OPCION: ¿Hay que saber programar para anotarse? -> CORRECTO: No hace falta: los cursos son introductorios y arrancan desde cero.
- Rosario: Primera parada: el Puerto de partida. Suban al auto y sigan la flecha. Piloto: ¡manejen con cuidado!

## CUTSCENE_FIM
left: equipo
right: rosario
bg: Interior de COM-30

- Rosario: Este es el Puerto de partida: acá empieza la Fase 1, con Introducción a las CC e IA desde cero. Son cursos online y autoasistidos, con webinars optativos.
- Rosario: Para ganarse el cofre, resuelvan los desafíos del laboratorio. Cuando terminen, les va a dar un código de desbloqueo.
- LINK: Abrir laboratorio -> puzzles/puerto.html
- Rosario: ¿Qué código les dio el laboratorio?
- OPCION: ACCESO -> CORRECTO: ¡Ese es! Terminaron los desafíos de Puerto de partida.
- OPCION: UMBRAL -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: SELECT -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: EVENTO -> REINTENTAR: Ese código no es de esta isla. Revisen el laboratorio.
- OPCION: Volver a abrir el laboratorio -> ATRAS
- Rosario: Para la bitácora: Pueden anotarse estudiantes de 1.°, 2.° y 3.° de bachillerato público de Secundaria y UTU.
- Rosario: Acá está el cofre de Puerto de partida. Adentro hay una letra: U. ¡Anótenla!
