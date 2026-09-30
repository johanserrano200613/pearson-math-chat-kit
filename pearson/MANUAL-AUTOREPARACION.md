# Manual de base de conocimiento y autorreparación

## 1. Propósito

Este sistema permite reutilizar reglas matemáticas verificadas y procedimientos de recuperación entre equipos y cuentas sin usar IA, sin enviar credenciales a ningún servicio y sin depender de la posición de una opción.

La base distingue tres cosas:

- `answerRules`: respuestas que ya pasaron una verificación local para una familia y un enunciado concreto.
- `incidents`: errores observados, con código y límite de recuperación.
- `repairs`: pasos conocidos para corregir un incidente sin repetir respuestas ni reiniciar el navegador de forma ciega.

La base no guarda correos, contraseñas, cookies, tokens, nombres de cuenta ni resultados de una cuenta concreta.

## 2. Regla de identidad

Una regla solo coincide cuando coinciden simultáneamente:

1. plataforma;
2. familia matemática;
3. enunciado normalizado por contenido.

El sistema no usa `questions[i]`, el índice de una opción, el orden de la pantalla ni una respuesta anterior como identidad. Si cambia el enunciado, la regla no se reutiliza.

## 3. Flujo de una pregunta

```text
observar pagina
  -> obtener enunciado, contexto y campos visibles
  -> identificar familia
  -> buscar regla VERIFICADA en knowledge-base.json
  -> si no existe, intentar solver local soportado
  -> verificar por regla local
  -> DRY_RUN / mostrar evidencia
  -> detener ante ambiguedad, cambio o resultado desconocido
```

El modo entregado no envía respuestas a quizzes ni pulsa controles de envío. `DRY_RUN` significa que la propuesta fue calculada y comprobada localmente, no que Pearson la aceptó.

## 4. Cuándo se puede añadir una respuesta

No se agrega una respuesta solo porque el botón se habilitó o porque una pantalla cambió. Para catalogarla deben existir:

- el enunciado completo;
- la familia matemática identificada;
- la respuesta candidata;
- una verificación local reproducible;
- la evidencia de qué regla se comprobó.

La incorporación se hace mediante `recordAnswerRule` en un proceso controlado. No se deben copiar respuestas por número de pregunta ni importar respuestas de otra cuenta sin verificar el contenido.

## 5. Autorreparación permitida

La autorreparación es deliberadamente limitada:

| Código | Acción | Recuperación automática |
|---|---|---|
| `CDP_UNAVAILABLE` | configurar conexión | una comprobación; después detener |
| `QUESTION_CHANGED` | descartar propuesta y observar | una nueva observación, sin enviar |
| `UNSUPPORTED_EQUATION` | intervención | ninguna |
| `RESULT_UNKNOWN` | observar resultado | nunca reenviar automáticamente |
| `UNKNOWN_ERROR` | registrar evidencia | ninguna |

Un segundo intento de la misma reparación no se convierte en un bucle. Se registra `STOP_AND_RECORD` y se requiere revisión.

## 6. Registro de un error nuevo

Al encontrar un fallo no catalogado, guardar manualmente un registro con:

- fecha y hora;
- código nuevo;
- URL y actividad, sin tokens privados;
- enunciado y contexto necesarios para reproducir;
- propuesta calculada;
- selección o estado observado;
- resultado visible;
- método de resolución;
- recuperación aplicada;
- si la pregunta cambió o quedó en `RESULT_UNKNOWN`.

No se debe guardar la contraseña, cookies, encabezados de autorización ni una captura que exponga información de otra cuenta.

## 7. Copiar a otro PC

Copiar la carpeta completa `math-automation` y conservar, como mínimo:

- `pearson-deterministic-runner.mjs`;
- `math-solver.mjs`;
- `knowledge-base.mjs`;
- `knowledge-base.json`;
- `submission-policy.mjs`;
- `recovery-policy.mjs`;
- `pearson-observe.mjs`;
- `tests/`.

En el nuevo equipo:

1. instalar una versión compatible de Node.js;
2. disponer de Playwright en la ruta configurada o definir `PEARSON_PLAYWRIGHT_MODULE`;
3. iniciar Edge con un endpoint CDP elegido por el usuario;
4. abrir manualmente la cuenta y el curso correctos;
5. definir `PEARSON_CDP_ENDPOINT`;
6. ejecutar primero las pruebas;
7. ejecutar el runner en modo diagnóstico.

Ejemplo:

```powershell
cd "C:\ruta\al\proyecto"
$env:PEARSON_CDP_ENDPOINT = "http://127.0.0.1:9222"
node .\math-automation\pearson-deterministic-runner.mjs
```

Si las cuentas tienen contenido distinto, se mantiene la misma base solo para reglas que coincidan exactamente por contenido y familia. La cuenta no forma parte de la identidad de la respuesta, pero la actividad y el enunciado sí.

## 8. Copia y actualización segura

Antes de editar la base:

```powershell
Copy-Item .\math-automation\knowledge-base.json .\math-automation\knowledge-base.backup.json
node --test .\math-automation\tests\*.test.mjs
```

La escritura programática usa archivo temporal y renombrado. Si el JSON queda inválido, se restaura la copia y se detiene el runner. No se mezclan bases de cuentas durante una ejecución activa.

## 9. Qué sigue sin estar demostrado

La base inicial contiene únicamente la familia observada y verificada `y'' - 400y = 0`. No demuestra que el sistema resuelva ecuaciones de primer orden, sistemas, transformadas, opciones múltiples, gráficos, quizzes ni otros formatos. Cada familia nueva necesita su propia prueba roja, implementación mínima, verificación local y revisión antes de catalogarse.

## 10. Verificación de una solución exponencial de primer orden

Ampliación local: `verifyFirstOrderExponential(equationText, candidateText)` en
`math-solver.mjs` admite `y' = y + k e^(-x)` y una candidata
`y = A e^x + B e^(-x)`, con coeficientes enteros dentro del rango seguro.
Esto amplía la base inicial descrita arriba; no amplía por sí solo la navegación
ni el envío del runner.

1. Leer el enunciado actual, la función propuesta y la parte solicitada.
   El número «3» no identifica una ecuación ni una respuesta.
2. Si pide el procedimiento para comprobar una solución, diferenciar la función
   y sustituir tanto la función como su derivada en la ecuación diferencial.
   Elegir esa descripción por su texto, no por la letra de la opción.
3. Calcular `y' = A e^x - B e^(-x)` usando la regla de la cadena.
   Comparar coeficientes: el residuo es `(-2B-k)e^(-x)`.
   La candidata es solución exactamente cuando `-2B-k = 0`.
4. Para el caso guardado `y = 8e^x - 9e^(-x)` y `k = 18`, la derivada es
   `8e^x + 9e^(-x)`. La representación textual local es
   `8*e^(x)+9*e^(-x)`. Esta cadena todavía no es un formato de entrada
   confirmado para el editor de Pearson.
5. Antes de escribir, comprobar la identidad y parte de la pregunta. Si hay una
   respuesta previa, verificar que el editor queda vacío. Después de escribir,
   comprobar la expresión representada: el segundo término debe estar fuera
   del primer exponente. Si no se puede leer con certeza, no enviar.
6. Si el envío previo quedó incierto, observar primero el resultado actual.
   No reenviar por un timeout. Solo registrar aceptación con evidencia visible
   de Pearson para la parte y la pregunta correspondientes.

Estado de la variante actual observada en Pearson: Question 3, 1.1.5 presentó
`y' = y + 16e^(-x)` y `y = e^x - 8e^(-x)`. Pearson aceptó la parte 1 al elegir
“Differentiate the given function and substitute into the differential
equation.” La parte 2 deriva a `e^x + 8e^(-x)` y satisface la ecuación por
sustitución; no se confirmó su escritura ni su aceptación en el editor porque
la conexión de Playwright se perdió durante la operación de llenado y el nuevo
inicio de sesión quedó en “Signing in…”. No repetir el envío: observar primero
el estado en Pearson. La regla de la base identifica enunciado y coeficientes,
no el número de pregunta, y marca por separado la aceptación en la plataforma.

## 11. Rechazo observado en sustitución de una ecuación de primer orden

En práctica Pearson `Question 1, 1.1.19-T`, para `y' = y + 4` y
`y = C e^x - 4`, Pearson aceptó el método de diferenciación y `y' = C e^x`.
Después se ingresó en los campos de sustitución `C e^x` a la izquierda y
`C e^x - 4` para `y` a la derecha; el editor mostró
`C e^x = (C e^x - 4) + 4`, identidad correcta, pero Pearson marcó incorrecta
la sustitución de `y`. No se ha determinado si fue formato de entrada, vínculo
campo-respuesta o comportamiento de la plataforma. No convertir este caso en
regla de respuesta aceptada ni repetirlo a ciegas.

Antes de cualquier otra sustitución: volver a leer ecuación, función, parte y
orden de los blancos; calcular ambos lados; comprobar que el editor enlaza cada
expresión con el blanco previsto y revisar la representación visible antes de
enviar. Si una identidad visible correcta se rechaza, registrar el incidente y
detener ese método para esa variante; consultar una ayuda explicativa o cambiar
de estrategia, sin reintentos idénticos. Solo una aceptación explícita de
Pearson confirma el formato de envío.

En una variante posterior se observó un problema reproducible de edición: los
campos accesibles como vacíos (`enter your response here`) recibieron una
operación Playwright `fill()` sobre el input interno del editor MathType, pero
la etiqueta accesible resultante concatenó la expresión anterior y la nueva
(por ejemplo, `C e^x` seguido otra vez de `C e^x - 3`). Por tanto, una etiqueta
vacía antes de escribir no basta para validar el valor final, y los selectores
por índice (`input` número 5/6) no garantizan que se esté modificando el blanco
correcto. Usar los identificadores de blanco observados para esa pregunta
(`#Ssuba`, `#Ssubb`), esperar a que desaparezca la capa de carga de Pearson,
limpiar y reemplazar el contenido del editor, y revisar de nuevo las etiquetas
accesibles y la ecuación renderizada en busca de duplicación o desorden. Si la
capa de carga sigue interceptando la interacción o no se puede verificar un
único término por blanco, no pulsar “Check answer”. Este hallazgo es una causa
probable de errores de entrada, pero no demuestra retrospectivamente la causa
del rechazo anterior de `y' = y + 4`.

En la variante siguiente, `y' = y + 3`, `y = C e^x - 3`, el editor ya agrupa
cada blanco entre paréntesis. Añadir otros paréntesis alrededor de `C e^x - 3`
produjo un rechazo explícito de formato por paréntesis no balanceados. Para ese
editor, no duplicar el agrupamiento que ya aporta el enunciado. Este hallazgo
explica el rechazo de la variante con paréntesis; no explica aún el rechazo
anterior sin ellos. La comprobación comparativa pendiente es probar una vez
`C e^x - 3` sin paréntesis en la variante actual y detener esta familia si
Pearson vuelve a rechazarla.
