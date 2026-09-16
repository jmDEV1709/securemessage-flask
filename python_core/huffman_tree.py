import heapq
import itertools

class HuffmanNode:
    def __init__(self, char=None, freq=0):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None

    def is_leaf(self):
        return self.left is None and self.right is None

class HuffmanTree:
    def __init__(self):
        self.root = None
        self.codes = {}

    def build_tree(self, text: str):
        if not text:
            raise ValueError("A mensagem não pode estar vazia.")
        frequency = {}
        for char in text:
            frequency[char] = frequency.get(char, 0) + 1
        counter = itertools.count()
        heap = [(freq, next(counter), HuffmanNode(char, freq)) for char, freq in frequency.items()]
        heapq.heapify(heap)
        if len(heap) == 1:
            _, _, node = heapq.heappop(heap)
            root = HuffmanNode(freq=node.freq)
            root.left = node
            heapq.heappush(heap, (root.freq, next(counter), root))
        while len(heap) > 1:
            _, _, left = heapq.heappop(heap)
            _, _, right = heapq.heappop(heap)
            merged = HuffmanNode(freq=left.freq + right.freq)
            merged.left, merged.right = left, right
            heapq.heappush(heap, (merged.freq, next(counter), merged))
        self.root = heap[0][2]
        self.codes = {}
        self._generate_codes(self.root, "")
        return self.root

    def _generate_codes(self, node, code):
        if node is None: return
        if node.is_leaf():
            self.codes[node.char] = code or "0"
            return
        self._generate_codes(node.left, code + "0")
        self._generate_codes(node.right, code + "1")

    def encode(self, text: str):
        self.build_tree(text)
        return "".join(self.codes[c] for c in text), self.codes

    def serialize_tree(self, node=None):
        node = self.root if node is None else node
        if node is None: return None
        if node.is_leaf(): return {"leaf": True, "char": node.char}
        return {"leaf": False, "left": self.serialize_tree(node.left), "right": self.serialize_tree(node.right)}

    def deserialize_tree(self, data):
        self.root = self._deserialize_node(data)
        return self.root

    def _deserialize_node(self, data):
        if not isinstance(data, dict) or "leaf" not in data:
            raise ValueError("Estrutura da árvore inválida.")
        if data["leaf"]:
            return HuffmanNode(char=data.get("char"))
        node = HuffmanNode()
        node.left = self._deserialize_node(data.get("left"))
        node.right = self._deserialize_node(data.get("right"))
        return node

    def decode_from_tree(self, bits: str):
        if self.root is None: raise ValueError("Árvore vazia.")
        current, chars = self.root, []
        for bit in bits:
            if bit not in "01": raise ValueError("Sequência de bits inválida.")
            current = current.left if bit == "0" else current.right
            if current is None: raise ValueError("Bits incompatíveis com a árvore.")
            if current.is_leaf():
                chars.append(current.char)
                current = self.root
        if current is not self.root: raise ValueError("Sequência de bits incompleta.")
        return "".join(chars)
