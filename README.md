#

# Setup

## Dependencies

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
- Create a new virtual env: `pyenv virtualenv 3.11.1 pytorch-assistant`
- configure pyenv to use the virtual env in the current directory: `pyenv local pytorch-assistant`
- Install the Python dependencies: `pip install -r requirements.txt`

### OpenAI API key

- Go to https://beta.openai.com/account/api-keys and login or sign up
- Create a new API key
- Add your OpenAI API key to your enviorment: `export OPENAI_API_KEY="PUT_OPEN_API_KEY_HERE"`

### FAISS

- Install miniconda: `brew install --cask miniconda`
- Install FAISS from miniconda: `conda install -c pytorch faiss-cpu`

## Training

- `python train.py`

## Backend

- `flask --app main run`

## Frontend

- `cd frontend`
- `npm install`
- `npm run dev`

# Testing

## Backend

`curl -d '{"query":"test"}' -H "Content-Type: application/json" -X POST http://localhost:5000/query`
