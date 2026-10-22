const assessmentModal = document.querySelector("#assessmentModal");
const assessmentButton = document.querySelector("#assessmentButton");
const closeModalButton = document.querySelector("#closeModal");
const assessmentForm = document.querySelector("#assessmentForm");
const confidenceInput = document.querySelector("#confidence");
const confidenceOutput = document.querySelector("#confidenceOutput");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");
const sessionKey = "skillspring.session";
let toastTimer;

function leaveDashboard() {
  sessionStorage.removeItem(sessionKey);
  window.location.replace("auth.html");
}

try {
  const session = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
  if (!session?.name || !session?.email) {
    leaveDashboard();
  } else {
    document.querySelector("#welcomeTitle").firstChild.textContent = `Good morning, ${session.name}`;
    document.querySelector(".profile-text strong").textContent = session.name;
    document.querySelector(".profile-text small").textContent = session.email;
    document.querySelector(".avatar").textContent = session.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }
} catch {
  leaveDashboard();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
}

function openAssessment() {
  assessmentModal.hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector("#focusSkill").focus();
}

function closeAssessment() {
  assessmentModal.hidden = true;
  document.body.classList.remove("modal-open");
  assessmentButton.focus();
}

assessmentButton.addEventListener("click", openAssessment);
closeModalButton.addEventListener("click", closeAssessment);
assessmentModal.addEventListener("click", (event) => {
  if (event.target === assessmentModal) closeAssessment();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !assessmentModal.hidden) closeAssessment();
});

confidenceInput.addEventListener("input", () => {
  confidenceOutput.value = `${confidenceInput.value} / 5`;
});

assessmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const skill = document.querySelector("#focusSkill").value;
  const confidence = Number(confidenceInput.value);
  const readiness = Math.min(95, 68 + (confidence - 3) * 3);
  document.querySelector("#readinessValue").innerHTML = `${readiness}<span>%</span>`;
  document.querySelector(".insight-banner p").innerHTML =
    `<strong>Your next focus:</strong> Keep building your ${skill.toLowerCase()} skills with a lesson picked just for you.`;
  closeAssessment();
  showToast(`Your learning plan is updated with ${skill} as your focus.`);
});

menuButton.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    sidebar.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  });
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelector("#viewSkillsButton").addEventListener("click", () => {
  showToast("Your skill landscape is up to date. Retake your assessment to refresh your levels.");
});

document.querySelectorAll(".course-action").forEach((button) => {
  button.addEventListener("click", () => {
    const courseName = button.closest(".course-item").querySelector("h3").textContent;
    showToast(`Ready when you are — ${courseName} is on your learning path.`);
  });
});

document.querySelector(".notification-button").addEventListener("click", () => {
  showToast("You’re all caught up. Your next learning goal is just 2 hours away.");
});

document.querySelector(".profile-button").addEventListener("click", () => {
  leaveDashboard();
});

document.querySelector("#accountButton").addEventListener("click", leaveDashboard);

document.querySelector(".more-button").addEventListener("click", () => {
  showToast("Your learning path is tailored to your Senior Product Designer goal.");
});
