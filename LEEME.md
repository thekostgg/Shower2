# Invitación Baby Shower de Santiago

Página web con la invitación hecha en Canva. Es una sola página: primero aparece el sobre y, al abrirlo, se ven las 5 páginas de la invitación con animaciones.

## Qué hace

- **Sobre animado**: al tocar el sello, el sobre o "Abrir invitación", el sobre se abre.
- **Animaciones**:
  - las abejas vuelan y las estrellas brillan;
  - las nubes se desplazan;
  - los personajes se balancean o "respiran";
  - las hojas se mecen, la colmena y la cinta flotan.
- **Cuenta regresiva** en el mismo lugar de la fecha. Cada 5 segundos alterna entre "DICIEMBRE 12 2026 · 17:00" y "FALTAN 34 DÍAS · hh:mm:ss". Cuando llega el día, se queda la fecha.
- **Ver ubicación**: abre Google Maps en El Roble #2171, Concepción.
- **Confirmar asistencia**: abre un formulario. Cada respuesta se guarda en una planilla de Google y llega un correo a marciapa61@gmail.com.
- **Ver lista de deseos**: abre el enlace que se pone en `config.js`. Mientras esté vacío, muestra "Muy pronto…".

Los datos que pueden cambiar están todos en **`config.js`**.

---

## Paso 1: Conectar las confirmaciones con Google (5 minutos)

1. Entra con la cuenta de Google que quieras usar a <https://sheets.new>. Se crea una planilla nueva; ponle de nombre "Confirmaciones Baby Shower".
2. En el menú, entra a **Extensiones → Apps Script**.
3. Borra lo que aparece y pega todo el contenido de `apps-script/Codigo.gs`. Guarda con el ícono del disquete.
4. Arriba, en la lista de funciones, elige **`probar`** y presiona **Ejecutar**.
   - Google pedirá permisos. Presiona "Revisar permisos", elige tu cuenta, luego "Configuración avanzada" → "Ir a … (no seguro)" → **Permitir**. Es tu propio script, por eso Google muestra esa advertencia.
   - Debería llegar un correo de prueba a marciapa61@gmail.com y aparecer una fila "Prueba" en la planilla. Esa fila se puede borrar.
5. Presiona **Implementar → Nueva implementación**.
   - Tipo (ícono de engranaje): **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Presiona **Implementar** y copia la **URL de la aplicación web**. Termina en `/exec`.
6. Pega esa URL en `config.js`, en `CONFIRMAR_URL: '...'`.

> Si después cambias el código del script, usa **Implementar → Administrar implementaciones → Editar → Versión nueva** para que la URL siga siendo la misma.

## Paso 2: Publicar en GitHub Pages

1. En <https://github.com/new> crea un repositorio:
   - nombre: `babyshower-santiago`;
   - **Public**;
   - sin README.
2. Sube esta carpeta al repositorio. Claude lo hace con `git push` y GitHub pedirá iniciar sesión una vez.
3. En el repositorio entra a **Settings → Pages**. En "Branch" elige **main** y **/(root)**, luego presiona **Save**.
4. En 1 o 2 minutos la invitación queda en `https://TU-USUARIO.github.io/babyshower-santiago/`.

## Cambiar algo del diseño

Las imágenes salen de tu Canva con `tools/builder.html`, que reconstruye cada página con las piezas originales:

1. Inicia el servidor local: `tools/server.ps1`.
2. Abre `http://localhost:8765/tools/builder.html?mode=build`.

Qué elementos se animan y cómo se define en `tools/config.js`.
