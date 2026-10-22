const USERS_KEY = "skillspring.users";
const SESSION_KEY = "skillspring.session";
const HASH_ITERATIONS = 150000;
const encoder = new TextEncoder();
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const loginTab = document.querySelector("#loginTab");
const registerTab = document.querySelector("#registerTab");
const loginPanel = document.querySelector("#loginPanel");
const registerPanel = document.querySelector("#registerPanel");
const authMessage = document.querySelector("#authMessage");

function showMessage(message, type = "error") {
  authMessage.textContent = message;
  authMessage.classList.toggle("auth-error", type === "error");
  authMessage.classList.toggle("auth-success", type === "success");
}

function setMode(mode) {
  const loginMode = mode === "login";
  loginPanel.hidden = !loginMode;
  registerPanel.hidden = loginMode;
  loginTab.classList.toggle("active", loginMode);
  registerTab.classList.toggle("active", !loginMode);
  loginTab.setAttribute("aria-selected", String(loginMode));
  registerTab.setAttribute("aria-selected", String(!loginMode));
  showMessage("");
}

function loadUsers() {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  const users = JSON.parse(data);
  if (!Array.isArray(users)) throw new Error("Saved account data is invalid.");
  return users;
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw new Error("Saved account data is invalid.");
  return Uint8Array.from(value.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const result = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: HASH_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return toHex(new Uint8Array(result));
}

function beginSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
  window.location.replace("index.html");
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
document.querySelectorAll("[data-show]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.show));
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = new FormData(registerForm);
  const name = String(values.get("name")).trim();
  const email = String(values.get("email")).trim().toLowerCase();
  const password = String(values.get("password"));
  const submit = registerForm.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const users = loadUsers();
    if (users.some((user) => user.email === email)) {
      showMessage("An account already exists with this email. Please log in.");
      setMode("login");
      document.querySelector("#loginEmail").value = email;
      showMessage("An account already exists with this email. Please log in.");
      return;
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const user = { name, email, salt: toHex(salt), passwordHash: await hashPassword(password, salt) };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    beginSession(user);
  } catch (error) {
    showMessage(`Could not register: ${error.message}`);
  } finally {
    submit.disabled = false;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = new FormData(loginForm);
  const email = String(values.get("email")).trim().toLowerCase();
  const password = String(values.get("password"));
  const submit = loginForm.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const user = loadUsers().find((account) => account.email === email);
    if (!user) {
      showMessage("No account found for that email. Check your details or register.");
      return;
    }
    const hash = await hashPassword(password, fromHex(user.salt));
    if (hash !== user.passwordHash) {
      showMessage("That email and password don’t match. Please try again.");
      return;
    }
    beginSession(user);
  } catch (error) {
    showMessage(`Could not log in: ${error.message}`);
  } finally {
    submit.disabled = false;
  }
});

if (sessionStorage.getItem(SESSION_KEY)) window.location.replace("index.html");