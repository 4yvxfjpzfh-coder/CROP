/**
 * URL liviana para la foto de un producto: las que están guardadas como data
 * URI se sirven desde /api/foto/<id> en vez de viajar dentro del HTML.
 */
export function productPhotoSrc(p: { id: string; photoUrl: string | null; updatedAt: Date }) {
  if (!p.photoUrl) return null;
  if (!p.photoUrl.startsWith("data:")) return p.photoUrl;
  return `/api/foto/${p.id}?v=${p.updatedAt.getTime()}`;
}
