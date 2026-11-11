// Page script: the bumper intro and the ID card on its lanyard.
// Everything else (nav, menu, hovers, the moment) is run by the kit in assets/.

// ===== BUMPER =====
// CSS fades it out after 2.8s; remove it from the page once it has gone.
(function () {
    const bumper = document.querySelector('.bumper');
    if (!bumper) return;
    setTimeout(() => bumper.remove(), 3400);
})();

// ===== ID CARD PHYSICS =====
(function () {
    const card = document.getElementById('idcard-hang');
    if (!card) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Physics state
    let angle = reduced ? 0 : 0.15; // a gentle swing on load
    let angleVel = 0;
    const DAMPING = 0.975;
    const GRAVITY = 0.004;

    // Drag state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartAngle = 0;
    let running = false;

    const body = document.getElementById('idcard-body');

    function render() {
        card.style.transform = `translateX(-50%) rotate(${angle}rad)`;
        // the foil sheen on the card slides with the swing
        if (body) body.style.setProperty('--swing', angle.toFixed(4));
    }

    function step() {
        if (!isDragging) {
            // pendulum: angular acceleration = -g * sin(theta)
            angleVel += -GRAVITY * Math.sin(angle);
            angleVel *= DAMPING;
            angle += angleVel;
        }
        render();
        // stop the loop once the card is at rest, so nothing runs in the background
        if (isDragging || Math.abs(angle) > 0.0005 || Math.abs(angleVel) > 0.0005) {
            requestAnimationFrame(step);
        } else {
            angle = 0; angleVel = 0; render(); running = false;
        }
    }

    function start() {
        if (running) return;
        running = true;
        requestAnimationFrame(step);
    }

    function down(x) {
        isDragging = true;
        dragStartX = x;
        dragStartAngle = angle;
        angleVel = 0;
        start();
    }

    function move(x) {
        if (!isDragging) return;
        angle = Math.max(-0.9, Math.min(0.9, dragStartAngle - (x - dragStartX) * 0.004));
    }

    function up(x) {
        if (!isDragging) return;
        angleVel = -(x - dragStartX) * 0.0006;
        isDragging = false;
    }

    card.addEventListener('pointerdown', e => {
        down(e.clientX);
        card.setPointerCapture(e.pointerId);
        e.preventDefault();
    });
    card.addEventListener('pointermove', e => move(e.clientX));
    card.addEventListener('pointerup', e => up(e.clientX));
    card.addEventListener('pointercancel', e => up(e.clientX));

    render();
    if (!reduced) start();
})();

// ===== SKELETON SHIMMER =====
// Each photograph's frame shows a soft shimmer until the picture has loaded; the picture itself is never hidden.
(function () {
    const imgs = document.querySelectorAll('.panel > img, .frame > img, .idc-photo > img, .close__media > img');
    imgs.forEach(img => {
        if (img.complete && img.naturalWidth) return;
        const box = img.parentElement;
        box.classList.add('is-loading');
        const done = () => box.classList.remove('is-loading');
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
    });
})();
