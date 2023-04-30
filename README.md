# PyTorch Assistant

**This is a proof of concept chat app demo that uses OpenAI's GPT models and data from PyTorch's blog, forum, and docs to provide PyTorch-specific responses, creating a "PyTorch Assistant".**

The web application essentially:

1. Takes a query from the user.
1. Finds the most relevant content from PyTorch's blog, forum, and documentation related to the query using a pre-built vector database.
1. Utilizes OpenAI's API to respond to the user in natural language, incorporating relevant content from PyTorch's blog, forum, and documentation.

# Setup

### Python

- clone this repo and `cd` to the root of the repo
- Install pyenv and pyenv-virtualenv: `brew install pyenv pyenv-virtualenv`
- Add the following to your `~/.bashrc` or `~/.zshrc` file:
  ```
  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="$PYENV_ROOT/bin:$PATH"
  eval "$(pyenv init -)"
  eval "$(pyenv virtualenv-init -)"
  ```
- install Python version 3.11.1: `pyenv install 3.11.1`
- restart your shell/terminal

### OpenAI API key

- Go to https://beta.openai.com/account/api-keys and login or sign up
- Create a new API key
- Add your OpenAI API key to your enviorment: `export OPENAI_API_KEY="PUT_OPEN_API_KEY_HERE"`

### Training

- Create a new virtual env: `pyenv virtualenv 3.11.1 pytorch-assistant-training`
- `cd` to the `training` directory
- configure pyenv to use the virtual env in the current directory: `pyenv local pytorch-assistant-training`
- Install the Python dependencies: `pip install -r requirements.txt`
- Run the training script (this may take a while e.g. hours and you may run into limits on OpenAI's free teir): `python train.py`

### Backend

- Create a new virtual env: `pyenv virtualenv 3.11.1 pytorch-assistant-backend`
- `cd` to the `backend` directory
- configure pyenv to use the virtual env in the current directory: `pyenv local pytorch-assistant-backend`
- Install the Python dependencies: `pip install -r requirements.txt`
- After training has completed copy the `knowledgebase` and `vectorstore` folders from `training` to `backend`
- start the backend server: `flask --app main.py --debug run`

### Front end

- Install nvm: `brew install nvm`
- Install node v18.12.1: `nvm install v18.12.1`
- `cd` to the `frontend` folder
- Run: `npm install`
- Start the frontend server: `npm run dev`

# Testing

## Backend

`curl http://localhost:5000/?query=hi`

# Todo

- Update training script to skip training if PKL files are already present
- Create react frontend
  - https://beta.nextjs.org/docs/api-reference/use-search-params
  - https://beta.nextjs.org/docs/data-fetching/mutating
  - https://github.com/vercel/examples/tree/main/solutions/ai-chatgpt
