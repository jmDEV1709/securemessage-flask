import base64
import json
import os
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from .huffman_tree import HuffmanTree

class SecmsgFileError(ValueError): pass

class SecmsgHandler:
    FORMAT_NAME = "securemessage-huffman-aes"
    FORMAT_VERSION = 2
    ITERATIONS = 600_000
    AAD = b"securemessage-v2"

    @classmethod
    def _key(cls, password, salt):
        if not password: raise ValueError("A senha não pode estar vazia.")
        return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=cls.ITERATIONS).derive(password.encode())

    @staticmethod
    def _b64(value): return base64.b64encode(value).decode("ascii")

    @staticmethod
    def _unb64(value):
        try: return base64.b64decode(value, validate=True)
        except Exception as exc: raise SecmsgFileError("Arquivo inválido ou corrompido.") from exc

    @classmethod
    def encrypt_message(cls, message, password):
        huffman = HuffmanTree()
        bits, codes = huffman.encode(message)
        tree = huffman.serialize_tree()
        inner = json.dumps({"algorithm":"huffman-binary-tree","tree":tree,"encoded_bits":bits}, ensure_ascii=False, separators=(",", ":")).encode()
        salt, nonce = os.urandom(16), os.urandom(12)
        cipher = AESGCM(cls._key(password, salt)).encrypt(nonce, inner, cls.AAD)
        envelope = {"format":cls.FORMAT_NAME,"version":2,"kdf":"PBKDF2-HMAC-SHA256","iterations":cls.ITERATIONS,"cipher":"AES-256-GCM","salt":cls._b64(salt),"nonce":cls._b64(nonce),"ciphertext":cls._b64(cipher)}
        return envelope, tree, bits, codes

    @classmethod
    def decrypt_message(cls, envelope, password):
        if not isinstance(envelope, dict) or envelope.get("format") != cls.FORMAT_NAME or envelope.get("version") != 2:
            raise SecmsgFileError("Formato de arquivo não suportado.")
        try:
            salt, nonce, cipher = cls._unb64(envelope["salt"]), cls._unb64(envelope["nonce"]), cls._unb64(envelope["ciphertext"])
            plain = AESGCM(cls._key(password, salt)).decrypt(nonce, cipher, cls.AAD)
            data = json.loads(plain.decode())
            huffman = HuffmanTree(); huffman.deserialize_tree(data["tree"])
            message = huffman.decode_from_tree(data["encoded_bits"])
            return message, data["tree"], data["encoded_bits"]
        except InvalidTag as exc:
            raise SecmsgFileError("Senha incorreta ou arquivo modificado.") from exc
        except (KeyError, ValueError, json.JSONDecodeError) as exc:
            if isinstance(exc, SecmsgFileError): raise
            raise SecmsgFileError("Arquivo inválido ou corrompido.") from exc
