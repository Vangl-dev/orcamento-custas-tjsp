# ⚖ Orçamento de Custas TJSP

Ferramenta para estimativa operacional de custas processuais, atos citatórios e preparo recursal no âmbito do Tribunal de Justiça do Estado de São Paulo.

## Funcionalidades

### Custas Iniciais

- Cobrança
- Execução de título extrajudicial
- Cumprimento de sentença
- Inventário e Partilha
- Ação Penal Privada
- Alimentos

### Atos Citatórios

- Citações postais
- Oficiais de justiça
- Modalidades de diligência

### Recursos

- Embargos de Declaração
- Agravo de Instrumento
- Apelação

### Correção monetária e juros

- Correção pela Tabela Prática do TJSP (publicada pela AASP)
- Juros legais: CC/1916 (6% a.a.), CC/2002 (12% a.a.) e Taxa Legal do art. 406 do CC (BCB, série SGS 29543)
- Texto pronto para a petição

### Extras

- Exportação para PDF
- Configurações persistentes
- Parâmetros editáveis
- Atualização automática baseada na UFESP configurada

---

## Atualização dos dados

A Tabela Prática e a Taxa Legal são atualizadas sozinhas pelo GitHub
(`.github/workflows/atualizar-dados.yml`):

- todo dia, às 8h de Brasília, o GitHub consulta a AASP e o Banco Central;
- se houver mês novo, grava `public/data/correction-table.json` e
  `public/data/taxa-legal.json`, faz o commit e publica o site;
- se a página da AASP mudar de formato, ou se algum mês já publicado tiver
  valor diferente, a atualização para e o GitHub manda e-mail avisando. Nada é
  publicado até alguém conferir.

O site também consulta o Banco Central direto ao abrir, então uma Taxa Legal
publicada depois da última atualização já entra no cálculo.

Para rodar na hora: aba **Actions** do GitHub → "Atualizar Tabela Prática e
Taxa Legal" → **Run workflow**. Ou localmente: `npm run atualizar-dados`.

Valores fixos (UFESP, salário mínimo, diligências) ficam em
`src/data/appSettings.ts`. Ao mudar algum, mude também `DEFAULTS_VERSION`
para que quem já usou a ferramenta receba os valores novos.

---

## Tecnologias

- React
- TypeScript
- Vite
- jsPDF

---

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Testes

```bash
npm test
```

## Build de Produção

```bash
npm run build
```

---

## Aviso

Esta aplicação possui finalidade de apoio operacional.

Os resultados apresentados constituem estimativas e devem ser conferidos com:

- legislação vigente;
- Provimentos do Tribunal de Justiça de São Paulo;
- tabelas oficiais aplicáveis ao período do recolhimento.

O usuário permanece responsável pela validação final dos valores.

---

## Status

Versão inicial funcional.

Projeto em desenvolvimento contínuo.