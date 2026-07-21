/**
 * Gera o ficheiro src/data/products.ts a partir do catalog-raw.json
 * Mapeia subfamílias do Excel para categorias/subcategorias do site
 */
const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/catalog-raw.json'), 'utf-8'));

// Mapeamento subfamilia Excel → { category, subcategory, subcategoryName }
const SUBFAMILY_MAP = {
  // Fornos
  'elect_forno_elect_enc': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect_hydrocl': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect_dualcl': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect_vapor': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect_gama900': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect_poli': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_elect_country': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  'elect_forno_gas': { category: 'cozinha', subcategory: 'fornos', name: 'Fornos' },
  // Microondas
  'elect_microondas_enc': { category: 'cozinha', subcategory: 'microondas', name: 'Microondas' },
  'elect_microondas_livre': { category: 'cozinha', subcategory: 'microondas', name: 'Microondas' },
  // Placas
  'elect_placa_inducao': { category: 'cozinha', subcategory: 'placas', name: 'Placas' },
  'elect_placa_gas': { category: 'cozinha', subcategory: 'placas', name: 'Placas' },
  'elect_placa_vitro': { category: 'cozinha', subcategory: 'placas', name: 'Placas' },
  // Exaustores
  'elect_exaustor': { category: 'cozinha', subcategory: 'exaustores', name: 'Exaustores' },
  'elect_exaustor_filtro': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_Exaustor_kitrecirculacao': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_exaustor_sobretubo': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  // Frigoríficos
  'elect_combinado_livre': { category: 'cozinha', subcategory: 'frigorificos', name: 'Frigoríficos' },
  'elect_combinado_encastrar': { category: 'cozinha', subcategory: 'frigorificos', name: 'Frigoríficos' },
  'elect_frigorifico_livre': { category: 'cozinha', subcategory: 'frigorificos', name: 'Frigoríficos' },
  'elect_frigorifico_encastrar': { category: 'cozinha', subcategory: 'frigorificos', name: 'Frigoríficos' },
  'elect_congelador': { category: 'cozinha', subcategory: 'frigorificos', name: 'Frigoríficos' },
  'elect_garrafeira': { category: 'cozinha', subcategory: 'frigorificos', name: 'Frigoríficos' },
  // Lava-loiça
  'elect_lava_loica': { category: 'cozinha', subcategory: 'lava-loica', name: 'Lava-loiça' },
  'elect_lava_loica_enc': { category: 'cozinha', subcategory: 'lava-loica', name: 'Lava-loiça' },
  'elect_lava_loica_acessorio': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_lava_loica_triturador': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  // Máquinas lavar loiça
  'elect_maquina_louca_livre': { category: 'cozinha', subcategory: 'maquinas-lavar-loica', name: 'Máquinas de lavar loiça' },
  'elect_maquina_louca_enc': { category: 'cozinha', subcategory: 'maquinas-lavar-loica', name: 'Máquinas de lavar loiça' },
  // Misturadoras
  'elect_misturadora': { category: 'cozinha', subcategory: 'misturadoras', name: 'Misturadoras' },
  // Máquinas de café
  'elect_Maq_cafe_enc': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_Maq_cafe': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  // Gavetas
  'elect_Gaveta_partes': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_Gaveta_multiusos': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_Gaveta_aquecimento': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  // Lavandaria
  'elect_maquina_roupa_livre': { category: 'lavandaria', subcategory: 'maquinas-lavar-roupa', name: 'Máquinas de lavar roupa' },
  'elect_maquina_roupa_enc': { category: 'lavandaria', subcategory: 'maquinas-lavar-roupa', name: 'Máquinas de lavar roupa' },
  'elect_maquina_roupa_secar_livre': { category: 'lavandaria', subcategory: 'maquinas-secar', name: 'Máquinas de secar' },
  'elect_maquina_roupa_lavaeseca_enc': { category: 'lavandaria', subcategory: 'maquinas-lavar-secar', name: 'Máquinas de lavar e secar' },
  'elect_maquina_roupa_lavaeseca_livre': { category: 'lavandaria', subcategory: 'maquinas-lavar-secar', name: 'Máquinas de lavar e secar' },
  'elect_maquina_roupa_acess': { category: 'lavandaria', subcategory: 'maquinas-lavar-roupa', name: 'Máquinas de lavar roupa' },
  // Termoacumuladores
  'elect_termoacumulador': { category: 'termoacumuladores', subcategory: 'termoacumuladores', name: 'Termoacumuladores' },
  // Outros / Acessórios
  'elect_outros': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_acessorio': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
  'elect_palamenta': { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' },
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function formatPrice(aoa) {
  return aoa;
}

// Generate products
const products = rawData.map((item, index) => {
  const mapping = SUBFAMILY_MAP[item.subfamilia] || { category: 'cozinha', subcategory: 'acessorios', name: 'Acessórios' };
  const id = slugify(item.sku + '-' + item.name.split(' ').slice(0, 4).join('-'));
  const slug = slugify(item.name);

  return {
    id,
    slug,
    sku: item.sku,
    ean: item.ean,
    name: item.name,
    reference: item.sku,
    refPhc: item.refPhc,
    shortDescription: item.name,
    description: item.name,
    category: mapping.category,
    subcategory: mapping.subcategory,
    subcategoryName: mapping.name,
    priceAOA: item.priceAOA,
    subfamilia: item.subfamilia,
  };
});

// Count per subcategory
const subCounts = {};
products.forEach(p => {
  const key = `${p.category}/${p.subcategory}`;
  subCounts[key] = (subCounts[key] || 0) + 1;
});

console.log('\n=== Distribuição por subcategoria ===');
Object.entries(subCounts).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
console.log(`\nTotal: ${products.length} produtos`);

// Write JSON for the generation agent
fs.writeFileSync(path.join(__dirname, '../src/data/catalog-mapped.json'), JSON.stringify(products, null, 2));
console.log('\nFicheiro catalog-mapped.json gerado com sucesso.');
