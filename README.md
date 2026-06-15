# Pro Limpee | Landing page

Landing page da **Pro Limpee**, especializada em limpeza, conservacao e
higienizacao de vidros para ambientes residenciais, comerciais e prediais.
Slogan: *Excelencia em transparencia*.

Site no ar: https://prolimpee-vidros.netlify.app

## Stack

- **Vite** (build e dev server)
- **Three.js** (cena 3D de vidro refrativo que reage ao scroll, com bloom)
- **GSAP + ScrollTrigger** (reveals e a secao "Como funciona" em scroll horizontal preso)
- **Supabase** (tabela `leads`, recebe os pedidos do formulario de orcamento)
- **CSS nativo** (tema dark glass, acento ciano da marca)

## Como rodar localmente

```bash
npm install
cp .env.example .env   # preencha com as chaves do Supabase
npm run dev            # http://localhost:5173
npm run build          # gera a pasta dist/
npm run preview        # serve o build de producao
```

## Configuracao

### Contato (telefone, WhatsApp, e-mail)
Tudo fica centralizado em [`src/config.js`](src/config.js). Edite ali o
numero de WhatsApp, telefone e e-mail. Todo o site le desse arquivo.

### Supabase
As chaves ficam no `.env` (nao versionado):

```
VITE_SUPABASE_URL=https://ojwqzmseggtsmscllrsh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

A tabela `leads` guarda: `nome`, `telefone`, `servico`, `mensagem`, `origem`,
`created_at`. Tem RLS ativo: o publico (anon) so pode inserir, e a leitura
exige usuario autenticado. Os leads aparecem no painel do Supabase em
Table Editor > leads.

Se o Supabase nao estiver configurado, o formulario cai no fallback de abrir
o WhatsApp com a mensagem ja preenchida.

## Deploy (Netlify)

O deploy ja esta configurado e ligado ao site `prolimpee-vidros`.

```bash
npm run build
netlify deploy --prod --dir dist
```

As variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` ja estao
cadastradas no Netlify para builds via CI.

## Imagens

As fotos das secoes Servicos, Diferenciais e Galeria usam placeholders
(picsum.photos) e devem ser trocadas pelas fotos reais dos trabalhos da
Pro Limpee (ex: as do Instagram @prolimpee). Basta substituir as URLs em
[`index.html`](index.html).
