/**
 * ╔══════════════════════════════════════════════════╗
 * ║   db.js — In-Memory Database for Taj Residency   ║
 * ║   All monetary values in INR (₹)                 ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Simulates a relational database using JavaScript arrays.
 * All CRUD operations work directly on these arrays.
 */

/* ─── ID COUNTER ─── */
const _ids = { room: 10, booking: 100, customer: 200, staff: 300, service: 400 };
function nextId(entity) { return ++_ids[entity]; }

/* ════════════════════════════════════
   ROOMS TABLE
   Fields: id, number, floor, type, pricePerNight, capacity, status, amenities
════════════════════════════════════ */
const rooms = [
  { id: 1,  number: "101", floor: 1, type: "Standard",     pricePerNight: 2500,  capacity: 2, status: "Available",   amenities: ["AC", "TV", "WiFi"] },
  { id: 2,  number: "102", floor: 1, type: "Standard",     pricePerNight: 2500,  capacity: 2, status: "Occupied",    amenities: ["AC", "TV", "WiFi"] },
  { id: 3,  number: "201", floor: 2, type: "Deluxe",       pricePerNight: 4500,  capacity: 2, status: "Available",   amenities: ["AC", "TV", "WiFi", "Mini-Bar", "Balcony"] },
  { id: 4,  number: "202", floor: 2, type: "Deluxe",       pricePerNight: 4500,  capacity: 3, status: "Maintenance", amenities: ["AC", "TV", "WiFi", "Mini-Bar"] },
  { id: 5,  number: "301", floor: 3, type: "Suite",        pricePerNight: 8500,  capacity: 4, status: "Available",   amenities: ["AC", "TV", "WiFi", "Jacuzzi", "Mini-Bar", "Balcony", "Kitchen"] },
  { id: 6,  number: "302", floor: 3, type: "Suite",        pricePerNight: 8500,  capacity: 4, status: "Occupied",    amenities: ["AC", "TV", "WiFi", "Jacuzzi", "Mini-Bar"] },
  { id: 7,  number: "401", floor: 4, type: "Presidential", pricePerNight: 18000, capacity: 6, status: "Available",   amenities: ["AC", "TV", "WiFi", "Jacuzzi", "Pool", "Butler", "Private Dining", "Gym"] },
  { id: 8,  number: "203", floor: 2, type: "Deluxe",       pricePerNight: 4800,  capacity: 2, status: "Available",   amenities: ["AC", "TV", "WiFi", "Sea View"] },
  { id: 9,  number: "103", floor: 1, type: "Standard",     pricePerNight: 2200,  capacity: 1, status: "Available",   amenities: ["AC", "TV"] },
  { id: 10, number: "303", floor: 3, type: "Suite",        pricePerNight: 9200,  capacity: 4, status: "Occupied",    amenities: ["AC", "TV", "WiFi", "Jacuzzi", "Terrace"] },
];

/* ════════════════════════════════════
   CUSTOMERS TABLE
   Fields: id, name, phone, email, idType, idNumber, city, totalStays
════════════════════════════════════ */
const customers = [
  { id: 1, name: "Aarav Sharma",    phone: "9812345670", email: "aarav@email.com",   idType: "Aadhaar",  idNumber: "1234-5678-9012", city: "Mumbai",    totalStays: 3 },
  { id: 2, name: "Neha Patel",      phone: "9823456781", email: "neha@email.com",    idType: "PAN",      idNumber: "ABCDE1234F",     city: "Ahmedabad", totalStays: 1 },
  { id: 3, name: "Rohan Mehta",     phone: "9834567892", email: "rohan@email.com",   idType: "Passport", idNumber: "P1234567",       city: "Delhi",     totalStays: 5 },
  { id: 4, name: "Priya Iyer",      phone: "9845678903", email: "priya@email.com",   idType: "Aadhaar",  idNumber: "2345-6789-0123", city: "Chennai",   totalStays: 2 },
  { id: 5, name: "Vikram Singh",    phone: "9856789014", email: "vikram@email.com",  idType: "Voter ID", idNumber: "VH/21/0123456",  city: "Jaipur",    totalStays: 4 },
  { id: 6, name: "Ananya Reddy",    phone: "9867890125", email: "ananya@email.com",  idType: "Aadhaar",  idNumber: "3456-7890-1234", city: "Hyderabad", totalStays: 1 },
  { id: 7, name: "Kabir Joshi",     phone: "9878901236", email: "kabir@email.com",   idType: "PAN",      idNumber: "FGHIJ5678K",     city: "Pune",      totalStays: 2 },
  { id: 8, name: "Meera Nair",      phone: "9889012347", email: "meera@email.com",   idType: "Passport", idNumber: "P7654321",       city: "Kochi",     totalStays: 3 },
];

/* ════════════════════════════════════
   BOOKINGS TABLE
   Fields: id, customerId, roomId, checkIn, checkOut, status, notes, servicesUsed, createdAt
   Status lifecycle: Confirmed → Checked-In → Checked-Out | Cancelled
════════════════════════════════════ */
const today = new Date();
const fmt = d => d.toISOString().split("T")[0];
const dPlus = n => { const d = new Date(today); d.setDate(d.getDate()+n); return fmt(d); };
const dMinus = n => { const d = new Date(today); d.setDate(d.getDate()-n); return fmt(d); };

const bookings = [
  { id: 101, customerId: 1, roomId: 2,  checkIn: dMinus(2), checkOut: dPlus(1),  status: "Checked-In",  notes: "Early breakfast required",  servicesUsed: [401, 403], createdAt: dMinus(5) },
  { id: 102, customerId: 3, roomId: 6,  checkIn: dMinus(1), checkOut: dPlus(3),  status: "Checked-In",  notes: "Honeymoon — flowers please", servicesUsed: [402, 403], createdAt: dMinus(4) },
  { id: 103, customerId: 5, roomId: 10, checkIn: dMinus(3), checkOut: dPlus(0),  status: "Checked-In",  notes: "",                           servicesUsed: [401],      createdAt: dMinus(6) },
  { id: 104, customerId: 2, roomId: 3,  checkIn: dPlus(1),  checkOut: dPlus(4),  status: "Confirmed",   notes: "Need extra pillows",          servicesUsed: [],         createdAt: dMinus(1) },
  { id: 105, customerId: 4, roomId: 5,  checkIn: dPlus(2),  checkOut: dPlus(7),  status: "Confirmed",   notes: "Vegetarian meals only",       servicesUsed: [],         createdAt: dMinus(1) },
  { id: 106, customerId: 6, roomId: 1,  checkIn: dPlus(0),  checkOut: dPlus(2),  status: "Confirmed",   notes: "",                           servicesUsed: [],         createdAt: dMinus(0) },
  { id: 107, customerId: 7, roomId: 8,  checkIn: dMinus(7), checkOut: dMinus(4), status: "Checked-Out", notes: "",                           servicesUsed: [401, 404], createdAt: dMinus(10) },
  { id: 108, customerId: 8, roomId: 9,  checkIn: dMinus(5), checkOut: dMinus(3), status: "Cancelled",   notes: "Cancelled due to emergency",  servicesUsed: [],         createdAt: dMinus(8) },
];

/* ════════════════════════════════════
   STAFF TABLE
   Fields: id, name, role, phone, salary, shift, joinDate, status
════════════════════════════════════ */
const staff = [
  { id: 301, name: "Sunita Rao",      role: "Manager",       phone: "9712345671", salary: 55000, shift: "Morning", joinDate: "2020-03-15", status: "Active" },
  { id: 302, name: "Deepak Chauhan",  role: "Receptionist",  phone: "9723456782", salary: 22000, shift: "Morning", joinDate: "2021-07-10", status: "Active" },
  { id: 303, name: "Lalitha Menon",   role: "Receptionist",  phone: "9734567893", salary: 22000, shift: "Evening", joinDate: "2022-01-05", status: "Active" },
  { id: 304, name: "Rajesh Kumar",    role: "Chef",          phone: "9745678904", salary: 38000, shift: "Morning", joinDate: "2019-11-20", status: "Active" },
  { id: 305, name: "Geeta Deshpande", role: "Housekeeping",  phone: "9756789015", salary: 18000, shift: "Morning", joinDate: "2023-02-14", status: "Active" },
  { id: 306, name: "Arvind Pillai",   role: "Security",      phone: "9767890126", salary: 20000, shift: "Night",   joinDate: "2022-09-01", status: "Active" },
  { id: 307, name: "Pooja Shukla",    role: "Concierge",     phone: "9778901237", salary: 25000, shift: "Evening", joinDate: "2021-04-22", status: "Active" },
  { id: 308, name: "Harish Bose",     role: "Maintenance",   phone: "9789012348", salary: 21000, shift: "Morning", joinDate: "2023-06-30", status: "Active" },
];

/* ════════════════════════════════════
   SERVICES TABLE
   Fields: id, name, category, price, available, description
════════════════════════════════════ */
const services = [
  { id: 401, name: "Room Service",      category: "Food & Beverage", price: 350,  available: true,  description: "In-room dining with full menu" },
  { id: 402, name: "Spa Treatment",     category: "Spa & Wellness",  price: 1800, available: true,  description: "60-minute full body massage" },
  { id: 403, name: "Airport Pickup",    category: "Transport",       price: 900,  available: true,  description: "AC vehicle pickup from airport" },
  { id: 404, name: "Laundry Service",   category: "Laundry",         price: 400,  available: true,  description: "Per bag wash and fold" },
  { id: 405, name: "Swimming Pool",     category: "Entertainment",   price: 200,  available: true,  description: "Day pass to rooftop pool" },
  { id: 406, name: "Yoga Session",      category: "Spa & Wellness",  price: 600,  available: true,  description: "Morning yoga with instructor" },
  { id: 407, name: "Doctor on Call",    category: "Miscellaneous",   price: 1200, available: true,  description: "In-room doctor visit" },
  { id: 408, name: "Mini Bar Refill",   category: "Food & Beverage", price: 550,  available: false, description: "Refill mini bar stock" },
];

/* ════════════════════════════════════
   BILLING RECORDS
   Stores finalized invoices
════════════════════════════════════ */
const bills = [];
