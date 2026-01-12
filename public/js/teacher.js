let students = [
    { name: "Daniel", score: 2000 },
    { name: "Emre", score: 1580 },
    { name: "Zay", score: 1499 },
    { name: "Luuk", score: 1000 },
    { name: "Marianna", score: 900 }
];

const scoreList = document.getElementById('score-list');


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


renderLeaderboard();



