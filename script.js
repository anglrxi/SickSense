// --- DATA SETS ---
// Static arrays acting as a mini-database for remedies and random tips
const remedies = [
    { symptom: "fever", advice: "Rest and stay hydrated. Monitor temperature." },
    { symptom: "cough", advice: "Honey and warm water can soothe the throat." },
    { symptom: "headache", advice: "Rest in a quiet, dark room and avoid screens." },
    { symptom: "fatigue", advice: "Try to get at least 8 hours of sleep tonight." }
];

const healthTips = [
    "Drink water before every meal.",
    "Try 5 minutes of stretching every morning.",
    "Limit sugar intake to boost your immunity.",
    "A 20-minute walk improves heart health."
];

// --- INITIALIZATION ---
// Runs as soon as the page loads to set up the user's specific environment
window.onload = () => {
    // Set user info from Login
    document.getElementById('display-name').textContent = localStorage.getItem('userName') || "Guest";
    document.getElementById('display-address').textContent = localStorage.getItem('userAddress') || "Unknown Location";
    
    getNewTip();    // Picks a random starting tip
    loadLogs(); // Populates the "History" section with saved entries
};

// --- NAVIGATION ---
function logout() {
    localStorage.clear(); // Wipes all session data (logged in status, name, etc.)
    window.location.href = 'login.html';
}

function toggleDarkMode() {
    // Adds/Removes a CSS class on the <body> to trigger theme changes defined in style.css
    document.body.classList.toggle('dark-theme');
}

// --- SYMPTOM LOGGER ---
// This handles the primary form on the dashboard
document.getElementById('symptom-form').addEventListener('submit', function(e) {
    e.preventDefault();

   // 1. Capture Symptoms: Loops through checked boxes and sums up the 'data-weight'
    let selectedSymptoms = [];
    let score = 0;
    document.querySelectorAll('.symptom:checked').forEach(checkbox => {
        selectedSymptoms.push(checkbox.value);
        score += parseInt(checkbox.getAttribute('data-weight'));
    });

    // 2. Capture Additional Info: Grabs values from the date and text inputs
    const onsetDate = document.getElementById('onset-date').value || "Not specified";
    const extraNotes = document.getElementById('extra-notes').value || "No additional notes provided.";
    const currentTime = new Date().toLocaleString();

    // 3. Create Log Object: Groups all data into a single package
    const newEntry = {
        name: localStorage.getItem('userName') || "User",
        symptoms: selectedSymptoms,
        healthScore: score,
        onset: onsetDate,
        notes: extraNotes,
        timestamp: currentTime
    };

    // 4. Save to LocalStorage: Gets the old list, adds the new entry, and saves it back
    let existingLogs = JSON.parse(localStorage.getItem('sickSenseLogs')) || [];
    existingLogs.push(newEntry);
    localStorage.setItem('sickSenseLogs', JSON.stringify(existingLogs));

    // 5. Visual Feedback: Changes the color of the result box based on severity
    const scoreBox = document.getElementById('score-display');
    scoreBox.style.display = "block";
    scoreBox.className = "result-box";
    if (score > 3) {
        scoreBox.textContent = "High Risk! Please visit a clinic.";
        scoreBox.style.background = "#e74c3c";
        scoreBox.style.color = "white";
    } else {
        scoreBox.textContent = "Low Risk. Entry recorded.";
        scoreBox.style.background = "#f1c40f";
        scoreBox.style.color = "black";
    }

    // 6. Refresh the list and Reset Form: Shows the new log in the history immediately
    loadLogs();
    this.reset();
});

// --- RENDER LOGS TO SCREEN ---
function loadLogs() {
    const logList = document.getElementById('log-list');
    const logs = JSON.parse(localStorage.getItem('sickSenseLogs')) || [];

    if (logs.length === 0) {
        logList.innerHTML = "<p style='color:gray; padding:10px;'>No health entries found.</p>";
        return;
    }

    // Generate HTML: Uses .map to turn each log object into a <li> element
    logList.innerHTML = logs.map((log) => `
        <li style="background: var(--bg); padding:15px; border-radius:8px; margin-bottom:15px; border-left: 5px solid var(--primary); list-style:none;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>${log.name}</strong>
                <small style="color:gray;">${log.timestamp}</small>
            </div>
            <p><strong>Symptoms:</strong> ${log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None'}</p>
            <p><strong>Started:</strong> ${log.onset} | <strong>Score:</strong> ${log.healthScore}</p>
            <p style="font-style:italic; margin-top:5px; color:var(--primary);">"${log.notes}"</p>
        </li>
    `).reverse().join(''); // .reverse() ensures the newest entries appear at the top
}

function clearLogs() {
    if(confirm("Are you sure you want to delete all history?")) {
        localStorage.removeItem('sickSenseLogs');
        loadLogs();
    }
}

// --- BMI CALCULATOR ---
function calculateBMI() {
    const age = parseInt(document.getElementById('bmi-age').value);
    const w = parseFloat(document.getElementById('bmi-weight').value);
    const h = parseFloat(document.getElementById('bmi-height').value) / 100;
    const res = document.getElementById('bmi-result');

    if (w > 0 && h > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        let category = "";
        if (age >= 20) {
            category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : "Overweight";
        } else {
            category = bmi < 15 ? "Underweight (Child)" : "Healthy (Child)";
        }
        res.innerHTML = `<strong>BMI: ${bmi}</strong><br>Category: ${category}`;
        res.style.display = "block";
        res.style.background = "#9b59b6";
        res.style.color = "white";
    } else {
        alert("Please enter valid Weight and Height.");
    }
}

// --- UTILITIES ---
function addWater() {
    const p = document.getElementById('water-progress');
    // Increments the progress bar until it hits the max (8)
    if (p.value < p.max) p.value++;
    document.getElementById('water-count').textContent = `${p.value}/8 Glasses`;
}

function searchRemedy() {
    const query = document.getElementById('library-search').value.toLowerCase();
    const resultDiv = document.getElementById('remedy-result');
    // Looks through the remedies array for a match
    const found = remedies.find(r => r.symptom.includes(query));
    // If a match is found, inject the advice; otherwise, clear the box
    resultDiv.innerHTML = (query && found) ? `<div class="info-box" style="margin-top:10px;">${found.advice}</div>` : "";
}

function getNewTip() {
    // Randomly selects an index from the healthTips array
    const tip = healthTips[Math.floor(Math.random() * healthTips.length)];
    document.getElementById('tip-box').textContent = tip;
}

// --- ADMIN INQUIRY ---
document.getElementById('inquiry-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('inquiry-text').value;

    // Package message with user contact info from LocalStorage
    const newInquiry = {
        name: localStorage.getItem('userName'),
        phone: localStorage.getItem('userPhone'), //
        message: msg,
        timestamp: new Date().toLocaleString()
    };
    
    // Save to a separate storage key that the Admin Dashboard reads
    let inquiries = JSON.parse(localStorage.getItem('sickSenseInquiries')) || [];
    inquiries.push(newInquiry);
    localStorage.setItem('sickSenseInquiries', JSON.stringify(inquiries));
    
    document.getElementById('inquiry-status').style.display = "block";
    this.reset();
});