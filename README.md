# SecureMessage Flask

Aplicação Flask pronta para Vercel. Usa árvore binária de Huffman para codificar a mensagem e AES-256-GCM para proteger árvore e bits no arquivo `.txt`.

## Local
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```
Abra `http://127.0.0.1:5000`.

## Vercel
Envie a pasta para um repositório GitHub, importe na Vercel e faça o deploy com a raiz do projeto. O ponto de entrada é `main:app`.
