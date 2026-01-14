let students = [];

const scoreList = document.getElementById('score-list');

async function loadLeaderboard() {
    try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();

        // Backend format: { fullname, points }
        students = data.map(user => ({
            name: user.fullname,
            score: user.points
        }));

        renderLeaderboard();
    } catch (err) {
        console.error("Failed to load leaderboard:", err);
    }
}


function renderLeaderboard() {
    
    students.sort((a, b) => b.score - a.score);
    
    scoreList.innerHTML = ""; 

    students.forEach((student, index) => {
        const row = document.createElement('li');
        row.className = 'score-row';
        row.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="name">${student.name}</span>
            <span class="score">${student.score.toLocaleString()}</span>
        `;
        scoreList.appendChild(row);
    });
}

function addPoints(studentName, points) {
    const student = students.find(s => s.name === studentName);
    if (student) {
        student.score += points;
        renderLeaderboard(); 
    }
}


loadLeaderboard();



window.addEventListener('load', () => {
    const ufoImage = document.getElementById('ufo-alien');
    const speechBubble = document.getElementById('speech-bubble');

    const messages = [
        "Hi, I'm Exie! Do you have any space snacks? 🍪",
        "Wait... is this planet Earth or a giant video game? 🎮",
        "I traveled 5 million light years just to see your website! ✨",
        "Exie to base: The humans are clicking me again! 🛸",
        "Punch it! We're breaking the sound barrier!",
        "You're moving so fast, you're leaving a trail of stardust.",
        "Maximum overdrive engaged! Look at those numbers climb.",
        "Your momentum is undeniable. Next stop: The Moon!",
        "Warp speed ahead! Nothing can stop you now.",
        "Engaging hyperdrive! Prepare for an interstellar journey.",
        "You’re entering the stratosphere! Keep pushing to win.🛸",
    ];

    let autoTalkInterval;
    let firstClickDone = false; 

  
    function showMessage(text, autoHide = true) {
        speechBubble.innerText = text || messages[Math.floor(Math.random() * messages.length)];
        speechBubble.classList.add('show');

        if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);

       
        if (autoHide) {
            window.bubbleTimeout = setTimeout(() => {
                speechBubble.classList.remove('show');
            }, 5000);
        }
    }


    if (speechBubble) {
        showMessage("🛸Keep pushing to win, your points will influence your grade!🛸", false);
    }

    if (ufoImage && speechBubble) {
        ufoImage.addEventListener('click', () => {
            
            
            if (!firstClickDone) {
                firstClickDone = true;
                console.log("Mission started by first click!");
                
               
                autoTalkInterval = setInterval(() => {
                    showMessage(); 
                }, 15000);
            }

           
            showMessage();
        });
    }
});
