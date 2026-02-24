import LZString from 'lz-string';
import pako from 'pako';

const base64UrlEncode = (uint8arr) => {
  let binary = '';
  const len = uint8arr.length;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(uint8arr[i]);
  let b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlDecode = (b64url) => {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const compressCode = (code) => {
  const input = typeof code === 'string' ? code : String(code);
  const lz = LZString.compressToEncodedURIComponent(input) || '';

  try {
    const compressed = pako.deflate(input);
    const gz = base64UrlEncode(compressed);
    const gzEncoded = `gz:${gz}`;
    if (lz && lz.length <= gzEncoded.length) {
      return lz;
    } else {
      return gzEncoded;
    }
  } catch (e) {
    return lz;
  }
};

export const decompressCode = (encodedData) => {
  if (!encodedData) return null;

  try {
    const lzDecoded = LZString.decompressFromEncodedURIComponent(encodedData);
    if (lzDecoded !== null && lzDecoded !== undefined) return lzDecoded;
  } catch (e) {}

  try {
    let b64 = encodedData;
    if (encodedData.startsWith('gz:')) b64 = encodedData.slice(3);
    if (!/^[A-Za-z0-9\-_]+$/.test(b64)) return null;
    const bytes = base64UrlDecode(b64);
    const inflated = pako.inflate(bytes);
    const decoded = new TextDecoder().decode(inflated);
    return decoded;
  } catch (e) {
    return null;
  }
};
