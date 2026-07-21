#!/bin/bash
# Testes exaustivos do chatbot Teka
# Cada teste envia uma mensagem e verifica a resposta

API="http://localhost:3000/api/chat"
PASS=0
FAIL=0
TOTAL=0

test_chat() {
  local msg="$1"
  local expect_type="$2"  # cards | text | no-cards
  local expect_contains="$3"  # substring expected in text
  TOTAL=$((TOTAL+1))

  local body="{\"message\":\"$msg\",\"state\":{\"flow\":\"idle\",\"step\":0,\"context\":{}}}"
  local result=$(curl -s -X POST "$API" -H "Content-Type: application/json" -d "$body" 2>/dev/null)

  local has_cards=$(echo "$result" | grep -c '"productCards":\[{')
  local response_text=$(echo "$result" | sed 's/.*"text":"\([^"]*\)".*/\1/')

  local ok=true
  local reason=""

  # Check cards expectation
  if [ "$expect_type" = "cards" ] && [ "$has_cards" -eq 0 ]; then
    ok=false
    reason="Expected product cards but got none"
  fi
  if [ "$expect_type" = "no-cards" ] && [ "$has_cards" -gt 0 ]; then
    ok=false
    reason="Expected NO cards but got some"
  fi

  # Check text contains
  if [ -n "$expect_contains" ]; then
    if ! echo "$response_text" | grep -qi "$expect_contains"; then
      ok=false
      reason="Expected text to contain '$expect_contains' but got: ${response_text:0:60}"
    fi
  fi

  # Check for hallucinations: cards should match the query category
  if [ "$has_cards" -gt 0 ] && [ -n "$expect_contains" ]; then
    local card_cats=$(echo "$result" | grep -o '"subcategory":"[^"]*"' | sort -u)
    # This is informational, not a fail condition
  fi

  if $ok; then
    echo "  PASS  \"$msg\" -> ${response_text:0:60}..."
    PASS=$((PASS+1))
  else
    echo "  FAIL  \"$msg\" -> $reason"
    echo "         Response: ${response_text:0:80}"
    FAIL=$((FAIL+1))
  fi
}

echo "========================================"
echo "  TESTES DO CHATBOT TEKA"
echo "========================================"
echo ""

echo "--- SAUDACOES ---"
test_chat "ola" "no-cards" "Assistente Teka"
test_chat "bom dia" "no-cards" "Assistente"
test_chat "boa tarde" "no-cards" "Assistente"

echo ""
echo "--- AGRADECIMENTOS ---"
test_chat "obrigado" "no-cards" "nada"
test_chat "obrigada pela ajuda" "no-cards" "nada"

echo ""
echo "--- BUSCA POR CATEGORIA (deve encontrar produtos) ---"
test_chat "fornos" "cards" "Fornos"
test_chat "micro-ondas" "cards" "Micro"
test_chat "placas" "cards" "Placas"
test_chat "exaustores" "cards" "Exaustor"
test_chat "frigorificos" "cards" "Frigor"
test_chat "lavar roupa" "cards" "lavar roupa"
test_chat "torneiras" "cards" "Misturador"
test_chat "ar condicionado" "cards" "Condicionado"
test_chat "termoacumuladores" "cards" "Termoacumulador"
test_chat "maquina cafe" "cards" "cafe"
test_chat "lava louca" "cards" "louça"

echo ""
echo "--- LINGUAGEM NATURAL (deve encontrar produtos) ---"
test_chat "que fornos tens?" "cards" "Fornos"
test_chat "tens fogoes?" "cards" "Fornos"
test_chat "quero ver exaustores" "cards" "Exaustor"
test_chat "mostrar placas de inducao" "cards" "Placas"
test_chat "quero comprar um frigorifico" "cards" "Frigor"
test_chat "preciso de uma maquina de lavar" "cards" "lavar"

echo ""
echo "--- PRECOS E CONTACTO (sem cards) ---"
test_chat "quanto custa um forno?" "no-cards" "distribuidores"
test_chat "qual o valor?" "no-cards" "distribuidores"
test_chat "contacto" "no-cards" "933 302 752"
test_chat "telefone" "no-cards" "933 302 752"
test_chat "email" "no-cards" "teka@mdv"

echo ""
echo "--- SUPORTE (sem cards, entra em flow) ---"
test_chat "tenho um problema com o forno" "no-cards" "assistencia"
test_chat "o meu frigorifico avariou" "no-cards" "assistencia"

echo ""
echo "--- SIMULADOR ---"
test_chat "simulador" "no-cards" "simulador"
test_chat "que modelo de ar condicionado preciso" "no-cards" "simulador"
test_chat "calcular btu" "no-cards" "simulador"

echo ""
echo "--- ANTI-ALUCINACAO (nao deve encontrar nada) ---"
test_chat "sao on/off?" "no-cards" ""
test_chat "bla bla bla" "no-cards" ""
test_chat "xxx" "no-cards" ""
test_chat "teste 123" "no-cards" ""
test_chat "como esta o tempo?" "no-cards" ""
test_chat "quem es tu?" "no-cards" ""

echo ""
echo "--- QUICK REPLIES ---"
test_chat "Encontrar Produto" "no-cards" "tipo de produto"
test_chat "Suporte Tecnico" "no-cards" "assistencia"
test_chat "FAQ" "no-cards" "frequentes"
test_chat "Voltar ao inicio" "no-cards" "ajudar"

echo ""
echo "========================================"
echo "  RESULTADOS: $PASS/$TOTAL passed, $FAIL failed"
echo "========================================"
