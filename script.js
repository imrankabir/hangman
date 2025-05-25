const categories = {
  fruits: ["apple", "banana", "cherry", "grape", "orange"],
  animals: ["tiger", "elephant", "giraffe", "rabbit", "zebra"],
  countries: ["canada", "brazil", "germany", "nepal", "japan"]
};

let word = "";
let guessed = [];
let attempts = 6;

const get = (k, d) => JSON.parse(localStorage.getItem(`numbers-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`numbers-${k}`, JSON.stringify(v));

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

function initGame() {
  const selectedCategory = document.getElementById("category").value;
  const words = categories[selectedCategory];
  word = words[Math.floor(Math.random() * words.length)];
  guessed = [];
  attempts = 6;
  updateDisplay();
  resetHangman();
  document.getElementById("message").textContent = "";
}

function updateDisplay() {
  const display = word.split("").map(letter => (guessed.includes(letter) ? letter : "_")).join(" ");
  document.getElementById("wordDisplay").textContent = display;
  document.getElementById("guessedLetters").textContent = guessed.join(", ");
  document.getElementById("attempts").textContent = attempts;
}

function makeGuess() {
  const input = document.getElementById("guessInput");
  const letter = input.value.toLowerCase();
  input.value = "";
  if (!letter.match(/[a-z]/i) || guessed.includes(letter) || letter.length === 0) return;
  guessed.push(letter);
  if (!word.includes(letter)) {
    attempts--;
    drawHangman(6 - attempts);
    wrongSound.play();
  } else {
    correctSound.play();
  }
  updateDisplay();
  checkGameStatus();
}

function drawHangman(step) {
  const parts = ["rope", "head", "body", "arms", "legs"];
  if (step >= 1 && step <= parts.length) {
    document.querySelector(`.${parts[step - 1]}`).style.opacity = 1;
  }
}

function resetHangman() {
  ["rope", "head", "body", "arms", "legs"].forEach((part) => {
    document.querySelector(`.${part}`).style.opacity = 0;
  });
}

function checkGameStatus() {
  if (word.split("").every(letter => guessed.includes(letter))) {
    document.getElementById("message").textContent = "🎉 You win!";
    winSound.play();
  } else if (attempts === 0) {
    document.getElementById("message").textContent = `😢 You lost! Word was "${word}".`;
    loseSound.play();
  }
}

document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  document.getElementById("toggleTheme").textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

document.addEventListener('DOMContentLoaded', e => {
    // let { numbers } = get('numbers', {numbers: []});
    // let { total } = get('total', {total: t});
    initGame();
});