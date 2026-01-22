const KEY = "bh_mvp_v1";

const uid = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);

export function seedIfEmpty() {
    const s = load();
    if (s) return;

    const listingId = uid();
    const room1 = { id: uid(), name: "Room A", capacity: 3, occupied: 1, price: 1500 };
    const room2 = { id: uid(), name: "Room B", capacity: 2, occupied: 2, price: 1800 };
    const room3 = { id: uid(), name: "Room C", capacity: 4, occupied: 0, price: 1300 };

    const demo = {
        listings: [
            {
                id: listingId,
                title: "Skyline Boarding House",
                area: "Cebu, Talamban",
                description: "Quiet place. Curfew 10pm. Visitors allowed until 8pm. Near school. Includes Wi-Fi.",
                minPrice: 1300,
                maxPrice: 1800,
                photos: [],
                rooms: [room1, room2, room3]
            }
        ],
        applications: [],
        notifications: [],
        tenancies: [
            // tenant moved-in info goes here later
        ],
        tenantState: {
            movedInListingId: null
        }
    };

    save(demo);
}

export function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
export function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

export function getListings() {
    return load()?.listings ?? [];
}

export function getListing(id) {
    return getListings().find(x => x.id === id) || null;
}

export function createListing(payload) {
    const db = load();
    const listing = { id: uid(), ...payload };
    db.listings.unshift(listing);
    save(db);
    return listing;
}

export function isTenantMovedIn() {
    const db = load();
    return !!db.tenantState?.movedInListingId;
}

export function applyToRoom({ listingId, roomId, form }) {
    const db = load();

    if (db.tenantState?.movedInListingId) {
        return { ok: false, error: "You are already moved-in. Applying is blocked." };
    }

    const listing = db.listings.find(l => l.id === listingId);
    if (!listing) return { ok: false, error: "Listing not found." };

    const room = listing.rooms.find(r => r.id === roomId);
    if (!room) return { ok: false, error: "Room not found." };

    if (room.occupied >= room.capacity) return { ok: false, error: "Room is already full." };

    const app = {
        id: uid(),
        listingId,
        roomId,
        status: "PENDING",
        createdAt: Date.now(),
        tenant: { ...form },
        ownerMessage: "",
        tenantReply: ""
    };

    db.applications.unshift(app);
    db.notifications.unshift({
        id: uid(),
        type: "NEW_APPLICATION",
        createdAt: Date.now(),
        message: `${form.name} applied for ${listing.title} • ${room.name}`,
        listingId,
        roomId,
        applicationId: app.id
    });

    save(db);
    return { ok: true, application: app };
}

export function getKPIs() {
    const db = load();
    const listings = db.listings ?? [];
    const apps = db.applications ?? [];

    let totalCapacity = 0;
    let totalOccupied = 0;

    listings.forEach(l => {
        (l.rooms || []).forEach(r => {
            totalCapacity += r.capacity;
            totalOccupied += r.occupied;
        });
    });

    const pendingApps = apps.filter(a => a.status === "PENDING").length;
    const occupancyPct = totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return {
        totalTenants: totalOccupied,
        totalCapacity,
        occupancyPct,
        pendingApps,
        listingsCount: listings.length
    };
}

export function getNotifications() {
    const db = load();
    return db.notifications ?? [];
}

export function clearAll() {
    localStorage.removeItem(KEY);
}
