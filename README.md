# SecureMessage

O **SecureMessage** é uma aplicação web desenvolvida em Python e Flask para criar e abrir mensagens protegidas por senha.

O projeto utiliza uma **árvore binária de Huffman** para representar e codificar os caracteres da mensagem. Depois da codificação, a árvore e a sequência de bits são protegidas por criptografia AES-GCM e armazenadas em um arquivo `.txt`.

A aplicação também apresenta uma visualização gráfica da árvore, identificando a raiz, os nós internos, as folhas e os caminhos binários.

---

## Objetivo do projeto

O objetivo do SecureMessage é demonstrar, de maneira visual e prática, o uso de uma árvore binária na codificação de mensagens.

O sistema permite:

- escrever uma mensagem;
- construir uma árvore binária de Huffman;
- gerar um código binário para cada caractere;
- converter a mensagem em uma sequência de bits;
- visualizar a árvore construída;
- proteger a árvore e os bits com uma senha;
- salvar o conteúdo em um arquivo `.txt`;
- abrir o arquivo utilizando a senha;
- reconstruir a árvore;
- recuperar a mensagem original.

---

# Explicação da árvore binária

## A estrutura é realmente uma árvore binária?

Sim. A estrutura utilizada no projeto é uma **árvore binária de Huffman**.

Uma árvore é considerada binária quando cada nó possui, no máximo, dois filhos:

```text
filho esquerdo
filho direito
```

No SecureMessage:

- o caminho para o filho esquerdo representa o bit `0`;
- o caminho para o filho direito representa o bit `1`;
- o nó superior representa a raiz;
- os nós intermediários ajudam a formar os caminhos;
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

Cada caractere fica em uma folha. O código binário do caractere é formado pelo caminho percorrido desde a raiz até essa folha.

---

## A árvore Huffman é uma árvore binária de busca?

Não.

Uma **árvore binária de busca**, também chamada de BST, organiza os valores de acordo com comparações:

```text
valores menores ficam à esquerda
valores maiores ficam à direita
```

A árvore de Huffman não trabalha dessa forma.

Ela organiza os caracteres utilizando suas frequências na mensagem. Os caracteres que aparecem mais vezes normalmente recebem caminhos menores, enquanto os caracteres menos frequentes podem receber caminhos maiores.

Portanto:

```text
Árvore de Huffman = codificação por frequência
BST = organização para busca e ordenação
```

A BST presente no projeto pode ser usada para organizar o histórico pela data e pelo horário, mas não participa diretamente da codificação da mensagem.

---

# Como a árvore de Huffman é construída

A construção acontece nas seguintes etapas:

1. O sistema recebe a mensagem.
2. Conta quantas vezes cada caractere aparece.
3. Cria uma folha para cada caractere.
4. Coloca os nós em uma fila de prioridade.
5. Retira os dois nós com menor frequência.
6. Cria um novo nó contendo a soma das frequências.
7. Coloca os dois nós retirados como filhos do novo nó.
8. Repete o processo até existir apenas uma raiz.

Exemplo de frequências:

```text
Mensagem: banana

b = 1
a = 3
n = 2
```

O algoritmo começa combinando os elementos de menor frequência. O resultado é uma árvore binária em que cada caractere ocupa uma folha.

---

# Qual ordem a árvore segue?

Essa pergunta depende da etapa observada.

A árvore de Huffman não é construída diretamente por pré-ordem, em ordem ou pós-ordem. Sua construção utiliza a frequência dos caracteres e combina repetidamente os dois nós com menor frequência.

Os percursos são usados posteriormente para acessar, visualizar ou gerar os códigos da árvore.

## Pré-ordem

Na pré-ordem, o percurso acontece assim:

```text
raiz → esquerda → direita
```

Exemplo:

```text
              R
             / \
            A   B
           / \ / \
          C  D E  F
```

A pré-ordem seria:

```text
R → A → C → D → B → E → F
```

A versão antiga do projeto Ionic e Angular utilizava uma animação que visitava os nós em pré-ordem. A raiz aparecia primeiro, seguida pela subárvore esquerda e depois pela subárvore direita.

## Em ordem

No percurso em ordem, a sequência é:

```text
esquerda → raiz → direita
```

Usando o mesmo exemplo:

```text
C → A → D → R → E → B → F
```

Esse percurso é muito utilizado em árvores binárias de busca, mas não é o percurso principal da codificação Huffman.

## Pós-ordem

Na pós-ordem, a sequência é:

```text
esquerda → direita → raiz
```

Usando o exemplo:

```text
C → D → A → E → F → B → R
```

No desenho da árvore, uma lógica semelhante à pós-ordem pode ser utilizada para calcular a posição dos nós. Primeiro são calculadas as posições dos filhos e depois o pai é centralizado entre eles.

Essa etapa serve apenas para organizar a interface. Ela não interfere na codificação da mensagem.

---

# Qual ordem é usada na codificação da mensagem?

A codificação acontece em duas etapas diferentes.

## 1. Geração dos códigos dos caracteres

O algoritmo percorre a árvore em profundidade:

```text
raiz → esquerda → direita
```

Esse processo pode ser associado à pré-ordem.

Durante o percurso:

- ao seguir para a esquerda, acrescenta `0`;
- ao seguir para a direita, acrescenta `1`;
- ao chegar a uma folha, associa o caminho ao caractere.

Exemplo:

```text
a = 0
b = 10
c = 110
d = 111
```

O código de cada caractere corresponde ao caminho completo entre a raiz e sua folha.

## 2. Codificação da mensagem

Depois que a tabela de códigos está pronta, o sistema lê a mensagem na ordem original em que foi digitada, da esquerda para a direita.

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

Portanto, a explicação correta é:

> A geração dos códigos percorre a árvore em profundidade, seguindo primeiro o ramo esquerdo e depois o direito. A codificação da mensagem preserva a ordem original dos caracteres, substituindo cada caractere pelo código binário correspondente.

A mensagem não é reorganizada em pré-ordem, em ordem ou pós-ordem.

---

# Visualização da árvore

A interface apresenta a estrutura completa da árvore em um modal ampliado.

A visualização utiliza as seguintes cores:

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
- botão para restaurar o zoom;
- botão para fechar a visualização;
- exibição do caminho binário de cada folha.

Na versão atual, a estrutura completa aparece simultaneamente.

Isso significa que a tela mostra a árvore inteira, mas não representa obrigatoriamente uma animação de percurso.

O posicionamento gráfico dos nós não altera a estrutura da árvore. A interface apenas calcula coordenadas para impedir sobreposição e deixar cada pai centralizado entre os filhos.

---

# Fluxo de criação da mensagem

O processo de criação segue esta sequência:

```text
Mensagem original
        ↓
Contagem da frequência dos caracteres
        ↓
Construção da árvore binária de Huffman
        ↓
Geração dos códigos binários
        ↓
Conversão da mensagem em bits
        ↓
Serialização da árvore
        ↓
Criptografia da árvore e dos bits
        ↓
Geração do arquivo .txt
```

Durante a criação, a árvore é devolvida pelo Python para a interface, permitindo sua visualização antes de o arquivo ser utilizado novamente.

---

# Fluxo de abertura da mensagem

O processo de abertura segue esta sequência:

```text
Seleção do arquivo .txt
        ↓
Informação da senha
        ↓
Leitura dos dados criptografados
        ↓
Descriptografia da árvore e dos bits
        ↓
Reconstrução da árvore binária
        ↓
Percurso da sequência de bits
        ↓
Recuperação da mensagem original
        ↓
Exibição da árvore reconstruída
```

Quando o programa percorre os bits:

- `0` direciona para o filho esquerdo;
- `1` direciona para o filho direito;
- ao encontrar uma folha, recupera o caractere;
- depois de encontrar uma folha, retorna para a raiz;
- o processo continua até terminar a sequência de bits.

---

# Segurança da mensagem

A árvore Huffman realiza a codificação e a compactação da mensagem, mas Huffman sozinho não é uma criptografia de segurança.

Por esse motivo, o projeto utiliza duas etapas:

```text
Huffman
    ↓
Transforma a mensagem em uma estrutura de árvore e bits

AES-GCM
    ↓
Protege a árvore e os bits utilizando uma senha
```

A responsabilidade de cada parte é:

## Huffman

- contar os caracteres;
- construir a árvore binária;
- gerar os caminhos `0` e `1`;
- codificar a mensagem;
- reconstruir a mensagem.

## AES-GCM

- proteger a árvore serializada;
- proteger a sequência de bits;
- impedir a leitura direta do conteúdo;
- verificar se a senha está correta;
- detectar alterações no arquivo.

A árvore continua sendo uma parte obrigatória da solução. A criptografia apenas protege sua representação dentro do arquivo.

---

# Formato do arquivo

O arquivo é salvo com a extensão:

```text
.txt
```

O nome inclui a data e o horário local da criação:

```text
mensagem_DD-MM-AAAA_HH-MM-SS.txt
```

Exemplo:

```text
mensagem_16-09-2026_00-52-30.txt
```

Embora seja um arquivo `.txt`, seu conteúdo contém um objeto JSON com os dados necessários para a descriptografia.

Exemplo da estrutura externa:

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

A árvore e os bits não ficam expostos diretamente. Ambos estão protegidos dentro do campo `ciphertext`.

---

# Tecnologias utilizadas

- Python
- Flask
- HTML
- CSS
- JavaScript
- Árvore binária de Huffman
- AES-256-GCM
- PBKDF2-HMAC-SHA256
- JSON
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

## Responsabilidade dos arquivos

### `main.py`

Responsável por:

- iniciar a aplicação Flask;
- entregar a página principal;
- receber a mensagem e a senha;
- chamar o núcleo Huffman;
- devolver a árvore para a interface;
- abrir e descriptografar arquivos.

### `python_core/huffman_tree.py`

Responsável por:

- contar a frequência dos caracteres;
- construir a árvore binária;
- gerar os códigos Huffman;
- serializar a árvore;
- reconstruir a árvore;
- codificar e decodificar a mensagem.

### `python_core/secmsg_handler.py`

Responsável por:

- integrar Huffman e AES-GCM;
- gerar uma chave a partir da senha;
- criptografar árvore e bits;
- validar o formato do arquivo;
- descriptografar o conteúdo;
- devolver a árvore reconstruída e a mensagem.

### `templates/index.html`

Responsável pela estrutura da interface.

### `public/style.css`

Responsável pelas cores, responsividade, modal e aparência da árvore.

### `public/app.js`

Responsável por:

- enviar requisições ao Flask;
- baixar o arquivo;
- ler o arquivo selecionado;
- abrir e fechar o modal;
- controlar o zoom;
- desenhar a árvore em SVG;
- mostrar os caminhos binários.

---

# Como executar localmente

## 1. Criar o ambiente virtual

No terminal, dentro da pasta do projeto:

```powershell
python -m venv .venv
```

## 2. Ativar o ambiente

No Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Instalar as dependências

```powershell
python -m pip install -r requirements.txt
```

## 4. Iniciar o sistema

```powershell
python main.py
```

## 5. Abrir no navegador

Acesse:

```text
http://127.0.0.1:5000
```

---

# Como utilizar

## Criar uma mensagem

1. Abra a aba **Preparar mensagem**.
2. Digite o conteúdo.
3. Digite uma senha.
4. Clique em **Criptografar e salvar arquivo**.
5. Observe a árvore construída.
6. Salve o arquivo `.txt` gerado.

## Abrir uma mensagem

1. Abra a aba **Ler arquivo**.
2. Selecione o arquivo `.txt`.
3. Digite a senha utilizada na criação.
4. Clique em **Abrir mensagem**.
5. Visualize a mensagem recuperada.
6. Abra a visualização ampliada da árvore reconstruída.

---

# Possíveis erros

## Motor Python indisponível

Confirme que o Flask está ligado:

```powershell
python main.py
```

## Senha incorreta

O sistema não consegue descriptografar o arquivo sem a mesma senha utilizada na criação.

## Arquivo inválido

O arquivo pode:

- não pertencer ao SecureMessage;
- estar incompleto;
- ter sido alterado;
- estar corrompido.

## CSS ou JavaScript não aparecem

Atualize a página ignorando o cache:

```text
Ctrl + F5
```

---

# Resumo técnico para apresentação

> O SecureMessage utiliza uma árvore binária de Huffman para representar os caracteres de uma mensagem. Cada caractere é armazenado em uma folha, e os caminhos entre a raiz e as folhas geram códigos binários. O ramo esquerdo representa zero e o ramo direito representa um. A árvore é construída de acordo com a frequência dos caracteres, não por ordenação numérica ou alfabética. Para gerar os códigos, o algoritmo percorre a árvore em profundidade, visitando primeiro o lado esquerdo e depois o direito. A mensagem é codificada preservando a ordem original dos caracteres. Depois disso, a árvore serializada e a sequência de bits são protegidas por AES-GCM utilizando uma chave derivada da senha. Na abertura do arquivo, o sistema recupera a árvore, percorre os bits e reconstrói a mensagem original.

---

# Conclusão

O projeto demonstra a aplicação prática de uma árvore binária em um sistema de codificação de mensagens.

A árvore de Huffman é responsável por representar os caracteres e gerar os códigos binários. O AES-GCM complementa o projeto protegendo a árvore e os bits com senha.

A visualização gráfica facilita a compreensão da estrutura, mostrando claramente:

```text
raiz
nós internos
folhas
ramo esquerdo 0
ramo direito 1
caminhos binários
```

Dessa forma, o SecureMessage combina estrutura de dados, algoritmos, segurança e desenvolvimento web em uma única aplicação.