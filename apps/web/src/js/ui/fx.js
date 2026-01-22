export function ripple(e) {
    const btn = e.currentTarget;
    const r = document.createElement("span");
    r.className = "ripple";
    const rect = btn.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left) + "px";
    r.style.top = (e.clientY - rect.top) + "px";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
}

export function bindRipple(el) {
    if (!el) return;
    el.addEventListener("click", ripple);
}

export function bindTilt(el) {
    if (!el) return;
    el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform = `translateY(-2px) rotateX(${(py - .5) * 7}deg) rotateY(${(px - .5) * -7}deg)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
}

export function revealOnScroll() {
    const items = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("show"); });
    }, { threshold: 0.12 });
    items.forEach(i => io.observe(i));
}

export function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
}