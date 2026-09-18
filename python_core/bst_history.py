class HistoryNode:
    """
    Nó da Árvore Binária de Busca do histórico.

    A chave de ordenação é formada pelo timestamp
    e pelo ID do registro.
    """

    def __init__(
        self,
        record_id: str,
        timestamp: str,
        file_name: str,
        operation: str,
    ):
        self.record_id = record_id
        self.timestamp = timestamp
        self.file_name = file_name
        self.operation = operation

        self.left = None
        self.right = None

    @property
    def key(self) -> tuple[str, str]:
        """
        Timestamp é a chave principal.

        O ID funciona como critério de desempate
        caso dois registros possuam o mesmo horário.
        """
        return (
            self.timestamp,
            self.record_id,
        )

    def to_record(self) -> dict:
        return {
            "id": self.record_id,
            "timestamp": self.timestamp,
            "file_name": self.file_name,
            "operation": self.operation,
        }


class HistoryBST:
    """
    Árvore Binária de Busca usada para organizar
    o histórico cronologicamente.
    """

    MAX_RECORDS = 100

    def __init__(self):
        self.root = None
        self.size = 0

    def insert_record(self, record: dict) -> None:
        """
        Insere um registro obedecendo à propriedade:

        chave menor -> esquerda
        chave maior -> direita
        """
        self._validate_record(record)

        new_node = HistoryNode(
            record_id=record["id"],
            timestamp=record["timestamp"],
            file_name=record["file_name"],
            operation=record["operation"],
        )

        self.root = self._insert(
            self.root,
            new_node,
        )

    def _insert(
        self,
        current: HistoryNode | None,
        new_node: HistoryNode,
    ) -> HistoryNode:
        if current is None:
            self.size += 1
            return new_node

        if new_node.key < current.key:
            current.left = self._insert(
                current.left,
                new_node,
            )

        elif new_node.key > current.key:
            current.right = self._insert(
                current.right,
                new_node,
            )

        else:
            # Mesmo ID e timestamp.
            # Atualiza os metadados sem duplicar o nó.
            current.file_name = new_node.file_name
            current.operation = new_node.operation

        return current

    def find_by_id(
        self,
        record_id: str,
    ) -> dict | None:
        """
        Busca um ID em toda a árvore.

        Como a árvore está ordenada por timestamp,
        a busca por ID precisa percorrer os nós.
        """
        node = self._find_by_id(
            self.root,
            record_id,
        )

        if node is None:
            return None

        return node.to_record()

    def _find_by_id(
        self,
        node: HistoryNode | None,
        record_id: str,
    ) -> HistoryNode | None:
        if node is None:
            return None

        if node.record_id == record_id:
            return node

        found_left = self._find_by_id(
            node.left,
            record_id,
        )

        if found_left is not None:
            return found_left

        return self._find_by_id(
            node.right,
            record_id,
        )

    def find_by_key(
        self,
        timestamp: str,
        record_id: str,
    ) -> dict | None:
        """
        Busca eficiente utilizando a chave da BST.
        """
        target_key = (
            timestamp,
            record_id,
        )

        current = self.root

        while current is not None:
            if target_key == current.key:
                return current.to_record()

            if target_key < current.key:
                current = current.left
            else:
                current = current.right

        return None

    def in_order(self) -> list:
        """
        Percurso em ordem:

        esquerda -> raiz -> direita

        Como é uma BST por timestamp, devolve
        o histórico em ordem cronológica.
        """
        result = []

        self._in_order(
            self.root,
            result,
        )

        return result

    def _in_order(
        self,
        node: HistoryNode | None,
        result: list,
    ) -> None:
        if node is None:
            return

        self._in_order(
            node.left,
            result,
        )

        result.append(
            node.to_record()
        )

        self._in_order(
            node.right,
            result,
        )

    def pre_order(self) -> list:
        """
        Percurso em pré-ordem:

        raiz -> esquerda -> direita
        """
        result = []

        self._pre_order(
            self.root,
            result,
        )

        return result

    def _pre_order(
        self,
        node: HistoryNode | None,
        result: list,
    ) -> None:
        if node is None:
            return

        result.append(
            node.to_record()
        )

        self._pre_order(
            node.left,
            result,
        )

        self._pre_order(
            node.right,
            result,
        )

    def post_order(self) -> list:
        """
    Percurso em pós-ordem:
        esquerda -> direita -> raiz
        """
        
        result = []

        self._post_order(
            self.root,
            result,
        )

        return result

    def _post_order(
        self,
        node: HistoryNode | None,
        result: list,
    ) -> None:
        if node is None:
            return

        self._post_order(
            node.left,
            result,
        )

        self._post_order(
            node.right,
            result,
        )

        result.append(
            node.to_record()
        )

    def serialize(self) -> dict | None:
        """
        Converte a BST em um dicionário para
        visualização no frontend.
        """
        return self._serialize_node(
            self.root
        )

    def _serialize_node(
        self,
        node: HistoryNode | None,
    ) -> dict | None:
        if node is None:
            return None

        return {
            "id": node.record_id,
            "timestamp": node.timestamp,
            "file_name": node.file_name,
            "operation": node.operation,
            "left": self._serialize_node(
                node.left
            ),
            "right": self._serialize_node(
                node.right
            ),
        }

    @classmethod
    def from_records(
        cls,
        records: list,
    ) -> "HistoryBST":
        """
        Reconstrói a BST a partir dos registros
        enviados pelo navegador.
        """
        if not isinstance(records, list):
            raise ValueError(
                "O histórico precisa ser uma lista."
            )

        if len(records) > cls.MAX_RECORDS:
            raise ValueError(
                "O histórico ultrapassa o limite de 100 registros."
            )

        tree = cls()

        for record in records:
            tree.insert_record(record)

        return tree

    @staticmethod
    def _validate_record(record: dict) -> None:
        if not isinstance(record, dict):
            raise ValueError(
                "Registro de histórico inválido."
            )

        required_fields = {
            "id",
            "timestamp",
            "file_name",
            "operation",
        }

        if not required_fields.issubset(record):
            raise ValueError(
                "Registro de histórico incompleto."
            )

        if not isinstance(record["id"], str):
            raise ValueError(
                "ID do histórico inválido."
            )

        if not record["id"].strip():
            raise ValueError(
                "ID do histórico vazio."
            )

        if not isinstance(record["timestamp"], str):
            raise ValueError(
                "Data do histórico inválida."
            )

        if not record["timestamp"].strip():
            raise ValueError(
                "Data do histórico vazia."
            )

        if not isinstance(record["file_name"], str):
            raise ValueError(
                "Nome de arquivo inválido."
            )

        if len(record["file_name"]) > 200:
            raise ValueError(
                "Nome de arquivo muito grande."
            )

        allowed_operations = {
            "created",
            "opened",
        }

        if record["operation"] not in allowed_operations:
            raise ValueError(
                "Operação do histórico inválida."
            )
