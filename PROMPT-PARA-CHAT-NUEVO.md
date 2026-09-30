# Prompt para continuar Pearson en un chat nuevo

Trabaja únicamente con este repositorio y con Pearson MyLab Math. Antes de actuar, lee `README.md`, `pearson/README.md`, `pearson/MANUAL-AUTOREPARACION.md`, las políticas y las pruebas pertinentes.

Hechos y límites conocidos:

- El proyecto actual es una herramienta local de observación y resolución determinista limitada; no es un sistema completo de ejecución de cursos.
- `npm run observe` solo inspecciona la pestaña Pearson visible conectada por CDP. `npm run dry-run` solo propone y verifica localmente respuestas para familias soportadas; no las envía.
- No se ha demostrado aquí que el runner complete prácticas o quizzes automáticamente. No afirmes que una práctica, quiz o curso se completó sin evidencia explícita de la interfaz.
- No inicies un quiz calificado ni envíes respuestas de un quiz. Para prácticas, trabaja paso a paso, primero observando el enunciado completo, el contexto, los campos y el estado de la página; resuelve y verifica matemáticamente antes de proponer una acción.

Reglas de trabajo:

1. Separa hechos observados, hipótesis y decisiones. Una respuesta repetida o un botón habilitado no son evidencia de corrección.
2. Vincula cualquier propuesta al contenido actual completo. No uses índice de pregunta, índice de opción ni respuestas de otro ejercicio como identidad.
3. Si hay overlay/loading, navegación ambigua, ecuación o formato no soportado, cambio de pregunta o resultado incierto, detente, conserva evidencia no sensible y explica el bloqueo. No recargues ni reinicies como recuperación rutinaria.
4. Mantén Edge y su sesión del usuario intactos. No abras/cierres navegadores, no crees perfiles nuevos y no pidas ni guardes contraseñas, cookies o tokens en archivos o commits. El acceso requiere que el usuario inicie sesión y prepare CDP localmente.
5. No inventes resultados ni amplíes el alcance a Let’z. No publiques respuestas personales, capturas con datos de cuenta ni estado del navegador.
6. Cambia solo lo mínimo, añade pruebas locales para cada corrección y di con precisión qué demuestran. Las pruebas unitarias no prueban el comportamiento real de Pearson.
7. Antes de cualquier interacción que pudiera enviar una respuesta, expón la pregunta, la solución derivada y su verificación; espera autorización explícita para esa acción. Nunca automatices quizzes calificados.

Empieza inspeccionando el estado actual del repo y de los procesos de forma no invasiva. No asumas que una sesión Pearson está abierta o que se completó una lección. Si la petición depende de una acción humana (inicio de sesión, CAPTCHA, desbloqueo de CDP), pausa en ese punto y pide al usuario que la realice.
