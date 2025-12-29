// -----------------------------
// DOT-GRID BACKGROUND
// -----------------------------
const canvas = document.getElementById("dot-grid-canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let dots = [];
let mouse = { x: -9999, y: -9999 };

const dotSize = 3;
const gap = 20;
const influence = 120;
const returnSpeed = 0.1;

// Build grid
function buildGrid() {
    dots = [];
    const cols = Math.floor(width / (dotSize + gap));
    const rows = Math.floor(height / (dotSize + gap));

    for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
            const px = x * (dotSize + gap) + gap / 2;
            const py = y * (dotSize + gap) + gap / 2;

            dots.push({
                x: px,
                y: py,
                baseX: px,
                baseY: py,
                vx: 0,
                vy: 0,
                color: "#888"
            });
        }
    }
}

// Resize canvas
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    buildGrid();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Draw loop
function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let dot of dots) {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influence) {
            const force = ((influence - dist) / influence) * 2;
            const nx = dist === 0 ? 0 : dx / dist;
            const ny = dist === 0 ? 0 : dy / dist;

            dot.vx += nx * force;
            dot.vy += ny * force;
            dot.color = "#a05fffff";
        } else {
            dot.color = "#888";
        }

        dot.vx += (dot.baseX - dot.x) * returnSpeed;
        dot.vy += (dot.baseY - dot.y) * returnSpeed;

        dot.vx *= 0.85;
        dot.vy *= 0.85;

        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
    }

    requestAnimationFrame(draw);
}
draw();

// Mouse tracking
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mouseout", () => {
    mouse.x = -9999;
    mouse.y = -9999;
});

// -----------------------------
// SCROLL FADE-IN ANIMATION
// -----------------------------
const fadeElements = document.querySelectorAll('.fade');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach(el => fadeObserver.observe(el));

// Also add visible class immediately to elements already in viewport on load
document.addEventListener('DOMContentLoaded', () => {
    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        }
    });
});

// -----------------------------
// Hash Tool Functionality
// -----------------------------
const generateBtn = document.getElementById("generateBtn");
const matchBtn = document.getElementById("matchBtn");
const copyBtn = document.getElementById("copyBtn");

if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
        const text = document.getElementById("textInput").value;
        const algo = document.getElementById("algorithm").value;

        if (!text) return alert("Enter text to hash");

        try {
            const res = await fetch("/hash", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text: text, algorithm: algo})
            });
            const data = await res.json();
            if (data.hash) {
                document.getElementById("output").innerText = data.hash;
            } else if (data.error) {
                document.getElementById("output").innerText = data.error;
            }
        } catch (err) {
            console.error(err);
            alert("Error generating hash");
        }
    });
}

if (matchBtn) {
    matchBtn.addEventListener("click", async () => {
        const text = document.getElementById("matchText").value;
        const hash = document.getElementById("matchHash").value;

        if (!text || !hash) return alert("Enter both text and hash");

        try {
            const res = await fetch("/hash", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text: text, match: hash})
            });
            const data = await res.json();
            if (data.match) {
                document.getElementById("matchOutput").innerText = `✅ Match found (${data.algorithm})`;
            } else {
                document.getElementById("matchOutput").innerText = `❌ ${data.message || "No match found"}`;
            }
        } catch (err) {
            console.error(err);
            alert("Error checking match");
        }
    });
}

// Copy to clipboard
if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        const output = document.getElementById("output").innerText;
        if (output && output !== "Output will appear here...") {
            navigator.clipboard.writeText(output).then(() => {
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    `;
                }, 2000);
            });
        }
    });
}

// -----------------------------
// Newsletter Form
// -----------------------------
const form = document.querySelector(".newsletter-form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector("input");
        const email = emailInput.value.trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valid.test(email)) {
            alert("❌ Invalid email format.");
            return;
        }
        try {
            const res = await fetch("/subscribe", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: email})
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Subscribed successfully! Check your email.");
                emailInput.value = "";
            } else {
                alert("❌ Subscription failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("❌ Could not connect to server.");
            console.error(err);
        }
    });
}
