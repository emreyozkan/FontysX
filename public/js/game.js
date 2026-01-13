const imgDone = "images/checkmark.png";
const imgOpen = "images/levelopen1.png";
const imgLock = "images/levellock4.png";

let currentLevel = 1;
const totalLevels = 7;

const levelData = {
    1: { title: "MISSION 1", text: "ASK TEACHER FOR THE FIRST CODE", correctCode: "1111", points: 10 },
    2: { title: "MISSION 2", text: "ASK TEACHER ......... FOR ONE STUDY TIP!", correctCode: "2222", points: 10 },
    3: { title: "MISSION 3", text: "FIND THE TEACHER NEAR THE LIBRARY", correctCode: "3333", points: 10 },
    4: { title: "MISSION 4", text: "GET THE CODE FROM YOUR MATH TEACHER", correctCode: "4444", points: 10 },
    5: { title: "MISSION 5", text: "ASK FOR A CODE IN THE CAFETERIA", correctCode: "5555", points: 10 },
    6: { title: "MISSION 6", text: "SECRET CODE MISSION", correctCode: "6666", points: 10 },
    7: { title: "FINAL MISSION", text: "THE LAST CODE TO WIN THE GAME", correctCode: "7777", points: 20 }
};

function updateMap() {
    for (let i = 1; i <= totalLevels; i++) {
        const node = document.getElementById(`step${i}`);
        if (!node) continue;
        const img = node.querySelector("img");

        if (i < currentLevel) {
            node.className = "node completed";
            img.src = imgDone;
            node.onclick = () => openModal(i, true);
        } else if (i === currentLevel) {
            node.className = "node active";
            img.src = imgOpen;
            node.onclick = () => openModal(i, false);
        } else {
            node.className = "node locked";
            img.src = imgLock;
            node.onclick = null;
        }
    }
    drawLines();
}

function drawLines() {
    const svg = document.getElementById('map-lines');
    if (!svg) return;
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);
    const container = document.querySelector('.map-container').getBoundingClientRect();

    for (let i = 1; i < totalLevels; i++) {
        const startNode = document.getElementById(`step${i}`);
        const endNode = document.getElementById(`step${i+1}`);
        if (startNode && endNode) {
            const r1 = startNode.getBoundingClientRect();
            const r2 = endNode.getBoundingClientRect();
            const x1 = (r1.left + r1.width / 2) - container.left;
            const y1 = (r1.top + r1.height / 2) - container.top;
            const x2 = (r2.left + r2.width / 2) - container.left;
            const y2 = (r2.top + r2.height / 2) - container.top;
            const midX = (x1 + x2) / 2 + (i % 2 === 0 ? 70 : -70);
            const midY = (y1 + y2) / 2 + (i % 2 === 0 ? -20 : 20);
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`);
            if (i < currentLevel) {
                path.setAttribute("stroke", "#00d4ff");
                path.setAttribute("stroke-width", "5");
                path.setAttribute("filter", "url(#glow)");
            } else {
                path.setAttribute("stroke", "rgba(7, 234, 241, 0.5)");
                path.setAttribute("stroke-width", "3");
                path.setAttribute("stroke-dasharray", "10, 10");
            }
            svg.appendChild(path);
        }
    }
}

function openModal(levelNum, isCompleted) {
    const modal = document.getElementById('modalOverlay');
    const modalBody = document.querySelector('.modal-body');
    const btn = document.getElementById('completeBtn');
    const data = levelData[levelNum];

    document.getElementById('modalTitle').innerText = data.title;
    
    if (isCompleted) {
        modalBody.innerHTML = `<div class="mission-card completed-card"><p>Mission Accomplished!</p><div style="font-size: 3rem;">✅</div></div>`;
        btn.style.display = "none";
    } else {
        btn.style.display = "inline-block";
        btn.disabled = true;

        modalBody.innerHTML = `
            <div class="mission-card">
                <p class="mission-text"><strong>></strong> ${data.text} <strong><</strong></p>
                <div class="input-group">
                    <label>YOUR CODE FROM TEACHER</label>
                    <div class="code-inputs">
                        <input type="text" maxlength="1" class="code-box" id="c1">
                        <input type="text" maxlength="1" class="code-box" id="c2">
                        <input type="text" maxlength="1" class="code-box" id="c3">
                        <input type="text" maxlength="1" class="code-box" id="c4">
                    </div>
                </div>
                <div class="mission-footer">
                    <span class="points-badge">${data.points} points</span>
                </div>
            </div>
        `;

        const inputs = modalBody.querySelectorAll('.code-box');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value && index < inputs.length - 1) inputs[index + 1].focus();
                validateMission(data.correctCode);
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === "Backspace" && !e.target.value && index > 0) inputs[index - 1].focus();
            });
        });
        btn.onclick = () => finishLevel(levelNum);
    }
    modal.style.display = 'block';
}

function validateMission(correctCode) {
    const c1 = document.getElementById('c1').value;
    const c2 = document.getElementById('c2').value;
    const c3 = document.getElementById('c3').value;
    const c4 = document.getElementById('c4').value;
    const enteredCode = c1 + c2 + c3 + c4;
    const btn = document.getElementById('completeBtn');

    if (enteredCode === correctCode) {
        btn.disabled = false;
        document.querySelectorAll('.code-box').forEach(el => el.style.borderBottomColor = "#00ff96");
    } else {
        btn.disabled = true;
        document.querySelectorAll('.code-box').forEach(el => el.style.borderBottomColor = "#1e293b");
    }
}

function finishLevel(levelNum) {
    if (levelNum === currentLevel) {
        currentLevel++;
        closeModal();
        updateMap();
    }
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

window.addEventListener('resize', drawLines);
updateMap();



window.addEventListener('load', () => {
    const ufoImage = document.getElementById('ufo-alien');
    const speechBubble = document.getElementById('speech-bubble');

    const messages = [
        "Hi, I'm Exie! Do you have any space snacks? 🍪",
        "Wait... is this planet Earth or a giant video game? 🎮",
        "I traveled 5 million light years just to see your website! ✨",
        "Exie to base: The humans are clicking me again! 🛸",
        "Error 404: Exie's brain not found. Too much stardust! 🌟",
        "Is it true you guys have something called 'pizza'? Take me to it! 🍕",
        "I’m not short, I’m just from a high-gravity planet! 🪐",
        "Earth is cool, but the WiFi in the Milky Way is faster. 📶",
        "Stop clicking! You're tickling my sensors! 😂"
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
        showMessage("Hi, I'm Exie! Are you ready for your challenge? Click me to start ! 🛸", false);
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