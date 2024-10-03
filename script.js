let username = '';
let leaderboard = [];
let moves = 0;
let emptyIndex = 15;
let puzzle = [];
let startTime = 0;
let timerInterval;
let bestTime = null;

document.getElementById('login-btn').addEventListener('click', () => {
    username = document.getElementById('username').value;
    if (username) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';
        
        initializePuzzle();
        startTimer();
    }
});

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


document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('win-message').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
    moves = 0;
    document.getElementById('move-count').innerText = moves;
    resetTimer();
});

function initializePuzzle() {
    puzzle = Array.from({ length: 15 }, (_, i) => i + 1).concat(null);
    puzzle = shuffle(puzzle);
    renderPuzzle();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderPuzzle() {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';
    puzzle.forEach((value, index) => {
        const div = document.createElement('div');
        if (value !== null) {
            div.innerText = value;
            div.addEventListener('click', () => moveTile(index));
        } else {
            emptyIndex = index;
            div.style.backgroundColor = '#ecf0f1';
        }
        container.appendChild(div);
    });
}

function moveTile(index) {
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4];
    if (validMoves.includes(index)) {
        [puzzle[emptyIndex], puzzle[index]] = [puzzle[index], puzzle[emptyIndex]];
        emptyIndex = index;
        moves++;
        document.getElementById('move-count').innerText = moves;
        renderPuzzle();
        checkWin();
    }
}

function checkWin() {
    const isWin = puzzle.slice(0, 15).every((num, i) => num === i + 1);
    if (isWin) {
        stopTimer();
        document.getElementById('game-page').style.display = 'none';
        document.getElementById('win-message').style.display = 'block';
        document.getElementById('winner-name').innerText = username;
        updateLeaderboard();
    }
}

// ฟังก์ชันจับเวลา
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('time-count').innerText = elapsedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById('time-count').innerText = '0';
}

function updateLeaderboard() {
    const currentTime = Math.floor((Date.now() - startTime) / 1000);

    leaderboard.push({ name: username, moves, time: currentTime });
    leaderboard.sort((a, b) => a.moves - b.moves || a.time - b.time);
    
    if (bestTime === null || currentTime < bestTime) {
        bestTime = currentTime;
        document.getElementById('best-time').innerText = bestTime;
    }

    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.innerText = `${entry.name} - ${entry.moves} moves - ${entry.time} seconds`;
        leaderboardList.appendChild(li);
    });
}

function resetGame() {
    buttonContainer.innerHTML = ''; // ล้างกระดานเกม
    highlighted = numberOfTiles;
    shuffled = false;
    gameStarted = false;
    clearInterval(timerInterval); // หยุดจับเวลา
    document.getElementById('currentTime').innerText = 'Time: 00:00'; // รีเซ็ตเวลาเป็น 00:00
    
    loadTiles(size); // โหลดกระดานใหม่
    shuffle(); // สุ่มกระดานใหม่
    document.getElementById("resetButton").style.display = 'none'; // ซ่อนปุ่ม Reset หลังจากกดรีเซ็ตแล้ว
    document.getElementById("startButton").style.display = 'block'; // แสดงปุ่ม Start อีกครั้ง
    document.getElementById("resetButton").addEventListener("click", resetGame); // ปุ่ม Reset

}
