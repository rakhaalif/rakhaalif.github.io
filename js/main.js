// ===== PROGRESS BAR =====
const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrollTop / docHeight * 100) + '%';
});

// ===== CURSOR GLOW =====
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);

window.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== PARALLAX HERO =====
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${window.scrollY * 0.25}px)`;
        heroContent.style.opacity = 1 - (window.scrollY / window.innerHeight) * 1.2;
    }
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '', duration = 1500) {
    const isDecimal = target % 1 !== 0;
    const start = 0;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;
        el.textContent = isDecimal ? current.toFixed(2) + suffix : Math.floor(current) + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

const counters = [
    { selector: '.stat:nth-child(1) .stat-num', value: 3.80, suffix: '' },
    { selector: '.stat:nth-child(2) .stat-num', value: 5, suffix: '' },
    { selector: '.stat:nth-child(3) .stat-num', value: 90, suffix: '+' },
    { selector: '.stat:nth-child(4) .stat-num', value: 860, suffix: '+' },
];
let countersDone = false;
const statsSection = document.querySelector('.about-stats');

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);

            // Trigger counter when stats visible
            if (entry.target === statsSection && !countersDone) {
                countersDone = true;
                counters.forEach(c => {
                    const el = document.querySelector(c.selector);
                    if (el) animateCounter(el, c.value, c.suffix);
                });
            }
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
if (statsSection) revealObserver.observe(statsSection);

// ===== STAGGER CHILDREN =====
const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            staggerObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.stagger-children').forEach(el => staggerObserver.observe(el));

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(a => a.style.color = '');
            const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (active) active.style.color = 'var(--accent)';
        }
    });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COUNT = 70;
const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
}));

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
            const force = (100 - dist) / 100;
            p.vx += (dx / dist) * force * 0.15;
            p.vy += (dy / dist) * force * 0.15;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,136,${p.alpha})`;
        ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(57,255,136,${0.08 * (1 - dist / 110)})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== STAGGER TECH STACK & PROJECTS =====
document.querySelector('.stack-grid')?.classList.add('stagger-children');
document.querySelector('.projects-grid')?.classList.add('stagger-children');

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
});

// ===== BUMPER =====
window.addEventListener('load', () => {
    const bumper = document.getElementById('bumper');
    setTimeout(() => { bumper.style.display = 'none'; }, 3400);
});

// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById('tab-' + btn.dataset.tab);
        target.classList.add('active');
        // Re-trigger stagger
        target.querySelectorAll('.stagger-children').forEach(el => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), 50);
        });
    });
});

// ===== ID CARD PHYSICS =====
(function () {
    const scene = document.getElementById('idcard-scene');
    const card = document.getElementById('idcard-hang');
    const canvas = document.getElementById('rope-canvas');
    if (!scene || !card || !canvas) return;

    const ctx = canvas.getContext('2d');
    const PIVOT_X = 110; // anchor point X (center top)
    const PIVOT_Y = 8;   // anchor point Y

    // Physics state
    let angle = 0;      // current angle in radians
    let angleVel = 0;      // angular velocity
    const DAMPING = 0.97;   // energy loss per frame
    const GRAVITY = 0.003;  // pendulum gravity constant
    const ROPE_LEN = 60;    // rope length px

    // Drag state
    let isDragging = false;
    let lastAngle = 0;
    let lastTime = 0;

    function getAngleFromPointer(px, py) {
        const rect = scene.getBoundingClientRect();
        const dx = (px - rect.left) - PIVOT_X;
        const dy = (py - rect.top) - PIVOT_Y;
        return Math.atan2(dx, dy);
    }

    function resizeCanvas() {
        canvas.width = scene.offsetWidth;
        canvas.height = scene.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawRope() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cardTop = {
            x: PIVOT_X + Math.sin(angle) * ROPE_LEN,
            y: PIVOT_Y + Math.cos(angle) * ROPE_LEN
        };
        // Draw lanyard strap
        ctx.beginPath();
        ctx.moveTo(PIVOT_X, PIVOT_Y);
        // Bezier curve for natural rope sag
        ctx.bezierCurveTo(
            PIVOT_X + Math.sin(angle) * ROPE_LEN * 0.4,
            PIVOT_Y + ROPE_LEN * 0.3,
            cardTop.x,
            cardTop.y - 10,
            cardTop.x,
            cardTop.y
        );
        ctx.strokeStyle = 'rgba(100,100,100,0.7)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Clip connector
        ctx.beginPath();
        ctx.arc(PIVOT_X, PIVOT_Y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#555';
        ctx.fill();

        // Top anchor dot
        ctx.beginPath();
        ctx.arc(PIVOT_X, PIVOT_Y - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(57,255,136,0.6)';
        ctx.fill();
    }

    function updateCard() {
        const cardX = PIVOT_X + Math.sin(angle) * ROPE_LEN - 80;
        const cardY = PIVOT_Y + Math.cos(angle) * ROPE_LEN;
        card.style.transform =
            `translateX(calc(-50% + ${Math.sin(angle) * ROPE_LEN}px)) rotate(${angle * 0.8}rad)`;
        card.style.top = (PIVOT_Y + Math.cos(angle) * ROPE_LEN) + 'px';
    }

    function animate() {
        if (!isDragging) {
            // Pendulum physics
            angleVel += -GRAVITY * Math.sin(angle);
            angleVel *= DAMPING;
            angle += angleVel;
        }
        drawRope();
        updateCard();
        requestAnimationFrame(animate);
    }
    animate();

    // === Mouse drag ===
    card.addEventListener('mousedown', e => {
        isDragging = true;
        lastAngle = getAngleFromPointer(e.clientX, e.clientY);
        lastTime = performance.now();
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const newAngle = getAngleFromPointer(e.clientX, e.clientY);
        const now = performance.now();
        angleVel = (newAngle - lastAngle) / (now - lastTime + 1) * 16;
        angle = newAngle;
        lastAngle = newAngle;
        lastTime = now;
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    // === Touch drag ===
    card.addEventListener('touchstart', e => {
        isDragging = true;
        const t = e.touches[0];
        lastAngle = getAngleFromPointer(t.clientX, t.clientY);
        lastTime = performance.now();
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const t = e.touches[0];
        const newAngle = getAngleFromPointer(t.clientX, t.clientY);
        const now = performance.now();
        angleVel = (newAngle - lastAngle) / (now - lastTime + 1) * 16;
        angle = newAngle;
        lastAngle = newAngle;
        lastTime = now;
    }, { passive: false });
    document.addEventListener('touchend', () => { isDragging = false; });

    // Auto gentle swing on load
    angle = 0.3;
})();
