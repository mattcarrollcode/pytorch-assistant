import os
import requests
import yaml
import time
import pickle
import tempfile
import subprocess
import pathlib
from bs4 import BeautifulSoup as BSHTML
from requests.models import JSONDecodeError

from openai.error import RateLimitError

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores.faiss import FAISS
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.llms import OpenAI

# OPENAI_API_KEY = ""
# os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

EMBED = "openai"
embeddings = OpenAIEmbeddings()


def preprocess_and_pickle(page_iter, src_name):
    docs = []
    splitter = CharacterTextSplitter(separator="\n", chunk_size=1024)
    for page in page_iter:
        docs.extend((splitter.create_documents(
            [page['text']], [page['metadata']])))
    pickle.dump(docs, open(f'knowledgebase/{src_name}.pkl', 'wb'))


def get_blogs(repo_owner='pytorch', repo_name='pytorch.github.io'):
    with tempfile.TemporaryDirectory() as d:
        subprocess.check_call(
            f"git clone --depth 1 https://github.com/{repo_owner}/{repo_name}.git .",
            cwd=d,
            shell=True,
        )
        git_sha = (
            subprocess.check_output("git rev-parse HEAD", shell=True, cwd=d)
            .decode("utf-8")
            .strip()
        )
        repo_path = pathlib.Path(d)
        markdown_files = list(repo_path.glob("_posts/*.md"))
        for markdown_file in markdown_files:
            with open(markdown_file, "r") as f:
                filename = markdown_file.parts[-1]
                title = os.path.splitext('-'.join(filename.split('-')[3:]))[0]
                blog_url = f"https://pytorch.org/blog/{title}/"
                yield {'text': f.read(), 'metadata': {"source": blog_url}}
# preprocess_and_pickle(get_blogs(), 'blogs')


def get_forum(period='weekly'):
    host = "https://discuss.pytorch.org"

    def _get_accepted_topics(period, page=0, dst=[]):
        resp = requests.get(
            host+f'/top.json?page={page}&period={period}&per_page=100').json()
        dst.extend([(d['id'], d['title']) for d in resp['topic_list']
                   ['topics'] if d['has_accepted_answer'] is True])
        if 'more_topics_url' in resp['topic_list'].keys():
            page += 1
            _get_accepted_topics(period=period, page=page, dst=dst)
        return dst

    def _process_cooked(cooked):
        bs = BSHTML(cooked)
        p = ' '.join([x.get_text() for x in bs.find_all('p')])
        return p

    solved_topics = _get_accepted_topics(period)
    for t, title in solved_topics:
        try:
            r = requests.get(host+f'/t/{t}/posts.json').json()
        except JSONDecodeError:
            continue
        try:
            q = title + '? ' + \
                _process_cooked(r['post_stream']['posts'][0]['cooked'])
            a = _process_cooked(
                [x['cooked'] for x in r['post_stream']['posts'] if x['accepted_answer'] is True][0])
        except IndexError:
            print(f"Skipping https://discuss.pytorch.org/t/{t}/")
            continue
        text = "QUESTION: " + q + ' ANSWER: ' + a
        yield {'text': text, 'metadata': {'source': f"https://discuss.pytorch.org/t/{t}/"}}
# preprocess_and_pickle(get_forum(), 'forum')


def get_docs(repo_owner='pytorch', repo_name='pytorch'):
    with tempfile.TemporaryDirectory() as d:
        subprocess.check_call(
            f"git clone --depth 1 https://github.com/{repo_owner}/{repo_name}.git .",
            cwd=d,
            shell=True,
        )
        repo_path = pathlib.Path(d + '/docs/source')
        # repo_path = pathlib.Path('pytorch/docs/source')
        markdown_files = list(repo_path.glob("**/*.rst"))
        for markdown_file in markdown_files:
            relative_path = markdown_file.relative_to(repo_path)
            if '_' in markdown_file.name:
                continue
            with open(markdown_file, "r") as f:
                i = markdown_file.parts.index('source')
                filename = os.path.splitext(relative_path)[0]
                page_url = f"https://pytorch.org/docs/stable/{filename}.html"
                yield {'text': f.read(), 'metadata': {"source": page_url}, "file": relative_path}
# preprocess_and_pickle(get_docs(), 'docs')


def create_vectorstores():
    for source in os.listdir('knowledgebase'):
        print(source)
        # source = os.path.splitext(pages_path)[0]
        out_path = f"vectorstore/{EMBED.lower()}_embeddings/{source}.pkl"
        if os.path.exists(out_path):
            continue

        pages = pickle.load(open(os.path.join('knowledgebase', source), 'rb'))
        docsearch = FAISS.from_documents([pages.pop(0)], embeddings)
        i, step = 0, 30
        while i < len(pages):
            texts = [d.page_content for d in pages[i:i+step]]
            meta = [d.metadata for d in pages[i:i+step]]
            try:
                docsearch.add_texts(texts, meta)
                i += step
            except RateLimitError:
                print("Hit RateLimit @ i=", i)
                time.sleep(60)
        pickle.dump(docsearch, open(out_path, "wb"))


create_vectorstores()
base_llm = OpenAI(temperature=0.2)
qa_chain = load_qa_with_sources_chain(base_llm, chain_type="stuff")

queries = [
    "Does PyTorch work on windows 32-bit?",
    "How do I make my experiment deterministic?",
    "How should I scale up my Pytorch models?",
    "Why is my training so slow?"
]

for query in queries:
    print("QUERY: ", query)
    for vectordb in os.listdir('vectorstore/openai_embeddings'):
        source = os.path.splitext(vectordb)[0]
        vectordb = 'vectorstore/openai_embeddings/'+vectordb
        db = pickle.load(open(vectordb, 'rb'))
        relevant_docs = db.similarity_search(query, k=4)
        print("From ", source)
        print(qa_chain.run(input_documents=relevant_docs, question=query))
        print("------")
    print("\n============\n")
