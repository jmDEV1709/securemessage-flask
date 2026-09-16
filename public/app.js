const $ = (selector) =>
  document.querySelector(selector);


let selectedFile = null;
let currentTree = null;
let currentZoom = 1;


/*
 * Alterna entre criação e leitura.
 */
document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => {
      item.classList.remove('active');
    });

    document.querySelectorAll('.panel').forEach((panel) => {
      panel.classList.add('hidden');
    });

    button.classList.add('active');

    const panel = document.getElementById(
      button.dataset.tab
    );

    if (panel) {
      panel.classList.remove('hidden');
    }
  });
});


/*
 * Faz requisições para o Flask.
 */
async function callApi(path, body) {
  const response = await fetch(path, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      'Não foi possível processar a solicitação.'
    );
  }

  return data;
}


/*
 * Verifica a conexão com Python.
 */
fetch('/api/health')
  .then((response) => response.json())
  .then(() => {
    $('#status').textContent =
      'Motor Python conectado';

    $('#status').className =
      'status connected';
  })
  .catch(() => {
    $('#status').textContent =
      'Motor Python indisponível';

    $('#status').className =
      'status disconnected';
  });


/*
 * Criptografa a mensagem.
 */
$('#encrypt').addEventListener(
  'click',
  async () => {
    const message = $('#message').value;
    const password = $('#password').value;

    try {
      if (!message.trim()) {
        throw new Error(
          'Digite uma mensagem.'
        );
      }

      if (!password) {
        throw new Error(
          'Digite uma senha.'
        );
      }

      const data = await callApi(
        '/api/encrypt',
        {
          message,
          password,
        }
      );

      prepareTree(
        data.tree,
        'Árvore construída',
        'Estrutura criada. Os caminhos 0 e 1 representam a codificação de Huffman.'
      );

      downloadEncryptedFile(
        data.file
      );

    } catch (error) {
      alert(error.message);
    }
  }
);


/*
 * Produz:
 * mensagem_16-09-2026_00-52-30.txt
 *
 * Utiliza o horário local do computador
 * ou celular do usuário.
 */
function createFileName() {
  const now = new Date();

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const year = now.getFullYear();

  const hours = String(
    now.getHours()
  ).padStart(2, '0');

  const minutes = String(
    now.getMinutes()
  ).padStart(2, '0');

  const seconds = String(
    now.getSeconds()
  ).padStart(2, '0');

  return (
    `mensagem_${day}-${month}-${year}` +
    `_${hours}-${minutes}-${seconds}.txt`
  );
}


/*
 * Baixa o arquivo protegido.
 */
function downloadEncryptedFile(fileData) {
  const fileContent = JSON.stringify(
    fileData,
    null,
    2
  );

  const blob = new Blob(
    [fileContent],
    {
      type: 'text/plain;charset=utf-8',
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = createFileName();

  document.body.appendChild(link);

  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 500);
}


/*
 * Lê o arquivo selecionado.
 */
$('#file').addEventListener(
  'change',
  async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();

      selectedFile = JSON.parse(content);

    } catch {
      selectedFile = null;

      alert(
        'O arquivo selecionado não é válido.'
      );
    }
  }
);


/*
 * Descriptografa a mensagem.
 */
$('#decrypt').addEventListener(
  'click',
  async () => {
    const password =
      $('#openPassword').value;

    try {
      if (!selectedFile) {
        throw new Error(
          'Selecione o arquivo da mensagem.'
        );
      }

      if (!password) {
        throw new Error(
          'Digite a senha do arquivo.'
        );
      }

      const data = await callApi(
        '/api/decrypt',
        {
          file: selectedFile,
          password,
        }
      );

      $('#result').textContent =
        data.message;

      $('#result').classList.remove(
        'hidden'
      );

      prepareTree(
        data.tree,
        'Árvore reconstruída',
        'Estrutura reconstruída. Interpretando os bits para recuperar o conteúdo.'
      );

    } catch (error) {
      alert(error.message);
    }
  }
);


/*
 * Prepara a árvore recebida do Python.
 */
function prepareTree(
  tree,
  title,
  description
) {
  if (!tree) {
    return;
  }

  currentTree = tree;

  $('#treeSummaryTitle').textContent =
    title;

  $('#treeSummaryText').textContent =
    description;

  $('#modalDescription').textContent =
    description;

  $('#treeSummary').classList.remove(
    'hidden'
  );

  openTreeModal();
}


/*
 * Abre o modal.
 */
function openTreeModal() {
  if (!currentTree) {
    return;
  }

  renderTreeSvg(currentTree);

  setZoom(1);

  $('#treeModal').classList.remove(
    'hidden'
  );

  document.body.classList.add(
    'modal-open'
  );
}


/*
 * Fecha o modal.
 */
function closeTreeModal() {
  $('#treeModal').classList.add(
    'hidden'
  );

  document.body.classList.remove(
    'modal-open'
  );
}


$('#openTreeModal').addEventListener(
  'click',
  openTreeModal
);


$('#closeTreeModal').addEventListener(
  'click',
  closeTreeModal
);


$('#treeModal').addEventListener(
  'click',
  (event) => {
    if (event.target === $('#treeModal')) {
      closeTreeModal();
    }
  }
);


document.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Escape') {
      closeTreeModal();
    }
  }
);


/*
 * Controles de zoom.
 */
function setZoom(value) {
  currentZoom = Math.min(
    1.8,
    Math.max(0.5, value)
  );

  $('#treeCanvas').style.transform =
    `scale(${currentZoom})`;

  $('#zoomValue').textContent =
    `${Math.round(currentZoom * 100)}%`;
}


$('#zoomOut').addEventListener(
  'click',
  () => {
    setZoom(currentZoom - 0.1);
  }
);


$('#zoomIn').addEventListener(
  'click',
  () => {
    setZoom(currentZoom + 0.1);
  }
);


$('#zoomReset').addEventListener(
  'click',
  () => {
    setZoom(1);
  }
);


/*
 * Namespace obrigatório para criar SVG.
 */
const SVG_NAMESPACE =
  'http://www.w3.org/2000/svg';


function createSvgElement(name) {
  return document.createElementNS(
    SVG_NAMESPACE,
    name
  );
}


/*
 * Converte a árvore recebida do Python
 * em uma lista de nós com coordenadas.
 */
function calculateTreeLayout(root) {
  const nodes = [];
  const edges = [];

  const horizontalSpace = 105;
  const verticalSpace = 105;
  const sidePadding = 70;
  const topPadding = 55;

  let leafPosition = 0;
  let maximumDepth = 0;


  function visit(
    node,
    depth,
    path,
    parent = null,
    bit = null
  ) {
    maximumDepth = Math.max(
      maximumDepth,
      depth
    );

    let leftResult = null;
    let rightResult = null;
    let xPosition;


    if (node.leaf) {
      xPosition =
        sidePadding +
        leafPosition * horizontalSpace;

      leafPosition += 1;

    } else {
      leftResult = visit(
        node.left,
        depth + 1,
        path + '0',
        null,
        '0'
      );

      rightResult = visit(
        node.right,
        depth + 1,
        path + '1',
        null,
        '1'
      );

      /*
       * O nó pai fica centralizado exatamente
       * entre os dois nós filhos.
       */
      xPosition =
        (
          leftResult.x +
          rightResult.x
        ) / 2;
    }


    const result = {
      node,
      depth,
      path,
      bit,
      x: xPosition,
      y:
        topPadding +
        depth * verticalSpace,
    };


    nodes.push(result);


    if (leftResult) {
      edges.push({
        parent: result,
        child: leftResult,
        bit: '0',
      });
    }


    if (rightResult) {
      edges.push({
        parent: result,
        child: rightResult,
        bit: '1',
      });
    }


    return result;
  }


  visit(
    root,
    0,
    '',
    null,
    null
  );


  const width = Math.max(
    850,
    sidePadding * 2 +
      Math.max(
        leafPosition - 1,
        0
      ) * horizontalSpace
  );


  const height =
    topPadding * 2 +
    maximumDepth * verticalSpace +
    70;


  return {
    nodes,
    edges,
    width,
    height,
  };
}


/*
 * Desenha a árvore usando SVG.
 * As linhas ficam ligadas ao centro
 * de cada nó, sem atravessar os blocos.
 */
function renderTreeSvg(tree) {
  const container = $('#tree');

  container.innerHTML = '';

  const layout =
    calculateTreeLayout(tree);

  const svg =
    createSvgElement('svg');

  svg.setAttribute(
    'class',
    'huffman-svg'
  );

  svg.setAttribute(
    'width',
    String(layout.width)
  );

  svg.setAttribute(
    'height',
    String(layout.height)
  );

  svg.setAttribute(
    'viewBox',
    `0 0 ${layout.width} ${layout.height}`
  );


  /*
   * Desenha os galhos primeiro,
   * para ficarem atrás dos nós.
   */
  layout.edges.forEach((edge) => {
    const line =
      createSvgElement('line');

    line.setAttribute(
      'x1',
      String(edge.parent.x)
    );

    line.setAttribute(
      'y1',
      String(edge.parent.y + 25)
    );

    line.setAttribute(
      'x2',
      String(edge.child.x)
    );

    line.setAttribute(
      'y2',
      String(edge.child.y - 25)
    );

    line.setAttribute(
      'class',
      edge.bit === '0'
        ? 'tree-edge edge-left'
        : 'tree-edge edge-right'
    );

    svg.appendChild(line);


    /*
     * Número 0 ou 1 em cada galho.
     */
    const bitLabel =
      createSvgElement('text');

    bitLabel.setAttribute(
      'x',
      String(
        (
          edge.parent.x +
          edge.child.x
        ) / 2
      )
    );

    bitLabel.setAttribute(
      'y',
      String(
        (
          edge.parent.y +
          edge.child.y
        ) / 2 - 4
      )
    );

    bitLabel.setAttribute(
      'class',
      edge.bit === '0'
        ? 'bit-label bit-zero'
        : 'bit-label bit-one'
    );

    bitLabel.textContent =
      edge.bit;

    svg.appendChild(bitLabel);
  });


  /*
   * Desenha os nós sobre os galhos.
   */
  layout.nodes.forEach((item) => {
    const group =
      createSvgElement('g');

    group.setAttribute(
      'class',
      getNodeClass(item)
    );

    group.setAttribute(
      'transform',
      `translate(${item.x}, ${item.y})`
    );


    const rectangle =
      createSvgElement('rect');

    rectangle.setAttribute('x', '-38');
    rectangle.setAttribute('y', '-25');
    rectangle.setAttribute('width', '76');
    rectangle.setAttribute('height', '50');
    rectangle.setAttribute('rx', '6');

    group.appendChild(rectangle);


    const title =
      createSvgElement('text');

    title.setAttribute(
      'class',
      'node-title'
    );

    title.setAttribute('x', '0');
    title.setAttribute('y', '-3');
    title.setAttribute(
      'text-anchor',
      'middle'
    );

    title.textContent =
      getNodeTitle(
        item.node,
        item.depth === 0
      );

    group.appendChild(title);


    const path =
      createSvgElement('text');

    path.setAttribute(
      'class',
      'node-path'
    );

    path.setAttribute('x', '0');
    path.setAttribute('y', '14');
    path.setAttribute(
      'text-anchor',
      'middle'
    );

    path.textContent =
      item.depth === 0
        ? 'R'
        : item.path;

    group.appendChild(path);

    svg.appendChild(group);
  });


  container.appendChild(svg);
}


function getNodeClass(item) {
  if (item.depth === 0) {
    return 'svg-node svg-root-node';
  }

  if (item.node.leaf) {
    return 'svg-node svg-leaf-node';
  }

  return 'svg-node svg-internal-node';
}


function getNodeTitle(node, isRoot) {
  if (isRoot) {
    return 'R';
  }

  if (!node.leaf) {
    return 'raiz';
  }

  if (node.char === ' ') {
    return 'espaço';
  }

  if (node.char === '\n') {
    return 'quebra';
  }

  if (node.char === '\t') {
    return 'tab';
  }

  return node.char;
}