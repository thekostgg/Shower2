// ====== Datos que pueden cambiar sin tocar el resto ======
window.CONFIG = {
  // Fecha y hora del baby shower (hora de Chile en diciembre = UTC-3)
  EVENTO: '2026-12-12T17:00:00-03:00',

  // Dirección para "Ver ubicación"
  MAPA_URL: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('El Roble 2171, Concepción, Chile'),

  // Enlace de la lista de deseos (déjalo vacío si todavía no existe)
  REGALOS_URL: '',

  // URL del Apps Script de Google que guarda la respuesta y envía el correo.
  // Se obtiene al publicar apps-script/Codigo.gs (ver LEEME.md).
  CONFIRMAR_URL: '',
};
