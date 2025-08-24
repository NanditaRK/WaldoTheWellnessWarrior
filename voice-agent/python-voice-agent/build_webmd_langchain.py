# build_webmd_langchain.py
from datasets import load_dataset
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
# import pickle

def main():
    #loding the dataset
    dataset = load_dataset("shefali2023/webmd-data", split="train[:2000]")  # use subset for demo
    # print(dataset.column_names)
    # print(dataset[0])

    #embedding model
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    #preparing the docs
    texts = [row["Prompt"] for row in dataset]  # main content
    metadatas = [{"index": i} for i, _ in enumerate(dataset)]  # optional metadata

    #faiss index used as it is a smaller dataset instead of smth like pinecone or chroma
    vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadatas)

    #save locally
    vectorstore.save_local("webmd_faiss_langchain")

    print("FAISS index built and saved to webmd_faiss_langchain/")

if __name__ == "__main__":
    main()
