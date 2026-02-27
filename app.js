// ── State ─────────────────────────────────────────────────
const state = {
  missions: [],
  totalXP: 0,
  selectedDiff: "easy",
};

const XP_VALUES = { easy: 10, normal: 25, hard: 50 };

const RANKS = [
  { min: 200, label: "Archmage" },
  { min: 50, label: "Sorcerer" },
  { min: 0, label: "Novice" },
];

function getRank(xp) {
  return RANKS.find((r) => xp >= r.min);
}

// ── Difficulty selector ───────────────────────────────────
function selectDiff(btn) {
  document
    .querySelectorAll(".diff-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  state.selectedDiff = btn.dataset.diff;
}

// ── Add mission ───────────────────────────────────────────
function addMission() {
  const nameInput = document.getElementById("mission-name");
  const descInput = document.getElementById("mission-desc");

  const name = nameInput.value.trim();
  const desc = descInput.value.trim();

  if (!name) {
    showToast("Ponle nombre a la mision.");
    nameInput.focus();
    return;
  }

  const mission = {
    id: Date.now(),
    name,
    description: desc || "Sin descripcion.",
    difficulty: state.selectedDiff,
    xp: XP_VALUES[state.selectedDiff],
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  console.log("[disci-app] Mision creada:", mission);

  state.missions.push(mission);
  nameInput.value = "";
  descInput.value = "";

  render();
  showToast(`Mision "${name}" creada.`);
}

// ── Complete mission ──────────────────────────────────────
function completeMission(id) {
  const mission = state.missions.find((m) => m.id === id);
  if (!mission || mission.status === "SUCCESFUL") return;

  mission.status = "SUCCESFUL";
  state.totalXP += mission.xp;

  console.log("[disci-app] Mision completada:", mission);
  console.log("[disci-app] XP total:", state.totalXP);

  render();
  showToast(`+${mission.xp} XP ganados.`);
}

// ── Render ────────────────────────────────────────────────
function render() {
  const list = document.getElementById("mission-list");
  const emptyEl = document.getElementById("empty-state");

  const active = state.missions.filter((m) => m.status === "PENDING");
  const done = state.missions.filter((m) => m.status === "SUCCESFUL");

  document.getElementById("active-count").textContent = active.length;
  document.getElementById("done-count").textContent = done.length;

  list.innerHTML = "";

  if (state.missions.length === 0) {
    list.appendChild(emptyEl);
    return;
  }

  const diffLabel = { easy: "Facil", normal: "Normal", hard: "Dificil" };

  [...active, ...done].forEach((mission) => {
    const isDone = mission.status === "SUCCESFUL";
    const li = document.createElement("li");
    li.className = `mission-item${isDone ? " done" : ""}`;
    li.innerHTML = `
      <div class="diff-dot ${mission.difficulty}"></div>
      <div class="mission-body">
        <div class="mission-name">${escapeHTML(mission.name)}</div>
        <div class="mission-desc">${escapeHTML(mission.description)}</div>
        <div class="mission-meta">
          <span class="badge ${mission.difficulty}">${diffLabel[mission.difficulty]}</span>
          <span class="badge ${isDone ? "done" : "pending"}">${mission.status}</span>
          <span class="xp-badge">+${mission.xp} XP</span>
        </div>
      </div>
      <button class="complete-btn" onclick="completeMission(${mission.id})" ${isDone ? "disabled" : ""}>
        ${isDone ? "✓" : "○"}
      </button>
    `;
    list.appendChild(li);
  });

  updateXP();
}

// ── XP bar & rank ─────────────────────────────────────────
function updateXP() {
  const rank = getRank(state.totalXP);
  const nextIdx = RANKS.findIndex((r) => r.min <= state.totalXP) - 1;
  const next = RANKS[nextIdx];

  let pct = 0;
  if (next) {
    pct = Math.min(
      100,
      ((state.totalXP - rank.min) / (next.min - rank.min)) * 100,
    );
  } else {
    pct = Math.min(100, (state.totalXP / 200) * 100);
  }

  document.getElementById("xp-bar").style.width = pct + "%";
  document.getElementById("total-xp").textContent = state.totalXP;
  document.getElementById("rank-badge").textContent = rank.label;
}

// ── Toast ─────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── Helpers ───────────────────────────────────────────────
function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

// ── Init ──────────────────────────────────────────────────
render();
updateXP();
