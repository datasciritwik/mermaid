import LZString from 'lz-string';

export const compressCode = (code) => {
  return LZString.compressToEncodedURIComponent(code);
};

export const decompressCode = (encodedData) => {
  return LZString.decompressFromEncodedURIComponent(encodedData);
};
