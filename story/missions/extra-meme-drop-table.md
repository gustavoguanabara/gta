---
id: extra-meme-drop-table
npc: joaquin
location: COM-131
prompt: Misión extra en COM-131
roof_color: #30A936
roof_logo: assets/item-meme-drop-table.svg
modo: libre
reward_item: meme-drop-table
reward_btc: 5
---

## CUTSCENE
left: equipo
right: joaquin
bg: Interior de COM-131

- VIDEO: videos/extra-meme-drop-table-escena-1.mp4
- Joaquín: ¿Conocen el chiste del pibe que se llamaba Robert'); DROP TABLE estudiantes;--?
- Joaquín: El sistema del liceo guardó el nombre tal cual... y se borró la tabla entera. 😱
- Joaquín: ¿Qué aprendemos de eso?
- OPCION: Que SQL es peligroso -> REINTENTAR: SQL está bien; el problema es meter datos sin validar.
- OPCION: Hay que validar los datos que escribe el usuario -> CORRECTO: Exacto. A eso se le llama inyección SQL: siempre hay que validar y separar los datos del código.
- OPCION: Que no hay que llamarse Robert -> REINTENTAR: Jaja, el nombre no tiene la culpa. El problema es el sistema.
- VIDEO: videos/extra-meme-drop-table-escena-2.mp4
- Joaquín: Tomen esta goma. Úsenla con cuidado.
