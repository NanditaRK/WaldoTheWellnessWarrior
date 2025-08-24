# voice-agent/python-voice-agent/web.py
import os
import subprocess
import threading
import time
from flask import Flask, jsonify

app = Flask(__name__)

def run_agent():
    while True:
        proc = subprocess.Popen(["python", "agent.py"], cwd=os.path.dirname(__file__))
        ret = proc.wait()
        app.logger.warning(f"agent.py exited with {ret}, restarting in 5s...")
        time.sleep(5)

@app.route("/")
def index():
    return jsonify({"status": "ok", "message": "voice-agent running"})

@app.route("/_health")
def health():
    return "ok", 200

if __name__ == "__main__":
    
    t = threading.Thread(target=run_agent, daemon=True)
    t.start()
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
