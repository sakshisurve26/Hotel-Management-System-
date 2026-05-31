/**
 * ╔══════════════════════════════════════════════════╗
 * ║   app.js — Application Logic & Event Handling   ║
 * ║   Taj Residency Hotel Management System          ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Modules:
 *   1. Navigation
 *   2. Dashboard
 *   3. Rooms
 *   4. Bookings
 *   5. Check-In / Check-Out
 *   6. Billing
 *   7. Customers
 *   8. Staff
 *   9. Services
 *  10. Modal Manager
 */

/* ══════════════════════════════════════
   1. NAVIGATION
══════════════════════════════════════ */

const sectionMeta = {
  dashboard: { title: "Dashboard",      sub: "Overview & real-time statistics" },
  rooms:     { title: "Room Management",sub: "Add, view and manage hotel rooms" },
  bookings:  { title: "Bookings",       sub: "Manage booking lifecycle" },
  checkin:   { title: "Check-In / Out", sub: "Process guest arrivals and departures" },
  billing:   { title: "Billing",        sub: "Generate invoices with 10% GST" },
  customers: { title: "Customers",      sub: "Guest records and profiles" },
  staff:     { title: "Staff",          sub: "Employee management" },
  services:  { title: "Services",       sub: "Hotel services and pricing" },
};

function showSection(name) {
  // Hide all sections
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));

  // Show target
  document.getElementById("section-" + name).classList.add("active");

  // Highlight nav
  const navBtns = document.querySelectorAll(".nav-item");
  navBtns.forEach(b => {
    if (b.getAttribute("onclick").includes("'" + name + "'")) b.classList.add("active");
  });

  // Update topbar
  const meta = sectionMeta[name];
  document.getElementById("pageTitle").textContent = meta.title;
  document.getElementById("pageSub").textContent  = meta.sub;

  // Render section
  const renders = {
    dashboard: renderDashboard,
    rooms:     renderRooms,
    bookings:  renderBookings,
    checkin:   renderCheckIn,
    billing:   renderBillingSection,
    customers: () => renderCustomers(""),
    staff:     renderStaff,
    services:  renderServices,
  };
  if (renders[name]) renders[name]();
}

/* ══════════════════════════════════════
   2. DASHBOARD
══════════════════════════════════════ */

function renderDashboard() {
  const totalRooms     = rooms.length;
  const availableRooms = rooms.filter(r => r.status === "Available").length;
  const occupiedRooms  = rooms.filter(r => r.status === "Occupied").length;
  const activeBookings = bookings.filter(b => b.status === "Checked-In").length;
  const totalCustomers = customers.length;
  const totalStaff     = staff.length;

  // Revenue from checked-out bookings
  const revenue = bookings
    .filter(b => b.status === "Checked-Out")
    .reduce((sum, b) => sum + calculateBill(b).total, 0);

  const statsData = [
    { label: "Total Rooms",      value: totalRooms,                  icon: "⬚", color: "stat-blue"   },
    { label: "Available Rooms",  value: availableRooms,              icon: "◎", color: "stat-green"  },
    { label: "Guests Checked-In",value: activeBookings,              icon: "◈", color: "stat-orange" },
    { label: "Total Customers",  value: totalCustomers,              icon: "◐", color: "stat-purple" },
    { label: "Staff Members",    value: totalStaff,                  icon: "◑", color: "stat-teal"   },
    { label: "Revenue (Past)",   value: formatINRCompact(revenue),   icon: "◉", color: "stat-gold"   },
  ];

  document.getElementById("statsGrid").innerHTML = statsData.map(s => `
    <div class="stat-card ${s.color}">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-info">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    </div>
  `).join("");

  // Occupancy bars by type
  const types = ["Standard", "Deluxe", "Suite", "Presidential"];
  document.getElementById("occupancyBars").innerHTML = types.map(type => {
    const typeRooms = rooms.filter(r => r.type === type);
    const occ = typeRooms.filter(r => r.status === "Occupied").length;
    const pct = typeRooms.length ? Math.round((occ / typeRooms.length) * 100) : 0;
    return `
      <div class="occ-row">
        <span class="occ-label">${type}</span>
        <div class="occ-bar-wrap">
          <div class="occ-bar" style="width:${pct}%"></div>
        </div>
        <span class="occ-pct">${occ}/${typeRooms.length}</span>
      </div>
    `;
  }).join("");

  // Recent bookings
  const recent = [...bookings].sort((a, b) => b.id - a.id).slice(0, 5);
  document.getElementById("recentBookings").innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Guest</th><th>Room</th><th>Status</th></tr></thead>
      <tbody>${recent.map(b => {
        const cust = customers.find(c => c.id === b.customerId);
        const room = rooms.find(r => r.id === b.roomId);
        return `<tr>
          <td>#${b.id}</td>
          <td>${cust ? cust.name : "—"}</td>
          <td>${room ? room.number : "—"}</td>
          <td>${statusBadge(b.status)}</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  `;
}

/* ══════════════════════════════════════
   3. ROOMS
══════════════════════════════════════ */

function renderRooms() {
  const statusF = document.getElementById("roomStatusFilter").value;
  const typeF   = document.getElementById("roomTypeFilter").value;

  const filtered = rooms.filter(r =>
    (!statusF || r.status === statusF) &&
    (!typeF   || r.type === typeF)
  );

  document.getElementById("roomsGrid").innerHTML = filtered.length ? filtered.map(r => `
    <div class="room-card room-${r.status.toLowerCase().replace("-","").replace(" ","")}">
      <div class="room-card-top">
        <div class="room-number">Room ${r.number}</div>
        ${statusBadge(r.status)}
      </div>
      <div class="room-type">${r.type}</div>
      <div class="room-info-row">
        <span>Floor ${r.floor}</span>
        <span>👥 ${r.capacity}</span>
        <span class="room-price">${formatINR(r.pricePerNight)}<small>/night</small></span>
      </div>
      <div class="room-amenities">${r.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join("")}</div>
      <div class="room-actions">
        <button class="btn-sm btn-outline" onclick="editRoom(${r.id})">Edit</button>
        <button class="btn-sm btn-outline btn-danger-outline" onclick="deleteRoom(${r.id})">Remove</button>
      </div>
    </div>
  `).join("") : `<div class="empty-state">No rooms match the selected filters.</div>`;
}

function editRoom(id) {
  const r = rooms.find(r => r.id === id);
  if (!r) return;
  document.getElementById("roomModalTitle").textContent = "Edit Room";
  document.getElementById("roomEditId").value      = r.id;
  document.getElementById("roomNumber").value      = r.number;
  document.getElementById("roomFloor").value       = r.floor;
  document.getElementById("roomType").value        = r.type;
  document.getElementById("roomPrice").value       = r.pricePerNight;
  document.getElementById("roomCapacity").value    = r.capacity;
  document.getElementById("roomStatus").value      = r.status;
  document.getElementById("roomAmenities").value   = r.amenities.join(", ");
  openModal("roomModal");
}

function saveRoom() {
  const number    = document.getElementById("roomNumber").value.trim();
  const floor     = parseInt(document.getElementById("roomFloor").value) || 1;
  const type      = document.getElementById("roomType").value;
  const price     = parseFloat(document.getElementById("roomPrice").value);
  const capacity  = parseInt(document.getElementById("roomCapacity").value) || 2;
  const status    = document.getElementById("roomStatus").value;
  const amenities = document.getElementById("roomAmenities").value.split(",").map(a => a.trim()).filter(Boolean);
  const editId    = parseInt(document.getElementById("roomEditId").value);

  if (!number) return showToast("Room number is required.", "error");
  if (!price || price <= 0) return showToast("Enter a valid price.", "error");

  // Check duplicate room number (excluding self)
  if (rooms.some(r => r.number === number && r.id !== editId)) {
    return showToast("Room number already exists.", "error");
  }

  if (editId) {
    const r = rooms.find(r => r.id === editId);
    Object.assign(r, { number, floor, type, pricePerNight: price, capacity, status, amenities });
    showToast("Room updated successfully.");
  } else {
    rooms.push({ id: nextId("room"), number, floor, type, pricePerNight: price, capacity, status, amenities });
    showToast("Room added successfully.");
  }

  closeModal("roomModal");
  renderRooms();
}

function deleteRoom(id) {
  // Check if room has active bookings
  const hasActive = bookings.some(b => b.roomId === id && ["Confirmed","Checked-In"].includes(b.status));
  if (hasActive) return showToast("Cannot remove room with active bookings.", "error");
  if (!confirmAction("Remove this room permanently?")) return;
  const idx = rooms.findIndex(r => r.id === id);
  if (idx > -1) rooms.splice(idx, 1);
  showToast("Room removed.");
  renderRooms();
}

/* ══════════════════════════════════════
   4. BOOKINGS
══════════════════════════════════════ */

function renderBookings() {
  const statusF = document.getElementById("bookingStatusFilter").value;
  const filtered = bookings.filter(b => !statusF || b.status === statusF);

  document.getElementById("bookingsTbody").innerHTML = filtered.length ? filtered.map(b => {
    const cust = customers.find(c => c.id === b.customerId);
    const room = rooms.find(r => r.id === b.roomId);
    const bill = calculateBill(b);
    return `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td>${cust ? cust.name : "Unknown"}</td>
        <td>${room ? `${room.number} (${room.type})` : "—"}</td>
        <td>${formatDate(b.checkIn)}</td>
        <td>${formatDate(b.checkOut)}</td>
        <td>${statusBadge(b.status)}</td>
        <td>${formatINR(bill.total)}</td>
        <td class="action-cell">
          ${b.status === "Confirmed" ? `<button class="btn-sm" onclick="cancelBooking(${b.id})">Cancel</button>` : ""}
          <button class="btn-sm btn-outline" onclick="viewBookingDetails(${b.id})">View</button>
        </td>
      </tr>
    `;
  }).join("") : `<tr><td colspan="8" class="empty-td">No bookings found.</td></tr>`;
}

function populateBookingModal() {
  const custSel = document.getElementById("bookingCustomer");
  custSel.innerHTML = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  const availRooms = rooms.filter(r => r.status === "Available");
  const roomSel = document.getElementById("bookingRoom");
  roomSel.innerHTML = availRooms.map(r =>
    `<option value="${r.id}">Room ${r.number} — ${r.type} (${formatINR(r.pricePerNight)}/night)</option>`
  ).join("");

  // Default dates
  document.getElementById("bookingCheckIn").value  = todayStr();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("bookingCheckOut").value = tomorrow.toISOString().split("T")[0];

  // Live cost preview
  ["bookingCheckIn","bookingCheckOut","bookingRoom"].forEach(id => {
    document.getElementById(id).addEventListener("change", updateBookingCostPreview);
  });
  updateBookingCostPreview();
}

function updateBookingCostPreview() {
  const roomId   = parseInt(document.getElementById("bookingRoom").value);
  const checkIn  = document.getElementById("bookingCheckIn").value;
  const checkOut = document.getElementById("bookingCheckOut").value;
  const room     = rooms.find(r => r.id === roomId);
  if (!room || !checkIn || !checkOut) return;

  const nights = calcNights(checkIn, checkOut);
  if (nights <= 0) {
    document.getElementById("bookingCostPreview").innerHTML = `<span class="cost-warning">⚠ Check-out must be after check-in</span>`;
    return;
  }
  const subtotal = room.pricePerNight * nights;
  const tax = subtotal * 0.10;
  document.getElementById("bookingCostPreview").innerHTML = `
    <div class="cost-preview-box">
      <div class="cp-row"><span>${nights} night${nights>1?"s":""} × ${formatINR(room.pricePerNight)}</span><span>${formatINR(subtotal)}</span></div>
      <div class="cp-row"><span>GST (10%)</span><span>${formatINR(tax)}</span></div>
      <div class="cp-row cp-total"><span>Estimated Total</span><span>${formatINR(subtotal + tax)}</span></div>
    </div>
  `;
}

function saveBooking() {
  const customerId = parseInt(document.getElementById("bookingCustomer").value);
  const roomId     = parseInt(document.getElementById("bookingRoom").value);
  const checkIn    = document.getElementById("bookingCheckIn").value;
  const checkOut   = document.getElementById("bookingCheckOut").value;
  const notes      = document.getElementById("bookingNotes").value.trim();

  const dateCheck = validateDates(checkIn, checkOut);
  if (!dateCheck.valid) return showToast(dateCheck.msg, "error");
  if (!customerId) return showToast("Please select a customer.", "error");
  if (!roomId)     return showToast("Please select a room.", "error");

  // Mark room as Occupied
  const room = rooms.find(r => r.id === roomId);
  if (room) room.status = "Occupied";

  const newBooking = {
    id: nextId("booking"),
    customerId, roomId, checkIn, checkOut,
    status: "Confirmed",
    notes,
    servicesUsed: [],
    createdAt: todayStr()
  };
  bookings.push(newBooking);

  // Increment customer stay count
  const cust = customers.find(c => c.id === customerId);
  if (cust) cust.totalStays++;

  showToast(`Booking #${newBooking.id} confirmed!`);
  closeModal("bookingModal");
  renderBookings();
}

function cancelBooking(id) {
  if (!confirmAction("Cancel this booking?")) return;
  const b = bookings.find(b => b.id === id);
  if (!b || b.status !== "Confirmed") return showToast("Only confirmed bookings can be cancelled.", "error");
  b.status = "Cancelled";
  // Free room
  const room = rooms.find(r => r.id === b.roomId);
  if (room) room.status = "Available";
  showToast("Booking cancelled.");
  renderBookings();
}

function viewBookingDetails(id) {
  const b    = bookings.find(b => b.id === id);
  const cust = customers.find(c => c.id === b.customerId);
  const room = rooms.find(r => r.id === b.roomId);
  const bill = calculateBill(b);

  alert(`
Booking #${b.id} — ${b.status}
──────────────────────────────
Guest  : ${cust ? cust.name : "Unknown"} (${cust ? cust.phone : ""})
Room   : ${room ? room.number + " (" + room.type + ")" : "—"}
Check-In  : ${formatDate(b.checkIn)}
Check-Out : ${formatDate(b.checkOut)}
Nights : ${bill.nights}
──────────────────────────────
Room Charge : ${formatINR(bill.roomCharge)}
Services    : ${formatINR(bill.servicesCharge)}
GST (10%)   : ${formatINR(bill.tax)}
TOTAL       : ${formatINR(bill.total)}
──────────────────────────────
Notes: ${b.notes || "None"}
  `.trim());
}

/* ══════════════════════════════════════
   5. CHECK-IN / CHECK-OUT
══════════════════════════════════════ */

function renderCheckIn() {
  // Populate check-in select (Confirmed bookings)
  const confirmed = bookings.filter(b => b.status === "Confirmed");
  const ciSel = document.getElementById("checkinBookingSelect");
  ciSel.innerHTML = `<option value="">— Choose Booking —</option>` +
    confirmed.map(b => {
      const c = customers.find(c => c.id === b.customerId);
      const r = rooms.find(r => r.id === b.roomId);
      return `<option value="${b.id}">#${b.id} — ${c ? c.name : "?"} | Room ${r ? r.number : "?"}</option>`;
    }).join("");
  ciSel.onchange = () => showCheckinPreview(parseInt(ciSel.value));
  document.getElementById("checkinPreview").innerHTML = "";

  // Populate check-out select (Checked-In bookings)
  const checkedIn = bookings.filter(b => b.status === "Checked-In");
  const coSel = document.getElementById("checkoutBookingSelect");
  coSel.innerHTML = `<option value="">— Choose Booking —</option>` +
    checkedIn.map(b => {
      const c = customers.find(c => c.id === b.customerId);
      const r = rooms.find(r => r.id === b.roomId);
      return `<option value="${b.id}">#${b.id} — ${c ? c.name : "?"} | Room ${r ? r.number : "?"}</option>`;
    }).join("");
  coSel.onchange = () => showCheckoutPreview(parseInt(coSel.value));
  document.getElementById("checkoutPreview").innerHTML = "";

  // Currently Checked-In list
  document.getElementById("checkedInList").innerHTML = checkedIn.length ? checkedIn.map(b => {
    const c = customers.find(cu => cu.id === b.customerId);
    const r = rooms.find(ro => ro.id === b.roomId);
    const nights = calcNights(b.checkIn, todayStr());
    return `<tr>
      <td>#${b.id}</td>
      <td>${c ? c.name : "—"}</td>
      <td>${r ? r.number : "—"}</td>
      <td>${formatDate(b.checkIn)}</td>
      <td>${nights} night${nights !== 1 ? "s" : ""}</td>
    </tr>`;
  }).join("") : `<tr><td colspan="5" class="empty-td">No guests currently checked-in.</td></tr>`;
}

function showCheckinPreview(id) {
  if (!id) { document.getElementById("checkinPreview").innerHTML = ""; return; }
  const b = bookings.find(b => b.id === id);
  const c = customers.find(c => c.id === b.customerId);
  const r = rooms.find(r => r.id === b.roomId);
  document.getElementById("checkinPreview").innerHTML = `
    <div class="preview-box">
      <div class="preview-row"><span>Guest</span><strong>${c ? c.name : "?"}</strong></div>
      <div class="preview-row"><span>Room</span><strong>${r ? r.number + " — " + r.type : "?"}</strong></div>
      <div class="preview-row"><span>Check-In</span><strong>${formatDate(b.checkIn)}</strong></div>
      <div class="preview-row"><span>Check-Out</span><strong>${formatDate(b.checkOut)}</strong></div>
      <div class="preview-row"><span>Nights</span><strong>${calcNights(b.checkIn, b.checkOut)}</strong></div>
    </div>
  `;
}

function showCheckoutPreview(id) {
  if (!id) { document.getElementById("checkoutPreview").innerHTML = ""; return; }
  const b = bookings.find(b => b.id === id);
  const c = customers.find(c => c.id === b.customerId);
  const r = rooms.find(r => r.id === b.roomId);
  const bill = calculateBill(b);
  document.getElementById("checkoutPreview").innerHTML = `
    <div class="preview-box">
      <div class="preview-row"><span>Guest</span><strong>${c ? c.name : "?"}</strong></div>
      <div class="preview-row"><span>Room</span><strong>${r ? r.number : "?"}</strong></div>
      <div class="preview-row"><span>Nights</span><strong>${bill.nights}</strong></div>
      <div class="preview-row"><span>Room Charges</span><strong>${formatINR(bill.roomCharge)}</strong></div>
      <div class="preview-row"><span>Services</span><strong>${formatINR(bill.servicesCharge)}</strong></div>
      <div class="preview-row"><span>GST (10%)</span><strong>${formatINR(bill.tax)}</strong></div>
      <div class="preview-row total-row"><span>TOTAL</span><strong>${formatINR(bill.total)}</strong></div>
    </div>
  `;
}

function doCheckIn() {
  const id = parseInt(document.getElementById("checkinBookingSelect").value);
  if (!id) return showToast("Please select a booking.", "error");
  const b = bookings.find(b => b.id === id);
  if (!b) return;
  b.status = "Checked-In";
  const room = rooms.find(r => r.id === b.roomId);
  if (room) room.status = "Occupied";
  showToast(`Guest checked-in for Booking #${id}!`);
  renderCheckIn();
}

function doCheckOut() {
  const id = parseInt(document.getElementById("checkoutBookingSelect").value);
  if (!id) return showToast("Please select a booking.", "error");
  const b = bookings.find(b => b.id === id);
  if (!b) return;
  b.status = "Checked-Out";
  const room = rooms.find(r => r.id === b.roomId);
  if (room) room.status = "Available";
  showToast(`Guest checked-out. Room ${room ? room.number : ""} is now available.`);
  renderCheckIn();
}

/* ══════════════════════════════════════
   6. BILLING
══════════════════════════════════════ */

let billExtraServices = [];

function renderBillingSection() {
  billExtraServices = [];

  // Populate booking select (all non-cancelled)
  const billSel = document.getElementById("billingBookingSelect");
  billSel.innerHTML = `<option value="">— Choose Booking —</option>` +
    bookings.filter(b => b.status !== "Cancelled").map(b => {
      const c = customers.find(c => c.id === b.customerId);
      return `<option value="${b.id}">#${b.id} — ${c ? c.name : "?"} (${b.status})</option>`;
    }).join("");

  // Populate services select
  const svcSel = document.getElementById("billingServiceSelect");
  svcSel.innerHTML = `<option value="">— Select Service —</option>` +
    services.filter(s => s.available).map(s =>
      `<option value="${s.id}">${s.name} — ${formatINR(s.price)}</option>`
    ).join("");

  document.getElementById("billingServicesList").innerHTML = "";
  document.getElementById("billPreview").innerHTML = `
    <div class="bill-placeholder"><div class="bill-icon">◉</div><p>Select a booking to preview invoice</p></div>
  `;
}

function addServiceToBill() {
  const svcId = parseInt(document.getElementById("billingServiceSelect").value);
  if (!svcId) return showToast("Select a service first.", "error");
  const svc = services.find(s => s.id === svcId);
  if (!svc) return;
  if (billExtraServices.includes(svcId)) return showToast("Service already added.", "error");
  billExtraServices.push(svcId);

  const list = document.getElementById("billingServicesList");
  const div = document.createElement("div");
  div.className = "bill-svc-chip";
  div.innerHTML = `<span>${svc.name}</span><span>${formatINR(svc.price)}</span>
    <button onclick="removeBillService(${svcId}, this)">✕</button>`;
  list.appendChild(div);

  loadBillingPreview();
}

function removeBillService(id, btn) {
  billExtraServices = billExtraServices.filter(s => s !== id);
  btn.parentElement.remove();
  loadBillingPreview();
}

function loadBillingPreview() {
  const id = parseInt(document.getElementById("billingBookingSelect").value);
  if (!id) return;
  const b    = bookings.find(b => b.id === id);
  const cust = customers.find(c => c.id === b.customerId);
  const room = rooms.find(r => r.id === b.roomId);
  const bill = calculateBill(b, billExtraServices);

  document.getElementById("billPreview").innerHTML = `
    <div class="invoice-preview">
      <div class="invoice-header">
        <div class="invoice-logo">⬡ Taj Residency</div>
        <div class="invoice-meta">
          <div>Invoice for Booking <strong>#${b.id}</strong></div>
          <div>Date: ${formatDate(todayStr())}</div>
          <div>Status: ${statusBadge(b.status)}</div>
        </div>
      </div>
      <div class="invoice-guest">
        <div><strong>${cust ? cust.name : "—"}</strong></div>
        <div>${cust ? cust.phone : ""}</div>
        <div>${cust ? cust.city : ""}</div>
      </div>
      <table class="invoice-table">
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Room ${room ? room.number : "?"} (${room ? room.type : "?"}) × ${bill.nights} night${bill.nights>1?"s":""}</td><td>${formatINR(bill.roomCharge)}</td></tr>
          ${bill.usedServices.map(s => `<tr><td>${s.name}</td><td>${formatINR(s.price)}</td></tr>`).join("")}
          <tr class="subtotal-row"><td>Subtotal</td><td>${formatINR(bill.subtotal)}</td></tr>
          <tr><td>GST (10%)</td><td>${formatINR(bill.tax)}</td></tr>
          <tr class="total-row"><td><strong>TOTAL</strong></td><td><strong>${formatINR(bill.total)}</strong></td></tr>
        </tbody>
      </table>
      <div class="invoice-footer">Thank you for staying at Taj Residency!</div>
    </div>
  `;
}

function generateBill() {
  const id = parseInt(document.getElementById("billingBookingSelect").value);
  if (!id) return showToast("Please select a booking.", "error");
  const b    = bookings.find(b => b.id === id);
  const cust = customers.find(c => c.id === b.customerId);
  const room = rooms.find(r => r.id === b.roomId);
  const bill = calculateBill(b, billExtraServices);

  // Save bill record
  bills.push({ bookingId: id, generatedAt: todayStr(), total: bill.total });

  // Merge extra services into booking
  billExtraServices.forEach(sid => {
    if (!b.servicesUsed.includes(sid)) b.servicesUsed.push(sid);
  });

  document.getElementById("billPrintContent").innerHTML = `
    <div class="invoice-preview print-invoice">
      <div class="invoice-header">
        <div class="invoice-logo">⬡ Taj Residency</div>
        <div class="invoice-meta">
          <div><strong>GST Invoice</strong> — Booking #${b.id}</div>
          <div>Date: ${formatDate(todayStr())}</div>
        </div>
      </div>
      <div class="invoice-divider"></div>
      <div class="invoice-guest">
        <div><strong>Bill To:</strong> ${cust ? cust.name : "—"}</div>
        <div>Phone: ${cust ? cust.phone : ""} | City: ${cust ? cust.city : ""}</div>
        <div>ID: ${cust ? cust.idType + " — " + cust.idNumber : ""}</div>
      </div>
      <div class="invoice-period">
        Check-In: ${formatDate(b.checkIn)} &nbsp;|&nbsp; Check-Out: ${formatDate(b.checkOut)} &nbsp;|&nbsp; ${bill.nights} Night${bill.nights>1?"s":""}
      </div>
      <table class="invoice-table">
        <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>
          <tr>
            <td>Room ${room ? room.number : "?"} — ${room ? room.type : "?"}</td>
            <td>${bill.nights} night${bill.nights>1?"s":""}</td>
            <td>${formatINR(room ? room.pricePerNight : 0)}</td>
            <td>${formatINR(bill.roomCharge)}</td>
          </tr>
          ${bill.usedServices.map(s => `
            <tr>
              <td>${s.name} (${s.category})</td>
              <td>1</td>
              <td>${formatINR(s.price)}</td>
              <td>${formatINR(s.price)}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr class="subtotal-row"><td colspan="3">Subtotal</td><td>${formatINR(bill.subtotal)}</td></tr>
          <tr><td colspan="3">GST @ 10%</td><td>${formatINR(bill.tax)}</td></tr>
          <tr class="total-row"><td colspan="3"><strong>Grand Total (INR)</strong></td><td><strong>${formatINR(bill.total)}</strong></td></tr>
        </tfoot>
      </table>
      <div class="invoice-footer">
        <p>Thank you for your stay at Taj Residency. We hope to welcome you again!</p>
        <small>This is a computer-generated invoice. No signature required.</small>
      </div>
    </div>
  `;

  showToast("Invoice generated!");
  openModal("billPrintModal");
}

/* ══════════════════════════════════════
   7. CUSTOMERS
══════════════════════════════════════ */

function renderCustomers(query = "") {
  const q = query.toLowerCase();
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q)
  );

  document.getElementById("customersTbody").innerHTML = filtered.length ? filtered.map(c => `
    <tr>
      <td><strong>#${c.id}</strong></td>
      <td>
        <div class="customer-name-cell">
          <div class="mini-avatar" style="background:${avatarColor(c.name)}">${initials(c.name)}</div>
          ${c.name}
        </div>
      </td>
      <td>${c.phone}</td>
      <td>${c.email || "—"}</td>
      <td><span class="id-chip">${c.idType}</span> ${c.idNumber}</td>
      <td>${c.totalStays}</td>
      <td class="action-cell">
        <button class="btn-sm btn-outline" onclick="editCustomer(${c.id})">Edit</button>
        <button class="btn-sm btn-outline btn-danger-outline" onclick="deleteCustomer(${c.id})">Delete</button>
      </td>
    </tr>
  `).join("") : `<tr><td colspan="7" class="empty-td">No customers found.</td></tr>`;
}

function editCustomer(id) {
  const c = customers.find(c => c.id === id);
  if (!c) return;
  document.getElementById("customerModalTitle").textContent = "Edit Customer";
  document.getElementById("customerEditId").value    = c.id;
  document.getElementById("customerName").value      = c.name;
  document.getElementById("customerPhone").value     = c.phone;
  document.getElementById("customerEmail").value     = c.email;
  document.getElementById("customerIdType").value    = c.idType;
  document.getElementById("customerIdNumber").value  = c.idNumber;
  document.getElementById("customerCity").value      = c.city;
  openModal("customerModal");
}

function saveCustomer() {
  const name     = document.getElementById("customerName").value.trim();
  const phone    = document.getElementById("customerPhone").value.trim();
  const email    = document.getElementById("customerEmail").value.trim();
  const idType   = document.getElementById("customerIdType").value;
  const idNumber = document.getElementById("customerIdNumber").value.trim();
  const city     = document.getElementById("customerCity").value.trim();
  const editId   = parseInt(document.getElementById("customerEditId").value);

  if (!name)  return showToast("Name is required.", "error");
  if (!phone) return showToast("Phone is required.", "error");

  if (editId) {
    const c = customers.find(c => c.id === editId);
    Object.assign(c, { name, phone, email, idType, idNumber, city });
    showToast("Customer updated.");
  } else {
    customers.push({ id: nextId("customer"), name, phone, email, idType, idNumber, city, totalStays: 0 });
    showToast("Customer added.");
  }
  closeModal("customerModal");
  renderCustomers("");
}

function deleteCustomer(id) {
  const hasBooking = bookings.some(b => b.customerId === id && ["Confirmed","Checked-In"].includes(b.status));
  if (hasBooking) return showToast("Cannot delete customer with active bookings.", "error");
  if (!confirmAction("Delete this customer?")) return;
  const idx = customers.findIndex(c => c.id === id);
  if (idx > -1) customers.splice(idx, 1);
  showToast("Customer deleted.");
  renderCustomers("");
}

/* ══════════════════════════════════════
   8. STAFF
══════════════════════════════════════ */

function renderStaff() {
  const roleColors = {
    Manager: "#8e44ad", Receptionist: "#2980b9", Chef: "#e67e22",
    Security: "#c0392b", Housekeeping: "#27ae60", Maintenance: "#16a085",
    Concierge: "#d35400"
  };

  document.getElementById("staffGrid").innerHTML = staff.map(s => `
    <div class="staff-card">
      <div class="staff-avatar" style="background:${roleColors[s.role] || "#7f8c8d"}">${initials(s.name)}</div>
      <div class="staff-name">${s.name}</div>
      <div class="staff-role">${s.role}</div>
      <div class="staff-details">
        <span>📞 ${s.phone}</span>
        <span>🕐 ${s.shift}</span>
        <span>💰 ${formatINR(s.salary)}/mo</span>
        <span>📅 Since ${formatDate(s.joinDate)}</span>
      </div>
      ${statusBadge(s.status)}
      <div class="staff-actions">
        <button class="btn-sm btn-outline btn-danger-outline" onclick="removeStaff(${s.id})">Remove</button>
      </div>
    </div>
  `).join("");
}

function saveStaff() {
  const name      = document.getElementById("staffName").value.trim();
  const role      = document.getElementById("staffRole").value;
  const phone     = document.getElementById("staffPhone").value.trim();
  const salary    = parseFloat(document.getElementById("staffSalary").value) || 0;
  const shift     = document.getElementById("staffShift").value;
  const joinDate  = document.getElementById("staffJoinDate").value || todayStr();

  if (!name) return showToast("Staff name is required.", "error");

  staff.push({ id: nextId("staff"), name, role, phone, salary, shift, joinDate, status: "Active" });
  showToast("Staff member added.");
  closeModal("staffModal");
  renderStaff();
}

function removeStaff(id) {
  if (!confirmAction("Remove this staff member?")) return;
  const idx = staff.findIndex(s => s.id === id);
  if (idx > -1) staff.splice(idx, 1);
  showToast("Staff member removed.");
  renderStaff();
}

/* ══════════════════════════════════════
   9. SERVICES
══════════════════════════════════════ */

function renderServices() {
  document.getElementById("servicesTbody").innerHTML = services.map(s => `
    <tr>
      <td><strong>#${s.id}</strong></td>
      <td>${s.name}</td>
      <td><span class="category-chip">${s.category}</span></td>
      <td>${formatINR(s.price)}</td>
      <td>${s.available ? statusBadge("Available") : statusBadge("Maintenance")}</td>
      <td class="action-cell">
        <button class="btn-sm btn-outline" onclick="toggleService(${s.id})">${s.available ? "Disable" : "Enable"}</button>
        <button class="btn-sm btn-outline btn-danger-outline" onclick="deleteService(${s.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

function saveService() {
  const name      = document.getElementById("serviceName").value.trim();
  const category  = document.getElementById("serviceCategory").value;
  const price     = parseFloat(document.getElementById("servicePrice").value);
  const available = document.getElementById("serviceAvailable").value === "true";
  const desc      = document.getElementById("serviceDesc").value.trim();

  if (!name)           return showToast("Service name is required.", "error");
  if (!price || price < 0) return showToast("Enter a valid price.", "error");

  services.push({ id: nextId("service"), name, category, price, available, description: desc });
  showToast("Service added.");
  closeModal("serviceModal");
  renderServices();
}

function toggleService(id) {
  const svc = services.find(s => s.id === id);
  if (svc) svc.available = !svc.available;
  showToast(`Service ${svc.available ? "enabled" : "disabled"}.`);
  renderServices();
}

function deleteService(id) {
  if (!confirmAction("Delete this service?")) return;
  const idx = services.findIndex(s => s.id === id);
  if (idx > -1) services.splice(idx, 1);
  showToast("Service deleted.");
  renderServices();
}

/* ══════════════════════════════════════
   10. MODAL MANAGER
══════════════════════════════════════ */

function openModal(id) {
  // Reset form inputs
  const modal = document.getElementById(id);
  modal.querySelectorAll("input, textarea").forEach(el => el.value = "");
  modal.querySelectorAll("input[type=hidden]").forEach(el => el.value = "");

  // Pre-populate data selects for booking
  if (id === "bookingModal") populateBookingModal();

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
  document.body.style.overflow = "";
}

// Close on overlay click
document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.active").forEach(m => closeModal(m.id));
  }
});

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */

function init() {
  // Set date in topbar
  document.getElementById("topbarDate").textContent =
    new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

  // Render dashboard by default
  renderDashboard();
}

window.addEventListener("DOMContentLoaded", init);
