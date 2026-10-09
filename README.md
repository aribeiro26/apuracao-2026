# Segundo turno 2026

Site público em Next.js que lê a divulgação oficial do TSE e acompanha **presidente** e **governador**.

O total exibido não é digitado. A página soma:

1. as seções dentro de cada município (isso o TSE já totaliza no arquivo da cidade);
2. os municípios do estado, um arquivo por cidade;
3. os estados e o exterior, no caso de presidente.

Enquanto o TSE não publicar o arquivo do 2º turno (códigos `6258` federal e `6260` estadual, votação em 25/10/2026), o site mostra o 1º turno só de quem segue na disputa e passa sozinho para o arquivo novo quando ele existir.

## Rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Docker

```bash
docker compose up --build
```

O site fica em `http://localhost:3000`. Para parar: `docker compose down`.

O container não publica as rotas de dados. O navegador chama server actions no próprio site, e um proxy na frente grava o IP real da ligação (o cliente não escolhe esse IP). Cada IP e o processo inteiro têm limite de pedidos e de chamadas ao mesmo tempo. Passou do limite, a página pede para esperar — um bot não consegue varrer o TSE por aqui.

Cada pedido grava uma linha JSON no stdout (`docker compose logs`), no esquema 5W: quem (IP, país, idioma), o quê (ação e sucesso ou falha), quando, onde (serviço e canal) e por quê. O campo `rastreio` é o mesmo id do cabeçalho `x-rastreio` e, se algo falhar, aparece na página. A URL com HTML é recusada e não entra no log. A página manda um Content-Security-Policy: script só com nonce, sem objeto embutido e sem frame.

`npm run conferir` soma os municípios do Acre e compara com o arquivo oficial do estado. Os dois números precisam ser iguais.

## Idioma e doação

O idioma inicial sai do país da ligação (`x-vercel-ip-country` na Vercel): Brasil, Portugal, Espanha ou inglês para o resto. Dá para trocar no seletor; a escolha fica num cookie.

O botão Doar pede um QR ao servidor. A chave PIX não aparece na página. Ela fica cifrada no código do servidor e só é aberta para montar a imagem.

## Publicar de graça na Vercel

Não uso Supabase: não há banco. A fonte é o TSE e o cache fica na própria Vercel, no plano gratuito.

```bash
npx vercel login
npx vercel deploy --prod
```

O plano Hobby limita cada função a cerca de 10 segundos. Por isso a soma municipal anda em lotes de 8 cidades. Não varra o Brasil inteiro de uma vez: são mais de 5 mil arquivos e isso sobrecarrega o TSE.

## Fonte

`https://resultados.tse.jus.br/oficial/comum/config/ele-c.json`

Este projeto não é do TSE e não faz projeção de voto.
