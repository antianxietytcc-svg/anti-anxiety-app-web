# Anti-Anxiety Mobile

Aplicação React Native e Expo para reunir contatos de apoio, sons, feed, conversas e agendamentos. Utiliza o mesmo Firebase Authentication e Cloud Firestore da aplicação Web, sem Firebase Storage. As chamadas são uma simulação de interface.

## Executar

Use Node.js 24. Na raiz deste projeto, copie .env.example para .env.local, preencha os mesmos valores públicos do Firebase usados na Web e execute npm ci. Rode npm start para iniciar o Expo. A instalação nativa depende de um ambiente compatível com o SDK do projeto. Para a checagem estática, rode npx tsc --noEmit.

### CRUD compartilhado de contatos

As duas aplicações usam usuarios/{uid}/contatos/{contatoId}. Os contatos locais criados em versões anteriores não aparecem automaticamente na coleção nova. Para o ensaio, cadastre dados fictícios pela interface.

No Firebase Console, em Firestore Database → Rules, acrescente o bloco abaixo dentro de match /databases/{database}/documents, junto das regras que o projeto já usa. Publique a alteração e teste uma segunda conta para verificar o isolamento.

    match /usuarios/{uid}/contatos/{contatoId} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['nome', 'telefone', 'tipo_relacao'])
        && request.resource.data.keys().hasAll(['nome', 'telefone', 'tipo_relacao'])
        && request.resource.data.nome is string
        && request.resource.data.nome.size() > 0
        && request.resource.data.nome.size() <= 80
        && request.resource.data.telefone is string
        && request.resource.data.telefone.size() >= 10
        && request.resource.data.telefone.size() <= 24
        && request.resource.data.tipo_relacao in ['mãe', 'pai', 'amigo', 'irmão', 'responsável', 'cônjuge', 'outro'];
    }

Roteiro de ensaio: entre com a mesma conta na Web e no Mobile. Cadastre um contato na Web, reabra a tela no Mobile e confira. Altere o telefone pelo Mobile, recarregue a Web e confira. Exclua pela Web, reabra a tela no Mobile e confirme que o contato saiu. Faça as capturas nas duas aplicações em execução para o DOCX de entrega no Teams.

