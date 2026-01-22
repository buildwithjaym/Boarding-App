import "../../css/theme.css";
import "../../css/components.css";
import { bindRipple, bindTilt, revealOnScroll, toast } from "../ui/fx.js";

const el = (id) => document.getElementById(id);

const qEl = el("q");
const grid = el("listingsGrid");
const warn = el("warn");

const overlay = el("overlay");
const modal = el("modal");
const closeBtn = el("closeBtn");

const applyFor = el("applyFor");
const submitBtn = el("submitBtn");
const sentBadge = el("sentBadge");

const nameEl = el("name");
const ageEl = el("age");
const courseEl = el("course");
const yearEl = el("year");
const phoneEl = el("phone");
const emailEl = el("email");
const moveinEl = el("movein");
const msgEl = el("msg");

let currentListing = null;
let currentRoom = null;

function money(v) {
    const s = String(v || "").trim();
    if (!s) return "";
    return s.startsWith("₱") ? s : "₱" + s;
}

function loadListing() {
    const raw = localStorage.getItem("BH_LISTING");
    if (raw) {
        try { return JSON.parse(raw); } catch (_) { }
    }
    return null;
}

function availableRooms(l) {
    return (l.rooms || []).filter(r => (r.capacity - r.occupied) > 0);
}

function showWarn(msg) {
    warn.style.display = "inline-flex";
    warn.textContent = msg;
}

function hideWarn() {
    warn.style.display = "none";
    warn.textContent = "";
}

function getTenantState() {
    const raw = localStorage.getItem("TENANT_STATE");
    if (!raw) return { movedIn: false };
    try { return JSON.parse(raw); } catch (_) { return { movedIn: false }; }
}

function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function openModal(listing, room) {
    const s = getTenantState();
    if (s.movedIn) {
        showWarn("Already moved-in. Applying is blocked.");
        toast("Blocked: already moved-in.");
        return;
    }
    currentListing = listing;
    currentRoom = room;
    applyFor.textContent = `${listing.title} • ${room.name} • ${money(room.price)} per room • ${room.capacity - room.occupied} slots left`;
    overlay.classList.add("show");
    modal.classList.add("show");
}

function closeModal() {
    overlay.classList.remove("show");
    modal.classList.remove("show");
}

function submit() {
    const s = getTenantState();
    if (s.movedIn) {
        showWarn("Already moved-in. Applying is blocked.");
        toast("Blocked: already moved-in.");
        return;
    }

    const payload = {
        id: "app_" + Math.random().toString(16).slice(2),
        status: "PENDING",
        createdAt: Date.now(),
        listingId: currentListing.id,
        listingTitle: currentListing.title,
        roomName: currentRoom.name,
        tenant: {
            name: nameEl.value.trim(),
            age: Number(ageEl.value),
            course: courseEl.value.trim(),
            year: yearEl.value.trim(),
            phone: phoneEl.value.trim(),
            email: emailEl.value.trim(),
            movein: moveinEl.value,
            message: msgEl.value.trim()
        }
    };

    if (!payload.tenant.name) return toast("Name required.");
    if (!payload.tenant.age || payload.tenant.age < 16) return toast("Age invalid.");
    if (!payload.tenant.course) return toast("Course required.");
    if (!payload.tenant.year) return toast("Year level required.");
    if (!payload.tenant.phone) return toast("Phone required.");
    if (!validEmail(payload.tenant.email)) return toast("Email invalid.");
    if (!payload.tenant.movein) return toast("Move-in date required.");

    const raw = localStorage.getItem("APPLICATIONS");
    const arr = raw ? (JSON.parse(raw) || []) : [];
    arr.unshift(payload);
    localStorage.setItem("APPLICATIONS", JSON.stringify(arr));

    sentBadge.style.display = "inline-flex";
    setTimeout(() => sentBadge.style.display = "none", 1200);

    toast("Application sent.");
    closeModal();
}

function mkCard(listing) {
    const roomsAvail = availableRooms(listing);
    const totalSlots = roomsAvail.reduce((sum, r) => sum + (r.capacity - r.occupied), 0);

    const c = document.createElement("div");
    c.className = "card glow reveal listCard";

    const cover = listing.photos?.[0] ? `<img src="${listing.photos[0]}" alt="cover">` : "";

    c.innerHTML = `
    <div class="cover">${cover}</div>
    <div class="metaRow">
      <div>
        <div class="title">${listing.title}</div>
        <div class="muted">${listing.area}</div>
      </div>
      <div class="badge pulse">${totalSlots} slots</div>
    </div>
    <div class="metaRow">
      <div class="small">${listing.priceRange} <span class="muted2">per room</span></div>
      <div class="price">${money(roomsAvail[0]?.price || "")}</div>
    </div>
    <div class="small">${(listing.description || "").slice(0, 90)}${(listing.description || "").length > 90 ? "..." : ""}</div>
    <div class="cardFooter">
      <button class="btn primary" data-apply="1">View & Apply</button>
      <span class="badge">Rooms: ${roomsAvail.length}</span>
    </div>
  `;

    const b = c.querySelector("[data-apply]");
    bindRipple(b);
    b.addEventListener("click", () => openModal(listing, roomsAvail[0]));
    bindTilt(c);

    return c;
}

function render() {
    hideWarn();
    grid.innerHTML = "";

    const listing = loadListing();
    if (!listing) {
        const c = document.createElement("div");
        c.className = "card glow reveal";
        c.style.padding = "14px";
        c.innerHTML = `<div class="muted">No listing yet. Ask owner to create one in Owner page.</div>`;
        grid.appendChild(c);
        revealOnScroll();
        return;
    }

    const q = (qEl.value || "").trim().toLowerCase();
    const match = !q || listing.title.toLowerCase().includes(q) || listing.area.toLowerCase().includes(q);

    const roomsAvail = availableRooms(listing);
    if (!match || roomsAvail.length === 0) {
        const c = document.createElement("div");
        c.className = "card glow reveal";
        c.style.padding = "14px";
        c.innerHTML = `<div class="muted">No available rooms found.</div>`;
        grid.appendChild(c);
        revealOnScroll();
        return;
    }

    grid.appendChild(mkCard(listing));
    revealOnScroll();
}

bindRipple(closeBtn);
bindRipple(submitBtn);

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

submitBtn.addEventListener("click", submit);
qEl.addEventListener("input", render);

render();
revealOnScroll();