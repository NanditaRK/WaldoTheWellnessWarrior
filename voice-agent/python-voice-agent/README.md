

# Python Voice Agent


A basic example of a voice agent using livekit and python.

## Dev Setup

Clone the repository and install dependencies to a virtual environment:

```console
# Linux/macOS
cd python-voice-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 agent.py download-files
```


Set up the environment by copying `.env.example` to `.env.local` and filling in the required values:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `GEMINI_API_KEY`
- `CARTESIA_API_KEY`
- `DEEPGRAM_API_KEY`




Run the agent in just the console:

```console
python3 agent.py console
```


Run the agent and use an external frontend:
```console
python3 agent.py dev
```
