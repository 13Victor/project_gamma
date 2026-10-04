/** Nombre provisional del producto: cámbialo cuando esté decidido. */
export const SITE_NAME = "LoL Daily";

export const SITE_DESCRIPTION =
  "Adivina el campeón de League of Legends del día. Un reto nuevo cada día a las 00:00 UTC.";

/** URL pública del sitio, sin barra final. Define NEXT_PUBLIC_SITE_URL en producción. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
