# SecureMessage

O **SecureMessage** é uma aplicação web desenvolvida em Python e Flask para criar, proteger, compartilhar e recuperar mensagens por meio de documentos criptografados.

O projeto foi criado como uma solução para o problema de vazamento de conversas em texto legível. Em vez de enviar diretamente o conteúdo da mensagem, o usuário gera um documento protegido por senha. A pessoa que recebe o documento pode abri-lo no próprio sistema, informar a senha e recuperar o conteúdo original.

O sistema combina três recursos principais:

- **Árvore binária de Huffman:** codifica os caracteres da mensagem em caminhos formados por `0` e `1`.
- **AES-256-GCM:** fornece a proteção criptográfica real da árvore e dos bits.
- **Árvore Binária de Busca, BST:** organiza o histórico dos documentos pela data e pelo horário.

---

## Objetivo do projeto

O objetivo do SecureMessage é demonstrar, de forma visual e prática, o uso de estruturas de dados em um sistema de proteção de mensagens.

O sistema permite:

- escrever uma mensagem;
- contar a frequência dos caracteres;
- construir uma árvore binária de Huffman;
- gerar códigos binários para os caracteres;
- transformar a mensagem em uma sequência de bits;
- visualizar a árvore de Huffman;
- proteger a árvore e os bits com senha;
- gerar um documento `.txt` criptografado;
- abrir o documento no próprio sistema;
- reconstruir a árvore de Huffman;
- recuperar a mensagem original;
- registrar a criação e a abertura dos documentos;
- organizar o histórico em uma Árvore Binária de Busca;
- visualizar os percursos em pré-ordem, em ordem e pós-ordem.

---

# Arquitetura da solução

O projeto separa as responsabilidades entre Huffman, AES-GCM e BST:

```text
Árvore de Huffman
        ↓
Codifica os caracteres em caminhos binários

AES-256-GCM
        ↓
Protege a árvore e a sequência de bits

BST do histórico
        ↓
Organiza os registros dos documentos por data e horário
```

Cada estrutura possui uma função real no sistema:

```text
Huffman = codificação da mensagem
AES-GCM = criptografia e integridade
BST = organização e percurso do histórico
Flask = interface entre navegador e Python
```

---

# Solução para o problema de vazamento

Em uma conversa comum, a mensagem pode ser enviada diretamente como texto legível. Caso a conversa ou o documento seja acessado por uma pessoa não autorizada, o conteúdo poderá ser visualizado.

No SecureMessage, o fluxo é diferente:

```text
Pessoa A escreve a mensagem
        ↓
O sistema constrói a árvore de Huffman
        ↓
A mensagem é convertida em bits
        ↓
Árvore e bits são criptografados
        ↓
Um documento .txt é gerado
        ↓
Pessoa A envia o documento
        ↓
Pessoa B abre o documento no SecureMessage
        ↓
Pessoa B informa a senha
        ↓
O sistema reconstrói a árvore
        ↓
A mensagem original é recuperada
```

O arquivo não apresenta diretamente:

- a mensagem original;
- a árvore Huffman;
- os caracteres;
- os códigos binários;
- a senha.

A senha deve ser compartilhada por um canal diferente daquele utilizado para enviar o documento.

---

# Árvore binária de Huffman

## A estrutura é realmente uma árvore binária?

Sim. A estrutura utilizada na codificação é uma **árvore binária de Huffman**.

Uma árvore é considerada binária quando cada nó possui, no máximo, dois filhos:

```text
filho esquerdo
filho direito
```

No SecureMessage:

- o filho esquerdo representa o bit `0`;
- o filho direito representa o bit `1`;
- o nó superior representa a raiz;
- os nós intermediários representam combinações de frequência;
- as folhas armazenam os caracteres da mensagem.

Exemplo simplificado:

```text
                Raiz
               /    \
             0/      \1
             A        B
            / \      / \
          0/   \1  0/   \1
          C     D  E     F
```

O código binário de cada caractere é formado pelo caminho percorrido da raiz até a folha correspondente.

---

## Huffman é uma BST?

Não.

A árvore de Huffman e a Árvore Binária de Busca são dois tipos diferentes de árvore binária.

### Huffman

A árvore de Huffman utiliza a frequência dos caracteres:

```text
menor frequência
        ↓
combinação dos dois menores nós
        ↓
formação da árvore
```

Ela é utilizada para:

- representar caracteres;
- gerar códigos binários;
- codificar mensagens;
- reconstruir mensagens.

### BST

A Árvore Binária de Busca utiliza comparações:

```text
valor menor → esquerda
valor maior → direita
```

Ela é utilizada para:

- inserir registros;
- buscar registros;
- remover registros;
- organizar valores;
- percorrer valores ordenadamente.

No SecureMessage, as duas estruturas são utilizadas:

```text
Huffman → codificação da mensagem
BST → organização do histórico
```

---

# Construção da árvore de Huffman

A construção acontece nas seguintes etapas:

1. O sistema recebe a mensagem.
2. Conta quantas vezes cada caractere aparece.
3. Cria uma folha para cada caractere.
4. Coloca os nós em uma fila de prioridade.
5. Retira os dois nós com menor frequência.
6. Cria um novo nó com a soma das frequências.
7. Coloca os dois nós retirados como filhos do novo nó.
8. Insere novamente o nó combinado na fila.
9. Repete o processo até existir apenas uma raiz.

Exemplo:

```text
Mensagem: banana

b = 1
a = 3
n = 2
```

Os nós de menor frequência são combinados primeiro. Os caracteres mais frequentes normalmente recebem caminhos menores.

---

# Geração dos códigos Huffman

Depois da construção da árvore, o algoritmo percorre os caminhos da raiz até as folhas.

A regra é:

```text
esquerda = 0
direita = 1
```

Exemplo:

```text
a = 0
b = 10
c = 110
d = 111
```

A geração dos códigos utiliza um percurso recursivo em profundidade, visitando primeiro o ramo esquerdo e depois o ramo direito.

Ao chegar a uma folha, o caminho acumulado é associado ao caractere daquela folha.

---

# Codificação da mensagem

Depois que a tabela de códigos está pronta, a mensagem é lida na mesma ordem em que foi digitada.

Exemplo:

```text
Mensagem: CASA
```

Considere os códigos:

```text
C = 00
A = 1
S = 01
```

A substituição acontece assim:

```text
C    A    S    A
00   1    01   1
```

Resultado:

```text
001011
```

A mensagem não é reorganizada em pré-ordem, em ordem ou pós-ordem.

A ordem original dos caracteres é preservada. Os percursos são utilizados para acessar os nós da árvore, enquanto a codificação substitui cada caractere pelo código correspondente.

---

# Visualização da árvore de Huffman

A aplicação apresenta a árvore em um modal ampliado.

A visualização utiliza:

- amarelo para a raiz;
- azul para os nós internos;
- roxo para as folhas;
- verde para os caminhos `0`;
- rosa para os caminhos `1`.

O modal possui:

- rolagem horizontal;
- rolagem vertical;
- controle para aumentar o zoom;
- controle para diminuir o zoom;
- opção para restaurar o zoom;
- botão para fechar;
- caminhos binários;
- identificação dos caracteres.

A estrutura é desenhada em SVG para manter os nós e galhos alinhados.

O posicionamento gráfico não modifica a estrutura da árvore. A interface apenas calcula as coordenadas necessárias para apresentar cada nó.

---

# Criptografia com AES-GCM

A árvore Huffman realiza uma codificação binária, mas não oferece segurança criptográfica sozinha.

Se uma pessoa possuir a árvore e os bits sem proteção, essa pessoa poderá reconstruir a mensagem.

Por isso, o SecureMessage utiliza AES-256-GCM depois da codificação Huffman.

O fluxo é:

```text
Mensagem original
        ↓
Árvore de Huffman
        ↓
Sequência de bits
        ↓
Serialização da árvore
        ↓
AES-256-GCM
        ↓
Documento criptografado
```

O AES-GCM é responsável por:

- proteger a árvore serializada;
- proteger a sequência de bits;
- impedir a leitura direta do conteúdo;
- validar a senha;
- detectar alterações no documento;
- impedir a recuperação quando a senha estiver incorreta.

---

# Derivação da chave

A senha digitada pelo usuário não é utilizada diretamente como chave AES.

O sistema utiliza:

```text
PBKDF2-HMAC-SHA256
```

A derivação utiliza:

- senha;
- salt aleatório;
- função SHA-256;
- múltiplas iterações;
- chave resultante de 256 bits.

Fluxo:

```text
Senha do usuário
        +
Salt aleatório
        ↓
PBKDF2-HMAC-SHA256
        ↓
Chave AES de 256 bits
```

A senha não é salva dentro do documento.

---

# Documento criptografado

O arquivo é salvo com extensão:

```text
.txt
```

O nome contém a data e o horário local da criação:

```text
mensagem_DD-MM-AAAA_HH-MM-SS.txt
```

Exemplo:

```text
mensagem_18-09-2026_00-05-30.txt
```

Embora possua extensão `.txt`, o conteúdo utiliza uma estrutura JSON.

Exemplo da parte externa:

```json
{
  "format": "securemessage-huffman-aes",
  "version": 2,
  "kdf": "PBKDF2-HMAC-SHA256",
  "iterations": 600000,
  "cipher": "AES-256-GCM",
  "salt": "...",
  "nonce": "...",
  "ciphertext": "..."
}
```

Os campos `salt` e `nonce` não precisam ser secretos.

A árvore Huffman e a sequência de bits ficam protegidas dentro do campo `ciphertext`.

---

# Abertura e recuperação da mensagem

O processo de abertura segue esta sequência:

```text
Seleção do documento .txt
        ↓
Informação da senha
        ↓
Leitura do envelope criptografado
        ↓
Derivação da chave
        ↓
Descriptografia AES-GCM
        ↓
Recuperação da árvore e dos bits
        ↓
Reconstrução da árvore Huffman
        ↓
Percurso dos bits
        ↓
Recuperação da mensagem original
```

Durante a decodificação:

- o bit `0` direciona para o filho esquerdo;
- o bit `1` direciona para o filho direito;
- ao encontrar uma folha, o caractere é recuperado;
- depois da folha, o percurso volta para a raiz;
- o processo continua até o fim dos bits.

---

# Histórico com Árvore Binária de Busca

O SecureMessage utiliza uma **Árvore Binária de Busca**, também chamada de BST, para organizar o histórico dos documentos.

A BST não participa da criptografia da mensagem. Sua função é organizar os registros de criação e abertura dos documentos.

Cada nó da BST armazena:

```text
ID do registro
data e horário
nome do documento
tipo de operação
filho esquerdo
filho direito
```

Os tipos de operação são:

```text
created = mensagem criada
opened = mensagem aberta
```

---

## Regra de ordenação da BST

A chave principal é a data e o horário do registro.

A propriedade utilizada é:

```text
data menor → subárvore esquerda
data maior → subárvore direita
```

O ID é utilizado como critério de desempate caso dois registros tenham exatamente o mesmo horário.

Exemplo:

```text
                 10:30
                /     \
             09:15    14:20
             /          \
          08:40         16:00
```

Essa estrutura é uma BST porque os registros anteriores ficam à esquerda e os posteriores ficam à direita.

---

## Inserção na BST

Quando uma mensagem é criada ou aberta, o sistema gera um registro.

O processo de inserção é:

1. O novo registro começa pela raiz.
2. A data do novo registro é comparada com a data do nó atual.
3. Se for menor, o algoritmo segue para a esquerda.
4. Se for maior, o algoritmo segue para a direita.
5. Ao encontrar uma posição vazia, o novo nó é inserido.
6. O novo registro entra inicialmente como folha.

Exemplo:

```text
Raiz: 10:00

Novo registro: 09:00
09:00 < 10:00
Vai para a esquerda

Novo registro: 11:00
11:00 > 10:00
Vai para a direita
```

---

# Percursos da BST

O projeto apresenta três formas de percorrer a Árvore Binária de Busca.

## Pré-ordem

Na pré-ordem, a sequência é:

```text
raiz → esquerda → direita
```

Esse percurso visita o nó atual antes dos descendentes.

Exemplo:

```text
10:00 → 09:00 → 08:00 → 11:00
```

---

## Em ordem

No percurso em ordem, a sequência é:

```text
esquerda → raiz → direita
```

Como a BST está organizada pela data e pelo horário, o percurso em ordem apresenta o histórico do registro mais antigo para o mais recente.

Exemplo:

```text
08:00 → 09:00 → 10:00 → 11:00
```

A lista visual pode apresentar os registros recentes primeiro por conveniência, mas a sequência chamada **Em ordem** continua sendo calculada cronologicamente pela BST.

---

## Pós-ordem

Na pós-ordem, a sequência é:

```text
esquerda → direita → raiz
```

Esse percurso visita os filhos antes do nó atual.

Exemplo:

```text
08:00 → 09:00 → 11:00 → 10:00
```

---

# Armazenamento do histórico

Os metadados do histórico são preservados no `localStorage` do navegador.

A chave utilizada é:

```text
securemessage_history_v1
```

Exemplo de registro:

```json
{
  "id": "identificador-unico",
  "timestamp": "2026-09-18T03:05:30.000Z",
  "file_name": "mensagem_18-09-2026_00-05-30.txt",
  "operation": "created"
}
```

O histórico não armazena:

- mensagem original;
- senha;
- árvore Huffman;
- sequência de bits;
- chave criptográfica;
- conteúdo descriptografado.

Somente os metadados necessários para demonstrar e reconstruir a BST são armazenados.

---

## Funcionamento da BST com o navegador

O fluxo do histórico é:

```text
Mensagem criada ou aberta
        ↓
JavaScript cria os metadados
        ↓
Metadados são salvos no localStorage
        ↓
Navegador envia os registros para /api/history
        ↓
Python reconstrói a BST
        ↓
Python executa os percursos
        ↓
Interface mostra os resultados
```

O `localStorage` pertence ao navegador. Por isso, não aparece como arquivo dentro do projeto no VS Code.

O histórico também é separado por endereço:

```text
http://127.0.0.1:5000
http://localhost:5000
https://projeto.vercel.app
```

Cada endereço possui seu próprio armazenamento.

O histórico pode desaparecer quando:

- os dados do navegador forem apagados;
- o usuário utilizar uma aba anônima;
- o site for aberto em outro navegador;
- o site for aberto em outro dispositivo;
- o usuário clicar em “Limpar histórico”.

---

# Possível desbalanceamento da BST

Os registros normalmente são criados em ordem cronológica crescente.

Isso pode produzir uma BST inclinada para a direita:

```text
Registro 1
         \
        Registro 2
                \
               Registro 3
                       \
                      Registro 4
```

Essa estrutura continua sendo uma BST válida, mas representa um caso desbalanceado.

No pior caso:

```text
busca = O(n)
inserção = O(n)
```

Uma melhoria futura seria utilizar uma árvore AVL para manter a estrutura balanceada.

---

# Responsabilidade de cada estrutura

## Huffman

Responsável por:

- contar a frequência dos caracteres;
- criar os nós;
- construir a árvore binária;
- gerar caminhos `0` e `1`;
- codificar a mensagem;
- serializar a árvore;
- reconstruir a árvore;
- decodificar os bits.

## AES-GCM

Responsável por:

- criptografar a árvore e os bits;
- proteger o documento;
- validar a senha;
- garantir integridade;
- detectar alterações no arquivo.

## BST

Responsável por:

- registrar documentos criados;
- registrar documentos abertos;
- organizar os registros por horário;
- inserir os registros;
- realizar os três percursos;
- apresentar o histórico cronologicamente.

## Flask

Responsável por:

- servir a interface;
- receber requisições do navegador;
- chamar o Huffman;
- chamar o AES-GCM;
- reconstruir a BST;
- devolver os resultados para o frontend.

---

# Tecnologias utilizadas

- Python
- Flask
- HTML
- CSS
- JavaScript
- Árvore binária de Huffman
- Árvore Binária de Busca
- AES-256-GCM
- PBKDF2-HMAC-SHA256
- JSON
- SVG
- localStorage
- Vercel

---

# Estrutura do projeto

```text
securemessage-flask-vercel/
├── main.py
├── requirements.txt
├── pyproject.toml
├── vercel.json
├── README.md
├── .gitignore
│
├── python_core/
│   ├── __init__.py
│   ├── bst_history.py
│   ├── huffman_tree.py
│   └── secmsg_handler.py
│
├── templates/
│   └── index.html
│
└── public/
    ├── style.css
    └── app.js
```

---

# Responsabilidade dos arquivos

## `main.py`

Responsável por:

- iniciar a aplicação Flask;
- entregar a página principal;
- receber a mensagem e a senha;
- chamar o núcleo Huffman;
- criptografar e descriptografar;
- devolver a árvore para a interface;
- receber os registros do histórico;
- construir a BST;
- devolver os três percursos.

Rotas principais:

```text
GET  /
GET  /api/health
POST /api/encrypt
POST /api/decrypt
POST /api/history
```

---

## `python_core/huffman_tree.py`

Responsável por:

- representar os nós Huffman;
- contar frequências;
- construir a árvore;
- gerar os códigos;
- codificar os caracteres;
- serializar a árvore;
- reconstruir a árvore;
- decodificar a sequência de bits.

---

## `python_core/secmsg_handler.py`

Responsável por:

- integrar Huffman e AES-GCM;
- gerar uma chave a partir da senha;
- criar salt e nonce;
- criptografar a árvore e os bits;
- montar o documento;
- validar o formato;
- descriptografar o conteúdo;
- devolver a mensagem e a árvore reconstruída.

---

## `python_core/bst_history.py`

Responsável por:

- representar os nós do histórico;
- inserir registros pela data e pelo horário;
- aplicar a propriedade da BST;
- executar o percurso em pré-ordem;
- executar o percurso em ordem;
- executar o percurso em pós-ordem;
- serializar a estrutura do histórico;
- validar os metadados recebidos.

---

## `templates/index.html`

Responsável pela estrutura da interface:

- aba de criação;
- aba de leitura;
- aba Histórico BST;
- campos de mensagem e senha;
- painel dos registros;
- painel dos percursos;
- modal da árvore Huffman.

---

## `public/style.css`

Responsável por:

- cores;
- tipografia;
- responsividade;
- painéis;
- botões;
- histórico;
- modal;
- aparência da árvore;
- estados visuais.

---

## `public/app.js`

Responsável por:

- alternar as abas;
- chamar as rotas Flask;
- verificar o motor Python;
- gerar o nome do documento;
- realizar o download;
- ler o documento;
- abrir o modal;
- controlar o zoom;
- desenhar a árvore em SVG;
- registrar os metadados;
- utilizar o `localStorage`;
- mostrar os resultados da BST.

---

# Como executar localmente

## 1. Criar o ambiente virtual

Dentro da pasta do projeto:

```powershell
python -m venv .venv
```

## 2. Ativar o ambiente virtual

No Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Instalar as dependências

```powershell
python -m pip install -r requirements.txt
```

## 4. Executar a aplicação

```powershell
python main.py
```

## 5. Abrir no navegador

```text
http://127.0.0.1:5000
```

---

# Como utilizar

## Criar uma mensagem

1. Abra a aba **Preparar mensagem**.
2. Digite a mensagem.
3. Digite uma senha.
4. Clique em **Criptografar e salvar arquivo**.
5. Visualize a árvore Huffman.
6. Salve o documento `.txt`.
7. Abra a aba **Histórico BST**.
8. Confira o registro “Mensagem criada”.

## Abrir uma mensagem

1. Abra a aba **Ler arquivo**.
2. Selecione o documento `.txt`.
3. Digite a senha usada na criação.
4. Clique em **Abrir mensagem**.
5. Visualize a mensagem original.
6. Visualize a árvore reconstruída.
7. Abra o **Histórico BST**.
8. Confira o registro “Mensagem aberta”.

## Visualizar a BST

1. Abra a aba **Histórico BST**.
2. Confira a quantidade de registros.
3. Observe os documentos criados e abertos.
4. Confira a pré-ordem.
5. Confira o percurso em ordem.
6. Confira a pós-ordem.
7. Utilize “Atualizar histórico” quando necessário.
8. Utilize “Limpar histórico” para remover os metadados locais.

---

# Testes recomendados

Antes da entrega, teste:

- mensagem com letras;
- mensagem com números;
- mensagem com espaços;
- mensagem com acentos;
- mensagem com símbolos;
- senha correta;
- senha incorreta;
- arquivo alterado;
- arquivo inválido;
- criação de múltiplos documentos;
- abertura de documentos;
- atualização do Histórico BST;
- percurso em pré-ordem;
- percurso em ordem;
- percurso em pós-ordem;
- limpeza do histórico.

Também deve ser testado o caso de uma mensagem formada por um único caractere repetido:

```text
1111
aaaa
.....
```

Esse caso precisa ser tratado corretamente pela serialização da árvore Huffman, pois a estrutura pode possuir apenas uma folha útil.

---

# Possíveis erros

## Motor Python indisponível

Confirme se a aplicação está em execução:

```powershell
python main.py
```

## Senha incorreta

A mesma senha utilizada na criação precisa ser informada na abertura.

## Arquivo inválido

O arquivo pode:

- não pertencer ao SecureMessage;
- estar incompleto;
- estar corrompido;
- ter sido alterado.

## Histórico não aparece

Confirme se a rota está respondendo:

```text
POST /api/history
```

Abra o console do navegador com `F12` e verifique se existe erro.

O histórico também pode ser visualizado em:

```text
F12
Application
Local Storage
securemessage_history_v1
```

## CSS ou JavaScript não aparecem

Teste diretamente:

```text
http://127.0.0.1:5000/style.css
```

```text
http://127.0.0.1:5000/app.js
```

Depois atualize a página ignorando o cache:

```text
Ctrl + F5
```

---

# Hospedagem na Vercel

O projeto está preparado para ser hospedado na Vercel.

Os arquivos estáticos ficam em:

```text
public/
```

Na versão publicada:

```text
public/style.css → /style.css
public/app.js → /app.js
```

O ponto de entrada Python é configurado como:

```toml
[tool.vercel]
entrypoint = "main:app"
```

Depois de realizar alterações:

```powershell
git add .
git commit -m "Atualiza o SecureMessage"
git push origin main
```

A Vercel cria um novo deployment quando o repositório conectado recebe o novo commit.

---

# Limitações do projeto

O SecureMessage é um protótipo acadêmico de troca de mensagens por documentos protegidos.

O projeto não é um aplicativo de conversa em tempo real.

Na versão hospedada, a mensagem e a senha são enviadas para o backend Flask durante o processamento. Por isso, o sistema não deve ser apresentado como criptografia ponta a ponta completa.

O projeto protege o documento gerado, mas não impede:

- compartilhamento voluntário da senha;
- captura de tela da mensagem aberta;
- comprometimento do dispositivo;
- extensões maliciosas no navegador;
- envio da senha junto com o documento;
- perda do histórico ao apagar dados do navegador.

---

# Melhorias futuras

- confirmação da senha antes da criação;
- indicador visual de força da senha;
- suporte para baixar novamente documentos criados;
- armazenamento seguro do envelope criptografado no IndexedDB;
- busca por nome no histórico;
- busca pela chave completa da BST;
- remoção individual de registros;
- visualização gráfica da BST;
- animação dos percursos;
- balanceamento com árvore AVL;
- testes automatizados;
- execução integral da criptografia no navegador;
- suporte a aplicativo móvel;
- geração de código QR para compartilhar o documento;
- mecanismos de expiração do documento.

# Conclusão

O SecureMessage combina estruturas de dados, criptografia e desenvolvimento web em uma única aplicação.

A responsabilidade de cada elemento é:

```text
Huffman
→ representa e codifica a mensagem

AES-GCM
→ protege a árvore e os bits

BST
→ organiza o histórico dos documentos

Flask
→ conecta a interface ao código Python
```

A solução demonstra os conceitos de:

- árvore binária;
- raiz;
- folhas;
- nós internos;
- subárvores;
- recursividade;
- caminhos;
- inserção em BST;
- comparação entre chaves;
- pré-ordem;
- em ordem;
- pós-ordem;
- serialização;
- reconstrução;
- criptografia autenticada.

Dessa forma, o projeto atende ao objetivo de gerar um documento protegido, permitir sua recuperação no próprio sistema e aplicar uma Árvore Binária de Busca em uma funcionalidade real de histórico.