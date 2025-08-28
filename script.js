// Sample texts for random mode
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet and is commonly used for typing practice.",
  "Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our future.",
  "Reading is a window to different worlds and perspectives. Books allow us to explore new ideas, cultures, and experiences from the comfort of our own space.",
  "Cooking is both an art and a science. The perfect blend of ingredients, timing, and technique can create memorable dishes that bring people together.",
  "Nature provides us with countless wonders, from the smallest insects to the vastness of the ocean. Every ecosystem plays a vital role in maintaining balance.",
  "Music has the power to evoke emotions, tell stories, and connect people across cultures. It serves as a universal language that transcends boundaries.",
  "Exercise and physical activity are essential for maintaining good health. Regular movement strengthens the body, improves mood, and increases energy levels.",
  "Learning new skills and pursuing knowledge is a lifelong journey. Curiosity and dedication are the keys to personal growth and development.",
];

// Global variables
let currentText = "";
let startTime = null;
let endTime = null;
let timer = null;
let testDuration = 60; // default 1 minute
let isTestActive = false;
let currentMode = "random";
let typedCharacters = 0;
let correctCharacters = 0;
let errors = 0;

// DOM elements
const elements = {
  settingsPanel: document.getElementById("settingsPanel"),
  testArea: document.getElementById("testArea"),
  textContent: document.getElementById("textContent"),
  typingInput: document.getElementById("typingInput"),
  timeDisplay: document.getElementById("timeDisplay"),
  wpmDisplay: document.getElementById("wpmDisplay"),
  cpmDisplay: document.getElementById("cpmDisplay"),
  accuracyDisplay: document.getElementById("accuracyDisplay"),
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),
  historyBtn: document.getElementById("historyBtn"),
  resultsModal: document.getElementById("resultsModal"),
  historyModal: document.getElementById("historyModal"),
  customTextArea: document.getElementById("customTextArea"),
  customTextInput: document.getElementById("customTextInput"),
};

// Initialize GSAP animations
function initAnimations() {
  gsap.to(".header", { duration: 1, opacity: 1, y: 0, ease: "power2.out" });
  gsap.to(".settings-panel", {
    duration: 1,
    opacity: 1,
    y: 0,
    delay: 0.2,
    ease: "power2.out",
  });
  gsap.to(".test-area", {
    duration: 1,
    opacity: 1,
    y: 0,
    delay: 0.4,
    ease: "power2.out",
  });
}

// Event listeners
function setupEventListeners() {
  // Duration buttons
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".duration-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      testDuration = parseInt(e.target.dataset.duration);
      elements.timeDisplay.textContent = testDuration;
      gsap.to(e.target, { duration: 0.1, scale: 0.95, yoyo: true, repeat: 1 });
    });
  });

  // Text mode buttons
  document.querySelectorAll(".text-mode-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".text-mode-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentMode = e.target.dataset.mode;

      if (currentMode === "custom") {
        gsap.to(elements.customTextArea, {
          duration: 0.3,
          height: "auto",
          opacity: 1,
          display: "block",
        });
      } else {
        gsap.to(elements.customTextArea, {
          duration: 0.3,
          height: 0,
          opacity: 0,
          display: "none",
        });
      }
      gsap.to(e.target, { duration: 0.1, scale: 0.95, yoyo: true, repeat: 1 });
    });
  });

  // Start button
  elements.startBtn.addEventListener("click", startTest);

  // Reset button
  elements.resetBtn.addEventListener("click", resetTest);

  // History button
  elements.historyBtn.addEventListener("click", showHistory);

  // Typing input
  elements.typingInput.addEventListener("input", handleTyping);

  // Modal close buttons
  document
    .getElementById("closeResults")
    .addEventListener("click", closeResultsModal);
  document
    .getElementById("closeHistory")
    .addEventListener("click", closeHistoryModal);
  document.getElementById("retryBtn").addEventListener("click", () => {
    closeResultsModal();
    startTest();
  });
  document
    .getElementById("clearHistoryBtn")
    .addEventListener("click", clearHistory);

  // Close modals when clicking overlay
  elements.resultsModal.addEventListener("click", (e) => {
    if (e.target === elements.resultsModal) closeResultsModal();
  });
  elements.historyModal.addEventListener("click", (e) => {
    if (e.target === elements.historyModal) closeHistoryModal();
  });
}

// Generate or get text for the test
function getTestText() {
  if (currentMode === "custom" && elements.customTextInput.value.trim()) {
    return elements.customTextInput.value.trim();
  } else {
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  }
}

// Start the typing test
function startTest() {
  currentText = getTestText();
  if (!currentText) {
    alert("Please enter some text or select random text mode.");
    return;
  }

  // Reset variables
  startTime = new Date();
  endTime = null;
  isTestActive = true;
  typedCharacters = 0;
  correctCharacters = 0;
  errors = 0;

  // Update UI
  displayText();
  elements.typingInput.disabled = false;
  elements.typingInput.value = "";
  elements.typingInput.focus();
  elements.startBtn.style.display = "none";
  elements.resetBtn.style.display = "inline-block";

  // Start timer
  let timeLeft = testDuration;
  elements.timeDisplay.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    elements.timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endTest();
    }

    // Update stats
    updateStats();
  }, 1000);

  // Animate start
  gsap.to(elements.startBtn, { duration: 0.3, scale: 0, opacity: 0 });
  gsap.to(elements.resetBtn, {
    duration: 0.3,
    scale: 1,
    opacity: 1,
    delay: 0.1,
  });
  gsap.to(elements.typingInput, {
    duration: 0.3,
    borderColor: "#667eea",
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  });
}

// Display text with character spans
function displayText() {
  const textHtml = currentText
    .split("")
    .map(
      (char, index) =>
        `<span class="char" data-index="${index}">${
          char === " " ? "&nbsp;" : char
        }</span>`
    )
    .join("");
  elements.textContent.innerHTML = textHtml;
}

// Handle typing input
function handleTyping(e) {
  if (!isTestActive) return;

  const typedText = e.target.value;
  typedCharacters = typedText.length;
  correctCharacters = 0;
  errors = 0;

  // Update character highlighting
  const chars = document.querySelectorAll(".char");
  chars.forEach((char, index) => {
    char.classList.remove("correct", "incorrect", "current");

    if (index < typedText.length) {
      if (typedText[index] === currentText[index]) {
        char.classList.add("correct");
        correctCharacters++;
      } else {
        char.classList.add("incorrect");
        errors++;
      }
    } else if (index === typedText.length) {
      char.classList.add("current");
    }
  });

  // Check if test is complete
  if (typedText.length === currentText.length) {
    endTest();
  }

  updateStats();
}

// Update real-time statistics
function updateStats() {
  if (!startTime) return;

  const currentTime = new Date();
  const elapsedMinutes = (currentTime - startTime) / 60000;

  // Calculate WPM (assuming average word length of 5 characters)
  const wpm = Math.round(correctCharacters / 5 / elapsedMinutes) || 0;

  // Calculate CPM
  const cpm = Math.round(correctCharacters / elapsedMinutes) || 0;

  // Calculate accuracy
  const accuracy =
    typedCharacters > 0
      ? Math.round((correctCharacters / typedCharacters) * 100)
      : 100;

  elements.wpmDisplay.textContent = wpm;
  elements.cpmDisplay.textContent = cpm;
  elements.accuracyDisplay.textContent = accuracy + "%";

  // Animate stats
  gsap.to(
    [elements.wpmDisplay, elements.cpmDisplay, elements.accuracyDisplay],
    {
      duration: 0.2,
      scale: 1.1,
      yoyo: true,
      repeat: 1,
    }
  );
}

// End the typing test
function endTest() {
  if (!isTestActive) return;

  isTestActive = false;
  endTime = new Date();
  clearInterval(timer);

  elements.typingInput.disabled = true;

  // Calculate final statistics
  const totalTime = (endTime - startTime) / 1000; // in seconds
  const totalMinutes = totalTime / 60;

  const finalWPM = Math.round(correctCharacters / 5 / totalMinutes) || 0;
  const finalCPM = Math.round(correctCharacters / totalMinutes) || 0;
  const finalAccuracy =
    typedCharacters > 0
      ? Math.round((correctCharacters / typedCharacters) * 100)
      : 100;

  const correctWords = Math.floor(correctCharacters / 5);
  const incorrectWords = Math.floor(errors / 5);

  // Save to history
  saveToHistory({
    date: new Date().toLocaleString(),
    wpm: finalWPM,
    cpm: finalCPM,
    accuracy: finalAccuracy,
    time: Math.round(totalTime),
    correctWords,
    incorrectWords,
    totalChars: typedCharacters,
  });

  // Show results modal
  showResults({
    wpm: finalWPM,
    cpm: finalCPM,
    accuracy: finalAccuracy,
    time: Math.round(totalTime),
    correctWords,
    incorrectWords,
    totalChars: typedCharacters,
  });
}

// Reset the test
function resetTest() {
  clearInterval(timer);
  isTestActive = false;
  startTime = null;
  endTime = null;
  typedCharacters = 0;
  correctCharacters = 0;
  errors = 0;

  elements.typingInput.disabled = true;
  elements.typingInput.value = "";
  elements.timeDisplay.textContent = testDuration;
  elements.wpmDisplay.textContent = "0";
  elements.cpmDisplay.textContent = "0";
  elements.accuracyDisplay.textContent = "100%";

  elements.startBtn.style.display = "inline-block";
  elements.resetBtn.style.display = "none";

  // Clear text highlighting
  const chars = document.querySelectorAll(".char");
  chars.forEach((char) => {
    char.classList.remove("correct", "incorrect", "current");
  });

  // Animate reset
  gsap.to(elements.resetBtn, { duration: 0.3, scale: 0, opacity: 0 });
  gsap.to(elements.startBtn, {
    duration: 0.3,
    scale: 1,
    opacity: 1,
    delay: 0.1,
  });
  gsap.to(elements.typingInput, {
    duration: 0.3,
    borderColor: "#ddd",
    boxShadow: "none",
  });
}

// Show results modal
function showResults(results) {
  document.getElementById("finalWPM").textContent = results.wpm;
  document.getElementById("finalCPM").textContent = results.cpm;
  document.getElementById("finalAccuracy").textContent = results.accuracy + "%";
  document.getElementById("finalTime").textContent = results.time + "s";
  document.getElementById("correctWords").textContent = results.correctWords;
  document.getElementById("incorrectWords").textContent =
    results.incorrectWords;
  document.getElementById("totalChars").textContent = results.totalChars;

  elements.resultsModal.style.display = "flex";

  // Animate modal appearance
  gsap.fromTo(
    ".modal",
    { scale: 0.7, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
  );

  // Animate result values with stagger
  gsap.fromTo(
    ".result-value",
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2 }
  );
}

// Close results modal
function closeResultsModal() {
  gsap.to(".modal", {
    scale: 0.7,
    opacity: 0,
    duration: 0.2,
    onComplete: () => {
      elements.resultsModal.style.display = "none";
    },
  });
}

// Show history modal
function showHistory() {
  const history = getHistory();
  const historyList = document.getElementById("historyList");

  if (history.length === 0) {
    historyList.innerHTML =
      '<div class="no-history">No practice history yet. Complete a test to see your results here!</div>';
  } else {
    historyList.innerHTML = history
      .map(
        (record, index) => `
            <div class="history-item">
                <div class="history-date">${record.date}</div>
                <div class="history-stats">
                    <span class="history-stat">WPM: ${record.wpm}</span>
                    <span class="history-stat">CPM: ${record.cpm}</span>
                    <span class="history-stat">Accuracy: ${record.accuracy}%</span>
                    <span class="history-stat">Time: ${record.time}s</span>
                </div>
            </div>
        `
      )
      .join("");
  }

  elements.historyModal.style.display = "flex";

  // Animate modal appearance
  gsap.fromTo(
    ".modal",
    { scale: 0.7, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
  );

  // Animate history items with stagger
  gsap.fromTo(
    ".history-item",
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, delay: 0.2 }
  );
}

// Close history modal
function closeHistoryModal() {
  gsap.to(".modal", {
    scale: 0.7,
    opacity: 0,
    duration: 0.2,
    onComplete: () => {
      elements.historyModal.style.display = "none";
    },
  });
}

// Save result to localStorage
function saveToHistory(result) {
  const history = getHistory();
  history.unshift(result); // Add to beginning of array

  // Keep only last 50 results
  if (history.length > 50) {
    history.splice(50);
  }

  try {
    localStorage.setItem("typingHistory", JSON.stringify(history));
  } catch (e) {
    // Handle localStorage errors gracefully
    console.warn("Could not save to localStorage:", e);
  }
}

// Get history from localStorage
function getHistory() {
  try {
    const history = localStorage.getItem("typingHistory");
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.warn("Could not read from localStorage:", e);
    return [];
  }
}

// Clear history
function clearHistory() {
  if (confirm("Are you sure you want to clear all practice history?")) {
    try {
      localStorage.removeItem("typingHistory");
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    showHistory(); // Refresh the history display

    // Show confirmation animation
    gsap.to("#clearHistoryBtn", {
      duration: 0.2,
      scale: 0.9,
      backgroundColor: "#28a745",
      color: "white",
      onComplete: () => {
        setTimeout(() => {
          gsap.to("#clearHistoryBtn", {
            duration: 0.2,
            scale: 1,
            backgroundColor: "#6c757d",
            color: "white",
          });
        }, 1000);
      },
    });
  }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // ESC to close modals
    if (e.key === "Escape") {
      if (elements.resultsModal.style.display === "flex") {
        closeResultsModal();
      }
      if (elements.historyModal.style.display === "flex") {
        closeHistoryModal();
      }
    }

    // Ctrl+R or Cmd+R to reset (prevent page refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault();
      if (isTestActive || elements.resetBtn.style.display !== "none") {
        resetTest();
      }
    }

    // Ctrl+Enter or Cmd+Enter to start test
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isTestActive && elements.startBtn.style.display !== "none") {
        startTest();
      }
    }

    // Ctrl+H or Cmd+H to show history
    if ((e.ctrlKey || e.metaKey) && e.key === "h") {
      e.preventDefault();
      showHistory();
    }
  });
}

// Focus management
function setupFocusManagement() {
  // Auto-focus typing input when test starts
  elements.typingInput.addEventListener("focus", () => {
    if (isTestActive) {
      gsap.to(elements.typingInput, {
        duration: 0.2,
        borderColor: "#667eea",
        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.2)",
      });
    }
  });

  elements.typingInput.addEventListener("blur", () => {
    if (isTestActive) {
      // Refocus if test is active and user clicked away
      setTimeout(() => {
        if (isTestActive && document.activeElement !== elements.typingInput) {
          elements.typingInput.focus();
        }
      }, 100);
    }
  });
}

// Performance monitoring
function trackPerformance() {
  if (!isTestActive || !startTime) return;

  const currentTime = new Date();
  const elapsedSeconds = (currentTime - startTime) / 1000;

  // Track typing speed over time for potential graphs/charts
  const currentWPM =
    Math.round(correctCharacters / 5 / (elapsedSeconds / 60)) || 0;

  // Store performance data points (could be used for detailed analytics)
  if (!window.performanceData) {
    window.performanceData = [];
  }

  window.performanceData.push({
    timestamp: elapsedSeconds,
    wpm: currentWPM,
    accuracy:
      typedCharacters > 0
        ? Math.round((correctCharacters / typedCharacters) * 100)
        : 100,
    characters: typedCharacters,
  });
}

// Advanced statistics calculation
function calculateAdvancedStats() {
  if (!window.performanceData || window.performanceData.length < 2) return null;

  const data = window.performanceData;
  const maxWPM = Math.max(...data.map((d) => d.wpm));
  const avgWPM = Math.round(
    data.reduce((sum, d) => sum + d.wpm, 0) / data.length
  );
  const minAccuracy = Math.min(...data.map((d) => d.accuracy));
  const consistency =
    100 -
    Math.round(
      ((Math.max(...data.map((d) => d.wpm)) -
        Math.min(...data.map((d) => d.wpm))) /
        avgWPM) *
        100
    );

  return {
    maxWPM,
    avgWPM,
    minAccuracy,
    consistency: Math.max(0, consistency),
  };
}

// Enhanced error analysis
function analyzeErrors() {
  const chars = document.querySelectorAll(".char");
  const errorPositions = [];
  const commonErrors = {};

  chars.forEach((char, index) => {
    if (char.classList.contains("incorrect")) {
      const expected = currentText[index];
      const typed = elements.typingInput.value[index];

      errorPositions.push(index);

      const errorKey = `${expected}->${typed}`;
      commonErrors[errorKey] = (commonErrors[errorKey] || 0) + 1;
    }
  });

  return {
    errorPositions,
    commonErrors,
    errorRate: (errorPositions.length / typedCharacters) * 100,
  };
}

// Initialize the application
function init() {
  initAnimations();
  setupEventListeners();
  setupKeyboardShortcuts();
  setupFocusManagement();

  // Set initial text display
  currentText = getTestText();
  displayText();
  elements.timeDisplay.textContent = testDuration;

  // Performance tracking interval
  setInterval(trackPerformance, 1000);

  // Welcome animation sequence
  gsap
    .timeline()
    .to(".logo", { duration: 0.5, scale: 1.1, yoyo: true, repeat: 1, delay: 1 })
    .to(
      ".subtitle",
      { duration: 0.3, color: "#ffffff", yoyo: true, repeat: 1 },
      "-=0.3"
    );

  console.log("TypeMaster initialized successfully!");
  console.log("Keyboard shortcuts:");
  console.log("- Ctrl/Cmd + Enter: Start test");
  console.log("- Ctrl/Cmd + R: Reset test");
  console.log("- Ctrl/Cmd + H: Show history");
  console.log("- ESC: Close modals");
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isTestActive) {
    // Pause test when tab becomes inactive
    clearInterval(timer);
  } else if (!document.hidden && isTestActive && !timer) {
    // Resume test when tab becomes active again
    let timeLeft = parseInt(elements.timeDisplay.textContent);
    timer = setInterval(() => {
      timeLeft--;
      elements.timeDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        endTest();
      }

      updateStats();
    }, 1000);
  }
});

// Prevent accidental page reload during test
window.addEventListener("beforeunload", (e) => {
  if (isTestActive) {
    e.preventDefault();
    e.returnValue =
      "You have an active typing test. Are you sure you want to leave?";
    return e.returnValue;
  }
});

// Handle online/offline status
window.addEventListener("online", () => {
  console.log("Connection restored");
});

window.addEventListener("offline", () => {
  console.log("Connection lost - typing test will continue to work offline");
});
