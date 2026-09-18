const $ = (selector) => document.querySelector(selector);

const HISTORY_STORAGE_KEY = 'securemessage_history_v1';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

let selectedFile = null;
let currentSelectedFileName = '';
let currentTree = null;
let currentZoom = 1;

// Navegacao entre abas
document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((panel) => panel.classList.add('hidden'));
    button.classList.add('active');
    const panel = document.getElementById(button.dataset.tab);
    if (panel) panel.classList.remove('hidden');
    if (button.dataset.tab === 'history') loadHistory();
  });
});

async function callApi(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data;
  try { data = await response.json(); }
  catch { throw new Error('O servidor retornou uma resposta invalida.'); }
  if (!response.ok) throw new Error(data.error || 'Nao foi possivel processar a solicitacao.');
  return data;
}

async function checkPythonConnection() {
  const status = $('#status');
  if (!status) return;
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error();
    status.textContent = 'Motor Python conectado';
    status.className = 'status connected';
  } catch {
    status.textContent = 'Motor Python indisponivel';
    status.className = 'status disconnected';
  }
}

function createFileName() {
  const now = new Date();
  const part = (value) => String(value).padStart(2, '0');
  return `mensagem_${part(now.getDate())}-${part(now.getMonth() + 1)}-${now.getFullYear()}_${part(now.getHours())}-${part(now.getMinutes())}-${part(now.getSeconds())}.txt`;
}

const encryptButton = $('#encrypt');
if (encryptButton) {
  encryptButton.addEventListener('click', async () => {
    const message = $('#message')?.value ?? '';
    const password = $('#password')?.value ?? '';
    try {
      if (!message.trim()) throw new Error('Digite uma mensagem.');
      if (!password) throw new Error('Digite uma senha.');
      setButtonLoading(encryptButton, true, 'CRIPTOGRAFANDO...');
      const data = await callApi('/api/encrypt', { message, password });
      if (!data.file || !data.tree) throw new Error('Resposta incompleta do servidor.');
      prepareTree(data.tree, 'Arvore construida', 'Os caminhos 0 e 1 representam a codificacao de Huffman.');
      await downloadEncryptedFile(data.file);
    } catch (error) {
      showError(error);
    } finally {
      setButtonLoading(encryptButton, false, 'CRIPTOGRAFAR E SALVAR ARQUIVO');
    }
  });
}

async function downloadEncryptedFile(fileData) {
  const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const fileName = createFileName();
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  await addHistoryRecord(fileName, 'created');
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

const fileInput = $('#file');
if (fileInput) {
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    selectedFile = null;
    currentSelectedFileName = '';
    $('#result')?.classList.add('hidden');
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      selectedFile = parsed;
      currentSelectedFileName = file.name;
    } catch {
      event.target.value = '';
      showError(new Error('O arquivo selecionado nao e valido.'));
    }
  });
}

const decryptButton = $('#decrypt');
if (decryptButton) {
  decryptButton.addEventListener('click', async () => {
    const password = $('#openPassword')?.value ?? '';
    try {
      if (!selectedFile) throw new Error('Selecione o arquivo da mensagem.');
      if (!password) throw new Error('Digite a senha do arquivo.');
      setButtonLoading(decryptButton, true, 'ABRINDO ARQUIVO...');
      const data = await callApi('/api/decrypt', { file: selectedFile, password });
      const result = $('#result');
      if (result) {
        result.textContent = data.message;
        result.classList.remove('hidden');
      }
      await addHistoryRecord(currentSelectedFileName || 'arquivo-sem-nome.txt', 'opened');
      if (data.tree) prepareTree(data.tree, 'Arvore reconstruida', 'Os bits foram percorridos para recuperar o conteudo.');
    } catch (error) {
      showError(error);
    } finally {
      setButtonLoading(decryptButton, false, 'ABRIR MENSAGEM');
    }
  });
}

function setButtonLoading(button, loading, label) {
  if (!button) return;
  button.disabled = loading;
  button.textContent = label;
}

function prepareTree(tree, title, description) {
  if (!tree) return;
  currentTree = tree;
  if ($('#treeSummaryTitle')) $('#treeSummaryTitle').textContent = title;
  if ($('#treeSummaryText')) $('#treeSummaryText').textContent = description;
  if ($('#modalDescription')) $('#modalDescription').textContent = description;
  $('#treeSummary')?.classList.remove('hidden');
  openTreeModal();
}

function openTreeModal() {
  if (!currentTree || !$('#treeModal')) return;
  renderTreeSvg(currentTree);
  setZoom(1);
  $('#treeModal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeTreeModal() {
  $('#treeModal')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

$('#openTreeModal')?.addEventListener('click', openTreeModal);
$('#closeTreeModal')?.addEventListener('click', closeTreeModal);
$('#treeModal')?.addEventListener('click', (event) => {
  if (event.target === $('#treeModal')) closeTreeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeTreeModal();
});

function setZoom(value) {
  currentZoom = Math.min(1.8, Math.max(0.5, value));
  if ($('#treeCanvas')) $('#treeCanvas').style.transform = `scale(${currentZoom})`;
  if ($('#zoomValue')) $('#zoomValue').textContent = `${Math.round(currentZoom * 100)}%`;
}
$('#zoomOut')?.addEventListener('click', () => setZoom(currentZoom - 0.1));
$('#zoomIn')?.addEventListener('click', () => setZoom(currentZoom + 0.1));
$('#zoomReset')?.addEventListener('click', () => setZoom(1));

function createSvgElement(name) {
  return document.createElementNS(SVG_NAMESPACE, name);
}

function calculateTreeLayout(root) {
  const nodes = [];
  const edges = [];
  const horizontalSpace = 105;
  const verticalSpace = 105;
  const sidePadding = 70;
  const topPadding = 55;
  let leafPosition = 0;
  let maximumDepth = 0;

  function visit(node, depth, path) {
    if (!node) return null;
    maximumDepth = Math.max(maximumDepth, depth);
    let left = null;
    let right = null;
    let x;
    if (node.leaf) {
      x = sidePadding + leafPosition * horizontalSpace;
      leafPosition += 1;
    } else {
      left = visit(node.left, depth + 1, path + '0');
      right = visit(node.right, depth + 1, path + '1');
      if (left && right) x = (left.x + right.x) / 2;
      else if (left) x = left.x + 50;
      else if (right) x = right.x - 50;
      else {
        x = sidePadding + leafPosition * horizontalSpace;
        leafPosition += 1;
      }
    }
    const result = { node, depth, path, x, y: topPadding + depth * verticalSpace };
    nodes.push(result);
    if (left) edges.push({ parent: result, child: left, bit: '0' });
    if (right) edges.push({ parent: result, child: right, bit: '1' });
    return result;
  }

  visit(root, 0, '');
  return {
    nodes,
    edges,
    width: Math.max(850, sidePadding * 2 + Math.max(leafPosition - 1, 0) * horizontalSpace),
    height: topPadding * 2 + maximumDepth * verticalSpace + 80,
  };
}

function renderTreeSvg(tree) {
  const container = $('#tree');
  if (!container) return;
  container.innerHTML = '';
  const layout = calculateTreeLayout(tree);
  const svg = createSvgElement('svg');
  svg.setAttribute('class', 'huffman-svg');
  svg.setAttribute('width', String(layout.width));
  svg.setAttribute('height', String(layout.height));
  svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);

  layout.edges.forEach((edge) => {
    const line = createSvgElement('line');
    line.setAttribute('x1', edge.parent.x);
    line.setAttribute('y1', edge.parent.y + 25);
    line.setAttribute('x2', edge.child.x);
    line.setAttribute('y2', edge.child.y - 25);
    line.setAttribute('class', edge.bit === '0' ? 'tree-edge edge-left' : 'tree-edge edge-right');
    svg.appendChild(line);
    const label = createSvgElement('text');
    label.setAttribute('x', (edge.parent.x + edge.child.x) / 2);
    label.setAttribute('y', (edge.parent.y + edge.child.y) / 2 - 5);
    label.setAttribute('class', edge.bit === '0' ? 'bit-label bit-zero' : 'bit-label bit-one');
    label.textContent = edge.bit;
    svg.appendChild(label);
  });

  layout.nodes.forEach((item) => {
    const group = createSvgElement('g');
    group.setAttribute('class', getNodeClass(item));
    group.setAttribute('transform', `translate(${item.x}, ${item.y})`);
    const rectangle = createSvgElement('rect');
    rectangle.setAttribute('x', '-38');
    rectangle.setAttribute('y', '-25');
    rectangle.setAttribute('width', '76');
    rectangle.setAttribute('height', '50');
    rectangle.setAttribute('rx', '6');
    group.appendChild(rectangle);
    const title = createSvgElement('text');
    title.setAttribute('class', 'node-title');
    title.setAttribute('x', '0');
    title.setAttribute('y', '-3');
    title.setAttribute('text-anchor', 'middle');
    title.textContent = getNodeTitle(item.node, item.depth === 0);
    group.appendChild(title);
    const path = createSvgElement('text');
    path.setAttribute('class', 'node-path');
    path.setAttribute('x', '0');
    path.setAttribute('y', '14');
    path.setAttribute('text-anchor', 'middle');
    path.textContent = item.depth === 0 ? 'R' : item.path;
    group.appendChild(path);
    svg.appendChild(group);
  });
  container.appendChild(svg);
}

function getNodeClass(item) {
  if (item.depth === 0) return 'svg-node svg-root-node';
  if (item.node.leaf) return 'svg-node svg-leaf-node';
  return 'svg-node svg-internal-node';
}

function getNodeTitle(node, isRoot) {
  if (isRoot) return 'R';
  if (!node.leaf) return 'no';
  if (node.char === ' ') return 'espaco';
  if (node.char === '\n') return 'quebra';
  if (node.char === '\t') return 'tab';
  return String(node.char ?? '');
}

// Historico local. Nao salva mensagem, senha, arvore ou bits.
function getLocalHistory() {
  try {
    const records = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    return Array.isArray(records) ? records : [];
  } catch { return []; }
}

function saveLocalHistory(records) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records.slice(-100)));
}

function createHistoryId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function addHistoryRecord(fileName, operation) {
  if (!['created', 'opened'].includes(operation)) return;
  const records = getLocalHistory();
  records.push({
    id: createHistoryId(),
    timestamp: new Date().toISOString(),
    file_name: fileName || 'arquivo-sem-nome.txt',
    operation,
  });
  saveLocalHistory(records);
  await loadHistory();
}

async function loadHistory() {
  if (!$('#historyCount') || !$('#historyList') || !$('#historyEmpty')) return;
  try {
    const data = await callApi('/api/history', { records: getLocalHistory() });
    renderHistory(data);
  } catch (error) {
    console.error('Erro ao carregar a BST:', error);
    $('#historyEmpty').textContent = 'Nao foi possivel carregar a BST. Verifique a rota /api/history.';
    $('#historyEmpty').classList.remove('hidden');
    $('#historyList').classList.add('hidden');
  }
}

function renderHistory(data) {
  const ordered = Array.isArray(data.in_order) ? data.in_order : [];
  const size = Number.isInteger(data.size) ? data.size : ordered.length;
  $('#historyCount').textContent = `${size} ${size === 1 ? 'registro' : 'registros'}`;
  $('#historyList').innerHTML = '';
  if (!ordered.length) {
    $('#historyEmpty').textContent = 'Nenhuma mensagem foi criada ou aberta neste navegador.';
    $('#historyEmpty').classList.remove('hidden');
    $('#historyList').classList.add('hidden');
  } else {
    $('#historyEmpty').classList.add('hidden');
    $('#historyList').classList.remove('hidden');
    [...ordered].reverse().forEach((record) => $('#historyList').appendChild(createHistoryCard(record)));
  }
  setTraversalText('#preOrderResult', data.pre_order);
  setTraversalText('#inOrderResult', data.in_order);
  setTraversalText('#postOrderResult', data.post_order);
}

function createHistoryCard(record) {
  const card = document.createElement('article');
  card.className = 'history-card';
  const icon = document.createElement('div');
  icon.className = record.operation === 'created' ? 'history-icon created' : 'history-icon opened';
  icon.textContent = record.operation === 'created' ? 'C' : 'A';
  const content = document.createElement('div');
  content.className = 'history-card-content';
  const name = document.createElement('strong');
  name.textContent = record.file_name || 'arquivo-sem-nome.txt';
  const operation = document.createElement('span');
  operation.textContent = record.operation === 'created' ? 'Mensagem criada' : 'Mensagem aberta';
  const time = document.createElement('time');
  time.dateTime = record.timestamp || '';
  time.textContent = formatHistoryDate(record.timestamp);
  content.append(name, operation, time);
  card.append(icon, content);
  return card;
}

function setTraversalText(selector, records) {
  const element = $(selector);
  if (element) element.textContent = formatTraversal(records);
}

function formatTraversal(records) {
  if (!Array.isArray(records) || !records.length) return 'Nenhum registro';
  return records.map((record) => record.file_name || 'arquivo-sem-nome.txt').join(' -> ');
}

function formatHistoryDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Data invalida';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(date);
}

$('#refreshHistory')?.addEventListener('click', loadHistory);
$('#clearHistory')?.addEventListener('click', async () => {
  if (!window.confirm('Deseja apagar todo o historico deste navegador?')) return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  await loadHistory();
});

function showError(error) {
  window.alert(error instanceof Error ? error.message : 'Ocorreu um erro inesperado.');
}

async function initializeApplication() {
  await checkPythonConnection();
  await loadHistory();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}
