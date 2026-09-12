AUJUDA — VERSÃO WEB PARA GITHUB PAGES

1. Extraia este ZIP no computador.
2. Crie um repositório público no GitHub (por exemplo, aujuda).
3. Em Add file > Upload files, envie os ARQUIVOS extraídos.
   O index.html precisa ficar na raiz do repositório, junto com os CSS, JS e a imagem.
   Não envie apenas o ZIP ou uma pasta acima dos arquivos.
4. Confirme o envio (Commit changes).
5. Abra Settings > Pages.
6. Em Build and deployment, selecione Deploy from a branch.
7. Selecione a branch main e a pasta / (root). Clique em Save.
8. Aguarde a publicação. O GitHub mostra o endereço na tela Pages.

Documentação:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Você também pode abrir index.html para experimentar localmente.
Não é necessário instalar Node.js nem compilar o projeto.

O QUE MUDOU
- Fundo branco com detalhes verdes, transparências e sombras.
- Entrada suave com deslocamento e desfoque.
- Cartões surgem em sequência, com intervalos de 140 ms.
- A entrada se repete ao sair e voltar à seção.
- Cartão sobre a foto flutua, botões têm brilho e efeito de clique.
- Barra superior acompanha a rolagem.
- Controle de animações junto ao mural. Se o sistema pedir movimento reduzido,
  o site respeita essa preferência; o botão permite ativar explicitamente.
- Cadastro com espécie livre, foto opcional, prévia e remoção.

LIMITES DA DEMONSTRAÇÃO
Os dados e fotos ficam apenas na sessão e somem ao recarregar.
Não há login real, banco compartilhado ou publicação real de animais.
A versão web usa JavaScript, adaptado da ideia do projeto original em C.
A fotografia de exemplo foi gerada com IA.

VERIFICAÇÃO
Sintaxe e referências locais verificadas. Animações testadas em DOM simulado
(disparo, sequência e repetição), sem inspeção visual em navegador real.

© 2026 Marcelo Guedes. Todos os direitos autorais reservados.
