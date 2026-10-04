/**
 * Convierte un nombre en un slug de URL: minúsculas, sin acentos,
 * separado por guiones. "Kai'Sa" -> "kai-sa", "Renata Glasc" -> "renata-glasc".
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
