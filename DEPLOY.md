# Deploy em uma vez (que dê certo)

O projeto está preparado para **um único deploy**: o mesmo servidor serve a API e o frontend. **Não use Vercel** para este projeto — o Vercel não roda servidor Express, só estático/funções serverless.

## Recomendado: Render (um deploy, uma URL)

1. Crie conta em [render.com](https://render.com).
2. **New** → **Web Service**.
3. Conecte o repositório do GitHub.
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Runtime:** Node (versão 20)
5. Em **Environment** adicione:
   - `DATABASE_URL` (sua connection string PostgreSQL, ex.: Neon)
   - `GROQ_API_KEY` ou `OPENAI_API_KEY` (para análise com IA)
6. **Deploy**.

Pronto. Uma URL (ex.: `https://420-rerond.onrender.com`) serve o site e a API. Não precisa configurar `VITE_API_BASE_URL`.

### Opcional: Blueprint (render.yaml)

O repositório tem um `render.yaml`. No Render: **New** → **Blueprint** → selecione este repositório. O Render usa o `render.yaml`; o build já roda `npm run build` (Prisma + frontend). Configure só as variáveis (ex.: `DATABASE_URL`).

---

## Por que não Vercel?

- **Vercel** serve arquivos estáticos e funções serverless (rotas em `/api` como funções, não um Express rodando o tempo todo).
- Este projeto usa **Express + Prisma + upload de arquivos + análise com IA** (requisições longas). Isso precisa de um **servidor Node contínuo**.
- No Vercel, só o build do frontend seria publicado; as rotas `/api/*` não existiriam e tudo daria 404.

Se quiser usar Vercel mesmo assim: teria que colocar só o **frontend** no Vercel e o **backend** em outro lugar (ex.: Render), e configurar a URL da API no build. São dois deploys e mais configuração.

---

## Testar antes de subir

```bash
npm run build:frontend
npm run start
```

Acesse http://localhost:3001. Se funcionar aí, o deploy no Render tende a funcionar também.
