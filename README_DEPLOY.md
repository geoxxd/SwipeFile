# 🚀 Guia de Deploy: React + Supabase + Netlify

Este projeto é uma aplicação **Single Page Application (SPA) em React + Vite**, preparada para ser baixada, conectada ao **Supabase** (para Banco de Dados PostgreSQL e Armazenamento de Vídeos/Imagens) e hospedada na **Netlify**.

---

## 📋 Passo 1: Criar o Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login.
2. Clique em **New project** e dê um nome (ex: `swipe-file`).
3. No menu lateral esquerdo do Supabase, clique em **SQL Editor**.
4. Abra o arquivo `supabase_schema.sql` deste projeto (ou copie direto na aba Configurações do app).
5. Cole todo o conteúdo no SQL Editor e clique em **Run**.
   - ✅ Isso criará todas as tabelas (`offers`, `creatives`, `collections`, etc.).
   - ✅ Criará o bucket de Storage `creatives` para vídeos, imagens e capas.
   - ✅ Habilitará as políticas de segurança (RLS) para leitura e gravação.

---

## 🔑 Passo 2: Obter as Chaves do Supabase

No painel do seu projeto Supabase:
1. Vá em **Project Settings** (ícone de engrenagem) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon / public key** (uma chave longa que começa com `eyJ...`)

---

## 🌐 Passo 3: Deploy na Netlify

O projeto já inclui o arquivo `netlify.toml` e `public/_redirects` pré-configurados!

### Opção A: Pelo GitHub (Recomendado)
1. Suba esta pasta no seu GitHub.
2. Acesse [netlify.com](https://netlify.com) e clique em **Add new site** > **Import an existing project**.
3. Selecione o repositório do GitHub.
4. As configurações de build serão preenchidas automaticamente pelo `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Na seção **Environment variables**, adicione:
   - `VITE_SUPABASE_URL`: sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: sua chave pública anon
6. Clique em **Deploy site**.

### Opção B: Deploy Manual via Netlify Drop
1. No seu computador, rode no terminal:
   ```bash
   npm install
   npm run build
   ```
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist`.
3. No painel do site criado na Netlify, vá em **Site configuration** > **Environment variables** e adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Depois clique em **Trigger deploy** para reconstruir.

---

## 💻 Rodando Localmente com Supabase

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

E rode:
```bash
npm run dev
```

Pronto! Seus criativos, vídeos, capas e ofertas serão salvos em tempo real na nuvem do Supabase!
