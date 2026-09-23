/**
 * Diccionario central de todo el texto público editable desde /admin/textos.
 * Cada campo tiene una key única y un valor por defecto (el texto actual de
 * la app). Si el admin no editó una key, se usa el default de acá — la app
 * nunca se queda sin texto por una fila sin crear en la base de datos.
 *
 * Esta misma lista arma la UI de /admin/textos (agrupada por sección).
 */

export type SiteTextField = {
  key: string;
  label: string;
  default: string;
  multiline?: boolean;
  hint?: string;
};

export type SiteTextGroup = {
  title: string;
  fields: SiteTextField[];
};

export const SITE_TEXT_GROUPS: SiteTextGroup[] = [
  {
    title: "Marca",
    fields: [
      { key: "brand.name", label: "Nombre de la marca (logo)", default: "Crop" },
      {
        key: "brand.tagline",
        label: "Lema junto al logo",
        default: "Costa Rican Opportunities for Producers",
        hint: "Aparece al lado del logo en el encabezado del inicio.",
      },
      {
        key: "meta.title",
        label: "Título de la pestaña del navegador",
        default: "Crop — Rescate de comida y excedentes agrícolas",
      },
      {
        key: "meta.description",
        label: "Descripción para buscadores y redes sociales",
        default: "Aparta productos de excedente agrícola (cacao, café, banano, piña y más) y recógelos en la feria del agricultor. Sin pagos en línea.",
        multiline: true,
      },
    ],
  },
  {
    title: "Menú y botones comunes",
    fields: [
      { key: "nav.catalogo", label: "Enlace \"Catálogo\"", default: "Catálogo" },
      { key: "nav.ver_catalogo", label: "Enlace \"Ver catálogo\"", default: "Ver catálogo" },
      { key: "nav.mis_apartados", label: "Enlace \"Mis apartados\"", default: "Mis apartados" },
      { key: "nav.mi_perfil", label: "Botón \"Mi perfil\"", default: "Mi perfil" },
      { key: "nav.entrar", label: "Botón \"Entrar\"", default: "Entrar" },
      { key: "nav.crear_cuenta", label: "Botón \"Crear cuenta\"", default: "Crear cuenta" },
      { key: "nav.panel_agricultor", label: "Enlace \"Panel de agricultor\"", default: "Panel de agricultor" },
      { key: "nav.panel_admin", label: "Enlace \"Panel de administración\"", default: "Panel de administración" },
      { key: "nav.cerrar_sesion", label: "Botón \"Cerrar sesión\"", default: "Cerrar sesión" },
      { key: "nav.volver_inicio", label: "Enlace \"Volver al inicio\"", default: "← Volver al inicio" },
      { key: "footer.privacidad", label: "Enlace \"Privacidad\"", default: "Privacidad" },
      { key: "footer.terminos", label: "Enlace \"Términos\"", default: "Términos" },
      { key: "footer.cancelaciones", label: "Enlace \"Cancelaciones\"", default: "Cancelaciones" },
      { key: "footer.copyright_suffix", label: "Texto del pie de página tras el año", default: "Costa Rica" },
    ],
  },
  {
    title: "Portada (inicio)",
    fields: [
      { key: "home.hero.image_alt", label: "Descripción de la imagen del inicio", default: "Canasta con cacao, café y piña" },
      { key: "home.how.step1.title", label: "Paso 1 — título", default: "Explorá el catálogo" },
      { key: "home.how.step1.text", label: "Paso 1 — texto", default: "Recorré el excedente disponible hoy en la feria: fotos, precios y cantidades reales.", multiline: true },
      { key: "home.how.step2.title", label: "Paso 2 — título", default: "Apartá sin pagar en línea" },
      { key: "home.how.step2.text", label: "Paso 2 — texto", default: "Reservás lo que necesitás con un clic. El pago, si aplica, se hace al recoger.", multiline: true },
      { key: "home.how.step3.title", label: "Paso 3 — título", default: "Recogé en la feria" },
      { key: "home.how.step3.text", label: "Paso 3 — texto", default: "Tenés una ventana de tiempo para pasar a buscarlo en el punto de recogida del agricultor.", multiline: true },
      { key: "home.fruits.heading", label: "Título de la sección de frutas", default: "Lo que encontrás hoy" },
      { key: "home.fruits.subtext", label: "Subtítulo de la sección de frutas", default: "Recorré las frutas con las flechas." },
    ],
  },
  {
    title: "Catálogo",
    fields: [
      { key: "catalogo.selector.heading", label: "Título del selector de ferias", default: "Elegí una feria" },
      { key: "catalogo.selector.subtext", label: "Subtítulo del selector de ferias", default: "Cada feria tiene su propio catálogo con el excedente disponible ahí.", multiline: true },
      { key: "catalogo.selector.empty", label: "Mensaje si no hay ferias", default: "Todavía no hay ferias configuradas." },
      { key: "catalogo.selector.count_suffix", label: "Texto tras el número de productos en cada feria", default: "producto(s) disponibles" },
      { key: "catalogo.feria.meta_description", label: "Descripción para buscadores de la página de una feria", default: "Recorré el excedente disponible en esta feria." },
      { key: "catalogo.feria.empty", label: "Mensaje si una feria no tiene excedente", default: "Todavía no hay excedente en esta feria. Volvé pronto." },
      { key: "catalogo.feria.volver", label: "Enlace \"Ver otras ferias\"", default: "Ver otras ferias" },
      { key: "catalogo.gallery.instructions", label: "Instrucciones de la galería (ya no se usa, se deja por compatibilidad)", default: "Elegí lo que querés, ajustá la cantidad y hacé tu pedido.", multiline: true },
      { key: "catalogo.gallery.disponibles_suffix", label: "Texto tras la cantidad disponible", default: "disponibles" },
      { key: "catalogo.gallery.cultivado_por_prefix", label: "Texto antes del nombre del agricultor", default: "Cultivado por" },
      { key: "catalogo.gallery.cosechado_el_prefix", label: "Texto antes de la fecha de cosecha", default: "Cosechado el" },
      { key: "catalogo.gallery.cerrar", label: "Botón \"Cerrar\" del detalle", default: "Cerrar" },
      { key: "catalogo.reserve.success_prefix", label: "Mensaje al apartar (antes de la fecha)", default: "Apartado listo. Recogé antes del" },
      { key: "catalogo.reserve.pending", label: "Botón apartar — mientras carga", default: "Apartando…" },
      { key: "catalogo.reserve.idle", label: "Botón \"Apartar\"", default: "Apartar 1 unidad" },
      { key: "catalogo.cart.add", label: "Botón \"Agregar\" al carrito", default: "Agregar" },
      { key: "catalogo.cart.subtotal_prefix", label: "Texto antes del subtotal del carrito", default: "Subtotal" },
      { key: "catalogo.cart.service_fee_prefix", label: "Texto antes del cargo por servicio", default: "Servicio" },
      { key: "catalogo.cart.total_prefix", label: "Texto antes del total del carrito", default: "Total" },
      { key: "catalogo.cart.place_order", label: "Botón \"Hacer pedido\"", default: "Hacer pedido" },
      { key: "catalogo.cart.pending", label: "Botón \"Hacer pedido\" — mientras carga", default: "Enviando…" },
      { key: "catalogo.cart.empty", label: "Aviso cuando el carrito está vacío", default: "Elegí algo del catálogo para armar tu pedido." },
      { key: "catalogo.cart.success_prefix", label: "Mensaje al hacer un pedido (antes de la fecha)", default: "Pedido listo. Recogé antes del" },
      { key: "catalogo.error.invalid_product", label: "Error: producto inválido", default: "Producto inválido" },
      { key: "catalogo.error.too_many_active_prefix", label: "Error: demasiados apartados (antes del número)", default: "Ya tenés" },
      { key: "catalogo.error.too_many_active_suffix", label: "Error: demasiados apartados (después del número)", default: "apartados activos. Recogé alguno o esperá a que venza antes de apartar más.", multiline: true },
      { key: "catalogo.error.too_many_products_prefix", label: "Error: demasiados productos distintos en un pedido (antes del número)", default: "Un pedido puede tener como máximo" },
      { key: "catalogo.error.too_many_products_suffix", label: "Error: demasiados productos distintos en un pedido (después del número)", default: "productos distintos. Hacé el pedido en dos partes.", multiline: true },
      { key: "catalogo.error.product_unavailable", label: "Error: producto no disponible", default: "El producto ya no está disponible" },
      { key: "catalogo.error.insufficient_stock_prefix", label: "Error: poco stock (antes del número)", default: "Solo quedan" },
      { key: "catalogo.error.insufficient_stock_suffix", label: "Error: poco stock (después del número)", default: "unidades" },
      { key: "catalogo.error.generic", label: "Error genérico al apartar", default: "No se pudo apartar. Probá de nuevo." },
      { key: "carousel.cta", label: "Botón \"Ver en el catálogo\" del carrusel", default: "Ver en el catálogo" },
    ],
  },
  {
    title: "Mi perfil",
    fields: [
      { key: "perfil.heading", label: "Título de la página", default: "Mi perfil" },
      { key: "perfil.field_nombre", label: "Campo \"Nombre\"", default: "Nombre" },
      { key: "perfil.field_correo", label: "Campo \"Correo\"", default: "Correo" },
      { key: "perfil.field_miembro_desde", label: "Campo \"Miembro desde\"", default: "Miembro desde" },
      { key: "cuenta.delete.heading", label: "Título \"Eliminar mi cuenta\"", default: "Eliminar mi cuenta" },
      { key: "cuenta.delete.warning", label: "Advertencia al eliminar la cuenta", default: "Borra de forma permanente tu nombre, correo, credenciales de acceso y tus apartados. Esta acción no se puede deshacer.", multiline: true },
      { key: "cuenta.delete.button_pending", label: "Botón eliminar — mientras carga", default: "Eliminando…" },
      { key: "cuenta.delete.button_confirm", label: "Botón confirmar eliminación", default: "Sí, eliminar todo" },
      { key: "cuenta.delete.button_cancel", label: "Botón cancelar eliminación", default: "Cancelar" },
    ],
  },
  {
    title: "Mis apartados",
    fields: [
      { key: "apartados.status_reserved", label: "Estado: Apartado", default: "Apartado" },
      { key: "apartados.status_picked_up", label: "Estado: Recogido", default: "Recogido" },
      { key: "apartados.status_cancelled", label: "Estado: Cancelado", default: "Cancelado" },
      { key: "apartados.status_expired", label: "Estado: Vencido", default: "Vencido" },
      { key: "apartados.heading", label: "Título de la página", default: "Mis apartados" },
      { key: "apartados.codigo_cliente_prefix", label: "Texto antes del código de cliente", default: "Tu código de cliente" },
      { key: "apartados.empty_text", label: "Mensaje si no hay apartados", default: "Todavía no apartaste nada." },
      { key: "apartados.empty_link", label: "Enlace en el mensaje vacío", default: "Explorá el excedente disponible." },
      { key: "apartados.recoge_en_prefix", label: "Texto antes del punto de recogida", default: "Recogé en" },
      { key: "apartados.antes_del_prefix", label: "Texto antes de la fecha límite", default: "antes del" },
      { key: "apartados.cancel.button_initial", label: "Botón \"Cancelar apartado\"", default: "Cancelar apartado" },
      { key: "apartados.cancel.confirm_text", label: "Texto de confirmación (\"¿Seguro?\")", default: "¿Seguro?" },
      { key: "apartados.cancel.button_pending", label: "Botón cancelar — mientras carga", default: "Cancelando…" },
      { key: "apartados.cancel.button_confirm", label: "Botón \"Sí, cancelar\"", default: "Sí, cancelar" },
      { key: "apartados.cancel.button_no", label: "Botón \"No\"", default: "No" },
      { key: "apartados.cancel.error_generic", label: "Error genérico al cancelar", default: "No se pudo cancelar" },
      { key: "apartados.error.not_authenticated", label: "Error: no autenticado", default: "No autenticado" },
      { key: "apartados.error.not_found", label: "Error: apartado no encontrado", default: "Apartado no encontrado" },
      { key: "apartados.error.not_cancellable", label: "Error: ya no se puede cancelar", default: "Este apartado ya no se puede cancelar" },
    ],
  },
  {
    title: "Ingreso y bienvenida",
    fields: [
      { key: "signin.heading_prefix", label: "Título \"Entrar a Crop\" (antes de la marca)", default: "Entrar a" },
      { key: "signin.subtext", label: "Subtítulo de la página de ingreso", default: "Apartá productos de excedente agrícola y recogelos en la feria del agricultor. No se cobra en línea.", multiline: true },
      { key: "signin.info_box", label: "Aviso sobre datos de Apple", default: "Al crear tu cuenta con Apple guardamos tu nombre y correo para identificarte y gestionar tus apartados. Podés eliminar tu cuenta y tus datos en cualquier momento desde tu perfil.", multiline: true },
      { key: "signin.checkbox_label", label: "Texto de la casilla de aceptación", default: "He leído y acepto la Política de Privacidad y los Términos de Servicio.", multiline: true },
      { key: "signin.helper_accept_terms", label: "Aviso si falta aceptar términos", default: "Aceptá los términos para continuar." },
      { key: "signin.email_placeholder", label: "Campo de correo — texto de ayuda", default: "Correo electrónico" },
      { key: "signin.password_placeholder", label: "Campo de contraseña — texto de ayuda", default: "Contraseña" },
      { key: "signin.password_button", label: "Botón \"Entrar\" con correo y contraseña", default: "Entrar" },
      { key: "signin.password_pending", label: "Botón \"Entrar\" — mientras carga", default: "Entrando…" },
      { key: "signin.password_error", label: "Error al entrar con correo y contraseña", default: "Correo o contraseña incorrectos, o demasiados intentos. Si fallaste varias veces, esperá unos minutos y probá de nuevo." },
      { key: "signin.no_account", label: "Texto antes del enlace \"Crear cuenta\"", default: "¿Todavía no tenés cuenta?" },
      { key: "signin.apple_not_configured", label: "Aviso si Apple no está configurado", default: "El inicio de sesión con Apple todavía no está configurado en este entorno.", multiline: true },
      { key: "signin.dev_hint", label: "Aviso de acceso de desarrollo", default: "Usá el acceso de desarrollo de abajo mientras tanto." },
      { key: "signin.dev_button", label: "Botón de acceso de desarrollo", default: "Entrar como admin (solo desarrollo)" },
      { key: "signin.dev_helper", label: "Texto bajo el botón de desarrollo", default: "Atajo local, un clic, sin contraseña. No existe en producción." },
      { key: "welcome.heading", label: "Título de bienvenida", default: "Un paso más" },
      { key: "welcome.body", label: "Texto de bienvenida", default: "Confirmá que aceptás la Política de Privacidad y los Términos de Servicio para empezar a usar Crop.", multiline: true },
      { key: "welcome.accept", label: "Botón \"Acepto y continúo\"", default: "Acepto y continúo" },
      { key: "welcome.decline", label: "Enlace \"No acepto, cerrar sesión\"", default: "No acepto, cerrar sesión" },
      { key: "registro.heading", label: "Título de la página de registro", default: "Creá tu cuenta" },
      { key: "registro.subtext", label: "Subtítulo de la página de registro", default: "Con tu correo y una contraseña, sin depender de Apple.", multiline: true },
      { key: "registro.name_placeholder", label: "Campo de nombre — texto de ayuda", default: "Nombre" },
      { key: "registro.email_placeholder", label: "Campo de correo — texto de ayuda", default: "Correo electrónico" },
      { key: "registro.password_placeholder", label: "Campo de contraseña — texto de ayuda", default: "Contraseña (mínimo 8 caracteres)" },
      { key: "registro.submit", label: "Botón \"Crear cuenta\"", default: "Crear cuenta" },
      { key: "registro.pending", label: "Botón \"Crear cuenta\" — mientras carga", default: "Creando…" },
      { key: "registro.success", label: "Mensaje tras crear la cuenta", default: "Cuenta creada. Entrando…" },
      { key: "registro.auto_login_failed", label: "Aviso si la cuenta se creó pero el auto-login falló", default: "Tu cuenta se creó, pero no pudimos iniciar sesión automáticamente. Entrá con tu correo y contraseña:", multiline: true },
      { key: "registro.have_account", label: "Texto antes del enlace \"Entrar\"", default: "¿Ya tenés cuenta?" },
    ],
  },
  {
    title: "Aviso de cookies",
    fields: [
      { key: "cookie.body", label: "Texto del aviso de cookies", default: "Usamos únicamente las cookies necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad ni de analítica de terceros.", multiline: true },
      { key: "cookie.accept", label: "Botón \"Entendido\"", default: "Entendido" },
    ],
  },
  {
    title: "Páginas legales",
    fields: [
      { key: "legal.draft_notice", label: "Aviso de borrador (las 3 páginas legales)", default: "Borrador — pendiente de revisión legal. Última actualización: —" },
      { key: "legal.reembolsos.heading", label: "Título — Cancelaciones y Reembolsos", default: "Política de Cancelaciones y Reembolsos" },
      {
        key: "legal.reembolsos.body",
        label: "Texto — Cancelaciones y Reembolsos",
        multiline: true,
        hint: 'Una línea que empieza con "N. " se muestra como título de sección; el resto son párrafos. "Mis apartados" se convierte en enlace automáticamente.',
        default:
          "1. No hay pagos en línea\n" +
          'Crop no procesa pagos ni cobros a través de la plataforma. Un "apartado" es una reserva de producto, no una compra. Si corresponde algún pago, se realiza directamente con el agricultor al momento de recoger el producto en la feria.\n\n' +
          "2. Cancelar un apartado\n" +
          "Podés cancelar un apartado vigente en cualquier momento antes de la fecha límite de recogida, desde Mis apartados. Las unidades vuelven a estar disponibles de inmediato para otras personas.\n\n" +
          "3. Apartados vencidos\n" +
          "Si no recogés el producto antes de la fecha límite, el apartado se libera automáticamente y las unidades vuelven al inventario disponible. No hay ninguna penalización por esto.\n\n" +
          "4. Problemas con un producto\n" +
          "Como Crop no interviene en el pago ni en la entrega física, un reclamo sobre la calidad o el estado de un producto se resuelve directamente con el agricultor en el punto de recogida. Si el problema es con la plataforma en sí (por ejemplo, un error en la información mostrada), escribinos a: ldqg33@gmail.com o gboydt@icloud.com.",
      },
      { key: "legal.privacy.heading", label: "Título — Privacidad", default: "Política de Privacidad" },
      {
        key: "legal.privacy.body",
        label: "Texto — Privacidad",
        multiline: true,
        hint: 'Una línea que empieza con "N. " se muestra como título de sección; el resto son párrafos.',
        default:
          "1. Datos que recopilamos\n" +
          "Si creás tu cuenta con correo y contraseña, guardamos tu nombre, tu correo y tu contraseña (nunca en texto plano: se guarda cifrada con un algoritmo de un solo sentido, así que ni nosotros podemos leerla). Si entrás con Apple, recibimos tu nombre y tu dirección de correo (o el correo privado de reenvío de Apple, si elegís ocultarlo). Guardamos también los apartados que hacés en la plataforma. Si sos agricultor o administrador, la app puede acceder a tu cámara o galería para subir fotos de los productos que publicás.\n\n" +
          "2. Uso de los datos\n" +
          "Usamos estos datos únicamente para identificarte, mostrarte tus apartados y coordinar la recogida en la feria del agricultor. No vendemos ni compartimos tus datos con terceros, y no los usamos para publicidad ni seguimiento.\n\n" +
          "3. Conservación y eliminación\n" +
          "Podés eliminar tu cuenta y tus datos personales en cualquier momento desde tu perfil. Al hacerlo borramos tu nombre, correo y credenciales de acceso de forma permanente.\n\n" +
          "4. Contacto\n" +
          "Para consultas sobre privacidad, escribinos a: ldqg33@gmail.com o gboydt@icloud.com.",
      },
      { key: "legal.terms.heading", label: "Título — Términos", default: "Términos de Servicio" },
      {
        key: "legal.terms.body",
        label: "Texto — Términos",
        multiline: true,
        hint: 'Una línea que empieza con "N. " se muestra como título de sección; el resto son párrafos.',
        default:
          "1. Qué es Crop\n" +
          "Crop es una plataforma para apartar productos de excedente agrícola y de rescate de comida. No se realizan pagos en línea: el pago, si aplica, ocurre al recoger el producto en el punto de recogida.\n\n" +
          "2. Apartados y recogida\n" +
          "Un apartado reserva unidades por un tiempo limitado. Si no se recoge antes de la fecha límite, el apartado se libera automáticamente y las unidades vuelven a estar disponibles.\n\n" +
          "3. Tu cuenta\n" +
          "Podés crear tu cuenta con Apple o con tu propio correo y contraseña. Sos responsable de la actividad de tu cuenta y de mantener tu contraseña en secreto. Podés eliminar tu cuenta en cualquier momento desde tu perfil.\n\n" +
          "4. Disponibilidad y cambios\n" +
          'El servicio se ofrece "tal cual". Podemos modificar o suspender funciones; los cambios materiales se comunicarán con antelación razonable.',
      },
    ],
  },
];

export const SITE_TEXT_DEFAULTS: Record<string, string> = Object.fromEntries(
  SITE_TEXT_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.default])),
);
