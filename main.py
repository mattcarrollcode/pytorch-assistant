import os
import pickle
# from openai import OpenAI
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.llms import OpenAI
from flask import Flask, request

app = Flask(__name__)
base_llm = OpenAI(temperature=0.2)
qa_chain = load_qa_with_sources_chain(base_llm, chain_type="stuff")


@app.route('/query', methods=['POST'])
def foo():
    query = request.json['query']
    print(query)
    data = get_query_result(query)
    print(data)
    # result = get_query_result(data.query)
    return data


def get_query_result(query):
    response = {"messages": []}
    for vectordb in os.listdir('vectorstore/openai_embeddings'):
        source = os.path.splitext(vectordb)[0]
        vectordb = 'vectorstore/openai_embeddings/'+vectordb
        db = pickle.load(open(vectordb, 'rb'))

        relevant_docs = db.similarity_search(query, k=4)
        response['messages'].append({"source": source, "message": qa_chain.run(
            input_documents=relevant_docs, question=query)})
    return response
