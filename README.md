# Pearson Math Chat Kit

Material portable para continuar el trabajo de Pearson MyLab Math en otro chat o equipo. El paquete contiene únicamente código, pruebas, reglas matemáticas verificables y el manual; no incluye perfiles del navegador, cookies, credenciales ni datos de una cuenta.

## Estado real y límites

- El runner observado usa Edge mediante CDP y no abre ni cierra el navegador.
- `npm run observe` solo lee la página y sus controles.
- `npm run dry-run` observa una práctica y propone una respuesta únicamente para la familia de EDO lineales homogéneas de coeficientes constantes que el solucionador reconoce. Comprueba localmente la propuesta y termina en `DRY_RUN`.
- El código actual no envía respuestas, no inicia quizzes y no acredita que Pearson haya aceptado una respuesta. No se debe describir como automatización completa.
- Si falta evidencia, la ecuación no está soportada, cambia la pregunta o el resultado es incierto, se detiene.

## Preparación local

Instala Node.js y abre Edge por separado con depuración remota/CDP habilitada en una dirección local elegida por el usuario. No reutilices ni publiques perfiles del equipo anterior.

```powershell
git clone https://github.com/johanserrano200613/pearson-math-chat-kit.git
cd pearson-math-chat-kit
npm install
npm test
$env:PEARSON_CDP_ENDPOINT = "http://127.0.0.1:9222"
npm run observe
# Solo después de revisar lo observado:
npm run dry-run
```

La base de conocimiento puede cambiarse sin editar el repositorio:

```powershell
$env:PEARSON_KNOWLEDGE_BASE = "C:\ruta\knowledge-base.json"
npm run dry-run
```

La ruta alternativa al módulo de Playwright se configura con `PEARSON_PLAYWRIGHT_MODULE` si hace falta. Nunca pongas contraseñas, cookies, tokens ni storage state en el repo.

## Contenido

- [`PROMPT-PARA-CHAT-NUEVO.md`](./PROMPT-PARA-CHAT-NUEVO.md): instrucciones para retomar en un chat nuevo.
- [`pearson/`](./pearson/): runner, observación, solucionador, políticas, base de conocimiento, manual y pruebas.

## Pruebas

`npm test` cubre lógica local y políticas; no demuestra acceso a Pearson ni éxito real en su interfaz.
