import { shuffle } from "./shuffle.js";

// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");

// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let selectedItem;
let equationsArray = [];
let questionAmount = 0;
let playerAnswers = [];
let bestScoresArray = [];
// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;

// Scroll
let valueY = 0;

//best scores
function bestScoresToDOM() {
  bestScores.forEach(
    (el, i) => (el.textContent = `${bestScoresArray[i].bestScore.toFixed(0)}s`)
  );
}

//check local for saved scores
function getSavedScores() {
  if (localStorage.getItem("bestScores"))
    bestScoresArray = JSON.parse(localStorage.bestScores);
  else {
    bestScoresArray = [
      { questions: 10, bestScore: 0 },
      { questions: 25, bestScore: 0 },
      { questions: 50, bestScore: 0 },
      { questions: 99, bestScore: 0 },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoresArray));
  }
  bestScoresToDOM();
}

//update best scores
function updateBestScore() {
  bestScoresArray.forEach((score, i) => {
    if (
      score.questions === questionAmount &&
      (score.bestScore > timePlayed || !score.bestScore)
    )
      bestScoresArray[i].bestScore = timePlayed;
  });
  bestScoresToDOM();
  localStorage.setItem("bestScores", JSON.stringify(bestScoresArray));
}

//Reset Game
function playAgain() {
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerAnswers = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}
window.playAgain = playAgain;

function showScorePage() {
  gamePage.hidden = true;
  scorePage.hidden = false;
  setTimeout(() => (playAgainBtn.hidden = false), 1000);
}

function scoresToDOM() {
  timePlayed.toFixed(1) + "s";
  baseTimeEl.textContent = `Base Time: ${baseTime.toFixed(1)}s`;
  penaltyTimeEl.textContent = `Penalty: +${(timePlayed - baseTime).toFixed(
    1
  )}s`;
  finalTimeEl.textContent = `${timePlayed.toFixed(1)}s`;
  itemContainer.scrollTo({ top: 0, behavior: "instant" });
  updateBestScore();
  showScorePage();
}

function checkTime() {
  if (playerAnswers.length === questionAmount) {
    clearInterval(timer);
    baseTime = timePlayed;

    //add penalties for wrong answers, 0.5 secs for incorrect answer
    equationsArray.forEach((eq, i) => {
      if (eq.evaluated !== playerAnswers[i] + "") timePlayed += 0.5;
    });
    scoresToDOM();
  }
}

function addTime() {
  timePlayed += 0.1;
  selectedItem.textContent = "T: " + parseInt(timePlayed);
  checkTime();
}
//start timer when game page is clicked
function startTimer() {
  timePlayed = 0;
  timer = setInterval(addTime, 100);
}

// Create Correct/Incorrect Random Equations
const getRandom = n => Math.floor(Math.random() * n) + 1;

function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandom(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandom(9);
    secondNumber = getRandom(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandom(9);
    secondNumber = getRandom(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandom(3) - 1;
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

//scroll and store user choices
function playerAnswer(answer) {
  const index = valueY / 76;
  const answerEl = document.querySelector(`.eq${index}`);
  if (answer + "" === equationsArray[index].evaluated)
    answerEl.textContent = "✔️";
  else answerEl.textContent = "❌";
  valueY += 76;
  itemContainer.scroll(0, valueY);
  return playerAnswers.push(answer);
}
window.playerAnswer = playerAnswer;

function showGamePage() {
  startTimer();
  gamePage.hidden = false;
  countdownPage.hidden = true;
}
function equationsToDOM() {
  equationsArray.forEach((equation, i) => {
    const item = document.createElement("div");
    item.classList.add("item");
    const equationText = document.createElement("h1");
    equationText.classList.add(`eq${i}`);
    equationText.textContent = equation.value;
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}
// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");

  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();
  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

const countdownStart = () => {
  //use setinterval here, dont rely on ultiple settimeouts to showGame
  [3, 2, 1, "GO!", ""].forEach((time, i) =>
    setTimeout(() => {
      countdown.textContent = time;
      if (!time) showGamePage();
    }, 1000 * i)
  );
};

function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
}

function selectQuestionAmount(e) {
  e.preventDefault();
  if (questionAmount) showCountdown();
}

startForm.addEventListener("click", () => {
  radioContainers.forEach(radioEl => {
    radioEl.classList.remove("selected-label");
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
      questionAmount = +radioEl.children[1].value;
    }
  });
});

//events
startForm.addEventListener("submit", selectQuestionAmount);

//onload
getSavedScores();
