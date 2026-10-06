/**
 * Traducción al inglés de los textos de interfaz (las mismas keys que
 * site-text-defaults.ts). Está escrita a mano, no generada: así el botón de
 * traducir funciona al instante, gratis, sin internet y sin API key.
 *
 * Lo que el admin edite desde /admin/textos, y los nombres y descripciones de
 * los productos, se traducen aparte con la traducción automática de lib/i18n.ts.
 *
 * Si falta una key acá, esa línea se muestra en español (nunca queda vacía).
 */
export const SITE_TEXT_EN: Record<string, string> = {
  // ── Marca ─────────────────────────────────────────────────────────────
  "brand.name": "Crop",
  "brand.tagline": "Costa Rican Opportunities for Producers",
  "meta.title": "Crop — Food rescue and surplus farm produce",
  "meta.description":
    "Reserve surplus farm produce (cacao, coffee, banana, pineapple and more) and pick it up at the farmers market. No online payments.",

  // ── Menú y botones comunes ────────────────────────────────────────────
  "nav.catalogo": "Catalog",
  "nav.ver_catalogo": "View catalog",
  "nav.mis_apartados": "My reservations",
  "nav.mi_perfil": "My profile",
  "nav.entrar": "Sign in",
  "nav.crear_cuenta": "Create account",
  "nav.panel_agricultor": "Farmer panel",
  "nav.panel_admin": "Admin panel",
  "nav.cerrar_sesion": "Sign out",
  "nav.volver_inicio": "← Back to home",
  "footer.privacidad": "Privacy",
  "footer.terminos": "Terms",
  "footer.cancelaciones": "Cancellations",
  "footer.soporte": "Support",
  "footer.copyright_suffix": "Costa Rica",

  // ── Portada ───────────────────────────────────────────────────────────
  "home.hero.image_alt": "Basket with cacao, coffee and pineapple",
  "home.how.step1.title": "Browse the catalog",
  "home.how.step1.text": "See the surplus available at the market today: real photos, prices and quantities.",
  "home.how.step2.title": "Reserve without paying online",
  "home.how.step2.text": "Set aside what you need in one click. Payment, if any, happens at pickup.",
  "home.how.step3.title": "Pick it up at the market",
  "home.how.step3.text": "You get a time window to come by the farmer's pickup point and collect it.",
  "home.fruits.heading": "What you'll find today",
  "home.fruits.subtext": "Browse the fruit with the arrows.",

  // ── Catálogo ──────────────────────────────────────────────────────────
  "catalogo.selector.heading": "Choose a market",
  "catalogo.selector.subtext": "Each market has its own catalog with the surplus available there.",
  "catalogo.selector.empty": "No markets have been set up yet.",
  "catalogo.selector.count_suffix": "product(s) available",
  "catalogo.feria.meta_description": "Browse the surplus available at this market.",
  "catalogo.feria.empty": "There's no surplus at this market yet. Check back soon.",
  "catalogo.feria.volver": "See other markets",
  "catalogo.feria.como_llegar": "How to get there",
  "catalogo.gallery.instructions": "Pick what you want, set the quantity and place your order.",
  "catalogo.gallery.disponibles_suffix": "available",
  "catalogo.gallery.cultivado_por_prefix": "Grown by",
  "catalogo.gallery.cosechado_el_prefix": "Harvested on",
  "catalogo.gallery.compartir": "Share",
  "catalogo.gallery.link_copiado": "Link copied",
  "catalogo.gallery.cerrar": "Close",
  "catalogo.reserve.success_prefix": "Reserved. Pick it up before",
  "catalogo.reserve.pending": "Reserving…",
  "catalogo.reserve.idle": "Reserve 1 unit",
  "catalogo.cart.add": "Add",
  "catalogo.cart.subtotal_prefix": "Subtotal",
  "catalogo.cart.service_fee_prefix": "Service",
  "catalogo.cart.total_prefix": "Total",
  "catalogo.cart.pickup_slot_label": "What time will you pick up on Wednesday?",
  "catalogo.cart.pickup_slot_placeholder": "Choose a time",
  "catalogo.cart.below_minimum_prefix": "The minimum order is",
  "catalogo.cart.place_order": "Place order",
  "catalogo.cart.pending": "Sending…",
  "catalogo.cart.empty": "Pick something from the catalog to build your order.",
  "catalogo.cart.success_prefix": "Order placed. Pick it up before",
  "catalogo.error.invalid_product": "Invalid product",
  "catalogo.error.invalid_slot": "Choose a pickup time for next Wednesday.",
  "catalogo.error.below_minimum": "That's below the ₡3,000 minimum order.",
  "catalogo.error.too_many_active_prefix": "You already have",
  "catalogo.error.too_many_active_suffix":
    "active reservations. Pick one up or wait for it to expire before reserving more.",
  "catalogo.error.too_many_products_prefix": "An order can have at most",
  "catalogo.error.too_many_products_suffix": "different products. Please split it into two orders.",
  "catalogo.error.product_unavailable": "That product is no longer available",
  "catalogo.error.insufficient_stock_prefix": "Only",
  "catalogo.error.insufficient_stock_suffix": "units left",
  "catalogo.error.generic": "Couldn't reserve it. Please try again.",
  "carousel.cta": "See it in the catalog",

  // ── Mi perfil ─────────────────────────────────────────────────────────
  "perfil.heading": "My profile",
  "perfil.field_nombre": "Name",
  "perfil.field_correo": "Email",
  "perfil.field_miembro_desde": "Member since",
  "cuenta.delete.heading": "Delete my account",
  "cuenta.delete.warning":
    "This permanently deletes your name, email, sign-in credentials and your reservations. It can't be undone.",
  "cuenta.delete.button_pending": "Deleting…",
  "cuenta.delete.button_confirm": "Yes, delete everything",
  "cuenta.delete.button_cancel": "Cancel",

  // ── Mis apartados ─────────────────────────────────────────────────────
  "apartados.status_reserved": "Reserved",
  "apartados.status_picked_up": "Picked up",
  "apartados.status_cancelled": "Cancelled",
  "apartados.status_expired": "Expired",
  "apartados.heading": "My reservations",
  "apartados.codigo_cliente_prefix": "Your customer code",
  "apartados.empty_text": "You haven't reserved anything yet.",
  "apartados.empty_link": "Browse the available surplus.",
  "apartados.recoge_en_prefix": "Pick up at",
  "apartados.antes_del_prefix": "before",
  "apartados.cancel.button_initial": "Cancel reservation",
  "apartados.cancel.confirm_text": "Are you sure?",
  "apartados.cancel.button_pending": "Cancelling…",
  "apartados.cancel.button_confirm": "Yes, cancel",
  "apartados.cancel.button_no": "No",
  "apartados.cancel.error_generic": "Couldn't cancel it",
  "apartados.error.not_authenticated": "Not signed in",
  "apartados.error.not_found": "Reservation not found",
  "apartados.error.not_cancellable": "This reservation can no longer be cancelled",

  // ── Ingreso y bienvenida ──────────────────────────────────────────────
  "signin.heading_prefix": "Sign in to",
  "signin.subtext": "Reserve surplus farm produce and pick it up at the farmers market. Nothing is charged online.",
  "signin.info_box":
    "When you create your account with Apple we store your name and email to identify you and manage your reservations. You can delete your account and your data at any time from your profile.",
  "signin.checkbox_label": "I have read and accept the Privacy Policy and the Terms of Service.",
  "signin.helper_accept_terms": "Accept the terms to continue.",
  "signin.email_placeholder": "Email",
  "signin.password_placeholder": "Password",
  "signin.password_button": "Sign in",
  "signin.password_pending": "Signing in…",
  "signin.password_error":
    "Wrong email or password, or too many attempts. If you've failed several times, wait a few minutes and try again.",
  "signin.no_account": "Don't have an account yet?",
  "signin.olvide_password": "Forgot your password?",
  "olvide.heading": "Recover password",
  "olvide.subtext": "Enter your email and we'll send you a link to choose a new password.",
  "olvide.submit": "Send link",
  "olvide.pending": "Sending…",
  "olvide.success":
    "If that email has an account with a password, we've sent a link to reset it. Check your inbox (and spam).",
  "olvide.volver_signin": "Back to sign in",
  "restablecer.heading": "Choose a new password",
  "restablecer.subtext": "Enter the new password for your Crop account.",
  "restablecer.password_placeholder": "New password (at least 8 characters)",
  "restablecer.submit": "Save password",
  "restablecer.pending": "Saving…",
  "restablecer.success": "Done, your password has changed. You can sign in with the new one.",
  "restablecer.sin_token": "This link is incomplete or invalid.",
  "restablecer.pedir_nuevo": "Request a new link",
  "signin.apple_not_configured": "Sign in with Apple isn't set up in this environment yet.",
  "signin.dev_hint": "Use the development sign-in below in the meantime.",
  "signin.dev_button": "Sign in as admin (development only)",
  "signin.dev_helper": "Local shortcut, one click, no password. It doesn't exist in production.",
  "welcome.heading": "One more step",
  "welcome.body": "Confirm that you accept the Privacy Policy and the Terms of Service to start using Crop.",
  "welcome.accept": "I accept, continue",
  "welcome.decline": "I don't accept, sign out",
  "registro.heading": "Create your account",
  "registro.subtext": "With your email and a password, no Apple account needed.",
  "registro.name_placeholder": "Name",
  "registro.email_placeholder": "Email",
  "registro.password_placeholder": "Password (at least 8 characters)",
  "registro.submit": "Create account",
  "registro.pending": "Creating…",
  "registro.success": "Account created. Signing you in…",
  "registro.auto_login_failed":
    "Your account was created, but we couldn't sign you in automatically. Sign in with your email and password:",
  "registro.have_account": "Already have an account?",

  // ── Aviso de cookies ──────────────────────────────────────────────────
  "cookie.body":
    "We only use the cookies needed to keep you signed in. We don't use advertising or third-party analytics cookies.",
  "cookie.accept": "Got it",

  // ── Páginas legales ───────────────────────────────────────────────────
  "legal.draft_notice": "Draft — pending legal review. Last updated: —",
  "legal.reembolsos.heading": "Cancellation and Refund Policy",
  "legal.reembolsos.body": `1. There are no online payments
Crop does not process payments or charges through the platform. A "reservation" sets product aside; it is not a purchase. Any payment is made directly with the farmer when you pick the product up at the market.

2. Cancelling a reservation
You can cancel an active reservation at any time before the pickup deadline, from My reservations. The units become available to other people immediately.

3. Expired reservations
If you don't pick the product up before the deadline, the reservation is released automatically and the units return to available stock. There is no penalty for this.

4. Problems with a product
Because Crop is not involved in payment or physical delivery, a complaint about the quality or condition of a product is resolved directly with the farmer at the pickup point. If the problem is with the platform itself (for example, an error in the information shown), write to us at: ldqg33@gmail.com or gboydt@icloud.com.`,
  "legal.privacy.heading": "Privacy Policy",
  "legal.privacy.body": `1. Data we collect
If you create your account with an email and password, we store your name, your email and your password (never in plain text: it is stored hashed with a one-way algorithm, so not even we can read it). If you sign in with Apple, we receive your name and your email address (or Apple's private relay address, if you choose to hide it). We also store the reservations you make on the platform. If you are a farmer or an administrator, the app may access your camera or photo library to upload pictures of the products you publish.

2. How we use the data
We use this data only to identify you, show you your reservations and coordinate pickup at the farmers market. We do not sell or share your data with third parties, and we do not use it for advertising or tracking.

3. Retention and deletion
You can delete your account and your personal data at any time from your profile. When you do, we permanently delete your name, email and sign-in credentials.

4. Contact
For privacy questions, write to us at: ldqg33@gmail.com or gboydt@icloud.com.`,
  "legal.terms.heading": "Terms of Service",
  "legal.terms.body": `1. What Crop is
Crop is a platform for reserving surplus farm produce and rescued food. There are no online payments: payment, if any, happens when you pick the product up at the pickup point.

2. Reservations and pickup
A reservation holds units for a limited time. If they are not picked up before the deadline, the reservation is released automatically and the units become available again.

3. Your account
You can create your account with Apple or with your own email and password. You are responsible for the activity on your account and for keeping your password secret. You can delete your account at any time from your profile.

4. Availability and changes
The service is provided "as is". We may modify or suspend features; material changes will be announced with reasonable notice.`,

  // ── Soporte ───────────────────────────────────────────────────────────
  "soporte.heading": "Support",
  "soporte.subtext": "Need help with a reservation, your account or something on the site? Write to us.",
  "soporte.body": `1. Contact
Write to us at: ldqg33@gmail.com or gboydt@icloud.com. We reply as soon as we can.

2. How do I reserve a product?
Open your market's catalog, choose how much you want of each product and confirm the order. Nothing is charged online: payment, if any, is made directly with the farmer at pickup.

3. How do I cancel a reservation?
From My reservations you can cancel any active reservation before the pickup deadline.

4. Account problems
If you can't sign in or have a problem with your account, write to the addresses above from the email you registered with.`,

  // ── Admin — Productos ─────────────────────────────────────────────────
  "admin.products.heading": "Surplus products",
  "admin.products.publicar_nuevo": "Publish new",
  "admin.products.empty": "No products have been published yet.",
  "admin.products.disponibles_suffix": "available",
  "admin.products.sin_punto_recogida": "no pickup point",
  "admin.products.oculto": "hidden",
  "admin.products.antes_prefix": "was",
  "admin.products.sin_foto": "no photo",
  "admin.products.form_editar": "Edit product",
  "admin.products.form_nuevo": "New product",
  "admin.products.form_codigo_prefix": "Code:",
  "admin.products.form_nombre": "Name",
  "admin.products.form_descripcion": "Description",
  "admin.products.form_proveedor": "Farmer / supplier (optional)",
  "admin.products.form_proveedor_placeholder": "e.g. María Elena, Finca La Esperanza",
  "admin.products.form_cuenta_agricultor": "Linked farmer account (optional)",
  "admin.products.form_sin_vincular": "Not linked",
  "admin.products.form_cuenta_agricultor_hint":
    "If the farmer has their own account, link it here so they can view and edit this product from /agricultor.",
  "admin.products.form_foto": "Photo",
  "admin.products.form_pegar_url": "Or paste a URL",
  "admin.products.form_cosecha": "Last harvest",
  "admin.products.form_nota": "Note (e.g. Extra sweet, Not ripe)",
  "admin.products.form_nota_placeholder": "Extra sweet",
  "admin.products.form_se_vende_por": "Sold by",
  "admin.products.form_unidades": "Units",
  "admin.products.form_kilos": "Kilos",
  "admin.products.form_cantidad_prefix": "Quantity",
  "admin.products.form_excedente_prefix": "Price",
  "admin.products.form_visible_clientes": "Visible to customers",
  "admin.products.form_guardado": "Saved.",
  "admin.products.form_guardando": "Saving…",
  "admin.products.form_guardar_cambios": "Save changes",
  "admin.products.form_publicar_producto": "Publish product",
  "admin.products.form_eliminar": "Delete",
  "admin.products.form_seguro": "Are you sure?",
  "admin.products.form_si_eliminar": "Yes, delete",
  "admin.products.form_cancelar": "Cancel",

  // ── Agricultor — Productos ────────────────────────────────────────────
  "agricultor.products.heading": "My products",
  "agricultor.products.publicar_nuevo": "Publish new",
  "agricultor.products.empty": "You haven't published any products yet.",
  "agricultor.products.form_auto_publica":
    "It shows up in the public catalog as soon as you publish it, with nothing needed from the administrator.",
  "agricultor.products.guia_titulo": "How do I take a good product photo?",
  "agricultor.products.guia_body": `Take the photo in natural daylight — avoid direct flash.
Show only the product, without a cluttered background behind it.
Show the whole product, not too close and not too far.
Use the "Take photo" button to shoot it right there with your phone camera, or "Upload photo" if you already have one saved.
After uploading you can crop it and adjust brightness/contrast with the editor below.`,

  // ── Admin — Pedidos ───────────────────────────────────────────────────
  "admin.pedidos.heading": "Reservations",
  "admin.pedidos.subtext":
    "Active and picked-up reservations, in a folder per customer. Cancelled or expired ones aren't shown here.",
  "admin.pedidos.exportar_link": "Export for printing",
  "admin.pedidos.empty": "There are no reservations yet.",
  "admin.pedidos.cliente_prefix": "Customer",
  "admin.pedidos.creado_prefix": "created",
  "admin.pedidos.vence_prefix": "expires",
  "admin.pedidos.marcar_entregado": "Mark as delivered",
  "admin.pedidos.status_reserved": "Reserved",
  "admin.pedidos.status_picked_up": "Picked up",
  "admin.pedidos.status_cancelled": "Cancelled",
  "admin.pedidos.status_expired": "Expired",

  // ── Admin — Agricultores ──────────────────────────────────────────────
  "admin.agricultores.heading": "Farmers",
  "admin.agricultores.subtext":
    'Give the farmer role to an account that has signed in at least once. Then link their products from /admin/products (the "Linked farmer account" field on each product).',
  "admin.agricultores.email_label": "Email of an account that has already signed in",
  "admin.agricultores.email_placeholder": "farmer@example.com",
  "admin.agricultores.asignando": "Assigning…",
  "admin.agricultores.hacer_agricultor": "Make farmer",
  "admin.agricultores.listo": "Done, they're a farmer now.",
  "admin.agricultores.activos_heading": "Active farmers",
  "admin.agricultores.ninguno": "None yet.",
  "admin.agricultores.productos_suffix": "product(s)",
  "admin.agricultores.quitar_rol": "Remove role",
  "admin.agricultores.mesa_label": "Table",
  "admin.agricultores.mesa_placeholder": "Unassigned",
  "admin.agricultores.mesa_guardar": "Save",
  "admin.agricultores.seguro": "Are you sure?",
  "admin.agricultores.si_quitar": "Yes, remove",
  "admin.agricultores.cancelar": "Cancel",

  // ── Admin — Auditoría ─────────────────────────────────────────────────
  "admin.audit.heading": "Change log",
  "admin.audit.empty": "No activity recorded.",
  "admin.audit.action_create": "Created",
  "admin.audit.action_update": "Edited",
  "admin.audit.action_delete": "Deleted",

  // ── Admin — Orden del catálogo ────────────────────────────────────────
  "admin.catalogo_orden.heading": "Catalog order",
  "admin.catalogo_orden.subtext":
    "Every visible product with stock appears in /catalogo on its own — you don't need to add it by hand. Here you can feature a few by putting them first; the rest are ordered by publication date.",
  "admin.catalogo_orden.destacados_heading": "Featured, in a fixed order",
  "admin.catalogo_orden.destacados_empty": "None yet.",
  "admin.catalogo_orden.subir": "Move up",
  "admin.catalogo_orden.bajar": "Move down",
  "admin.catalogo_orden.quitar": "Remove",
  "admin.catalogo_orden.sin_destacar_heading": "Not featured, ordered by date",
  "admin.catalogo_orden.sin_destacar_empty": "There are no other available products left to feature.",
  "admin.catalogo_orden.destacar_primero": "Feature first",

  // ── Admin — Menú lateral ──────────────────────────────────────────────
  "admin.nav.subtitulo": "Market surplus",
  "admin.nav.productos": "Products",
  "admin.nav.agricultores": "Farmers",
  "admin.nav.catalogo": "3D catalog",
  "admin.nav.apartados": "Reservations",
  "admin.nav.puntos_recogida": "Pickup points",
  "admin.nav.apariencia": "Appearance",
  "admin.nav.textos": "Texts",
  "admin.nav.registro_cambios": "Change log",
  "admin.nav.administracion": "Administration",
  "admin.nav.salir_panel": "Leave the panel",
  "admin.nav.cerrar_sesion": "Sign out",

  // ── Agricultor — Menú lateral y pedidos ───────────────────────────────
  "agricultor.nav.subtitulo": "Farmer panel",
  "agricultor.nav.mis_productos": "My products",
  "agricultor.nav.pedidos": "Orders",
  "agricultor.nav.agricultor_default": "Farmer",
  "agricultor.pedidos.heading": "Orders",
  "agricultor.pedidos.subtext":
    "Who reserved your products, so you know what to prepare when they come to collect at the market.",
  "agricultor.pedidos.empty": "No one has reserved your products yet.",
  "agricultor.pedidos.cliente_default": "Customer",
  "agricultor.pedidos.antes_del_prefix": "before",

  // ── Admin — Foto y punto de recogida ──────────────────────────────────
  "admin.photo.tomar_foto": "Take photo",
  "admin.photo.subiendo": "Uploading…",
  "admin.photo.elegir_archivo": "Choose file",
  "admin.photo.subir_foto": "Upload photo",
  "admin.photo.punto_recogida": "Pickup point",
  "admin.photo.km_del_centro_suffix": "km from the centre",
  "admin.photo.pegar_url_primero": "Paste a photo URL to be able to edit it",
  "admin.photo.ocultar_editor": "Hide photo editor",
  "admin.photo.abrir_editor": "Open photo editor",
  "admin.photo.subiendo_editada": "Uploading edited image…",
};
