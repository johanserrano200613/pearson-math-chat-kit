# Pearson MyLab Math automation

Primera entrega: mapa observado y controlador determinista en modo diagnóstico.

## Hechos observados

- Pearson abre el curso desde `console.pearson.com` y carga MyLab Math dentro de Course Home.
- Course Home expone `Study Plan`, `Assignments`, `Student Gradebook`, `eText Contents` y otras rutas.
- Study Plan muestra objetivos con `Practice` y `Quiz Me` separados.
- El plan observado exige puntos de dominio antes del quiz. En la pantalla inspeccionada: 3 de 4 puntos.
- Una práctica abre una pestaña `PlayerPractice.aspx` con pregunta, lista de preguntas, campos de respuesta, `Check answer`, `Next question` y `Close`.
- Una pantalla previa de quiz muestra 3 preguntas, intentos ilimitados y dominio requerido de 75%, con `Start` y `Cancel`.

## Decisiones de seguridad

- La pregunta se identifica por sección, número, objetivo, enunciado y todos los campos visibles, nunca por el índice de la lista.
- El runner no puede pasar a `Quiz` si no hay evidencia de los puntos de dominio requeridos.
- Una respuesta se verifica localmente antes de enviarse cuando el tipo de ecuación está soportado.
- Ecuaciones no soportadas, campos ambiguos, cambios de pregunta y resultados desconocidos quedan detenidos para revisión.
- Esta entrega no inició el quiz ni envió respuestas reales.

## Ejecución

El script no usa IA, no llama a proveedores externos y no guarda credenciales. Requiere una sesión Edge que exponga CDP en `http://127.0.0.1:9222`; no abre, cierra ni reinicia otro navegador.

```powershell
$env:PEARSON_CDP_ENDPOINT = "http://127.0.0.1:9222"
node .\math-automation\pearson-deterministic-runner.mjs
```

La ejecución es de solo observación: identifica una práctica, intenta resolver la familia soportada, comprueba la respuesta localmente y devuelve `DRY_RUN`. No envía respuestas a quizzes ni continúa cuando la ecuación, el campo o el resultado no están soportados.

La base portable está en `knowledge-base.json`; contiene solo reglas verificadas y procedimientos sin credenciales. El manual de copia, registro de errores y autorreparación está en [MANUAL-AUTOREPARACION.md](./MANUAL-AUTOREPARACION.md).

Para usar otra base sin modificar la incluida:

```powershell
$env:PEARSON_KNOWLEDGE_BASE = "C:\ruta\knowledge-base.json"
node .\math-automation\pearson-deterministic-runner.mjs
```

## Estado

El código puro y sus pruebas cubren la política de transición y una primera familia de ecuaciones lineales homogéneas con coeficientes constantes. El controlador CDP ya observa Pearson, pero falta ampliar el solucionador por familias de ejercicios observadas y validar cada nuevo tipo con pruebas locales antes de usarlo.
