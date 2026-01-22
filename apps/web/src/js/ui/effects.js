export function bindFX(root = document) {
    root.querySelectorAll(".btn, .chip, .tilt").forEach(el => {
        el.addEventListener("click", ripple);
        el.addEventListener("mousemove", tiltMove);
        el.addEventListener("mouseleave", tiltReset);
    });
}

function ripple(e) {
    const btn = e.currentTarget;
    const r = document.createElement("span");
    r.className = "ripple";
    const rect = btn.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left) + "px";
    r.style.top = (e.clientY - rect.top) + "px";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
}

function tiltMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - .5) * 6;
    const ry = (px - .5) * -6;
    el.style.transform = `translateY(-1px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    el.style.boxShadow = `0 0 0 1px rgba(255,255,255,.10), 0 18px 70px rgba(0,0,0,.45)`;
}

function tiltReset(e) {
    const el = e.currentTarget;
    el.style.transform = "";
    el.style.boxShadow = "";
}
