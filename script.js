// Product list. Edit this to add, remove or change products.
const PRODUCTS = [
  { id: 1,  name: "Men's Cotton T-Shirt",  category: "Fashion",     price: 399,  mrp: 799,  rating: 4.3, icon: "👕", bg: "#e3f0ff" },
  { id: 2,  name: "Women's Kurti",         category: "Fashion",     price: 649,  mrp: 1299, rating: 4.5, icon: "👗", bg: "#ffe6f0" },
  { id: 3,  name: "Running Shoes",         category: "Fashion",     price: 1499, mrp: 2999, rating: 4.4, icon: "👟", bg: "#eaf7ee" },
  { id: 4,  name: "Denim Jeans",           category: "Fashion",     price: 899,  mrp: 1599, rating: 4.2, icon: "👖", bg: "#e6ecff" },
  { id: 5,  name: "Wireless Earbuds",      category: "Electronics", price: 1299, mrp: 2499, rating: 4.1, icon: "🎧", bg: "#f0eaff" },
  { id: 6,  name: "Smart Watch",           category: "Electronics", price: 2199, mrp: 4999, rating: 4.3, icon: "⌚", bg: "#fff1e0" },
  { id: 7,  name: "Power Bank 10000mAh",   category: "Electronics", price: 799,  mrp: 1499, rating: 4.4, icon: "🔋", bg: "#e8fbf4" },
  { id: 8,  name: "Bluetooth Speaker",     category: "Electronics", price: 1099, mrp: 1999, rating: 4.2, icon: "🔊", bg: "#fdf0e6" },
  { id: 9,  name: "Non-stick Pan",         category: "Home",        price: 549,  mrp: 999,  rating: 4.0, icon: "🍳", bg: "#fff6d9" },
  { id: 10, name: "Table Lamp",            category: "Home",        price: 699,  mrp: 1199, rating: 4.3, icon: "💡", bg: "#fffbe0" },
  { id: 11, name: "Indoor Plant",          category: "Home",        price: 349,  mrp: 599,  rating: 4.6, icon: "🪴", bg: "#e9f8e6" },
  { id: 12, name: "Face Wash",             category: "Beauty",      price: 199,  mrp: 299,  rating: 4.2, icon: "🧴", bg: "#e6f6ff" },
  { id: 13, name: "Lipstick Set",          category: "Beauty",      price: 449,  mrp: 899,  rating: 4.4, icon: "💄", bg: "#ffe6ea" },
  { id: 14, name: "Perfume",               category: "Beauty",      price: 799,  mrp: 1499, rating: 4.1, icon: "🌸", bg: "#fbeaff" },
  { id: 15, name: "Basmati Rice 5kg",      category: "Grocery",     price: 499,  mrp: 650,  rating: 4.5, icon: "🍚", bg: "#f5f2ea" },
  { id: 16, name: "Dry Fruits Combo",      category: "Grocery",     price: 899,  mrp: 1299, rating: 4.6, icon: "🥜", bg: "#f7eee2" },
];

const FREE_DELIVERY_ABOVE = 499;
const DELIVERY_FEE = 40;

const $ = (id) => document.getElementById(id);
const rupees = (n) => "₹" + n.toLocaleString("en-IN");

let activeCategory = "All";
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("sao-cart")) || {}; }
  catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem("sao-cart", JSON.stringify(cart)); } catch {}
}

function renderCategories() {
  const cats = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  $("categories").innerHTML = cats
    .map((c) => `<button class="chip ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderProducts() {
  const q = $("search").value.trim().toLowerCase();
  let list = PRODUCTS.filter(
    (p) => (activeCategory === "All" || p.category === activeCategory) && p.name.toLowerCase().includes(q)
  );

  const sort = $("sort").value;
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  $("list-title").textContent = activeCategory === "All" ? "All products" : activeCategory;
  $("empty").hidden = list.length > 0;
  $("grid").innerHTML = list
    .map((p) => {
      const off = Math.round((1 - p.price / p.mrp) * 100);
      return `
      <article class="card">
        <div class="thumb" style="background:${p.bg}">
          <span class="badge">${off}% OFF</span>${p.icon}
        </div>
        <div class="info">
          <h3>${p.name}</h3>
          <div class="rating">⭐ ${p.rating} · ${p.category}</div>
          <div class="price"><b>${rupees(p.price)}</b><s>${rupees(p.mrp)}</s></div>
          <button class="add" data-add="${p.id}">Add to cart</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderCart() {
  const ids = Object.keys(cart);
  const count = ids.reduce((n, id) => n + cart[id], 0);
  $("cart-count").textContent = count;

  if (!ids.length) {
    $("cart-items").innerHTML = `<p class="cart-empty">Your cart is empty 🛒</p>`;
  } else {
    $("cart-items").innerHTML = ids
      .map((id) => {
        const p = PRODUCTS.find((x) => x.id == id);
        return `
        <div class="item">
          <div class="mini" style="background:${p.bg}">${p.icon}</div>
          <div class="meta">
            <p>${p.name}</p>
            <div class="qty">
              <button data-dec="${id}" aria-label="Decrease">−</button>
              <span>${cart[id]}</span>
              <button data-inc="${id}" aria-label="Increase">+</button>
              <button class="remove" data-del="${id}">Remove</button>
            </div>
          </div>
          <b>${rupees(p.price * cart[id])}</b>
        </div>`;
      })
      .join("");
  }

  const subtotal = ids.reduce((s, id) => s + PRODUCTS.find((x) => x.id == id).price * cart[id], 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  $("subtotal").textContent = rupees(subtotal);
  $("delivery").textContent = delivery ? rupees(delivery) : "FREE";
  $("total").textContent = rupees(subtotal + delivery);
  saveCart();
}

function openCart(open) {
  $("drawer").classList.toggle("open", open);
  $("overlay").hidden = !open;
}

let toastTimer;
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 1800);
}

// Events
$("categories").addEventListener("click", (e) => {
  const cat = e.target.dataset.cat;
  if (!cat) return;
  activeCategory = cat;
  renderCategories();
  renderProducts();
});

$("grid").addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (!id) return;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  toast("Added to cart ✓");
});

$("cart-items").addEventListener("click", (e) => {
  const { inc, dec, del } = e.target.dataset;
  if (inc) cart[inc]++;
  if (dec && --cart[dec] <= 0) delete cart[dec];
  if (del) delete cart[del];
  renderCart();
});

$("search").addEventListener("input", renderProducts);
$("sort").addEventListener("change", renderProducts);
$("cart-btn").addEventListener("click", () => openCart(true));
$("close-cart").addEventListener("click", () => openCart(false));
$("overlay").addEventListener("click", () => openCart(false));

$("checkout").addEventListener("click", () => {
  if (!Object.keys(cart).length) return toast("Cart is empty");
  cart = {};
  renderCart();
  openCart(false);
  toast("Order placed! Thank you for shopping 🎉");
});

$("year").textContent = new Date().getFullYear();
renderCategories();
renderProducts();
renderCart();
