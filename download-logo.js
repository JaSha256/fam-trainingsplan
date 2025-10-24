#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LOGO_URL = 'https://fam-muenchen.de/files/layout/img/fam-logo-white.svg';
const OUTPUT_PATH = join(__dirname, 'public/icons/fam-logo.svg');

console.log('Downloading FAM logo from:', LOGO_URL);

fetch(LOGO_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(svgContent => {
    writeFileSync(OUTPUT_PATH, svgContent);
    console.log('✓ Logo downloaded successfully to:', OUTPUT_PATH);
    console.log('File size:', svgContent.length, 'bytes');
  })
  .catch(error => {
    console.error('Error downloading logo:', error.message);
    process.exit(1);
  });
