/**
 * Script para enriquecer os produtos com campos opcionais:
 * color, edition, installation, width, subfamily
 *
 * Analisa nomes, descrições e especificações para extrair valores.
 * Quando não é possível determinar com certeza, deixa undefined.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// === COLOR DETECTION ===
// Mapear sufixos comuns de cores nos nomes/referências dos produtos Teka
const COLOR_PATTERNS = [
  // Sufixos no nome/referência
  { pattern: /\bBK\b|FBK|GBK|Black Matt|BLACK MATT/i, color: 'Preto' },
  { pattern: /\bWH\b|FWH|White/i, color: 'Branco' },
  { pattern: /\bSS\b|\bINOX\b|Inoxidável/i, color: 'Inox' },
  { pattern: /\bATB\b|Antracite/i, color: 'Antracite' },
  { pattern: /\bSG\b|Stone Grey/i, color: 'Stone Grey' },
  { pattern: /\bDG\b|Dark Grey/i, color: 'Dark Grey' },
  { pattern: /\bGold\b|Dourado/i, color: 'Dourado' },
  { pattern: /\bCopper\b|Cobre/i, color: 'Cobre' },
  { pattern: /Urban Colors/i, color: 'Urban Colors' },
  // Vidro
  { pattern: /Vidro [Bb]ranco|White [Gg]lass/i, color: 'Vidro branco' },
  { pattern: /Vidro [Pp]reto|Black [Gg]lass/i, color: 'Vidro preto' },
];

function detectColor(name, specs) {
  // First try specs for "Cor" or "Acabamento"
  for (const spec of specs) {
    if (/^Cor$|^Acabamento$/i.test(spec.label) && spec.value.trim()) {
      return spec.value.trim();
    }
  }
  // Then try name patterns
  for (const { pattern, color } of COLOR_PATTERNS) {
    if (pattern.test(name)) return color;
  }
  return undefined;
}

// === EDITION DETECTION ===
function detectEdition(name) {
  if (/Van Gogh/i.test(name)) return 'Van Gogh Museum Edition';
  if (/Infinity G1|G1 Edition/i.test(name)) return 'Infinity G1 Edition';
  if (/Urban Colors/i.test(name)) return 'Urban Colors Edition';
  if (/Country Style/i.test(name)) return 'Country Style Edition';
  return undefined;
}

// === INSTALLATION DETECTION ===
function detectInstallation(name, shortDesc, specs) {
  // Check specs first
  for (const spec of specs) {
    if (/^Instalação$|^Tipo de instalação$/i.test(spec.label) && spec.value.trim()) {
      return spec.value.trim();
    }
  }
  const text = `${name} ${shortDesc}`.toLowerCase();
  if (/integra[çc][aã]o|encastr/i.test(text)) return 'Integração';
  if (/instala[çc][aã]o livre|free.?standing/i.test(text)) return 'Instalação livre';
  if (/baixo bancada|under.?counter/i.test(text)) return 'Baixo bancada';
  if (/sob tampo/i.test(text)) return 'Sob tampo';
  if (/encastre/i.test(text)) return 'Encastre';
  if (/à face/i.test(text)) return 'À face';
  return undefined;
}

// === WIDTH DETECTION ===
function detectWidth(specs) {
  for (const spec of specs) {
    if (/^Largura do produto \(mm\)$|^Largura \(mm\)$|^Largura$/i.test(spec.label) && spec.value.trim()) {
      const val = spec.value.trim();
      // Convert mm to cm if needed
      const mm = parseInt(val, 10);
      if (!isNaN(mm) && mm > 100) {
        return `${Math.round(mm / 10)} cm`;
      }
      if (/cm/.test(val)) return val;
      return val;
    }
  }
  return undefined;
}

// === SUBFAMILY DETECTION ===
// Subfamily mappings per subcategory (family)
const SUBFAMILY_RULES = {
  'fornos': (name, specs) => {
    const text = name.toLowerCase();
    if (/micro.?ondas/i.test(text)) return 'micro-ondas';
    if (/compacto/i.test(text)) return 'compactos';
    if (/convencional/i.test(text)) return 'convencionais';
    if (/multifun[çc]/i.test(text)) return 'multifuncoes';
    if (/gaveta/i.test(text)) return 'gavetas-multiusos';
    if (/polivalente/i.test(text)) return 'polivalentes';
    if (/vapor|steam/i.test(text)) return 'vapor';
    return undefined;
  },
  'micro-ondas': (name, specs) => {
    const text = `${name}`.toLowerCase();
    if (/baixo bancada|under.?counter/i.test(text)) return 'baixo-bancada';
    if (/integra[çc][aã]o|encastr/i.test(text)) return 'integracao';
    if (/instala[çc][aã]o livre|free.?standing/i.test(text)) return 'instalacao-livre';
    return undefined;
  },
  'placas': (name, specs) => {
    const text = name.toLowerCase();
    if (/indu[çc][aã]o/i.test(text)) return 'inducao';
    if (/vitrocer[aâ]mica/i.test(text)) return 'vitroceramica';
    if (/g[áa]s.*indu[çc]|indu[çc].*g[áa]s|mist/i.test(text)) return 'mistas-gas-inducao';
    if (/g[áa]s/i.test(text)) return 'gas';
    if (/polivalente/i.test(text)) return 'polivalente';
    return undefined;
  },
  'exaustores': (name, specs) => {
    const text = name.toLowerCase();
    if (/integra[çc][aã]o|telescóp|encastr/i.test(text)) return 'integracao';
    if (/decorativ|chaminé|parede|ilha/i.test(text)) return 'decorativas';
    return undefined;
  },
  'frigorificos': (name, specs) => {
    const text = name.toLowerCase();
    if (/arca/i.test(text)) return 'arcas';
    return 'frigorificos';
  },
  'lava-loucas': (name, specs) => {
    const text = name.toLowerCase();
    if (/sint[eé]tico/i.test(text)) return 'sintetico';
    if (/vidro/i.test(text)) return 'aco-inoxidavel-vidro';
    if (/inox|a[çc]o/i.test(text)) return 'aco-inoxidavel';
    return undefined;
  },
  'misturadoras-de-cozinha': (name, specs) => {
    const text = name.toLowerCase();
    if (/profissional/i.test(text)) return 'profissional';
    if (/mural|murais/i.test(text)) return 'murais';
    if (/cano alto|alto/i.test(text)) return 'cano-alto';
    if (/cano baixo|baixo/i.test(text)) return 'cano-baixo';
    return undefined;
  },
  'maquinas-de-lavar-louca': (name, specs) => {
    const text = name.toLowerCase();
    if (/integra[çc][aã]o total/i.test(text)) return 'integracao';
    if (/integra[çc][aã]o parcial/i.test(text)) return 'integracao';
    if (/integra[çc][aã]o|encastr/i.test(text)) return 'integracao';
    if (/instala[çc][aã]o livre|free/i.test(text)) return 'instalacao-livre';
    if (/compact/i.test(text)) return 'compactos';
    return undefined;
  },
};

function detectSubfamily(subcategory, name, specs) {
  const detector = SUBFAMILY_RULES[subcategory];
  if (!detector) return undefined;
  return detector(name, specs);
}

// === PROCESS FILE ===
// We'll use regex to find each product block and inject new fields after 'subcategory'

// Pattern to match a product object - we look for the subcategory line and add fields after it
// This is a line-by-line approach

const lines = content.split('\n');
const output = [];
let inProduct = false;
let currentProduct = {};
let productStartLine = -1;
let subcategoryLine = -1;
let nameValue = '';
let shortDescValue = '';
let subcategoryValue = '';
let specs = [];
let inSpecs = false;
let specsBracketDepth = 0;

// First pass: collect all product data
const productData = [];
let currentData = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Start of a product in the array
  if (/^  \{$/.test(line) && i > 130) { // After categories section
    currentData = { startLine: i, name: '', shortDesc: '', subcategory: '', specs: [], subcategoryLineIdx: -1 };
  }

  if (currentData) {
    const nameMatch = line.match(/^\s+name:\s*'(.+)',?\s*$/);
    if (nameMatch) currentData.name = nameMatch[1];

    const shortDescMatch = line.match(/^\s+shortDescription:\s*'(.+)',?\s*$/);
    if (shortDescMatch) currentData.shortDesc = shortDescMatch[1];

    const subcatMatch = line.match(/^\s+subcategory:\s*'(.+)',?\s*$/);
    if (subcatMatch) {
      currentData.subcategory = subcatMatch[1];
      currentData.subcategoryLineIdx = i;
    }

    // Collect specs
    const specMatch = line.match(/^\s+\{\s*label:\s*'(.+?)'\s*,\s*value:\s*'(.+?)'/);
    if (specMatch) {
      currentData.specs.push({ label: specMatch[1], value: specMatch[2] });
    }

    // End of product
    if (/^  \},?$/.test(line)) {
      if (currentData.subcategoryLineIdx >= 0) {
        productData.push(currentData);
      }
      currentData = null;
    }
  }
}

console.log(`Found ${productData.length} products to enrich`);

// Stats
let colorCount = 0, editionCount = 0, installCount = 0, widthCount = 0, subfamCount = 0;

// Second pass: inject fields (process from bottom to top to preserve line numbers)
for (let p = productData.length - 1; p >= 0; p--) {
  const prod = productData[p];
  const color = detectColor(prod.name, prod.specs);
  const edition = detectEdition(prod.name);
  const installation = detectInstallation(prod.name, prod.shortDesc, prod.specs);
  const width = detectWidth(prod.specs);
  const subfamily = detectSubfamily(prod.subcategory, prod.name, prod.specs);

  if (color) colorCount++;
  if (edition) editionCount++;
  if (installation) installCount++;
  if (width) widthCount++;
  if (subfamily) subfamCount++;

  // Build new lines to insert after subcategory line
  const newLines = [];
  if (subfamily) newLines.push(`    subfamily: '${subfamily}',`);

  // Insert after the closing tags line or after subcategory
  // We'll insert the simple fields right after subcategory
  const insertAfterLine = prod.subcategoryLineIdx;

  // Build lines to insert at the end of the product (before relatedProductIds or tags)
  const extraFields = [];
  if (color) extraFields.push(`    color: '${color}',`);
  if (edition) extraFields.push(`    edition: '${edition}',`);
  if (installation) extraFields.push(`    installation: '${installation}',`);
  if (width) extraFields.push(`    width: '${width}',`);

  // Insert subfamily after subcategory
  if (newLines.length > 0) {
    lines.splice(insertAfterLine + 1, 0, ...newLines);
    // Adjust line indices for extra fields
    // Find the tags line for this product (now shifted)
    const shift = newLines.length;
    // Find `tags:` line within the product
    let tagsLineIdx = -1;
    for (let j = insertAfterLine + shift; j < lines.length; j++) {
      if (/^\s+tags:/.test(lines[j])) {
        tagsLineIdx = j;
        break;
      }
      if (/^  \},?$/.test(lines[j])) break;
    }
    if (tagsLineIdx >= 0 && extraFields.length > 0) {
      lines.splice(tagsLineIdx + 1, 0, ...extraFields);
    }
  } else if (extraFields.length > 0) {
    // No subfamily, just find tags line
    let tagsLineIdx = -1;
    for (let j = insertAfterLine; j < lines.length; j++) {
      if (/^\s+tags:/.test(lines[j])) {
        tagsLineIdx = j;
        break;
      }
      if (/^  \},?$/.test(lines[j])) break;
    }
    if (tagsLineIdx >= 0) {
      lines.splice(tagsLineIdx + 1, 0, ...extraFields);
    }
  }
}

console.log(`Enrichment stats:`);
console.log(`  color: ${colorCount}/${productData.length}`);
console.log(`  edition: ${editionCount}/${productData.length}`);
console.log(`  installation: ${installCount}/${productData.length}`);
console.log(`  width: ${widthCount}/${productData.length}`);
console.log(`  subfamily: ${subfamCount}/${productData.length}`);

fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
console.log('Done! products.ts has been updated.');
