
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

window.addEventListener('resize', drawLines);
updateMap();



window.addEventListener('load', () => {
    const ufoImage = document.getElementById('ufo-alien');
    const speechBubble = document.getElementById('speech-bubble');

    const messages = [
        "Greetings, earthling! 👽",
        "Is there any space pizza here? 🍕",
        "Your website looks out of this world! ✨",
        "I come in peace! (mostly) ✌️",
        "System check: All green! 🟢",
        "Punch it! We're breaking the sound barrier!",
        "You're moving so fast, you're leaving a trail of stardust.",
        "Maximum overdrive engaged! Look at those numbers climb.",
        "Your momentum is undeniable. Next stop: The Moon!",
        "Warp speed ahead! Nothing can stop you now.",
        "Engaging hyperdrive! Prepare for an interstellar journey.",
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
        showMessage("You’re entering the stratosphere! Keep pushing to win.🛸", false);
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