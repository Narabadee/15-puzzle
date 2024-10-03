let size = 4;
let numberOfTiles = size ** 2;
let highlighted = numberOfTiles;
let shuffled = false;
let gameStarted = false;
let playerName = '';  // Player's name

// Leaderboard
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Elements
let buttonContainer = document.getElementById('tiles');
let startTime, timerInterval;
let bestTime = localStorage.getItem('bestTime') || '99:99';

// Login and Game Events
document.getElementById('loginButton').addEventListener('click', login);
document.getElementById("resetButton").addEventListener("click", resetGame);
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("homeButton").addEventListener("click", goHome);

// Keyboard controls
const RIGHT_ARROW = 39;
const LEFT_ARROW = 37;
const UP_ARROW = 40;
const DOWN_ARROW = 38;

window.onkeydown = function (event) {
    if (event.keyCode === RIGHT_ARROW) {
        swap(highlighted + 1);
    } else if (event.keyCode === LEFT_ARROW) {
        swap(highlighted - 1);
    } else if (event.keyCode === UP_ARROW) {
        swap(highlighted + size);
    } else if (event.keyCode === DOWN_ARROW) {
        swap(highlighted - size);
    }
};

// Login Function
function login() {
    const inputName = document.getElementById('playerName').value.trim();
    if (inputName === '') {
        alert('Please enter your name');
        return;
    }
    playerName = inputName;
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    displayLeaderboard();
}

function resetGame() {
    buttonContainer.innerHTML = '';
    highlighted = numberOfTiles;
    shuffled = false;
    gameStarted = false;
    startTime = new Date();
    
    loadTiles(size);
    shuffle();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTime, 1000);
}

function startGame() {
    newGame();
    document.getElementById("startButton").style.display = 'none';
    document.getElementById("homeButton").style.display = 'block';
    document.getElementById("resetButton").style.display = 'block';
    gameStarted = true;

    startTime = new Date();
    timerInterval = setInterval(updateTime, 1000); // Update every second
}

function goHome() {
    buttonContainer.innerHTML = '';
    highlighted = numberOfTiles;
    shuffled = false;
    gameStarted = false;

    clearInterval(timerInterval);
    document.getElementById('currentTime').innerText = 'Time: 00:00';
    document.getElementById('bestTime').innerText = `Best Time: ${bestTime}`;

    document.getElementById("startButton").style.display = 'block';
    document.getElementById("homeButton").style.display = 'none';
    document.getElementById("resetButton").style.display = 'none';
}

// Game Logic (unchanged)
function newGame() {
    loadTiles(size);
    setTimeout(shuffle, 500);
}

function loadTiles(n) {
    for (let b = 1; b <= numberOfTiles; b++) {
        const newTile = document.createElement('button');
        newTile.id = `btn${b}`;
        newTile.setAttribute('index', b);
        newTile.innerHTML = b;
        newTile.classList.add('btn');
        newTile.addEventListener('click', () => swap(parseInt(newTile.getAttribute('index'))));
        buttonContainer.append(newTile);
    }
    updateSelectedTile();
}

function updateSelectedTile() {
    const selectedTileId = `btn${highlighted}`;
    const selectedTile = document.getElementById(selectedTileId);
    selectedTile.classList.add("selected");
}

function shuffle() {
    let minShuffles = 100;
    let totalShuffles = minShuffles + Math.floor(Math.random() * 101);

    for (let i = 0; i < totalShuffles; i++) {
        setTimeout(() => {
            let direction;
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    direction = highlighted + 1;
                    break;
                case 1:
                    direction = highlighted - 1;
                    break;
                case 2:
                    direction = highlighted + size;
                    break;
                case 3:
                    direction = highlighted - size;
                    break;
            }
            swap(direction);
        }, i * 10);
    }
    shuffled = true;
}

function swap(clicked) {
    if (clicked < 1 || clicked > numberOfTiles) return;

    if ((clicked === highlighted + 1 && clicked % size !== 1) ||
        (clicked === highlighted - 1 && clicked % size !== 0) ||
        clicked === highlighted + size ||
        clicked === highlighted - size) {

        setSelected(clicked);

        if (shuffled && gameStarted && checkHasWon()) {
            endGame();
        }
    }
}

function checkHasWon() {
    for (let b = 1; b <= numberOfTiles; b++) {
        const currentTile = document.getElementById(`btn${b}`);
        const currentTileIndex = currentTile.getAttribute('index');
        const currentTileValue = currentTile.innerHTML;
        if (parseInt(currentTileIndex) !== parseInt(currentTileValue)) {
            return false;
        }
    }
    return true;
}

function setSelected(index) {
    const currentTile = document.getElementById(`btn${highlighted}`);
    const currentTileText = currentTile.innerHTML;
    currentTile.classList.remove('selected');
    const newTile = document.getElementById(`btn${index}`);
    currentTile.innerHTML = newTile.innerHTML;
    newTile.innerHTML = currentTileText;
    newTile.classList.add("selected");
    highlighted = index;
}

function updateTime() {
    const now = new Date();
    const elapsed = now - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('currentTime').innerText = `Time: ${formattedTime}`;
}

function endGame() {
    clearInterval(timerInterval); // Stop the timer
    const currentTime = document.getElementById('currentTime').innerText.split(' ')[1];

    leaderboard.push({ name: playerName, time: currentTime });
    leaderboard.sort((a, b) => compareTimes(a.time, b.time));
    leaderboard = leaderboard.slice(0, 10); // Keep top 10
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    showLeaderboard();
    
    setTimeout(() => {
        alert(`Congratulations, ${playerName}! You finished in ${currentTime}`);
    }, 100);
}

function showLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name} - ${entry.time}`;
        leaderboardContainer.appendChild(li);
    });
    document.getElementById("leaderboardContainer").style.display = 'block';
}

function compareTimes(time1, time2) {
    const [min1, sec1] = time1.split(':').map(Number);
    const [min2, sec2] = time2.split(':').map(Number);
    if (min1 !== min2) {
        return min1 - min2;
    }
    return sec1 - sec2;
}

function isBetterTime(current, best) {
    const [currentMinutes, currentSeconds] = current.split(':').map(Number);
    const [bestMinutes, bestSeconds] = best.split(':').map(Number);
    return currentMinutes < bestMinutes || (currentMinutes === bestMinutes && currentSeconds < bestSeconds);
}
