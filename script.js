const categories = {
  fruits: ["apple", "banana", "cherry", "grape", "orange", "mango", "pineapple", "strawberry", "watermelon", "kiwi", "blueberry", "peach", "pear", "plum", "pomegranate"],
  animals: ["tiger", "elephant", "giraffe", "rabbit", "zebra", "lion", "kangaroo", "dolphin", "penguin", "wolf", "bear", "fox", "horse", "camel", "monkey"],
  countries: [ "canada", "brazil", "germany", "nepal", "japan", "india", "france", "italy", "mexico", "egypt", "china", "spain", "argentina", "russia", "turkey"],
  colors: [ "red", "blue", "green", "yellow", "purple", "orange", "pink", "black", "white", "brown", "violet", "indigo", "cyan", "magenta", "turquoise"],
  vehicles: [ "car", "bicycle", "motorcycle", "airplane", "train", "boat", "truck", "scooter", "submarine", "helicopter", "bus", "tractor", "van", "tank", "glider"],
  sports: [ "soccer", "basketball", "cricket", "tennis", "baseball", "swimming", "cycling", "volleyball", "rugby", "boxing", "golf", "hockey", "skiing", "badminton", "wrestling"],
  instruments: [ "guitar", "piano", "violin", "drums", "flute", "trumpet", "saxophone", "cello", "harp", "accordion", "clarinet", "trombone", "banjo", "mandolin", "xylophone"],
  jobs: [ "doctor", "teacher", "engineer", "pilot", "chef", "nurse", "lawyer", "firefighter", "artist", "musician", "scientist", "farmer", "photographer", "carpenter", "mechanic"]
};

let word = "";
let guessed = [];
let attempts = 6;

const get = (k, d) => JSON.parse(localStorage.getItem(`hangman-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`hangman-${k}`, JSON.stringify(v));
const remove = (k) => localStorage.removeItem(`hangman-${k}`);

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

const guessInput = document.getElementById("guess");
const categorySelect = document.getElementById("category");

function saveGameState() {
  set("currentWord", word);
  set("guessedLetters", guessed);
  set("attemptsLeft", attempts);
}

function loadGameState() {
  const savedWord = get("currentWord", null);
  if (!savedWord) return false;

  const savedGuessed = get("guessedLetters", []);
  const savedAttempts = get("attemptsLeft", 6);

  word = savedWord;
  guessed = savedGuessed;
  attempts = savedAttempts;

  return true;
}

function clearGameState() {
  remove("currentWord");
  remove("guessedLetters");
  remove("attemptsLeft");
}

function initGame() {
  const selectedCategory = categorySelect.value;

  const savedCategory = get("lastCategory", null);
  const isSameCategory = savedCategory === selectedCategory;

  const message = document.getElementById("message").textContent.toLowerCase();
  if (isSameCategory && !message.includes("win") && !message.includes("lost")) {
    const loaded = loadGameState();
    if (loaded) {
      updateDisplay();
      resetHangman();
      for (let i = 7 - attempts; i > 0; i--) {
        drawHangman(i);
      }
      guessInput.focus();
      return;
    }
  }

  const words = categories[selectedCategory];
  word = words[Math.floor(Math.random() * words.length)];
  guessed = [];
  attempts = 6;
  updateDisplay();
  resetHangman();
  document.getElementById("message").textContent = "";
  guessInput.focus();

  clearGameState();
}

function updateDisplay() {
  const display = word.split("").map(letter => guessed.includes(letter) ? letter : "_").join(" ");
  document.getElementById("wordDisplay").textContent = display;
  document.getElementById("guessedLetters").textContent = guessed.join(", ");
  document.getElementById("attempts").textContent = attempts;
}

function drawHangman(step) {
  const parts = ["rope", "head", "body", "arms", "legs"];
  if (step >= 1 && step <= parts.length) {
    document.querySelector(`.${parts[step - 1]}`).style.opacity = 1;
  }
}

function resetHangman() {
  ["rope", "head", "body", "arms", "legs"].forEach(part => {
    const el = document.querySelector(`.${part}`);
    if (el) el.style.opacity = 0;
  });
}

function showTopScores() {
  const scores = get("scores", []);
  const list = document.getElementById("topScores");
  list.innerHTML = scores.map(s => `<li>${s.name} - ${s.score}</li>`).join("");
}

function populateCategories() {
  categorySelect.innerHTML = Object.keys(categories)
    .map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`)
    .join("");
}

function showName() {
  document.getElementById("name").textContent = get("name", { name: "Player" }).name;
}

document.getElementById("name").addEventListener("focus", (e) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(e.target);
  selection.removeAllRanges();
  selection.addRange(range);
});

document.getElementById("name").addEventListener("keyup", (e) => {
  set("name", { name: e.target.textContent.trim() });
});

// Save and load selected category
categorySelect.addEventListener("change", () => {
  set("lastCategory", categorySelect.value);
  initGame();
});

function loadLastCategory() {
  const savedCategory = get("lastCategory", Object.keys(categories)[0]);
  if (Object.keys(categories).includes(savedCategory)) {
    categorySelect.value = savedCategory;
  }
}

function makeGuess() {
  const guess = guessInput.value.trim().toLowerCase();
  guessInput.value = "";
  guessInput.focus();

  if (!guess || guess.length === 0) return;

  const message = document.getElementById("message").textContent.toLowerCase();
  if (message.includes("win") || message.includes("lost")) return;

  if (!/^[a-z]$/.test(guess)) {
    alert("Please enter a single letter.");
    return;
  }

  if (guessed.includes(guess)) {
    alert("Already guessed.");
    return;
  }

  guessed.push(guess);

  if (!word.includes(guess)) {
    attempts--;
    wrongSound?.play();
    drawHangman(7 - attempts);
  } else {
    correctSound?.play();
  }

  updateDisplay();
  checkGameStatus();

  // Save or clear game state based on game status
  const currentMessage = document.getElementById("message").textContent.toLowerCase();
  if (!currentMessage.includes("win") && !currentMessage.includes("lost")) {
    saveGameState();
  } else {
    clearGameState();
  }
}

function saveScore() {
  const name = get("name", { name: "Player" }).name;
  const score = attempts;

  let scores = get("scores", []);
  scores.push({ name, score, time: Date.now() });

  scores.sort((a, b) => b.score - a.score || a.time - b.time);
  scores = scores.slice(0, 10);

  set("scores", scores);
  showScores();
}

function showScores() {
  const scores = get("scores", []);
  const scoreBoard = document.getElementById("scoreBoard");
  scoreBoard.innerHTML = scores.map(s => `<li>${s.name} - ${s.score}</li>`).join("");
}

function checkGameStatus() {
  const messageEl = document.getElementById("message");
  if (word.split("").every(letter => guessed.includes(letter))) {
    messageEl.textContent = "🎉 You win!";
    winSound?.play();
    saveScore();
  } else if (attempts === 0) {
    messageEl.textContent = `😢 You lost! Word was "${word}".`;
    loseSound?.play();
  }
}

guessInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    makeGuess();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  loadLastCategory();
  showName();
  showScores();
  initGame();
  guessInput.focus();
});
