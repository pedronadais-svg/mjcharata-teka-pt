#!/bin/bash
# 500 testes exaustivos do chatbot Teka
# Testa: categorias, sinónimos, erros ortográficos, linguagem natural, anti-alucinação

API="http://localhost:3000/api/chat"
PASS=0
FAIL=0
TOTAL=0

send() {
  curl -s -X POST "$API" -H "Content-Type: application/json" \
    -d "{\"message\":\"$1\",\"state\":{\"flow\":\"idle\",\"step\":0,\"context\":{}}}" 2>/dev/null
}

# expect: cards=yes/no, category slug (optional)
t() {
  local msg="$1"
  local expect_cards="$2"  # yes | no
  local expect_cat="$3"    # category slug or empty
  TOTAL=$((TOTAL+1))

  local result=$(send "$msg")
  local has_cards=$(echo "$result" | grep -c '"productCards":\[{')
  local cat=$(echo "$result" | grep -o '"subcategory":"[^"]*"' | head -1 | sed 's/"subcategory":"//;s/"//')

  local ok=true
  if [ "$expect_cards" = "yes" ] && [ "$has_cards" -eq 0 ]; then ok=false; fi
  if [ "$expect_cards" = "no" ] && [ "$has_cards" -gt 0 ]; then ok=false; fi
  if [ -n "$expect_cat" ] && [ "$has_cards" -gt 0 ] && [ "$cat" != "$expect_cat" ]; then ok=false; fi

  if $ok; then
    PASS=$((PASS+1))
  else
    echo "  FAIL [$TOTAL] \"$msg\" cards=$has_cards cat=$cat (expected cards=$expect_cards cat=$expect_cat)"
    FAIL=$((FAIL+1))
  fi
}

echo "============================================"
echo "  500 TESTES DO CHATBOT TEKA"
echo "============================================"
echo ""

# ==========================================
# FORNOS (50 testes)
# ==========================================
echo "--- FORNOS ---"
t "fornos" yes fornos
t "forno" yes fornos
t "fornos teka" yes fornos
t "tens fornos?" yes fornos
t "que fornos tens" yes fornos
t "quero ver fornos" yes fornos
t "mostrar fornos" yes fornos
t "ver fornos" yes fornos
t "fornos piroliticos" yes fornos
t "forno pirolitico" yes fornos
t "forno multifuncoes" yes fornos
t "forno vapor" yes fornos
t "forno encastrar" yes fornos
t "fornos de encastrar" yes fornos
t "forno encastre" yes fornos
t "fogao" yes fornos
t "fogoes" yes fornos
t "fogao de encastrar" yes fornos
t "tens fogoes?" yes fornos
t "que fogoes vendem?" yes fornos
t "quero comprar um forno" yes fornos
t "preciso de um forno" yes fornos
t "forno eletrico" yes fornos
# erros ortográficos
t "fornoss" yes fornos
t "fornu" no ""
t "formos" no ""
t "frnos" no ""
t "pirolitico" yes fornos
t "pirolítico" yes fornos
t "fogao encastre" yes fornos
t "assar" yes fornos
# referências
t "HLB 8600" yes fornos
t "Van Gogh forno" yes fornos
t "steakmaster" yes ""
t "forno infinity" yes fornos
t "111000096" yes fornos
# variações
t "um bom forno para a cozinha" yes fornos
t "quero um forno bom" yes fornos
t "forno de cozinha" yes fornos
t "gostaria de ver os fornos" yes fornos
t "voces tem fornos?" yes fornos
t "Ha fornos disponiveis?" yes fornos
t "que tipos de fornos existem?" yes fornos
t "forno pirolise" no ""
t "forno grill" yes fornos
t "forno com vapor" yes fornos
t "forno a gas" no ""
t "forno compacto" yes fornos
t "forno grande" yes fornos
t "fornos baratos" yes fornos
t "fornos premium" yes fornos

# ==========================================
# MICRO-ONDAS (30 testes)
# ==========================================
echo "--- MICRO-ONDAS ---"
t "micro-ondas" yes micro-ondas
t "microondas" yes micro-ondas
t "micro ondas" yes micro-ondas
t "microonda" yes micro-ondas
t "tens microondas?" yes micro-ondas
t "quero um micro-ondas" yes micro-ondas
t "micro ondas encastrar" yes micro-ondas
t "micro-ondas integracao" yes micro-ondas
t "microondas teka" yes micro-ondas
t "micro-ondas grill" yes micro-ondas
t "micro ondas 22 litros" yes micro-ondas
# erros
t "microndas" no ""
t "micorondas" no ""
t "micro-onda" yes micro-ondas
t "mikro ondas" no ""
# variações
t "preciso de um microondas" yes micro-ondas
t "microondas de encastrar" yes micro-ondas
t "microondas livre instalacao" yes micro-ondas
t "microondas baixo bancada" yes micro-ondas
t "quero comprar microondas" yes micro-ondas
t "ha microondas?" yes micro-ondas
t "microondas com grill" yes micro-ondas
t "microondas ceramica" yes micro-ondas
t "microondas pequeno" yes micro-ondas
t "microondas grande" yes micro-ondas
t "microondas barato" yes micro-ondas
t "microondas preto" yes micro-ondas
t "microondas inox" yes micro-ondas
t "ML 82" yes micro-ondas
t "micro-ondas van gogh" yes micro-ondas

# ==========================================
# PLACAS (30 testes)
# ==========================================
echo "--- PLACAS ---"
t "placas" yes placas
t "placa" yes placas
t "placa inducao" yes placas
t "placa indução" yes placas
t "placa de inducao" yes placas
t "vitroceramica" yes placas
t "vitrocerâmica" yes placas
t "placa gas" yes placas
t "placa a gas" yes placas
t "cooktop" yes placas
t "placas de cozinha" yes placas
t "placa eletrica" yes placas
t "placa encastrar" yes placas
t "tens placas?" yes placas
t "quero uma placa" yes placas
t "placa 4 bicos" yes ""
t "placa 5 zonas" yes ""
t "placa mista" yes placas
t "fogao encastre placa" yes placas
# erros
t "placs" no ""
t "plaka" no ""
t "induccao" no ""
# variações
t "preciso de uma placa" yes placas
t "placa para cozinha" yes placas
t "quero comprar placa" yes placas
t "IBF 95" yes placas
t "placa van gogh" yes placas
t "placa preta" yes placas
t "placa inox" yes placas
t "placa grande" yes placas

# ==========================================
# EXAUSTORES (30 testes)
# ==========================================
echo "--- EXAUSTORES ---"
t "exaustores" yes exaustores
t "exaustor" yes exaustores
t "hotte" yes exaustores
t "chamine" yes exaustores
t "chaminé" yes exaustores
t "extractor" yes exaustores
t "aspiracao" yes exaustores
t "exaustor decorativo" yes exaustores
t "exaustor tecto" yes exaustores
t "exaustor teto" yes exaustores
t "exaustor integrado" yes exaustores
t "exaustor parede" yes exaustores
t "tens exaustores?" yes exaustores
t "quero um exaustor" yes exaustores
t "exaustor para cozinha" yes exaustores
# erros
t "exautor" no ""
t "exostores" no ""
t "exhoustor" no ""
# variações
t "preciso de um exaustor" yes exaustores
t "DVT 98" yes exaustores
t "exaustor silencioso" yes exaustores
t "exaustor preto" yes exaustores
t "exaustor inox" yes exaustores
t "exaustor grande" yes exaustores
t "exaustor 90cm" yes exaustores
t "exaustor telescopico" yes exaustores
t "exaustor ilha" yes exaustores
t "exaustor bancada" yes exaustores
t "exaustor van gogh" yes exaustores
t "exaustor 60cm" yes exaustores

# ==========================================
# FRIGORÍFICOS (30 testes)
# ==========================================
echo "--- FRIGORIFICOS ---"
t "frigorificos" yes frigorificos
t "frigorifico" yes frigorificos
t "frigoríficos" yes frigorificos
t "geleira" yes frigorificos
t "geladeira" yes frigorificos
t "congelador" yes frigorificos
t "combinado" yes frigorificos
t "side by side" yes frigorificos
t "americano" yes frigorificos
t "arca" yes frigorificos
t "arca congeladora" yes frigorificos
t "tens frigorificos?" yes frigorificos
t "quero um frigorifico" yes frigorificos
# erros
t "frigorifico" yes frigorificos
t "frigorfico" no ""
t "frijorífico" no ""
# variações
t "frigorifico encastre" yes frigorificos
t "frigorifico grande" yes frigorificos
t "frigorifico americano" yes frigorificos
t "frigorifico inox" yes frigorificos
t "frigorifico preto" yes frigorificos
t "no frost" yes frigorificos
t "RLF 85950" yes frigorificos
t "RBF 78785" yes frigorificos
t "frigorifico lado a lado" yes frigorificos
t "frigorifico 2 portas" yes frigorificos
t "frigorifico combinado" yes frigorificos
t "frigorifico encastrar" yes frigorificos
t "quero comprar frigorifico" yes frigorificos
t "preciso de um frigorifico" yes frigorificos

# ==========================================
# LAVA-LOUÇAS (20 testes)
# ==========================================
echo "--- LAVA-LOUCAS ---"
t "lava louca" yes lava-loucas
t "lava-louça" yes lava-loucas
t "lava louças" yes lava-loucas
t "pia cozinha" yes lava-loucas
t "bacia cozinha" yes lava-loucas
t "cuba" yes lava-loucas
t "sink" yes lava-loucas
t "lava-loucas inox" yes lava-loucas
t "lava louca aço" yes lava-loucas
t "tens lava-loucas?" yes lava-loucas
t "quero um lava louça" yes lava-loucas
t "lava louca encastrar" yes lava-loucas
t "lava louça 2 bacias" yes lava-loucas
t "lava louça grande" yes lava-loucas
t "lava louca sintetico" yes lava-loucas
t "lava louça inox" yes lava-loucas
t "lava louca preto" yes lava-loucas
t "lava louca vidro" yes lava-loucas
t "quero comprar lava-louça" yes lava-loucas
t "preciso de um lava-louça" yes lava-loucas

# ==========================================
# MÁQUINAS LAVAR LOUÇA (20 testes)
# ==========================================
echo "--- MAQ LAVAR LOUCA ---"
t "maquina lavar louca" yes maquinas-de-lavar-louca
t "maquina de lavar louça" yes maquinas-de-lavar-louca
t "maquinas de lavar louca" yes maquinas-de-lavar-louca
t "lavar pratos" yes maquinas-de-lavar-louca
t "dishwasher" yes maquinas-de-lavar-louca
t "lavar louça" yes maquinas-de-lavar-louca
t "tens maquina de lavar louça?" yes maquinas-de-lavar-louca
t "quero maquina de lavar louca" yes maquinas-de-lavar-louca
t "maquina louca encastrar" yes maquinas-de-lavar-louca
t "maquina louca 60cm" yes ""
t "DFI 86850" yes maquinas-de-lavar-louca
t "maquina louca integracao" yes maquinas-de-lavar-louca
t "maquina louca livre" yes maquinas-de-lavar-louca
t "maquina louca compacta" yes maquinas-de-lavar-louca
t "maquina louca silenciosa" yes ""
t "maquina louca inox" yes ""
t "preciso maquina lavar louça" yes maquinas-de-lavar-louca
t "quero comprar maquina louca" yes maquinas-de-lavar-louca
t "ha maquinas de lavar louca?" yes maquinas-de-lavar-louca
t "maquina louca teka" yes maquinas-de-lavar-louca

# ==========================================
# MISTURADORAS (20 testes)
# ==========================================
echo "--- MISTURADORAS ---"
t "misturadoras" yes misturadoras-de-cozinha
t "misturadora" yes misturadoras-de-cozinha
t "torneira" yes misturadoras-de-cozinha
t "torneiras" yes misturadoras-de-cozinha
t "grifo" yes misturadoras-de-cozinha
t "bica" yes misturadoras-de-cozinha
t "torneira cozinha" yes misturadoras-de-cozinha
t "misturadora cozinha" yes misturadoras-de-cozinha
t "tens torneiras?" yes misturadoras-de-cozinha
t "quero uma torneira" yes misturadoras-de-cozinha
t "torneira inox" yes misturadoras-de-cozinha
t "torneira preta" yes misturadoras-de-cozinha
t "torneira profissional" yes misturadoras-de-cozinha
t "torneira alta" yes misturadoras-de-cozinha
t "torneira baixa" yes misturadoras-de-cozinha
t "ICC 915" yes misturadoras-de-cozinha
t "preciso de uma torneira" yes misturadoras-de-cozinha
t "quero comprar torneira" yes misturadoras-de-cozinha
t "torneira mural" yes misturadoras-de-cozinha
t "torneira dourada" yes misturadoras-de-cozinha

# ==========================================
# LAVANDARIA (20 testes)
# ==========================================
echo "--- LAVANDARIA ---"
t "lavar roupa" yes maquinas-lavar-roupa
t "maquina de lavar roupa" yes maquinas-lavar-roupa
t "maquina lavar roupa" yes maquinas-lavar-roupa
t "maquina de lavar" yes maquinas-lavar-roupa
t "lavandaria" yes maquinas-lavar-roupa
t "tens maquinas de lavar?" yes maquinas-lavar-roupa
t "quero maquina lavar roupa" yes maquinas-lavar-roupa
t "maquina lavar 8kg" yes ""
t "maquina lavar 10kg" yes ""
t "lavar e secar" yes maquinas-lavar-secar
t "maquina secar" yes maquinas-secar
t "secadora" yes maquinas-secar
t "secador roupa" yes maquinas-secar
t "secar roupa" yes maquinas-secar
t "maquina 2 em 1" yes maquinas-lavar-secar
t "maquina lavar secar" yes maquinas-lavar-secar
t "preciso maquina lavar roupa" yes maquinas-lavar-roupa
t "quero comprar maquina lavar" yes maquinas-lavar-roupa
t "ha maquinas de lavar?" yes maquinas-lavar-roupa
t "WMK 81050" yes maquinas-lavar-roupa

# ==========================================
# AR CONDICIONADO (25 testes)
# ==========================================
echo "--- AR CONDICIONADO ---"
t "ar condicionado" yes mono-split
t "ar-condicionado" yes mono-split
t "split" yes mono-split
t "mono-split" yes mono-split
t "mono split" yes mono-split
t "aurea" yes mono-split
t "climatizacao" yes mono-split
t "tens ar condicionado?" yes mono-split
t "quero ar condicionado" yes mono-split
t "ac" yes mono-split
t "multi-split" yes multi-split
t "multisplit" yes multi-split
t "multi split" yes multi-split
t "TKGPA-09HFN8" yes mono-split
t "TKO-12HFN8" yes mono-split
t "9000 btu" yes mono-split
t "12000 btu" yes mono-split
t "ar condicionado 9000" yes mono-split
t "quero comprar ar condicionado" yes mono-split
t "preciso de ar condicionado" yes mono-split
t "ha ar condicionado?" yes mono-split
t "ar condicionado quarto" yes mono-split
t "ar condicionado sala" yes mono-split
t "ar condicionado barato" yes mono-split
t "ar condicionado teka" yes mono-split

# ==========================================
# TERMOACUMULADORES (15 testes)
# ==========================================
echo "--- TERMOACUMULADORES ---"
t "termoacumuladores" yes termoacumuladores
t "termoacumulador" yes termoacumuladores
t "agua quente" yes termoacumuladores
t "cilindro" yes termoacumuladores
t "esquentador" yes termoacumuladores
t "tens termoacumuladores?" yes termoacumuladores
t "quero termoacumulador" yes termoacumuladores
t "termoacumulador 80 litros" yes ""
t "termoacumulador eletrico" yes termoacumuladores
t "preciso de agua quente" yes termoacumuladores
t "aquecer agua" yes ""
t "termoacumulador teka" yes termoacumuladores
t "quero comprar termoacumulador" yes termoacumuladores
t "ha termoacumuladores?" yes termoacumuladores
t "termoacumulador grande" yes termoacumuladores

# ==========================================
# MÁQUINAS DE CAFÉ (15 testes)
# ==========================================
echo "--- MAQUINAS CAFE ---"
t "cafe" yes maquina-de-cafe
t "maquina cafe" yes maquina-de-cafe
t "maquina de cafe" yes maquina-de-cafe
t "cafeteira" yes maquina-de-cafe
t "expresso" yes maquina-de-cafe
t "cappuccino" yes maquina-de-cafe
t "tens maquinas de cafe?" yes maquina-de-cafe
t "quero maquina cafe" yes maquina-de-cafe
t "maquina cafe encastrar" yes maquina-de-cafe
t "CLC 855" yes maquina-de-cafe
t "CLC 8350" yes maquina-de-cafe
t "maquina cafe teka" yes maquina-de-cafe
t "quero comprar maquina cafe" yes maquina-de-cafe
t "preciso de maquina cafe" yes maquina-de-cafe
t "ha maquinas de cafe?" yes maquina-de-cafe

# ==========================================
# ACESSÓRIOS (10 testes)
# ==========================================
echo "--- ACESSORIOS ---"
t "acessorios" yes acessorios-de-cozinha
t "acessorios cozinha" yes acessorios-de-cozinha
t "complementos" yes acessorios-de-cozinha
t "tens acessorios?" yes acessorios-de-cozinha
t "quero acessorios" yes acessorios-de-cozinha
t "acessorios teka" yes acessorios-de-cozinha
t "complementos cozinha" yes acessorios-de-cozinha
t "grelha forno" yes ""
t "filtro exaustor" yes ""
t "bandeja forno" yes ""

# ==========================================
# SAUDAÇÕES (15 testes)
# ==========================================
echo "--- SAUDACOES ---"
t "ola" no ""
t "bom dia" no ""
t "boa tarde" no ""
t "boa noite" no ""
t "hey" no ""
t "oi" no ""
t "hello" no ""
t "ola tudo bem?" no ""
t "bom dia como posso ser ajudado?" no ""
t "ola preciso de ajuda" no ""
t "boas" no ""
t "boa" no ""
t "ei" no ""
t "viva" no ""
t "olá" no ""

# ==========================================
# PREÇOS (15 testes)
# ==========================================
echo "--- PRECOS ---"
t "quanto custa?" no ""
t "quanto custa um forno?" no ""
t "qual o valor?" no ""
t "preco" no ""
t "precos" no ""
t "orcamento" no ""
t "quanto custa o ar condicionado?" no ""
t "quanto custa a placa?" no ""
t "quanto custa o frigorifico?" no ""
t "kwanzas" no ""
t "qual o preco do forno?" no ""
t "valores dos produtos" no ""
t "tabela de precos" no ""
t "lista de precos" no ""
t "quanto vale?" no ""

# ==========================================
# CONTACTO (15 testes)
# ==========================================
echo "--- CONTACTO ---"
t "contacto" no ""
t "telefone" no ""
t "email" no ""
t "morada" no ""
t "onde fica a loja?" no ""
t "falar com humano" no ""
t "quero ligar" no ""
t "numero de telefone" no ""
t "endereco" no ""
t "como contactar?" no ""
t "onde comprar?" no ""
t "quero falar com alguem" no ""
t "atendimento" no ""
t "horario" no ""
t "como chegar?" no ""

# ==========================================
# SUPORTE (15 testes)
# ==========================================
echo "--- SUPORTE ---"
t "avaria" no ""
t "nao funciona" no ""
t "o forno avariou" no ""
t "o frigorifico nao liga" no ""
t "problema com produto" no ""
t "defeito" no ""
t "assistencia tecnica" no ""
t "reparacao" no ""
t "garantia" no ""
t "o exaustor faz barulho" no ""
t "erro no display" no ""
t "fuga de agua" no ""
t "suporte" no ""
t "assistencia" no ""
t "preciso de suporte" no ""

# ==========================================
# SIMULADOR (10 testes)
# ==========================================
echo "--- SIMULADOR ---"
t "simulador" no ""
t "calcular btu" no ""
t "simular potencia" no ""
t "que modelo de ar condicionado?" no ""
t "qual ac para sala 20m2?" no ""
t "potencia ar condicionado" no ""
t "quantos btu preciso?" no ""
t "simulador ar condicionado" no ""
t "calculadora btu" no ""
t "dimensionar ac" no ""

# ==========================================
# AGRADECIMENTOS (10 testes)
# ==========================================
echo "--- AGRADECIMENTOS ---"
t "obrigado" no ""
t "obrigada" no ""
t "obrigado pela ajuda" no ""
t "valeu" no ""
t "agradeco" no ""
t "muito obrigado" no ""
t "thanks" no ""
t "obrigada pela informacao" no ""
t "agradecido" no ""
t "obrigadissimo" no ""

# ==========================================
# ANTI-ALUCINAÇÃO (50 testes)
# ==========================================
echo "--- ANTI-ALUCINACAO ---"
t "sao on/off?" no ""
t "bla bla bla" no ""
t "xxx" no ""
t "teste 123" no ""
t "como esta o tempo?" no ""
t "quem es tu?" no ""
t "1+1" no ""
t "asdfghjkl" no ""
t "!!!" no ""
t "..." no ""
t "abc" no ""
t "zzz" no ""
t "nada" no ""
t "sim" no ""
t "nao" no ""
t "ok" no ""
t "talvez" no ""
t "hmm" no ""
t "lol" no ""
t "haha" no ""
t "que horas sao?" no ""
t "qual a capital de angola?" no ""
t "canta uma musica" no ""
t "conta uma piada" no ""
t "quem e o presidente?" no ""
t "qual o sentido da vida?" no ""
t "estou triste" no ""
t "estou feliz" no ""
t "gosto de gatos" no ""
t "futebol" no ""
t "benfica" no ""
t "sporting" no ""
t "covid" no ""
t "guerra" no ""
t "politica" no ""
t "religiao" no ""
t "dinheiro" no ""
t "bitcoin" no ""
t "iphone" no ""
t "samsung" no ""
t "bosch" no ""
t "samsung frigorifico" no ""
t "whirlpool" no ""
t "electrolux" no ""
t "pizza" no ""
t "restaurante" no ""
t "hotel" no ""
t "voo" no ""
t "carro" no ""
t "moto" no ""

# ==========================================
# QUICK REPLIES (10 testes)
# ==========================================
echo "--- QUICK REPLIES ---"
t "Encontrar Produto" no ""
t "Suporte Tecnico" no ""
t "FAQ" no ""
t "Comparar Produtos" no ""
t "Voltar ao inicio" no ""
t "Pesquisar outro" no ""
t "Ir para Contacto" no ""
t "Outra pergunta" no ""
t "Sim, resolveu!" no ""
t "Nao, preciso de assistencia" no ""

echo ""
echo "============================================"
echo "  RESULTADOS: $PASS/$TOTAL passed, $FAIL failed"
echo "  Taxa de sucesso: $(( PASS * 100 / TOTAL ))%"
echo "============================================"
