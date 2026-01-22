import { bindFX } from "../ui/effects.js";
import { startRevealObserver } from "../ui/reveal.js";
import { getListings, seedIfEmpty } from "../store.js";

seedIfEmpty();
bindFX(document);
startRevealObserver();

const grid = document.getElementById("grid");
const q = document.getElementById("q");
const area = document.getElementById("area");
const resetBtn = document.getElementById("resetBtn");
const empty = document.getElementById("empty");

const listings = getListings();

const areas = Array.from(new Set(listings.map(l => l.area))).filter(Boolean);
areas.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    area.appendChild(opt);
});

q.addEventListener("input", render);
area.addEventListener("change", render);
resetBtn.addEventListener("click", () => {
    q.value = "";
    area.value = "";
    render();
});

function roomAvailable(room) {
    return room.occupied < room.capacity;
}

function render() {
    const query = q.value.trim().toLowerCase();
    const areaVal = area.value;

    grid.innerHTML = "";

    const filtered = listings
        .map(l => {
            const availableRooms = (l.rooms || []).filter(roomAvailable);
            return { ...l, availableRooms };
        })
        .filter(l => l.availableRooms.length > 0)
        .filter(l => {
            const matchesQuery = !query || (l.title + " " + l.area).toLowerCase().includes(query);
            const matchesArea = !areaVal || l.area === areaVal;
            return matchesQuery && matchesArea;
        });

    empty.classList.toggle("hidden", filtered.length !== 0);

    filtered.forEach(l => {
        const cover = l.photos?.[0];
        const min = Math.min(...l.availableRooms.map(r => r.price));
        const max = Math.max(...l.availableRooms.map(r => r.price));

        const slots = l.availableRooms.reduce((sum, r) => sum + (r.capacity - r.occupied), 0);

        const card = document.createElement("article");
        card.className = "cardItem reveal tilt";
        card.innerHTML = `
      <div class="cover">
        ${cover ? `<img src="${cover}" alt="cover" />` : `<div class="skel" style="height:150px"></div>`}
      </div>
      <h3 class="cardTitle">${l.title}</h3>
      <p class="meta">${l.area}</p>
      <div class="row">
        <span class="badge pulse">Slots: ${slots}</span>
        <span class="badge">₱${min}${min !== max ? `–₱${max}` : ""}</span>
      </div>
      <div class="row" style="margin-top:12px">
        <a class="btn primary tilt" href="/tenant/listing.html?id=${encodeURIComponent(l.id)}">View</a>
        <span class="badge">Rooms: ${l.availableRooms.length}</span>
      </div>
    `;
        grid.appendChild(card);
    });

    startRevealObserver();
    bindFX(grid);
}

render();
