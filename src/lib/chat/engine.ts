import { products, categories, getProductsBySubcategory } from '@/data/products';
import { faqs } from '@/data/articles';

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  quickReplies?: string[];
  productCards?: { id: string; slug: string; name: string; image: string; subcategory: string }[];
  timestamp: number;
}

interface ChatState {
  flow: 'idle' | 'find-product' | 'support' | 'compare' | 'faq';
  step: number;
  context: Record<string, string>;
}

const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'Olá! Sou o assistente Teka Angola. Como posso ajudar?',
  quickReplies: ['Encontrar Produto', 'Suporte Técnico', 'Comparar Produtos', 'FAQ'],
  timestamp: Date.now(),
};

// ============================================================
// Mapeamento robusto de categorias — sinónimos, plural, variações
// ============================================================

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  // Sinónimos ordenados do mais específico para o mais genérico
  'fornos':                  ['forno', 'fornos', 'fogao', 'fogoes', 'pirolitico', 'multifuncoes', 'assar'],
  'micro-ondas':             ['microondas', 'micro-ondas', 'micro ondas', 'microonda'],
  'placas':                  ['placa', 'placas', 'inducao', 'vitroceramica', 'cooktop'],
  'exaustores':              ['exaustor', 'exaustores', 'chamine', 'extractor', 'hotte'],
  'frigorificos':            ['frigorifico', 'frigorificos', 'geleira', 'geladeira', 'congelador', 'combinado', 'side by side', 'americano', 'arca congeladora'],
  'lava-loucas':             ['lava-louca', 'lava-loucas', 'lava louca', 'lava-louça', 'lava-louças', 'lava louça', 'pia cozinha', 'bacia cozinha', 'cuba', 'sink'],
  'maquinas-de-lavar-louca': ['maquina de lavar louca', 'maquina de lavar louça', 'maquinas de lavar louca', 'maquina lavar louca', 'maquina lavar louça', 'lavar louca', 'lavar louça', 'lavar pratos', 'dishwasher', 'maquina louca', 'maquina louça'],
  'misturadoras-de-cozinha': ['misturadora', 'misturadoras', 'torneira', 'torneiras', 'grifo', 'bica'],
  'acessorios-de-cozinha':   ['acessorio', 'acessorios', 'complemento', 'complementos'],
  'maquina-de-cafe':         ['maquina de cafe', 'maquina cafe', 'cafeteira', 'expresso', 'cappuccino', 'cafe encastrar', 'cafe'],
  'maquinas-lavar-roupa':    ['maquina de lavar roupa', 'maquina lavar roupa', 'maquinas lavar roupa', 'lavar roupa', 'lavandaria'],
  'maquinas-secar':          ['maquina secar', 'secador', 'secadora', 'secar roupa'],
  'maquinas-lavar-secar':    ['lavar e secar', 'lavar secar', '2 em 1'],
  'termoacumuladores':       ['termoacumulador', 'termoacumuladores', 'esquentador', 'cilindro', 'agua quente'],
  'mono-split':              ['ar condicionado', 'ar-condicionado', 'climatizacao', 'split', 'mono-split', 'monosplit', 'aurea', 'arcon', 'btu'],
  'multi-split':             ['multi-split', 'multisplit', 'multi split'],
};

const CATEGORY_LABELS: Record<string, string> = {
  'fornos': 'Fornos',
  'micro-ondas': 'Micro-ondas',
  'placas': 'Placas',
  'exaustores': 'Exaustores',
  'frigorificos': 'Frigoríficos',
  'lava-loucas': 'Lava-louças',
  'maquinas-de-lavar-louca': 'Máquinas de lavar louça',
  'misturadoras-de-cozinha': 'Misturadoras',
  'acessorios-de-cozinha': 'Acessórios',
  'maquina-de-cafe': 'Máquinas de café',
  'maquinas-lavar-roupa': 'Máquinas de lavar roupa',
  'maquinas-secar': 'Máquinas de secar',
  'maquinas-lavar-secar': 'Máquinas de lavar e secar',
  'termoacumuladores': 'Termoacumuladores',
  'mono-split': 'Ar Condicionado Mono-Split',
  'multi-split': 'Ar Condicionado Multi-Split',
};

// ============================================================
// Normalização de texto (remove acentos, lowercase, trim)
// ============================================================

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// ============================================================
// Detectar categoria a partir de texto livre
// ============================================================

function detectCategory(text: string): string | null {
  const n = norm(text);

  // Try longest synonyms first to avoid partial matches
  // e.g. "maquina de lavar" should match laundry, not coffee
  let bestMatch: string | null = null;
  let bestLen = 0;

  for (const [slug, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const syn of synonyms) {
      const ns = norm(syn);
      if (n.includes(ns) && ns.length > bestLen) {
        bestMatch = slug;
        bestLen = ns.length;
      }
    }
  }
  return bestMatch;
}

// ============================================================
// Busca robusta de produtos
// ============================================================

function smartSearch(query: string, limit = 4): { id: string; slug: string; name: string; image: string; subcategory: string }[] {
  const q = norm(query);

  // 1. Tentar buscar por categoria detectada
  const detectedCat = detectCategory(query);
  if (detectedCat) {
    const catProducts = products.filter(p => p.subcategory === detectedCat);
    if (catProducts.length > 0) {
      return catProducts.slice(0, limit).map(toCard);
    }
  }

  // 2. Busca por referência parcial (ex: "HLB 8600", "ML 82", "DVT 98")
  const refQuery = q.replace(/\s+/g, '').toUpperCase();
  let results = products.filter(p => {
    const refNorm = p.reference.replace(/\s+/g, '').toUpperCase();
    const nameNorm = norm(p.name).replace(/\s+/g, '');
    const slugNorm = p.slug.replace(/-/g, '');
    return refNorm.includes(refQuery) || nameNorm.includes(q.replace(/\s+/g, '')) || slugNorm.includes(q.replace(/\s+/g, ''));
  });
  if (results.length > 0) return results.slice(0, limit).map(toCard);

  // 3. Busca directa no texto completo (com espaços)
  results = products.filter(p => {
    const s = norm(`${p.name} ${p.reference} ${p.subcategory} ${p.shortDescription} ${p.tags.join(' ')}`);
    return s.includes(q);
  });
  if (results.length > 0) return results.slice(0, limit).map(toCard);

  // 3. Busca por palavras individuais (mínimo 4 caracteres para evitar falsos positivos)
  const stopWords = new Set(['que', 'tens', 'tem', 'quais', 'qual', 'sao', 'são', 'como', 'isto', 'isso', 'aqui', 'ali', 'onde', 'quando', 'porque', 'porquê', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'o', 'a', 'e', 'para', 'com', 'por', 'em', 'se', 'ou', 'eu', 'me', 'meu', 'minha', 'ter', 'ser', 'esta', 'este', 'essa', 'esse', 'quero', 'preciso', 'procuro', 'gostava', 'gostaria', 'ver', 'mostrar', 'mostra', 'queria', 'ola', 'bom', 'dia', 'boa', 'tarde', 'noite', 'obrigado', 'obrigada', 'off', 'on', 'sim', 'nao', 'não', 'mas', 'mais', 'muito', 'bem', 'mal', 'todos', 'todas', 'todo', 'toda', 'pode', 'podem', 'posso', 'conta', 'canta', 'qual', 'faz', 'fazer', 'liga', 'ligar', 'barulho', 'grande', 'pequeno', 'barato', 'caro', 'bom', 'mau', 'novo', 'velho']);
  const keywords = norm(query).split(/\s+/).filter(w => w.length >= 4 && !stopWords.has(w));

  for (const kw of keywords) {
    results = products.filter(p => {
      const s = norm(`${p.name} ${p.subcategory} ${p.tags.join(' ')}`);
      return s.includes(kw);
    });
    if (results.length > 0) return results.slice(0, limit).map(toCard);
  }

  return [];
}

function toCard(p: typeof products[0]) {
  return { id: p.id, slug: p.slug, name: p.name, image: p.thumbnail || p.images?.[0] || '', subcategory: p.subcategory };
}

function findProductByRef(ref: string) {
  const q = norm(ref);
  return products.find(p =>
    norm(p.reference) === q || norm(p.name).includes(q) || p.id === ref.trim()
  );
}

// ============================================================
// Detectar intenção do utilizador
// ============================================================

type Intent = 'greeting' | 'find-product' | 'support' | 'compare' | 'faq' | 'price' | 'contact' | 'thanks' | 'simulator' | 'unknown';

function detectIntent(text: string): Intent {
  const n = norm(text);

  if (/^(ola|bom dia|boa tarde|boa noite|hey|hi|hello|oi)/.test(n)) return 'greeting';
  if (/obrigad|agradec|valeu|thanks/.test(n)) return 'thanks';
  if (/(preco|preço|custa|quanto vale|quanto custa|valor\b|kwanza|kz\b|orcamento|orçamento)/.test(n)) return 'price';
  if (/(contacto|telefone|email|morada|endereco|onde fica|falar.*humano|ligar)/.test(n)) return 'contact';
  if (/(suporte|avaria|avariou|partido|nao funciona|não funciona|problema|erro|defeito|assistencia|nao liga|não liga|barulho|fuga|reparacao|reparação|garantia)/.test(n)) return 'support';
  if (/(comparar|compara|vs|versus|diferenca|diferença)/.test(n)) return 'compare';
  if (/(faq|pergunta|duvida|dúvida)/.test(n)) return 'faq';
  if (/(simulador|simular|potencia|btu|calcular|que modelo|qual modelo)/.test(n)) return 'simulator';

  // Só classificar como busca de produto se detectar uma categoria ou keyword de produto
  const hasCategoryKeyword = detectCategory(text) !== null;
  const hasProductKeyword = /(produto|artigo|equipamento|eletrodomestico|electrodomestico|comprar|modelo)/.test(n);
  if (hasCategoryKeyword || hasProductKeyword) return 'find-product';

  return 'unknown';
}

// ============================================================
// Resumo do catálogo (para respostas contextuais)
// ============================================================

function getCatalogSummary(): string {
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.subcategory] = (counts[p.subcategory] || 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .map(([slug, c]) => `${CATEGORY_LABELS[slug] || slug}: ${c}`)
    .join(', ');
}

// ============================================================
// Engine principal
// ============================================================

export function createInitialState(): { messages: ChatMessage[]; state: ChatState } {
  return { messages: [WELCOME_MSG], state: { flow: 'idle', step: 0, context: {} } };
}

export function processMessage(
  userText: string,
  currentState: ChatState,
): { response: ChatMessage; newState: ChatState } {
  const text = userText.trim();
  const id = `msg-${Date.now()}`;

  // Preserve context from previous state
  const lastCategory = currentState.context.lastCategory || '';
  const lastQuery = currentState.context.lastQuery || '';

  // Quick reply handler — exact matches
  if (norm(text) === norm('Voltar ao início') || text === 'Pesquisar outro' || text === 'Comparar outros') {
    return { response: { ...WELCOME_MSG, id, timestamp: Date.now() }, newState: { flow: 'idle', step: 0, context: {} } };
  }

  // === CONTEXT-AWARE FOLLOW-UP ===
  // If user asks "tens de 24?" or "e o de 12000?" and we have lastCategory, search within that category
  const followUpMatch = norm(text).match(/(?:tens|tem|ha|e o|e a|e de|e os|tens de|mostrar|ver)\s*(?:de\s+)?(\d+)/);
  if (followUpMatch && lastCategory) {
    const num = followUpMatch[1];
    const catProducts = products.filter(p => p.subcategory === lastCategory);
    const filtered = catProducts.filter(p => {
      const s = norm(`${p.name} ${p.reference} ${p.shortDescription} ${p.tags.join(' ')}`);
      return s.includes(num);
    });
    if (filtered.length > 0) {
      const label = CATEGORY_LABELS[lastCategory] || lastCategory;
      return {
        response: { id, role: 'bot', timestamp: Date.now(), text: `Encontrei ${filtered.length} resultado${filtered.length > 1 ? 's' : ''} de ${num} em ${label}:`, productCards: filtered.slice(0, 4).map(toCard), quickReplies: ['Encontrar Produto', 'Voltar ao início'] },
        newState: { flow: 'idle', step: 0, context: { lastCategory, lastQuery: num } },
      };
    }
    // If not found by number, show all from last category
    if (catProducts.length > 0) {
      const label = CATEGORY_LABELS[lastCategory] || lastCategory;
      return {
        response: { id, role: 'bot', timestamp: Date.now(), text: `Não encontrei modelos de "${num}" em ${label}. Aqui estão os disponíveis:`, productCards: catProducts.slice(0, 4).map(toCard), quickReplies: ['Encontrar Produto', 'Voltar ao início'] },
        newState: { flow: 'idle', step: 0, context: { lastCategory, lastQuery: text } },
      };
    }
  }

  // "mais?" / "outros?" / "ver mais" — show more from last category
  if (lastCategory && /^(mais|outros|ver mais|mostrar mais|tem mais|ha mais|e mais)$/i.test(text.trim())) {
    const catProducts = products.filter(p => p.subcategory === lastCategory);
    const label = CATEGORY_LABELS[lastCategory] || lastCategory;
    // Show different products (offset by 4)
    const offset = catProducts.length > 4 ? 4 : 0;
    return {
      response: { id, role: 'bot', timestamp: Date.now(), text: `Mais produtos em ${label} (${catProducts.length} total):`, productCards: catProducts.slice(offset, offset + 4).map(toCard), quickReplies: ['Ver mais', 'Encontrar Produto', 'Voltar ao início'] },
      newState: { flow: 'idle', step: 0, context: { lastCategory, lastQuery } },
    };
  }

  if (text === 'Ir para Contacto') {
    return {
      response: { id, role: 'bot', timestamp: Date.now(), text: 'Pode contactar-nos:\n\n📞 +244 933 302 752\n📧 teka@mdvmadeiras.com\n\nOu visite /suporte/contacto', quickReplies: ['Voltar ao início'] },
      newState: { flow: 'idle', step: 0, context: {} },
    };
  }

  // === FLOW: Find Product (passo 2+) ===
  if (currentState.flow === 'find-product' && currentState.step === 1) {
    const detected = detectCategory(text);
    const slug = detected || Object.entries(CATEGORY_SYNONYMS).find(([, syns]) => syns.some(s => norm(s) === norm(text)))?.[0];
    const results = slug ? products.filter(p => p.subcategory === slug).slice(0, 4).map(toCard) : smartSearch(text);
    if (results.length > 0) {
      const label = CATEGORY_LABELS[slug || results[0].subcategory] || text;
      return {
        response: { id, role: 'bot', timestamp: Date.now(), text: `Encontrei ${results.length} produtos em ${label}:`, productCards: results, quickReplies: ['Ver mais', 'Pesquisar outro', 'Voltar ao início'] },
        newState: { flow: 'idle', step: 0, context: { lastCategory: slug || results[0].subcategory, lastQuery: text } },
      };
    }
    return {
      response: { id, role: 'bot', timestamp: Date.now(), text: `Não encontrei produtos para "${text}". Tente outra categoria:`, quickReplies: Object.keys(CATEGORY_LABELS).filter(k => products.some(p => p.subcategory === k)).map(k => CATEGORY_LABELS[k]) },
      newState: currentState,
    };
  }

  // === FLOW: Support (passos 1-3) ===
  if (currentState.flow === 'support') {
    if (currentState.step === 1) {
      const product = findProductByRef(text);
      if (product) {
        return {
          response: { id, role: 'bot', timestamp: Date.now(), text: `Encontrei: ${product.name} (Ref: ${product.reference})\n\nQual é o problema?`, quickReplies: ['Não liga/aquece', 'Erro no display', 'Barulho estranho', 'Fuga de água', 'Outro problema'] },
          newState: { flow: 'support', step: 2, context: { productId: product.id, productName: product.name } },
        };
      }
      // Try smart search
      const results = smartSearch(text, 1);
      if (results.length > 0) {
        const p = products.find(pr => pr.id === results[0].id)!;
        return {
          response: { id, role: 'bot', timestamp: Date.now(), text: `Encontrei: ${p.name} (Ref: ${p.reference})\n\nQual é o problema?`, quickReplies: ['Não liga/aquece', 'Erro no display', 'Barulho estranho', 'Fuga de água', 'Outro problema'] },
          newState: { flow: 'support', step: 2, context: { productId: p.id, productName: p.name } },
        };
      }
      return { response: { id, role: 'bot', timestamp: Date.now(), text: `Não encontrei o produto "${text}". Tente com a referência (ex: HLB 8600) ou nome.` }, newState: currentState };
    }
    if (currentState.step === 2) {
      return {
        response: { id, role: 'bot', timestamp: Date.now(), text: `Entendo que o ${currentState.context.productName} está com "${text}".\n\nTente estes passos:\n1️⃣ Desligue da corrente por 30 segundos\n2️⃣ Volte a ligar e teste\n3️⃣ Verifique se a instalação está correcta\n\nResolveu?`, quickReplies: ['Sim, resolveu!', 'Não, preciso de assistência'] },
        newState: { flow: 'support', step: 3, context: currentState.context },
      };
    }
    if (currentState.step === 3) {
      if (norm(text).includes('sim')) {
        return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Fico contente! Posso ajudar com mais alguma coisa?', quickReplies: ['Encontrar Produto', 'FAQ', 'Voltar ao início'] }, newState: { flow: 'idle', step: 0, context: {} } };
      }
      return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Recomendo contactar a assistência técnica MDV:\n\n📞 +244 933 302 752\n📧 teka@mdvmadeiras.com\n\nPodemos agendar uma visita técnica.', quickReplies: ['Ir para Contacto', 'Voltar ao início'] }, newState: { flow: 'idle', step: 0, context: {} } };
    }
  }

  // === FLOW: Compare ===
  if (currentState.flow === 'compare') {
    if (currentState.step === 1) {
      const product1 = findProductByRef(text) || (() => { const r = smartSearch(text, 1); return r.length ? products.find(p => p.id === r[0].id) : undefined; })();
      if (product1) {
        return { response: { id, role: 'bot', timestamp: Date.now(), text: `✅ Primeiro: ${product1.name}\n\nAgora indique o segundo produto.` }, newState: { flow: 'compare', step: 2, context: { product1Id: product1.id } } };
      }
      return { response: { id, role: 'bot', timestamp: Date.now(), text: `Não encontrei "${text}". Tente com referência (ex: HLB 8600).` }, newState: currentState };
    }
    if (currentState.step === 2) {
      const product2 = findProductByRef(text) || (() => { const r = smartSearch(text, 1); return r.length ? products.find(p => p.id === r[0].id) : undefined; })();
      const product1 = products.find(p => p.id === currentState.context.product1Id);
      if (product2 && product1) {
        const allLabels = [...new Set([...product1.specifications.map(s => s.label), ...product2.specifications.map(s => s.label)])].slice(0, 8);
        let comp = `📊 **${product1.name}** vs **${product2.name}**\n\n`;
        allLabels.forEach(label => {
          const v1 = product1.specifications.find(s => s.label === label)?.value || '—';
          const v2 = product2.specifications.find(s => s.label === label)?.value || '—';
          comp += `• ${label}: ${v1} vs ${v2}\n`;
        });
        return {
          response: { id, role: 'bot', timestamp: Date.now(), text: comp, productCards: [toCard(product1), toCard(product2)], quickReplies: ['Comparar outros', 'Voltar ao início'] },
          newState: { flow: 'idle', step: 0, context: {} },
        };
      }
      return { response: { id, role: 'bot', timestamp: Date.now(), text: `Não encontrei "${text}". Tente outra referência.` }, newState: currentState };
    }
  }

  // === FLOW: FAQ ===
  if (currentState.flow === 'faq') {
    const matched = faqs.find(f => f.question === text || norm(f.question).includes(norm(text)));
    if (matched) {
      return { response: { id, role: 'bot', timestamp: Date.now(), text: matched.answer, quickReplies: ['Outra pergunta', 'Voltar ao início'] }, newState: { flow: 'faq', step: 1, context: {} } };
    }
    if (text === 'Outra pergunta') {
      return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Perguntas frequentes:', quickReplies: faqs.slice(0, 6).map(f => f.question) }, newState: { flow: 'faq', step: 1, context: {} } };
    }
  }

  // === IDLE: Detectar intenção e responder ===
  const intent = detectIntent(text);

  if (intent === 'greeting') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: `Olá! Sou o Assistente Teka Angola 🇦🇴\n\nTemos ${products.length} produtos disponíveis. Como posso ajudar?`, quickReplies: ['Encontrar Produto', 'Suporte Técnico', 'FAQ'] }, newState: { flow: 'idle', step: 0, context: {} } };
  }

  if (intent === 'thanks') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'De nada! Estou sempre disponível para ajudar. 😊', quickReplies: ['Encontrar Produto', 'Voltar ao início'] }, newState: { flow: 'idle', step: 0, context: {} } };
  }

  if (intent === 'price') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Os preços dos nossos produtos estão disponíveis para distribuidores e parceiros. Para obter um orçamento personalizado:\n\n📞 +244 933 302 752\n📧 teka@mdvmadeiras.com', quickReplies: ['Encontrar Produto', 'Ir para Contacto'] }, newState: { flow: 'idle', step: 0, context: {} } };
  }

  if (intent === 'contact') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Pode contactar-nos através de:\n\n📞 +244 933 302 752\n📧 teka@mdvmadeiras.com\n📍 Luanda, Angola\n\nDistribuidor oficial: MDV Madeiras e Derivados', quickReplies: ['Ir para Contacto', 'Voltar ao início'] }, newState: { flow: 'idle', step: 0, context: {} } };
  }

  if (intent === 'support') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Qual produto precisa de assistência? Introduza o nome ou referência.', quickReplies: ['Voltar ao início'] }, newState: { flow: 'support', step: 1, context: {} } };
  }

  if (intent === 'compare') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Indique o primeiro produto (nome ou referência).', quickReplies: ['Voltar ao início'] }, newState: { flow: 'compare', step: 1, context: {} } };
  }

  if (intent === 'faq') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Perguntas frequentes:', quickReplies: faqs.slice(0, 6).map(f => f.question) }, newState: { flow: 'faq', step: 1, context: {} } };
  }

  if (intent === 'simulator') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Temos um simulador de potência para ar condicionado! Pode aceder em:\n\n👉 /ar-condicionado/simulador\n\nCalcula a potência ideal (BTU) para o seu espaço e recomenda o modelo Teka AUREA adequado.', quickReplies: ['Encontrar Produto', 'Voltar ao início'] }, newState: { flow: 'idle', step: 0, context: {} } };
  }

  // Quick reply buttons
  if (text === 'Encontrar Produto') {
    const cats = Object.keys(CATEGORY_LABELS).filter(k => products.some(p => p.subcategory === k)).map(k => CATEGORY_LABELS[k]);
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Que tipo de produto procura?', quickReplies: cats.slice(0, 8) }, newState: { flow: 'find-product', step: 1, context: {} } };
  }

  if (text === 'Comparar Produtos') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Indique o primeiro produto (nome ou referência).' }, newState: { flow: 'compare', step: 1, context: {} } };
  }

  if (text === 'FAQ') {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Perguntas frequentes:', quickReplies: faqs.slice(0, 6).map(f => f.question) }, newState: { flow: 'faq', step: 1, context: {} } };
  }

  if (text === 'Suporte Técnico' || norm(text) === norm('Suporte Técnico')) {
    return { response: { id, role: 'bot', timestamp: Date.now(), text: 'Qual produto precisa de assistência? Introduza a referência ou nome.' }, newState: { flow: 'support', step: 1, context: {} } };
  }

  // === FALLBACK: Smart search (only if intent suggests product search) ===
  // Skip search for very short/generic messages that aren't product-related
  const nt = norm(text);
  const isGenericMsg = nt.length < 4 ||
    /^(sim|nao|ok|talvez|hmm|lol|haha|bla|xxx|zzz|abc|nada|teste|oi|ei|hey|boa|boas|viva|\.\.\.|!!!)$/i.test(text.trim());
  const isOffTopic = /(piada|musica|cantar|futebol|benfica|sporting|covid|guerra|politica|religiao|bitcoin|iphone|samsung|bosch|whirlpool|electrolux|hotel|voo|carro|moto|restaurante|tempo|capital|presidente|sentido da vida|triste|feliz|gatos|pizza)/.test(nt);
  const results = (isGenericMsg || isOffTopic) ? [] : smartSearch(text);
  if (results.length > 0) {
    const catLabel = CATEGORY_LABELS[results[0].subcategory] || '';
    return {
      response: { id, role: 'bot', timestamp: Date.now(), text: `Encontrei ${results.length} resultado${results.length > 1 ? 's' : ''} em ${catLabel}:`, productCards: results, quickReplies: ['Ver mais', 'Encontrar Produto', 'Voltar ao início'] },
      newState: { flow: 'idle', step: 0, context: { lastCategory: results[0].subcategory, lastQuery: text } },
    };
  }

  return {
    response: { id, role: 'bot', timestamp: Date.now(), text: `Não encontrei resultados para "${text}". Pode tentar:\n\n• Nome de um produto (ex: "fornos")\n• Referência (ex: "HLB 8600")\n• Categoria (ex: "exaustores")\n\nOu use os botões abaixo:`, quickReplies: ['Encontrar Produto', 'Suporte Técnico', 'FAQ'] },
    newState: { flow: 'idle', step: 0, context: {} },
  };
}
