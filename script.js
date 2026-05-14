const tabs = document.querySelectorAll("[data-tab]");
const jumpers = document.querySelectorAll("[data-jump]");
const screens = document.querySelectorAll("[data-screen]");

const qrPanel = document.querySelector("#qrPanel");
const showQrButton = document.querySelector("#showQrButton");
const startTbmButton = document.querySelector("#startTbmButton");
const tbmActivity = document.querySelector("#tbmActivity");
const attendanceCount = document.querySelector("#attendanceCount");
const tbmStartTime = document.querySelector("#tbmStartTime");
const tbmElapsed = document.querySelector("#tbmElapsed");
const completeTbmButton = document.querySelector("#completeTbmButton");
const completeNote = document.querySelector("#completeNote");
const emergencyButtons = document.querySelectorAll(".quick-alerts button");
const sendEmergencyButton = document.querySelector("#sendEmergencyButton");
const emergencyNote = document.querySelector("#emergencyNote");
const tbmChecks = document.querySelectorAll(".tbm-check");
const tbmChoiceOptions = document.querySelectorAll(".choice-option");
const otherReason = document.querySelector("#otherReason");
const signatureCanvas = document.querySelector("#signatureCanvas");
const clearSignatureButton = document.querySelector("#clearSignatureButton");
const signatureState = document.querySelector("#signatureState");
const noticeTabs = document.querySelectorAll("[data-notice-tab]");
const noticePanels = document.querySelectorAll("[data-notice-panel]");
const libraryTabs = document.querySelectorAll("[data-library-tab]");
const libraryPanels = document.querySelectorAll("[data-library-panel]");
const statusTabs = document.querySelectorAll("[data-status-tab]");
const statusPanels = document.querySelectorAll("[data-status-panel]");
const documentButtons = document.querySelectorAll("[data-document-open]");
const documentOpenNote = document.querySelector("#documentOpenNote");
const documentOpenNoteGlobal = document.querySelector("#documentOpenNoteGlobal");
const healthFormButtons = document.querySelectorAll("[data-health-form]");
const healthWritePanel = document.querySelector("#healthWritePanel");
const healthWriteTitle = document.querySelector("#healthWriteTitle");
const submitHealthFormButton = document.querySelector("#submitHealthFormButton");
const healthSubmitNote = document.querySelector("#healthSubmitNote");

let tbmStartedAt = null;
let timerId = null;
let isSigning = false;
let hasSignature = false;

function signatureContext() {
  const context = signatureCanvas?.getContext?.("2d");
  if (!context) return null;
  context.lineWidth = 3;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#005cbf";
  return context;
}

function signaturePoint(event) {
  const rect = signatureCanvas.getBoundingClientRect();
  const scaleX = signatureCanvas.width / rect.width;
  const scaleY = signatureCanvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function setSignatureState(signed) {
  hasSignature = signed;
  signatureCanvas?.parentElement?.classList.toggle("is-signed", signed);
  if (signatureState) signatureState.textContent = signed ? "서명 완료" : "서명 대기";
}

function clearSignature() {
  const context = signatureContext();
  if (!context || !signatureCanvas) return;
  context.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  setSignatureState(false);
}

function showScreen(name) {
  screens.forEach((screen) => {
    const active = screen.dataset.screen === name;
    screen.classList.toggle("is-active", active);
    if (active) {
      screen.scrollTop = 0;
    }
  });

  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === name);
  });
}

function formatClock(date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateElapsed() {
  if (!tbmStartedAt || !tbmElapsed) return;
  tbmElapsed.textContent = formatElapsed(Date.now() - tbmStartedAt.getTime());
}

function setLibraryTab(selected) {
  libraryTabs.forEach((tab) => {
    const active = tab.dataset.libraryTab === selected;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  libraryPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.libraryPanel === selected);
  });
}

function setStatusTab(selected) {
  statusTabs.forEach((tab) => {
    const active = tab.dataset.statusTab === selected;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  statusPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.statusPanel === selected);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showScreen(tab.dataset.tab));
});

jumpers.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.jump);
    if (button.dataset.libraryJump) {
      setLibraryTab(button.dataset.libraryJump);
    }
  });
});

showQrButton?.addEventListener("click", () => {
  qrPanel?.classList.add("is-visible");
  showQrButton.textContent = "QR 표시됨";
});

startTbmButton?.addEventListener("click", () => {
  tbmActivity?.classList.add("is-visible");
  attendanceCount.textContent = "19 / 24명";
  tbmStartedAt = null;
  tbmStartTime.textContent = "08:20";
  tbmElapsed.textContent = "종료 후 확정";
  completeNote.textContent = "";
  clearInterval(timerId);
  clearSignature();
});

completeTbmButton?.addEventListener("click", () => {
  if (!hasSignature) {
    completeNote.textContent = "참여 서명을 먼저 입력해 주세요.";
    return;
  }
  clearInterval(timerId);
  tbmElapsed.textContent = "관리자 마감 대기";
  completeNote.textContent = "문항 제출과 전자서명이 완료되었습니다. 관리자가 TBM을 종료하면 공식 시간이 누적 반영됩니다.";
});

signatureCanvas?.addEventListener("pointerdown", (event) => {
  const context = signatureContext();
  if (!context) return;
  isSigning = true;
  signatureCanvas.setPointerCapture?.(event.pointerId);
  const point = signaturePoint(event);
  context.beginPath();
  context.moveTo(point.x, point.y);
});

signatureCanvas?.addEventListener("pointermove", (event) => {
  if (!isSigning) return;
  const context = signatureContext();
  if (!context) return;
  const point = signaturePoint(event);
  context.lineTo(point.x, point.y);
  context.stroke();
  setSignatureState(true);
});

signatureCanvas?.addEventListener("pointerup", () => {
  isSigning = false;
});

signatureCanvas?.addEventListener("pointerleave", () => {
  isSigning = false;
});

clearSignatureButton?.addEventListener("click", clearSignature);

emergencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    emergencyButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    otherReason?.classList.toggle("is-visible", button.dataset.otherAlert === "true");
  });
});

tbmChecks.forEach((button) => {
  button.addEventListener("click", () => {
    const checked = !button.classList.contains("is-checked");
    button.classList.toggle("is-checked", checked);
    button.setAttribute("aria-pressed", String(checked));
  });
});

tbmChoiceOptions.forEach((button) => {
  button.addEventListener("click", () => {
    tbmChoiceOptions.forEach((option) => {
      option.classList.remove("is-selected");
      option.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
  });
});

noticeTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.noticeTab;
    noticeTabs.forEach((tab) => {
      const active = tab.dataset.noticeTab === selected;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    noticePanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.noticePanel === selected);
    });
  });
});

libraryTabs.forEach((button) => {
  button.addEventListener("click", () => setLibraryTab(button.dataset.libraryTab));
});

documentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const title = button.dataset.documentOpen || button.textContent.trim();
    const message = `${title} 자료를 열람했습니다. 실제 앱에서는 PDF, 이미지, 영상 상세 화면으로 연결됩니다.`;
    if (documentOpenNote) {
      documentOpenNote.textContent = message;
    }
    if (documentOpenNoteGlobal) documentOpenNoteGlobal.textContent = message;
  });
});

statusTabs.forEach((button) => {
  button.addEventListener("click", () => setStatusTab(button.dataset.statusTab));
});

healthFormButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isJoin = button.dataset.healthForm === "join";
    healthWritePanel?.classList.add("is-visible");
    healthWritePanel?.setAttribute("aria-hidden", "false");
    if (healthWriteTitle) healthWriteTitle.textContent = isJoin ? "입사시 기본 건강문진" : "연 1회 정기 건강문진";
    if (healthSubmitNote) healthSubmitNote.textContent = "";
  });
});

submitHealthFormButton?.addEventListener("click", () => {
  if (healthSubmitNote) {
    healthSubmitNote.textContent = "문진표가 제출되었습니다. 관리자는 제출 여부와 확인 필요 항목만 권한에 따라 확인합니다.";
  }
});

sendEmergencyButton?.addEventListener("click", () => {
  const selected = document.querySelector(".quick-alerts button.is-selected");
  const type = selected ? selected.textContent : "기타";
  emergencyNote.textContent = `${type} 비상알람이 현장 관리자에게 전송되었습니다.`;
});
