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
        
        // Hide the leaderboard after login
        document.getElementById('leaderboard').style.display = 'none';
        
        // Show the Go Back button
        document.getElementById('go-back-btn').style.display = 'block';

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

    // Show the leaderboard again
    document.getElementById('leaderboard').style.display = 'block';

    // Hide the Go Back button
    document.getElementById('go-back-btn').style.display = 'none';

    moves = 0;
    document.getElementById('move-count').innerText = moves;
    resetTimer();
});

document.getElementById('go-back-btn').addEventListener('click', () => {
    document.getElementById('game-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';

    // Show the leaderboard again
    document.getElementById('leaderboard').style.display = 'block';

    // Hide the Go Back button
    document.getElementById('go-back-btn').style.display = 'none';
});

function initializePuzzle() {
    do {
        puzzle = Array.from({ length: 15 }, (_, i) => i + 1).concat(null);
        puzzle = shuffle(puzzle);
    } while (!isSolvable(puzzle)); // Keep shuffling until a solvable puzzle is found

    renderPuzzle();
}

function isSolvable(puzzle) {
    const inversions = countInversions(puzzle);
    const emptyIndex = puzzle.indexOf(null);
    const emptyRow = Math.floor(emptyIndex / 4); // Assuming a 4x4 grid

    // Check if the puzzle is solvable
    if (emptyRow % 2 === 0) { // empty tile is on an even row (0-indexed)
        return inversions % 2 === 1; // must have odd inversions
    } else { // empty tile is on an odd row (0-indexed)
        return inversions % 2 === 0; // must have even inversions
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function countInversions(puzzle) {
    let inversions = 0;
    const flatPuzzle = puzzle.filter(num => num !== null); // Remove the empty tile

    for (let i = 0; i < flatPuzzle.length; i++) {
        for (let j = i + 1; j < flatPuzzle.length; j++) {
            if (flatPuzzle[i] > flatPuzzle[j]) {
                inversions++;
            }
        }
    }
    return inversions;
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
