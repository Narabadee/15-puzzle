let username = ''; // ตัวแปรเก็บชื่อผู้เล่น
let leaderboard = []; // ตัวแปรเก็บข้อมูล leaderboard
let moves = 0; // ตัวแปรเก็บจำนวนการเคลื่อนไหว
let emptyIndex = 15; // ตำแหน่งของช่องว่างในเกม
let puzzle = []; // ตัวแปรเก็บสถานะของเกมตัวต่อ
let startTime = 0; // เวลาเริ่มต้นของเกม
let timerInterval; // ตัวแปรสำหรับจับเวลา
let bestTime = null; // เวลาที่ดีที่สุด

// ฟังก์ชันจัดการเมื่อผู้ใช้คลิกปุ่ม Login
document.getElementById('login-btn').addEventListener('click', () => {
    username = document.getElementById('username').value; // ดึงชื่อผู้เล่นจาก input
    if (username) {
        document.getElementById('login-page').style.display = 'none'; // ซ่อนหน้า login
        document.getElementById('game-page').style.display = 'block'; // แสดงหน้าเกม
        
        // ซ่อน leaderboard หลังจาก login
        document.getElementById('leaderboard').style.display = 'none';
        
        // แสดงปุ่ม Go Back
        document.getElementById('go-back-btn').style.display = 'block';

        initializePuzzle(); // เริ่มต้นเกมตัวต่อ
        startTimer(); // เริ่มจับเวลา
    }
});

// ฟังก์ชันจัดการการเคลื่อนไหวของปุ่มลูกศร
window.onkeydown = function (event) {
    if (event.keyCode === RIGHT_ARROW) {
        swap(highlighted + 1); // เคลื่อนย้ายทางขวา
    } else if (event.keyCode === LEFT_ARROW) {
        swap(highlighted - 1); // เคลื่อนย้ายทางซ้าย
    } else if (event.keyCode === UP_ARROW) {
        swap(highlighted + size); // เคลื่อนย้ายขึ้น
    } else if (event.keyCode === DOWN_ARROW) {
        swap(highlighted - size); // เคลื่อนย้ายลง
    }
};

// ฟังก์ชันจัดการเมื่อผู้เล่นคลิกปุ่มเล่นใหม่
document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('win-message').style.display = 'none'; // ซ่อนข้อความชนะ
    document.getElementById('login-page').style.display = 'block'; // กลับไปหน้า login

    // แสดง leaderboard อีกครั้ง
    document.getElementById('leaderboard').style.display = 'block';

    // ซ่อนปุ่ม Go Back
    document.getElementById('go-back-btn').style.display = 'none';

    moves = 0; // รีเซ็ตจำนวนการเคลื่อนไหว
    document.getElementById('move-count').innerText = moves;
    resetTimer(); // รีเซ็ตเวลา
});

// ฟังก์ชันจัดการเมื่อผู้เล่นคลิกปุ่ม Go Back
document.getElementById('go-back-btn').addEventListener('click', () => {
    document.getElementById('game-page').style.display = 'none'; // ซ่อนหน้าเกม
    document.getElementById('login-page').style.display = 'block'; // กลับไปหน้า login

    // แสดง leaderboard อีกครั้ง
    document.getElementById('leaderboard').style.display = 'block';

    // ซ่อนปุ่ม Go Back
    document.getElementById('go-back-btn').style.display = 'none';
});

// ฟังก์ชันเริ่มต้นเกมตัวต่อ
function initializePuzzle() {
    do {
        puzzle = Array.from({ length: 15 }, (_, i) => i + 1).concat(null); // สร้างตัวเลข 1-15 และช่องว่าง
        puzzle = shuffle(puzzle); // สุ่มตำแหน่งตัวเลข
    } while (!isSolvable(puzzle)); // สุ่มจนกว่าจะได้ puzzle ที่สามารถแก้ได้

    renderPuzzle(); // แสดง puzzle
}

// ฟังก์ชันตรวจสอบว่า puzzle สามารถแก้ได้หรือไม่
function isSolvable(puzzle) {
    const inversions = countInversions(puzzle); // นับจำนวน inversions
    const emptyIndex = puzzle.indexOf(null); // หาตำแหน่งของช่องว่าง
    const emptyRow = Math.floor(emptyIndex / 4); // แถวของช่องว่างใน grid 4x4

    // เช็คว่าตัวต่อสามารถแก้ได้หรือไม่
    if (emptyRow % 2 === 0) { // ช่องว่างอยู่ในแถวเลขคู่
        return inversions % 2 === 1; // ต้องมีจำนวน inversions เป็นเลขคี่
    } else { // ช่องว่างอยู่ในแถวเลขคี่
        return inversions % 2 === 0; // ต้องมีจำนวน inversions เป็นเลขคู่
    }
}

// ฟังก์ชันสำหรับสุ่ม array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // สลับตำแหน่ง
    }
    return array;
}

// ฟังก์ชันนับจำนวน inversions
function countInversions(puzzle) {
    let inversions = 0;
    const flatPuzzle = puzzle.filter(num => num !== null); // ลบช่องว่างออกจาก array

    for (let i = 0; i < flatPuzzle.length; i++) {
        for (let j = i + 1; j < flatPuzzle.length; j++) {
            if (flatPuzzle[i] > flatPuzzle[j]) {
                inversions++; // นับจำนวนครั้งที่ตัวเลขหน้าใหญ่กว่าตัวเลขหลัง
            }
        }
    }
    return inversions;
}

// ฟังก์ชันแสดง puzzle บนหน้าเว็บ
function renderPuzzle() {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = ''; // ล้างเนื้อหาเดิมใน container
    puzzle.forEach((value, index) => {
        const div = document.createElement('div');
        if (value !== null) {
            div.innerText = value; // แสดงตัวเลข
            div.addEventListener('click', () => moveTile(index)); // คลิกเพื่อย้ายตัวต่อ
        } else {
            emptyIndex = index; // เก็บตำแหน่งช่องว่าง
            div.style.backgroundColor = '#ecf0f1'; // สีพื้นหลังช่องว่าง
        }
        container.appendChild(div); // เพิ่ม div ลงใน container
    });
}

// ฟังก์ชันย้ายตัวต่อ
function moveTile(index) {
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4]; // การเคลื่อนย้ายที่ถูกต้อง
    if (validMoves.includes(index)) {
        [puzzle[emptyIndex], puzzle[index]] = [puzzle[index], puzzle[emptyIndex]]; // สลับตัวต่อกับช่องว่าง
        emptyIndex = index; // อัปเดตตำแหน่งช่องว่าง
        moves++; // เพิ่มจำนวนการเคลื่อนไหว
        document.getElementById('move-count').innerText = moves; // แสดงจำนวนการเคลื่อนไหว
        renderPuzzle(); // แสดง puzzle ใหม่
        checkWin(); // เช็คว่าชนะหรือยัง
    }
}

// ฟังก์ชันตรวจสอบว่าผู้เล่นชนะหรือยัง
function checkWin() {
    const isWin = puzzle.slice(0, 15).every((num, i) => num === i + 1); // ตรวจสอบว่าตัวต่อถูกเรียงครบหรือยัง
    if (isWin) {
        stopTimer(); // หยุดจับเวลา
        document.getElementById('game-page').style.display = 'none'; // ซ่อนหน้าเกม
        document.getElementById('win-message').style.display = 'block'; // แสดงข้อความชนะ
        document.getElementById('winner-name').innerText = username; // แสดงชื่อผู้ชนะ
        updateLeaderboard(); // อัปเดต leaderboard
    }
}

// ฟังก์ชันจับเวลา
function startTimer() {
    startTime = Date.now(); // เก็บเวลาที่เริ่มเล่น
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // คำนวณเวลาที่ผ่านไป
        document.getElementById('time-count').innerText = elapsedTime; // แสดงเวลาบนหน้าเว็บ
    }, 1000);
}

// ฟังก์ชันหยุดจับเวลา
function stopTimer() {
    clearInterval(timerInterval); // หยุดจับเวลา
}

// ฟังก์ชันรีเซ็ตเวลา
function resetTimer() {
    clearInterval(timerInterval); // หยุดจับเวลา
    document.getElementById('time-count').innerText = '0'; // รีเซ็ตเวลาเป็น 0
}

// ฟังก์ชันอัปเดตข้อมูลใน leaderboard
function updateLeaderboard() {
    const currentTime = Math.floor((Date.now() - startTime) / 1000); // คำนวณเวลาที่ผ่านไปในหน่วยวินาที

    // เพิ่มข้อมูลของผู้เล่นปัจจุบันลงใน leaderboard
    leaderboard.push({ name: username, moves, time: currentTime });

    // เรียงลำดับ leaderboard โดยเรียงตามจำนวน moves น้อยที่สุดก่อน และถ้า moves เท่ากันจะเรียงตามเวลาที่น้อยกว่า
    leaderboard.sort((a, b) => a.moves - b.moves || a.time - b.time);
    
    // ถ้าเวลาปัจจุบันเป็นเวลาที่ดีที่สุด หรือยังไม่มี bestTime ให้ตั้งค่า bestTime ใหม่
    if (bestTime === null || currentTime < bestTime) {
        bestTime = currentTime;
        document.getElementById('best-time').innerText = bestTime; // อัปเดตเวลา bestTime บนหน้าเว็บ
    }

    renderLeaderboard(); // เรียกฟังก์ชันเพื่อแสดง leaderboard ที่อัปเดตแล้ว
}

// ฟังก์ชันแสดงข้อมูล leaderboard บนหน้าเว็บ
function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list'); // ดึง element ของรายการ leaderboard
    leaderboardList.innerHTML = ''; // ล้างข้อมูลเก่าในรายการ leaderboard

    // วนลูปแสดงผลผู้เล่นใน leaderboard
    leaderboard.forEach(entry => {
        const li = document.createElement('li'); // สร้างรายการใหม่สำหรับแต่ละผู้เล่น
        li.innerText = `${entry.name} - ${entry.moves} moves - ${entry.time} seconds`; // ใส่ข้อมูลชื่อ จำนวน moves และเวลา
        leaderboardList.appendChild(li); // เพิ่มรายการลงใน leaderboard
    });
}

