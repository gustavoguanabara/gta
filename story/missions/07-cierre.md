---
id: 07-cierre
title: Cierre — La palabra secreta
start: COM-02
target: COM-03
objective: Cierre en COM-03 (sigan la flecha)
roof_color: #05428F
roof_logo: assets/ceibal-hoja.svg
---

## CUTSCENE_INICIO
left: equipo
right: rosario
bg: Llamada desde el Centro Ceibal

- VIDEO: videos/07-cierre-inicio-1.mp4
- Rosario: ¡Equipo! Ya recorrieron las seis islas. Vengan al Centro Ceibal para el cierre de la expedición.
- Rosario: Mientras manejan, la escriba puede ir ordenando las letras de los cofres. Las ven en el inventario (tecla I o el botón de la mochila).

## CUTSCENE_FIM
left: equipo
right: rosario
bg: Interior del Centro Ceibal

- VIDEO: videos/07-cierre-fin-1.mp4
- Rosario: ¡Llegaron! Juntaron seis letras: U, R, F, O, T y U. Ordénenlas en la bitácora.
- Rosario: ¿Cuál es la palabra secreta?
- OPCION: FUTURO -> CORRECTO: ¡Exacto! Tu futuro también se programa.
- OPCION: FRUTOU -> REINTENTAR: Casi... pero esa palabra no existe. Prueben otro orden.
- OPCION: TURFOU -> REINTENTAR: No. Pista: es algo que todavía no pasó.
- OPCION: RUTUFO -> REINTENTAR: No es esa. Empieza con F.
- Rosario: Todos estos cursos son online y gratuitos para bachillerato público de Secundaria y UTU. Miren la ruta completa de cursos.
- LINK: Ver la ruta de cursos -> puzzles/cierre.html
- VIDEO: videos/07-cierre-fin-2.mp4
- Rosario: Equipo: digan en voz alta su palabra y cuántas islas completaron. ¡Atentos a la próxima convocatoria en ceibal.edu.uy!
- Equipo: ¡Nos anotamos!
