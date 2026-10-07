"""Tiny local test server: serves the site, checks preset logins, appends messages to messages.txt.
Run:  python server.py   then open http://localhost:8000   (Python 3, no installs needed)"""
import json, os, secrets, time, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(ROOT, "messages.txt")
USERS = {"alice": "alice123", "bob": "bob123", "carol": "carol123"}   # <- edit/add users here
CHANNELS = ["general", "random", "dev"]                              # <- edit channels here
lock, tokens, seen, msgs = threading.Lock(), {}, {}, []

if os.path.exists(LOG):  # reload history; format: time | #channel | user | text
    for line in open(LOG, encoding="utf-8"):
        p = line.rstrip("\n").split(" | ", 3)
        if len(p) == 4 and p[1].lstrip("#") in CHANNELS:
            msgs.append({"time": p[0], "channel": p[1].lstrip("#"), "user": p[2], "text": p[3]})

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass
    def reply(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def who(self): return tokens.get(self.headers.get("X-Token"))
    def body(self):
        try: return json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except Exception: return {}

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/api/poll":
            me = self.who()
            if not me: return self.reply({"error": "Not logged in"}, 401)
            q = parse_qs(u.query); ch = q.get("channel", [CHANNELS[0]])[0]
            after = int(q.get("after", ["0"])[0] or 0)
            with lock:
                seen[me] = time.time()
                cm = [m for m in msgs if m["channel"] == ch]
                members = [{"name": n, "online": time.time() - seen.get(n, 0) < 8} for n in USERS]
            return self.reply({"messages": cm[after:], "total": len(cm), "members": members})
        if u.path in ("/server.py", "/messages.txt"): return self.send_error(404)
        super().do_GET()

    def do_POST(self):
        p, d = urlparse(self.path).path, self.body()
        if p == "/api/login":
            n, pw = str(d.get("username", "")).strip().lower(), str(d.get("password", ""))
            if USERS.get(n) != pw: return self.reply({"error": "Wrong username or password."}, 401)
            t = secrets.token_hex(16); tokens[t] = n; seen[n] = time.time()
            return self.reply({"token": t, "user": n, "channels": CHANNELS})
        me = self.who()
        if not me: return self.reply({"error": "Not logged in"}, 401)
        if p == "/api/logout":
            tokens.pop(self.headers.get("X-Token"), None); seen.pop(me, None); return self.reply({"ok": True})
        if p == "/api/send":
            ch, text = d.get("channel"), " ".join(str(d.get("text", "")).split())[:2000]
            if ch not in CHANNELS or not text: return self.reply({"error": "Bad message"}, 400)
            m = {"time": time.strftime("%Y-%m-%d %H:%M:%S"), "channel": ch, "user": me, "text": text}
            with lock:
                msgs.append(m)
                with open(LOG, "a", encoding="utf-8") as f: f.write(f"{m['time']} | #{ch} | {me} | {text}\n")
            return self.reply({"ok": True})
        self.reply({"error": "Not found"}, 404)

if __name__ == "__main__":
    print("Open http://localhost:8000  (Ctrl+C to stop). Messages are saved to messages.txt")
    ThreadingHTTPServer(("0.0.0.0", 8000), H).serve_forever()
