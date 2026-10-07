const $ = id => document.getElementById(id);
const COLORS = ["#5865f2", "#eb459e", "#c98a0f", "#23a55a", "#e67e22", "#1abc9c", "#9b59b6"];
const colorFor = s => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const toast = m => { const t = $("toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 3000); };
const avatar = (n, extra) => { const d = document.createElement("div"); d.className = "avatar"; d.style.background = colorFor(n); d.textContent = n[0].toUpperCase(); return d; };
let token = sessionStorage.getItem("token"), user = sessionStorage.getItem("user"), channels = JSON.parse(sessionStorage.getItem("channels") || "[]");
let channel = null, after = 0, timer = null;

async function api(path, body) {
  const r = await fetch(path, { method: body ? "POST" : "GET", headers: { "X-Token": token || "", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && token && path !== "/api/login") { logout(true); throw new Error("Session expired"); }
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}
$("auth-form").onsubmit = async e => {
  e.preventDefault(); $("auth-error").textContent = "";
  try {
    const j = await api("/api/login", { username: $("auth-user").value, password: $("auth-pass").value });
    token = j.token; user = j.user; channels = j.channels;
    sessionStorage.setItem("token", token); sessionStorage.setItem("user", user); sessionStorage.setItem("channels", JSON.stringify(channels));
    start();
  } catch (err) { $("auth-error").textContent = err.message === "Failed to fetch" ? "Can't reach server. Is server.py running?" : err.message; }
};
async function logout(silent) {
  if (!silent) try { await api("/api/logout", {}); } catch {}
  clearInterval(timer); sessionStorage.clear(); token = user = null;
  $("app").classList.add("hidden"); $("auth").classList.remove("hidden"); $("auth-pass").value = "";
}
$("logout").onclick = () => logout();

function start() {
  $("auth").classList.add("hidden"); $("app").classList.remove("hidden");
  $("me-name").textContent = user; $("me-avatar").replaceWith(Object.assign(avatar(user), { id: "me-avatar" }));
  selectChannel(channels[0]); clearInterval(timer); timer = setInterval(poll, 1500);
}
function selectChannel(c) {
  channel = c; after = 0; $("messages").innerHTML = "";
  $("chat-title").textContent = "# " + c; $("msg-input").placeholder = "Message #" + c;
  const l = $("channel-list"); l.innerHTML = "";
  channels.forEach(n => { const e = document.createElement("div"); e.className = "ch" + (n === c ? " active" : ""); e.textContent = "# " + n; e.onclick = () => selectChannel(n); l.append(e); });
  $("app").classList.remove("show-menu"); poll();
}
let polling = false;
async function poll() {
  if (polling || !token) return; polling = true; const ch = channel;
  try {
    const j = await api(`/api/poll?channel=${encodeURIComponent(ch)}&after=${after}`);
    if (ch !== channel) return;
    renderMembers(j.members);
    if (j.messages.length || after === 0) addMessages(j.messages, after === 0 && j.total === 0);
    after = j.total;
  } catch {} finally { polling = false; }
}
function addMessages(list, empty) {
  const box = $("messages"), stick = box.scrollHeight - box.scrollTop - box.clientHeight < 80 || after === 0;
  if (empty) { box.innerHTML = "<div class='empty'><h2></h2><p>No messages yet. Say hello!</p></div>"; box.querySelector("h2").textContent = "#" + channel; return; }
  box.querySelector(".empty")?.remove();
  list.forEach(m => {
    const row = document.createElement("div"); row.className = "msg";
    const body = document.createElement("div"), head = document.createElement("div");
    const nm = document.createElement("span"); nm.className = "name"; nm.textContent = m.user; nm.style.color = colorFor(m.user);
    const tm = document.createElement("span"); tm.className = "time"; tm.textContent = m.time;
    const tx = document.createElement("div"); tx.className = "body"; tx.textContent = m.text;
    head.append(nm, tm); body.append(head, tx); row.append(avatar(m.user), body); box.append(row);
  });
  if (stick) box.scrollTop = box.scrollHeight;
}
function renderMembers(ms) {
  const l = $("member-list"); l.innerHTML = "";
  [...ms].sort((a, b) => b.online - a.online || a.name.localeCompare(b.name)).forEach(m => {
    const r = document.createElement("div"); r.className = "mem" + (m.online ? "" : " off");
    const av = avatar(m.name), d = document.createElement("span"); d.className = "dot" + (m.online ? " on" : ""); av.append(d);
    const n = document.createElement("span"); n.textContent = m.name; r.append(av, n); l.append(r);
  });
}
$("composer").onsubmit = async e => {
  e.preventDefault(); const t = $("msg-input").value.trim(); if (!t) return; $("msg-input").value = "";
  try { await api("/api/send", { channel, text: t }); poll(); } catch (err) { $("msg-input").value = t; toast(err.message); }
};
$("menu-btn").onclick = () => $("app").classList.toggle("show-menu");
$("members-btn").onclick = () => $("app").classList.toggle("show-members");
$("scrim").onclick = () => $("app").classList.remove("show-menu", "show-members");
if (token && user && channels.length) start();
