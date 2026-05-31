/**
 * ╔══════════════════════════════════════════════════╗
 * ║   helpers.js — Utility Functions                 ║
 * ║   Date validation · Formatting · Billing calc    ║
 * ╚══════════════════════════════════════════════════╝
 */

/* ─── DATE UTILITIES ─── */

/** Returns today's date string as YYYY-MM-DD */
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/** Format a date string to DD MMM YYYY (e.g. 23 Apr 2025) */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Calculate number of nights between two date strings */
function calcNights(checkIn, checkOut) {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/** Validate that checkOut > checkIn */
function validateDates(checkIn, checkOut) {
  if (!checkIn || !checkOut) return { valid: false, msg: "Both dates are required." };
  if (new Date(checkOut) <= new Date(checkIn)) {
    return { valid: false, msg: "Check-out must be after check-in." };
  }
  return { valid: true };
}

/* ─── CURRENCY FORMATTING ─── */

/** Format number as Indian Rupee string e.g. ₹1,23,456.00 */
function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** Format compact number e.g. ₹1.2L */
function formatINRCompact(amount) {
  if (amount >= 100000) return "₹" + (amount / 100000).toFixed(1) + "L";
  if (amount >= 1000) return "₹" + (amount / 1000).toFixed(1) + "K";
  return "₹" + amount;
}

/* ─── BILLING CALCULATION ─── */

/**
 * calculateBill — Core billing engine
 * @param {Object} booking  — booking record
 * @param {Array}  serviceIds — array of service IDs added to bill
 * @returns {Object} breakdown: { nights, roomCharge, servicesCharge, subtotal, tax, total }
 */
function calculateBill(booking, serviceIds = []) {
  const room = rooms.find(r => r.id === booking.roomId);
  const nights = calcNights(booking.checkIn, booking.checkOut);

  const roomCharge = (room ? room.pricePerNight : 0) * nights;

  const allServiceIds = [...new Set([...booking.servicesUsed, ...serviceIds])];
  const usedServices = allServiceIds.map(sid => services.find(s => s.id === sid)).filter(Boolean);
  const servicesCharge = usedServices.reduce((sum, s) => sum + s.price, 0);

  const subtotal = roomCharge + servicesCharge;
  const taxRate = 0.10; // 10% GST
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return {
    nights,
    roomCharge,
    usedServices,
    servicesCharge,
    subtotal,
    taxRate,
    tax,
    total
  };
}

/* ─── STATUS BADGE HELPER ─── */

/** Return an HTML badge span for a given status string */
function statusBadge(status) {
  const map = {
    "Available":   "badge-green",
    "Occupied":    "badge-orange",
    "Maintenance": "badge-red",
    "Confirmed":   "badge-blue",
    "Checked-In":  "badge-orange",
    "Checked-Out": "badge-gray",
    "Cancelled":   "badge-red",
    "Active":      "badge-green",
    "Inactive":    "badge-gray",
  };
  const cls = map[status] || "badge-gray";
  return `<span class="badge ${cls}">${status}</span>`;
}

/* ─── STRING UTILITIES ─── */

/** Capitalize first letter of each word */
function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/** Truncate string at n chars */
function truncate(str, n = 30) {
  return str && str.length > n ? str.slice(0, n) + "…" : str;
}

/** Generate a random avatar color based on name */
function avatarColor(name) {
  const colors = ["#c0392b","#8e44ad","#2980b9","#27ae60","#e67e22","#16a085","#d35400","#7f8c8d"];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + (hash << 5) - hash;
  return colors[Math.abs(hash) % colors.length];
}

/** Get initials from a full name */
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── TOAST NOTIFICATION ─── */

/** Show a temporary toast message */
function showToast(message, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = message;
  t.className = "toast show " + (type === "error" ? "toast-error" : "toast-success");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3000);
}

/* ─── CONFIRM DIALOG ─── */

/** Simple confirm wrapper */
function confirmAction(msg) {
  return window.confirm(msg);
}
