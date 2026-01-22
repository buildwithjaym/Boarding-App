import "../../css/theme.css";
import "../../css/components.css";
import { bindRipple, bindTilt, revealOnScroll, toast } from "../ui/fx.js";

const el = (id) => document.getElementById(id);

const titleEl = el("title");
const areaEl = el("area");
const priceRangeEl = el("priceRange");
const contactEl = el("contact");
const descEl = el("description");

const roomNameEl = el("roomName");
const roomCapEl = el("roomCap");
const roomPriceEl = el("roomPrice");
const addRoomBtn = el("addRoomBtn");
const roomsWrap = el("roomsWrap");

const photosEl = el("photos");
const photosWrap = el("photosWrap");

const saveListingBtn = el("saveListingBtn");
const resetBtn = el("resetBtn");
const previewWrap = el("previewWrap");
const savedBadge = el("savedBadge");

let rooms = [];
let photos = [];

function money(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  return s.startsWith("₱") ? s : "₱" + s;
}

function readFiles(files, max = 6) {
  const arr = Array.from(files).slice(0, max);
  return Promise.all(arr.map(f => new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(f);
  })));
}

function listingPayload() {
  return {
    id: "listing_" + Math.random().toString(16).slice(2),
    title: titleEl.value.trim(),
    area: areaEl.value.trim(),
    priceRange: priceRangeEl.value.trim(),
    contact: contactEl.value.trim(),
    description: descEl.value.trim(),
    photos: photos.slice(0, 6),
    rooms: rooms.map(r => ({ ...r })),
    createdAt: Date.now()
  };
}

function validate(p) {
  if (!p.title) return "Title required.";
  if (!p.area) return "Area required.";
  if (!p.priceRange) return "Price range required.";
  if (!p.description) return "Description required.";
  if (!p.rooms.length) return "Add at least 1 room.";
  return null;
}

function availableSlots(p) {
  return p.rooms.reduce((sum, r) => sum + Math.max(0, r.capacity - r.occupied), 0);
}

function mkRoomCard(r, idx) {
  const c = document.createElement("div");
  c.className = "card glow reveal";
  c.style.padding = "12px";
  c.innerHTML = `
    <div class="metaRow">
      <div>
        <div class="title">${r.name}</div>
        <div class="muted">Capacity: ${r.capacity} • Occupied: ${r.occupied}</div>
      </div>
      <div class="price">${money(r.price)}</div>
    </div>
    <div class="row" style="margin-top:10px;">
      <button class="btn" data-del="${idx}">Remove</button>
    </div>
  `;
  const del = c.querySelector("[data-del]");
  bindRipple(del);
  del.addEventListener("click", () => {
    rooms.splice(idx, 1);
    renderRooms();
    renderPreview();
    toast("Room removed.");
  });
  bindTilt(c);
  return c;
}

function renderRooms() {
  roomsWrap.innerHTML = "";
  rooms.forEach((r, idx) => roomsWrap.appendChild(mkRoomCard(r, idx)));
  revealOnScroll();
}

function renderPhotos() {
  photosWrap.innerHTML = "";
  photos.forEach((src, idx) => {
    const c = document.createElement("div");
    c.className = "card glow reveal";
    c.style.padding = "10px";
    c.innerHTML = `
      <div class="cover"><img src="${src}" alt="photo"/></div>
      <div class="row" style="margin-top:10px;">
        <button class="btn" data-del="${idx}">Remove</button>
      </div>
    `;
    const del = c.querySelector("[data-del]");
    bindRipple(del);
    del.addEventListener("click", () => {
      photos.splice(idx, 1);
      renderPhotos();
      renderPreview();
      toast("Photo removed.");
    });
    bindTilt(c);
    photosWrap.appendChild(c);
  });
  revealOnScroll();
}

function mkPreviewCard(p) {
  const c = document.createElement("div");
  c.className = "card glow reveal listCard";
  const cover = p.photos?.[0] ? `<img src="${p.photos[0]}" alt="cover"/>` : "";
  c.innerHTML = `
    <div class="cover">${cover}</div>
    <div class="metaRow">
      <div>
        <div class="title">${p.title}</div>
        <div class="muted">${p.area}</div>
      </div>
      <div class="badge pulse">${availableSlots(p)} slots</div>
    </div>
    <div class="metaRow">
      <div class="small">${p.priceRange} <span class="muted2">per room</span></div>
      <div class="price">${money(p.rooms[0]?.price || "")}</div>
    </div>
    <div class="small">${p.description.slice(0, 90)}${p.description.length > 90 ? "..." : ""}</div>
    <div class="cardFooter">
      <span class="badge">Rooms: ${p.rooms.length}</span>
    </div>
  `;
  bindTilt(c);
  return c;
}

function renderPreview() {
  previewWrap.innerHTML = "";
  const p = listingPayload();
  const err = validate(p);
  if (err) {
    const c = document.createElement("div");
    c.className = "card glow reveal";
    c.style.padding = "14px";
    c.innerHTML = `<div class="muted">${err}</div>`;
    previewWrap.appendChild(c);
    revealOnScroll();
    return;
  }
  previewWrap.appendChild(mkPreviewCard(p));
  revealOnScroll();
}

addRoomBtn.addEventListener("click", () => {
  const name = roomNameEl.value.trim();
  const cap = Number(roomCapEl.value);
  const price = roomPriceEl.value.trim();

  if (!name) return toast("Room name required.");
  if (!cap || cap < 1) return toast("Capacity must be 1+.");
  if (!price) return toast("Room price required.");

  rooms.push({ name, capacity: cap, occupied: 0, price });
  roomNameEl.value = "";
  roomCapEl.value = "";
  roomPriceEl.value = "";

  renderRooms();
  renderPreview();
  toast("Room added.");
});

photosEl.addEventListener("change", async () => {
  const files = photosEl.files;
  if (!files?.length) return;
  const urls = await readFiles(files, 6);
  photos = [...photos, ...urls].slice(0, 6);
  photosEl.value = "";
  renderPhotos();
  renderPreview();
  toast("Photos added.");
});

[titleEl, areaEl, priceRangeEl, contactEl, descEl].forEach(x => x.addEventListener("input", renderPreview));

saveListingBtn.addEventListener("click", () => {
  const p = listingPayload();
  const err = validate(p);
  if (err) return toast(err);

  localStorage.setItem("BH_LISTING", JSON.stringify(p));
  savedBadge.style.display = "inline-flex";
  setTimeout(() => savedBadge.style.display = "none", 1200);
  toast("Listing saved.");
});

resetBtn.addEventListener("click", () => {
  titleEl.value = "";
  areaEl.value = "";
  priceRangeEl.value = "";
  contactEl.value = "";
  descEl.value = "";
  rooms = [];
  photos = [];
  renderRooms();
  renderPhotos();
  renderPreview();
  toast("Reset done.");
});

[addRoomBtn, saveListingBtn, resetBtn].forEach(bindRipple);

renderRooms();
renderPhotos();
renderPreview();
revealOnScroll();