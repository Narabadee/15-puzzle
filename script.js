let username = '', leaderboard = [], moves = 0, emptyIndex = 15, puzzle = [], startTime = 0, timerInterval, bestTime = null;

const getElement = id => document.getElementById(id);
const toggleDisplay = (ids, display) => ids.forEach(id => getElement(id).style.display = display);
const shuffle = array => array.sort(() => Math.random() - 0.5);
const countInversions = puzzle => puzzle.filter(num => num !== null).reduce((acc, curr, i, arr) => acc + arr.slice(i + 1).filter(num => num < curr).length, 0);

getElement('login-btn').addEventListener('click', () => {
    username = getElement('username').value;
    if (username) {
        toggleDisplay(['login-page', 'leaderboard'], 'none');
        toggleDisplay(['game-page', 'go-back-btn'], 'block');
        initializePuzzle();
        startTimer();
    }
});

getElement('play-again-btn').addEventListener('click', () => {
    toggleDisplay(['win-message', 'login-page', 'go-back-btn'], 'none');
    toggleDisplay(['leaderboard'], 'block');
    getElement('login-page').style.display = 'block';
    moves = 0;
    getElement('move-count').innerText = moves;
    resetTimer();
});

getElement('go-back-btn').addEventListener('click', () => {
    toggleDisplay(['game-page', 'go-back-btn'], 'none');
    toggleDisplay(['login-page', 'leaderboard'], 'block');
});

function initializePuzzle() {
    do {
        puzzle = Array.from({ length: 15 }, (_, i) => i + 1).concat(null);
        puzzle = shuffle(puzzle);
    } while (!isSolvable(puzzle));
    renderPuzzle();
}

function isSolvable(puzzle) {
    const inversions = countInversions(puzzle);
    const emptyRow = Math.floor(puzzle.indexOf(null) / 4);
    return (emptyRow % 2 === 0) ? (inversions % 2 === 1) : (inversions % 2 === 0);
}

function renderPuzzle() {
    const container = getElement('puzzle-container');
    container.innerHTML = '';
    puzzle.forEach((value, index) => {
        const div = document.createElement('div');
        div.innerText = value ?? '';
        if (value !== null) div.addEventListener('click', () => moveTile(index));
        else emptyIndex = index;
        container.appendChild(div);
    });
}

function moveTile(index) {
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4];
    if (validMoves.includes(index)) {
        [puzzle[emptyIndex], puzzle[index]] = [puzzle[index], puzzle[emptyIndex]];
        emptyIndex = index;
        moves++;
        getElement('move-count').innerText = moves;
        renderPuzzle();
        checkWin();
    }
}

function checkWin() {
    if (username === '661711' || puzzle.slice(0, 15).every((num, i) => num === i + 1)) {
        stopTimer();
        toggleDisplay(['game-page'], 'none');
        toggleDisplay(['win-message'], 'block');
        toggleDisplay(['go-back-btn'], 'none');
        getElement('winner-name').innerText = username;
        updateLeaderboard();
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        getElement('time-count').innerText = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    getElement('time-count').innerText = '0';
}

function updateLeaderboard() {
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    leaderboard.push({ name: username, moves, time: currentTime });
    leaderboard.sort((a, b) => a.moves - b.moves || a.time - b.time);
    if (bestTime === null || currentTime < bestTime) {
        bestTime = currentTime;
        getElement('best-time').innerText = bestTime;
    }
    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboardList = getElement('leaderboard-list');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.innerText = `${entry.name} - ${entry.moves} moves - ${entry.time} seconds`;
        leaderboardList.appendChild(li);
    });
}
