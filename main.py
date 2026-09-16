import json
from flask import Flask, render_template, request, jsonify, Response
from python_core.secmsg_handler import SecmsgHandler, SecmsgFileError

app = Flask(__name__, static_folder="public", static_url_path="/public")
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024

@app.get("/")
def home(): return render_template("index.html")

@app.get("/api/health")
def health(): return jsonify(status="ok", motor="Python + Flask")

@app.post("/api/encrypt")
def encrypt():
    try:
        data = request.get_json(silent=True) or {}
        envelope, tree, bits, codes = SecmsgHandler.encrypt_message(data.get("message", ""), data.get("password", ""))
        return jsonify(file=envelope, tree=tree, encoded_bits=bits, codes=codes)
    except (ValueError, SecmsgFileError) as exc:
        return jsonify(error=str(exc)), 400

@app.post("/api/decrypt")
def decrypt():
    try:
        data = request.get_json(silent=True) or {}
        message, tree, bits = SecmsgHandler.decrypt_message(data.get("file"), data.get("password", ""))
        return jsonify(message=message, tree=tree, encoded_bits=bits)
    except (ValueError, SecmsgFileError) as exc:
        return jsonify(error=str(exc)), 400

@app.errorhandler(413)
def too_large(_): return jsonify(error="O arquivo ultrapassa 2 MB."), 413

if __name__ == "__main__":
    app.run(debug=True, port=5000)
