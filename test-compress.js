globalThis.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
globalThis.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');

import { compressCode, decompressCode } from './vite-project/src/utils/compression.js';

const sampleSmall = `graph TD; A-->B;`;
const sampleLarge = Array(500).fill('This is a line of mermaid diagram text to make it larger.').join('\n');

(async () => {
  for (const s of [sampleSmall, sampleLarge]) {
    const encoded = compressCode(s);
    const decoded = decompressCode(encoded);
    console.log('---');
    console.log('input len:', s.length);
    console.log('encoded len:', encoded.length);
    console.log('prefix:', encoded.slice(0,4));
    console.log('decoded ok:', decoded === s);
  }
})();
