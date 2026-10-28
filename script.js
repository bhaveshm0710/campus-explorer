/* ===== PART 1: CORE (clubs, search, filters, event details) ===== */

const clubs = [
  { name: "Code Crew", icon: "💻", category: "Tech", description: "Weekly coding sessions, hackathons and peer mentoring." },
  { name: "Robo Labs", icon: "🤖", category: "Tech", description: "Build robots and learn electronics with hands-on projects." },
  { name: "Pixel Studio", icon: "🎨", category: "Creative", description: "Design, photography and video editing workshops." },
  { name: "Open Mic Society", icon: "🎤", category: "Creative", description: "Music, poetry and stand-up nights for every talent." },
  { name: "Court Kings", icon: "🏀", category: "Sports", description: "Basketball and volleyball practice with friendly matches." },
  { name: "Trail Runners", icon: "🏃", category: "Sports", description: "Morning runs, fitness challenges and marathon prep." }
];

const clubList = document.querySelector("#club-list");
const clubCount = document.querySelector("#club-count");
const searchInput = document.querySelector("#search");
const filterButtons = document.querySelectorAll(".filter");
const detailButtons = document.querySelectorAll(".details-btn");
const hero = document.querySelector(".hero");

let selectedCategory = "All";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showClubs() {
  const searchText = searchInput.value.toLowerCase();

  const matchingClubs = clubs.filter(function (club) {
    const matchesSearch =
      club.name.toLowerCase().includes(searchText) ||
      club.description.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory === "All" || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  clubCount.textContent = "Showing " + matchingClubs.length + " of " + clubs.length + " clubs";

  if (matchingClubs.length === 0) {
    clubList.innerHTML = '<p class="empty">No clubs found. Try another search.</p>';
    return;
  }

  clubList.innerHTML = matchingClubs.map(function (club, index) {
    return `
      <article class="card" data-category="${club.category}" style="--i:${index}">
        <div class="card-top">
          <span class="icon" aria-hidden="true">${club.icon}</span>
          <span class="tag">${club.category}</span>
        </div>
        <h3>${club.name}</h3>
        <p>${club.description}</p>
      </article>`;
  }).join("");

  addCardEffects();
}

searchInput.addEventListener("input", showClubs);

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCategory = button.dataset.category;
    filterButtons.forEach(function (other) {
      other.classList.toggle("active", other === button);
      other.setAttribute("aria-pressed", other === button);
    });
    showClubs();
  });
});

detailButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const details = button.nextElementSibling;
    const wasHidden = details.hidden;
    details.hidden = !wasHidden;
    button.textContent = wasHidden ? "Hide details" : "Show details";
    button.setAttribute("aria-expanded", wasHidden);
  });
});

/* ===== PART 2: EFFECTS (visual extras, safe to study last) ===== */

// Effect A: card tilt and glow that follow the mouse
function addCardEffects() {
  if (reduceMotion) return;
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("mousemove", tiltCard);
    card.addEventListener("mouseleave", function () { card.style.transform = ""; });
  });
}

function tiltCard(event) {
  const card = event.currentTarget;
  const box = card.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  card.style.setProperty("--mx", x + "px");
  card.style.setProperty("--my", y + "px");
  const rotateY = (x / box.width - 0.5) * 12;
  const rotateX = (0.5 - y / box.height) * 12;
  card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
}

// Effect B: headline text decodes from random symbols into real letters
function decodeText(element) {
  const finalText = element.dataset.text;
  const symbols = "!<>-_/[]{}=+*^?#01";
  let step = 0;
  const timer = setInterval(function () {
    element.textContent = finalText.split("").map(function (letter, index) {
      if (letter === " " || index < step) return letter;
      return symbols[Math.floor(Math.random() * symbols.length)];
    }).join("");
    step += 0.5;
    if (step >= finalText.length) {
      clearInterval(timer);
      element.textContent = finalText;
    }
  }, 40);
}

// Effect C: a web of moving dots that connect to each other and to the cursor
const canvas = document.querySelector("#web");
const pen = canvas.getContext("2d");
const mouse = { x: null, y: null };
const dots = [];

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  dots.length = 0;
  const count = Math.min(90, Math.floor(canvas.width / 14));
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6
    });
  }
}

function drawLine(from, to, maxDistance) {
  const distance = Math.hypot(from.x - to.x, from.y - to.y);
  if (distance > maxDistance) return;
  pen.strokeStyle = "rgba(182, 255, 59, " + (1 - distance / maxDistance) * 0.5 + ")";
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(to.x, to.y);
  pen.stroke();
}

function animateWeb() {
  pen.clearRect(0, 0, canvas.width, canvas.height);
  pen.fillStyle = "#b6ff3b";
  dots.forEach(function (dot, index) {
    dot.x += dot.speedX;
    dot.y += dot.speedY;
    if (dot.x < 0 || dot.x > canvas.width) dot.speedX *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.speedY *= -1;
    for (let other = index + 1; other < dots.length; other++) drawLine(dot, dots[other], 120);
    if (mouse.x !== null) drawLine(dot, mouse, 180);
    pen.fillRect(dot.x - 1.5, dot.y - 1.5, 3, 3);
  });
  if (!reduceMotion) requestAnimationFrame(animateWeb);
}

hero.addEventListener("pointermove", function (event) {
  const box = canvas.getBoundingClientRect();
  mouse.x = event.clientX - box.left;
  mouse.y = event.clientY - box.top;
});
hero.addEventListener("pointerleave", function () { mouse.x = null; });
window.addEventListener("resize", resizeCanvas);

/* ===== START ===== */
showClubs();
resizeCanvas();
animateWeb();
if (!reduceMotion) document.querySelectorAll(".decode").forEach(decodeText);

/* ===== PART 3: UPGRADES (extra effects, each one is separate) ===== */

// Scroll progress bar at the top of the page
const progressBar = document.querySelector(".progress");
window.addEventListener("scroll", function () {
  const scrollRange = document.body.scrollHeight - window.innerHeight;
  progressBar.style.setProperty("--p", window.scrollY / Math.max(scrollRange, 1));
});

// Soft glow that follows the cursor
window.addEventListener("pointermove", function (event) {
  document.documentElement.style.setProperty("--gx", event.clientX + "px");
  document.documentElement.style.setProperty("--gy", event.clientY + "px");
});

// Main button gets pulled slightly toward the cursor
const mainButton = document.querySelector(".hero .button");
mainButton.addEventListener("mousemove", function (event) {
  if (reduceMotion) return;
  const box = mainButton.getBoundingClientRect();
  const moveX = (event.clientX - box.left - box.width / 2) * 0.25;
  const moveY = (event.clientY - box.top - box.height / 2) * 0.25;
  mainButton.style.transform = "translate(" + moveX + "px, " + (moveY - 3) + "px)";
});
mainButton.addEventListener("mouseleave", function () { mainButton.style.transform = ""; });

// Numbers count up from 0
document.querySelectorAll("[data-count]").forEach(function (number) {
  const target = Number(number.dataset.count);
  let current = 0;
  number.textContent = reduceMotion ? target : 0;
  if (reduceMotion) return;
  const timer = setInterval(function () {
    current++;
    number.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 150);
});

// Sections fade up when they scroll into view
if (!reduceMotion) {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll("h2, .note, .controls, .event, .resources li").forEach(function (item) {
    item.classList.add("reveal");
    revealObserver.observe(item);
  });
}

// Highlight the navbar link of the section you are reading
const navLinks = document.querySelectorAll(".navbar nav a");
const sectionObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
    });
  });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach(function (section) { sectionObserver.observe(section); });
