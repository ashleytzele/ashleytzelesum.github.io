import { readFileSync } from 'node:fs';

// Reads the three production files as text. Every contract test parses strings
// rather than a DOM: Node has no HTML parser built in and adding one would mean
// a dependency, which this repo does not have and should not gain.
export function readSite() {
  return {
    html: readFileSync('index.html', 'utf8'),
    css: readFileSync('assets/css/blueprint.css', 'utf8'),
    js: readFileSync('assets/js/blueprint.js', 'utf8'),
  };
}
