# anti-anxiety (Expo + React Native)

Conversão do site (React + Vite) pra app (Expo SDK 57 / React Native 0.86 / TypeScript / NativeWind).

## Como rodar

```bash
npm install
npx expo install --fix   # ajusta as versões pra bater exatamente com o SDK instalado
npx expo start
```

> **Sobre a versão travada**: o `app.json` já fixa `"sdkVersion": "57.0.0"`. Pra atualizar
> dentro do próprio SDK 57 (patches), rode sempre `npx expo install --fix` — nunca
> `npm update` direto, porque isso pode puxar uma versão de RN incompatível com o SDK.
> Quando o SDK 58 sair oficialmente (ainda não existe, nem em beta, até ago/2026), a
> migração é: `npx expo install expo@^58 --fix`.

## Estrutura

```
app/                    → rotas (expo-router, roteamento por arquivo)
  _layout.tsx           → equivalente ao App.tsx + Rotas.tsx (Provider + Stack)
  index.tsx             → tela de Login ("/")
  sobre.tsx             → tela Sobre (fora das tabs)
  (tabs)/
    _layout.tsx          → equivalente ao BottomNav.tsx (agora é Tabs nativa)
    home.tsx             → Emergency
    chat.tsx
    explore.tsx
    profile.tsx

src/
  components/            → componentes compartilhados (Avatar, Modal, GradientBackground)
  contexts/               → LayoutContext (equivalente ao LayoutContexto.tsx)
  constants/theme.ts       → cores e gradientes centralizados
```

### Por que não tem mais um componente por página igual no site?

No site cada `.module.css` isolava o estilo de cada página. No RN não existe CSS puro,
e com NativeWind a estilização já fica isolada por componente via `className`, então
não precisa mais de um arquivo de estilo separado por tela — o próprio arquivo da tela
já concentra tudo. Continuei separando em componentes o que é **reutilizado em mais de
um lugar** (Avatar, GradientBackground, ModalMensagem), que é a razão de existir de um
componente separado no React de qualquer forma.

## O que ainda falta (próximos passos, na ordem que sugiro)

1. **Firebase**: criar `src/lib/firebase.ts` com a config do projeto (Auth, Firestore, Storage).
2. **Autenticação real** na tela de Login (`signInWithEmailAndPassword`).
3. **Mini-tela de som calmante** (botão "+" na Emergency): modal com lista de sons +
   slider de volume por som, usando `expo-av`.
4. **Mini-tela de adicionar contato** (botão "+" no Chat): modal de busca/adicionar por
   ícone, como você descreveu.
5. **Tela de conversa individual** (`app/(tabs)/chat/[id].tsx`) com mensagens em tempo
   real via Firestore.
6. **Cadastro/permissões de psicólogo**: campo `tipo: 'paciente' | 'psicologo'` no
   documento do usuário no Firestore + regras de segurança liberando as rotas de
   planilha/agenda só pra quem é `psicologo`.
7. **Chamada de voz/vídeo**: integrar Stream Video (ou Daily/LiveKit, como conversamos).
8. **Assets**: as imagens `assets/images/eduardo.png` e `gustavo.png` referenciadas em
   `sobre.tsx` ainda não existem no pacote — troque pelas fotos reais.

## Observação sobre `ModalMensagem`

Mantive a mesma assinatura de props (`exibir`, `titulo`, `texto`, `ocultar`) por baixo
usando o `Modal` nativo do RN, então nenhuma tela que já o usa (`Login`) precisou mudar
a forma de chamar.
