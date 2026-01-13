const grid = document.getElementById('code-grid');
const ufoImage = document.getElementById('ufo-alien');
const speechBubble = document.getElementById('speech-bubble');

let activeCodes = []; 
let firstClickDone = false;
let autoTalkInterval;

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


function generateRandomCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function renderGrid() {
    if (!grid) return;
    grid.innerHTML = ''; 
    activeCodes.forEach((codeObj, index) => {
        const codeWrapper = document.createElement('div');
        codeWrapper.className = 'code-item' + (codeObj.used ? ' used' : '');
        
        codeWrapper.innerHTML = `
            <span class="code">${codeObj.text}</span>
            ${!codeObj.used ? `<button class="use-btn" onclick="handleTeacherSelect(${index})">USE</button>` : ''}
        `;
        grid.appendChild(codeWrapper);
    });
}

function handleUse(index) {
   
    activeCodes[index].used = true;
    renderGrid(); 


    setTimeout(() => {
        activeCodes.splice(index, 1); 
        activeCodes.push({ text: generateRandomCode(), used: false }); 
        renderGrid(); 
    }, 600); 
}

function handleTeacherSelect(index) {
    const codeObj = activeCodes[index];
    const studentEmail = prompt("Enter student email to assign this code:"); // For testing
    if (!studentEmail) return;
    let studentCurrentLevel = prompt("Enter student's current level:"); // For testing
    studentCurrentLevel = Number(studentCurrentLevel);

    // Sanitize code: uppercase + alphanumeric only
    const sanitizedCode = codeObj.text.toUpperCase().replace(/[^A-Z0-9]/g, '');

    fetch("/api/apply-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail, code: sanitizedCode, level: studentCurrentLevel })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(`Code ${codeObj.text} assigned to ${studentEmail}`);
            activeCodes[index].used = true;
            renderGrid();
        } else {
            alert(data.message || "Failed to assign code");
        }
    })
    .catch(err => console.error(err));
}

function showMessage(text, autoHide = true) {
    if (!speechBubble) return;
    
    
    speechBubble.innerText = text || messages[Math.floor(Math.random() * messages.length)];
    
    
    speechBubble.classList.add('show');

    if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);

 
    if (autoHide) {
        window.bubbleTimeout = setTimeout(() => {
            speechBubble.classList.remove('show');
        }, 5000);
    }
}



window.addEventListener('load', () => {
  
    for (let i = 0; i < 8; i++) {
        activeCodes.push({ text: generateRandomCode(), used: false });
    }
    renderGrid();


    setTimeout(() => {
        showMessage("Hi, I'm Exie! Here are some codes for students that you can use! 🛸", false);
    }, 500);

   
    if (ufoImage) {
        ufoImage.style.cursor = "pointer"; 
        ufoImage.addEventListener('click', () => {
            if (!firstClickDone) {
                firstClickDone = true;
                autoTalkInterval = setInterval(() => {
                    showMessage(); 
                }, 15000);
            }
            showMessage();
        });
    }
});