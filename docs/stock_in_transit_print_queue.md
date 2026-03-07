# stock_in_transit_print_queue

## Objetivo

Criar uma fila persistente de impressão para evitar gravar diretamente em `stock_in_transit` antes da confirmação de que a etiqueta foi realmente impressa.

Esse fluxo resolve o problema:

- hoje, se o registro for salvo antes e a impressão falhar, o sistema fica com um item "válido" sem etiqueta física
- com uma fila intermediária, o item só entra em `stock_in_transit` após sucesso real da impressão

## Princípio

`stock_in_transit_print_queue` deve ser uma tabela normal do banco, persistente, e não uma tabela temporária nativa do Postgres.

Ela funciona como staging:

1. o usuário preenche os dados da etiqueta
2. o sistema cria um item na fila
3. o sistema tenta imprimir
4. se imprimir com sucesso, promove o item para `stock_in_transit`
5. se falhar, mantém o item na fila com status de erro ou pendência

## Nome sugerido

`stock_in_transit_print_queue`

## Colunas sugeridas

### Identificação

- `id`
  - `uuid`
  - chave primária

- `organization_id`
  - `uuid`
  - obrigatório
  - FK para organização

- `created_by`
  - `text` ou `uuid`, conforme padrão atual do projeto
  - obrigatório
  - usuário que iniciou a impressão

## Dados do item

- `product_id`
  - `integer`
  - opcional se existir fluxo com preparação digitada sem produto base
  - FK para produto

- `label_type`
  - `text`
  - obrigatório
  - valores sugeridos:
    - `opened_product`
    - `sample`
    - `thawing`
    - `manipulated`

- `quantity`
  - `numeric` ou tipo já usado em `stock_in_transit`
  - obrigatório

- `unit_of_measure_code`
  - `text`
  - obrigatório

- `manufacturing_date`
  - `timestamptz`
  - opcional

- `expiry_date`
  - `timestamptz`
  - opcional

- `observations`
  - `text`
  - opcional

## Payload da etiqueta

- `print_payload`
  - `jsonb`
  - obrigatório
  - deve guardar exatamente os dados usados para montar a etiqueta

Exemplos do que entra aqui:

- para `opened_product`
  - nome do produto
  - data/hora de abertura
  - validade original
  - validade após abertura
  - conservação
  - responsável

- para `sample`
  - nome da preparação/amostra
  - coleta
  - descarte
  - turno
  - quantidade/unidade
  - responsável

- para `thawing`
  - produto
  - início
  - fim
  - lote
  - quantidade/unidade
  - responsável

- para `manipulated`
  - preparação
  - fabricação
  - validade
  - conservação
  - quantidade/unidade
  - responsável

## Controle de impressão

- `printer_name`
  - `text`
  - opcional, mas recomendado

- `label_copies`
  - `integer`
  - obrigatório
  - default `1`

- `status`
  - `text`
  - obrigatório
  - valores recomendados:
    - `pending`
    - `printing`
    - `printed`
    - `failed`
    - `cancelled`
    - `promoted`

- `attempt_count`
  - `integer`
  - obrigatório
  - default `0`

- `last_error`
  - `text`
  - opcional

- `printed_at`
  - `timestamptz`
  - opcional

- `promoted_at`
  - `timestamptz`
  - opcional

## Relação com o registro final

- `stock_in_transit_id`
  - `uuid`
  - opcional
  - FK para `stock_in_transit`
  - só é preenchido depois da promoção com sucesso

## Auditoria

- `created_at`
  - `timestamptz`
  - obrigatório

- `updated_at`
  - `timestamptz`
  - obrigatório

## Índices recomendados

- índice por `organization_id`
- índice por `status`
- índice composto por `organization_id, status`
- índice por `created_at desc`
- índice por `stock_in_transit_id`

## Fluxo recomendado

### 1. Criar item na fila

Ao clicar em imprimir:

1. validar o formulário
2. montar o payload da etiqueta
3. criar um registro em `stock_in_transit_print_queue` com:
   - `status = pending`
   - `attempt_count = 0`
   - `print_payload`
   - dados de item

### 2. Travar para processamento

Antes de mandar imprimir:

1. atualizar o item para `status = printing`
2. incrementar `attempt_count`

Isso evita ambiguidade se houver reenvio ou clique duplicado.

### 3. Tentar imprimir

O sistema chama o fluxo atual de impressão usando os dados armazenados na fila.

### 4. Se imprimir com sucesso

1. atualizar a fila para:
   - `status = printed`
   - `printed_at = now()`
2. criar o item real em `stock_in_transit`
3. atualizar a fila para:
   - `status = promoted`
   - `stock_in_transit_id = id criado`
   - `promoted_at = now()`

## 5. Se a impressão falhar

Atualizar a fila para:

- `status = failed`
- `last_error = mensagem do erro`

Nesse cenário:

- nada é criado em `stock_in_transit`
- o usuário pode tentar `reimprimir`
- ou cancelar a pendência

## Reimpressão

Uma reimpressão deve reutilizar o mesmo item da fila.

Fluxo sugerido:

1. buscar item `failed` ou `pending`
2. atualizar para `printing`
3. tentar imprimir novamente
4. se sucesso, promover para `stock_in_transit`

## Cancelamento

Se o usuário desistir:

- atualizar `status = cancelled`
- manter histórico
- não apagar o registro

Evitar `delete` físico, porque isso apaga rastreabilidade operacional.

## QR Code

Se no futuro a etiqueta tiver QR Code apontando para o item real:

- o QR só deve ser gerado após a promoção para `stock_in_transit`
- por isso o fluxo ideal é:
  1. imprimir rascunho sem QR permanente, ou
  2. gerar o QR somente depois de existir `stock_in_transit_id`, ou
  3. usar um token da fila que depois redireciona para o item final

Se quiser simplicidade inicial, não acoplar QR nesta primeira etapa da fila.

## API sugerida

### Criar pendência

`POST /api/stock-in-transit-print-queue`

Cria item com `status = pending`

### Executar impressão

`POST /api/stock-in-transit-print-queue/:id/print`

Responsável por:

1. marcar `printing`
2. tentar imprimir
3. se sucesso, criar `stock_in_transit`
4. marcar `promoted`

### Reimprimir

`POST /api/stock-in-transit-print-queue/:id/retry`

### Cancelar

`POST /api/stock-in-transit-print-queue/:id/cancel`

### Listar pendências

`GET /api/stock-in-transit-print-queue?organizationId=...&status=...`

## Regra de negócio sugerida

O estoque oficial só deve conter itens que passaram por impressão com sucesso.

Ou seja:

- `stock_in_transit_print_queue` = intenção / tentativa / fila
- `stock_in_transit` = item operacional válido

## Vantagens dessa abordagem

- evita registro inválido quando a impressora falha
- mantém histórico de falha e reprocessamento
- facilita botão de reimpressão
- facilita auditoria
- reduz necessidade de rollback frágil

## Desvantagens

- aumenta complexidade do fluxo
- exige nova tabela, rotas, service e promoção transacional
- exige cuidado para evitar dupla promoção

## Implementação mínima recomendada

Se quiser fazer a menor versão possível:

1. criar tabela com:
   - `id`
   - `organization_id`
   - `created_by`
   - `product_id`
   - `label_type`
   - `quantity`
   - `unit_of_measure_code`
   - `manufacturing_date`
   - `expiry_date`
   - `observations`
   - `print_payload`
   - `printer_name`
   - `label_copies`
   - `status`
   - `attempt_count`
   - `last_error`
   - `stock_in_transit_id`
   - `created_at`
   - `updated_at`

2. fluxo:
   - cria fila
   - tenta imprimir
   - se sucesso, cria `stock_in_transit`
   - se falha, fica em `failed`

3. adicionar tela simples de pendências com:
   - status
   - erro
   - botão reimprimir
   - botão cancelar

## Recomendação final

Não usar tabela temporária nativa do Postgres para isso.

Usar tabela persistente de staging é a solução correta para o domínio.
