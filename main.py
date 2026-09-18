from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    send_from_directory,
)

from python_core.secmsg_handler import (
    SecmsgFileError,
    SecmsgHandler,
)
from python_core.bst_history import (
    HistoryBST,
)

app = Flask(
    __name__,
    static_folder=None,
)

app.config["MAX_CONTENT_LENGTH"] = (
    2 * 1024 * 1024
)


@app.get("/")
def home():
    return render_template(
        "index.html"
    )



@app.get("/style.css")
def style_css():
    return send_from_directory(
        "public",
        "style.css",
    )


@app.get("/app.js")
def app_js():
    return send_from_directory(
        "public",
        "app.js",
    )


@app.get("/api/health")
def health():
    return jsonify(
        status="ok",
        motor="Python + Flask",
    )


@app.post("/api/encrypt")
def encrypt():
    try:
        data = request.get_json(
            silent=True
        ) or {}

        message = data.get(
            "message",
            ""
        )

        password = data.get(
            "password",
            ""
        )

        envelope, tree, bits, codes = (
            SecmsgHandler.encrypt_message(
                message,
                password,
            )
        )

        return jsonify(
            file=envelope,
            tree=tree,
            encoded_bits=bits,
            codes=codes,
        )

    except (
        ValueError,
        SecmsgFileError,
    ) as error:
        return jsonify(
            error=str(error),
        ), 400

    except Exception as error:
        print(
            "Erro ao criptografar:",
            type(error).__name__,
            str(error),
        )

        return jsonify(
            error=(
                "Não foi possível criar "
                "a mensagem protegida."
            ),
        ), 500


@app.post("/api/decrypt")
def decrypt():
    try:
        data = request.get_json(
            silent=True
        ) or {}

        encrypted_file = data.get(
            "file"
        )

        password = data.get(
            "password",
            ""
        )

        message, tree, bits = (
            SecmsgHandler.decrypt_message(
                encrypted_file,
                password,
            )
        )

        return jsonify(
            message=message,
            tree=tree,
            encoded_bits=bits,
        )

    except (
        ValueError,
        SecmsgFileError,
    ) as error:
        return jsonify(
            error=str(error),
        ), 400

    except Exception as error:
        print(
            "Erro ao descriptografar:",
            type(error).__name__,
            str(error),
        )

        return jsonify(
            error=(
                "Não foi possível abrir "
                "a mensagem protegida."
            ),
        ), 500
@app.post("/api/history")
def history():
    """
    Recebe os registros guardados pelo navegador,
    monta uma BST e devolve:

    - histórico em ordem cronológica;
    - pré-ordem;
    - pós-ordem;
    - estrutura serializada da BST.
    """
    try:
        data = request.get_json(
            silent=True
        ) or {}

        records = data.get(
            "records",
            [],
        )

        history_tree = (
            HistoryBST.from_records(
                records
            )
        )

        return jsonify(
            size=history_tree.size,
            in_order=history_tree.in_order(),
            pre_order=history_tree.pre_order(),
            post_order=history_tree.post_order(),
            tree=history_tree.serialize(),
        )

    except ValueError as error:
        return jsonify(
            error=str(error),
        ), 400


@app.post("/api/history/search")
def search_history():
    """
    Busca um registro pelo ID.

    O histórico é reconstruído como uma BST
    antes da operação.
    """
    try:
        data = request.get_json(
            silent=True
        ) or {}

        records = data.get(
            "records",
            [],
        )

        record_id = data.get(
            "id",
            "",
        )

        if not isinstance(record_id, str):
            raise ValueError(
                "ID de busca inválido."
            )

        history_tree = (
            HistoryBST.from_records(
                records
            )
        )

        found = history_tree.find_by_id(
            record_id
        )

        if found is None:
            return jsonify(
                found=False,
                record=None,
            )

        return jsonify(
            found=True,
            record=found,
        )

    except ValueError as error:
        return jsonify(
            error=str(error),
        ), 400

@app.errorhandler(413)
def too_large(_error):
    return jsonify(
        error="O arquivo ultrapassa 2 MB.",
    ), 413


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )
    
    