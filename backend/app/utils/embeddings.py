from sentence_transformers import SentenceTransformer

# Downloaded automatically on first run (~90MB, cached in ~/.cache/huggingface)
model = SentenceTransformer("all-MiniLM-L6-v2")


def get_embedding(text: str) -> list[float]:
    return model.encode(text).tolist()
