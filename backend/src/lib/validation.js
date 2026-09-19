export function validateImage(image) {
 if (typeof image !== 'string') return false;
 const match = image.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
 return Boolean(match && Buffer.from(match[2], 'base64').length <= 2 * 1024 * 1024);
}
export const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
