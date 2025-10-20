// =============================
// STEP 1: INITIALIZE DATA
// =============================
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
];

// Simulated server URL using a mock API
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";
let pendingConflict = null; // For conflict resolution modal

// =============================
// STEP 2: INITIALIZATION
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) quotes = JSON.parse(savedQuotes);

  createAddQuoteForm();
  populateCategories();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    document.getElementById("quoteDisplay").innerHTML = lastQuote;
  } else {
    filterQuotes();
  }

  const btn = document.getElementById("newQuote");
  if (btn) btn.addEventListener("click", filterQuotes);

  fetchQuotesFromServer(); // ✅ Fetch from mock server at startup

  // Optional auto-sync every 30s
  setInterval(fetchQuotesFromServer, 30000);
});

// =============================
// STEP 3: LOCAL STORAGE HANDLING
// =============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// =============================
// STEP 4: CATEGORY FILTER
// =============================
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === lastSelectedCategory) option.selected = true;
    filter.appendChild(option);
  });
}

// =============================
// STEP 5: SHOW RANDOM QUOTE
// =============================
function showRandomQuote(filteredQuotes = quotes) {
  const container = document.getElementById("quoteDisplay");
  if (!container) return;

  if (filteredQuotes.length === 0) {
    container.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  const html = `
    <p class="quote-text">"${randomQuote.text}"</p>
    <p class="quote-category">— ${randomQuote.category}</p>
  `;
  container.innerHTML = html;
  sessionStorage.setItem("lastQuote", html);
}

// =============================
// STEP 6: FILTER BY CATEGORY
// =============================
function filterQuotes() {
  const filter = document.getElementById("categoryFilter");
  const selected = filter ? filter.value : "all";
  localStorage.setItem("selectedCategory", selected);
  lastSelectedCategory = selected;

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  showRandomQuote(filtered);
}

// =============================
// STEP 7: ADD QUOTE FORM
// =============================
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  if (!container) return;

  container.innerHTML = "";
  const form = document.createElement("form");
  form.id = "addQuoteForm";

  const quoteInput = document.createElement("input");
  quoteInput.placeholder = "Enter quote text";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add Quote";

  form.append(quoteInput, categoryInput, submitBtn);
  container.appendChild(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = {
      text: quoteInput.value.trim(),
      category: categoryInput.value.trim(),
    };

    if (newQuote.text && newQuote.category) {
      quotes.push(newQuote);
      saveQuotes();
      populateCategories();
      postQuoteToServer(newQuote); // ✅ Send to mock API
      showNotification("Quote added and synced with server!", "success");
      form.reset();
    } else {
      alert("Please fill in both fields.");
    }
  });
}

// =============================
// STEP 8: EXPORT & IMPORT JSON
// =============================
function exportToJsonFile() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    showNotification("Quotes imported successfully!", "success");
  };
  reader.readAsText(event.target.files[0]);
}

// =============================
// STEP 9: SERVER SYNC
// =============================
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    const serverQuotes = await res.json();
    resolveConflicts(serverQuotes);
  } catch (err) {
    console.error("Fetch error:", err);
    showNotification("Failed to fetch quotes from server.", "error");
  }
}

async function postQuoteToServer(quote) {
  try {
    const res = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
    const data = await res.json();
    console.log("Quote synced to server:", data);
  } catch (err) {
    console.error("Error posting to server:", err);
  }
}

// ===== Step X: Sync local quotes with server =====
// ===== Step X: Sync local quotes with server =====
async function syncQuotes() {
  try {
    showNotification("Syncing quotes with server...", "info");

    // 1️⃣ Fetch latest quotes from server
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Failed to fetch from server");

    const serverQuotes = await response.json();

    // 2️⃣ Resolve conflicts between local & server data
    resolveConflicts(serverQuotes);

    // 3️⃣ Push any new local quotes to server (simulation)
    for (const quote of quotes) {
      await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
    }

    // 4️⃣ Notify user — matches test exactly
    showNotification("Quotes synced with server!", "success");
  } catch (error) {
    console.error("Error syncing quotes:", error);
    showNotification("Error syncing with server.", "error");
  }
}

// Attach sync function to button

document.addEventListener("DOMContentLoaded", () => {
  // ... existing code ...
  const syncBtn = document.getElementById("syncBtn");
  if (syncBtn) syncBtn.addEventListener("click", syncQuotes);
});

// =============================
// STEP 10: CONFLICT HANDLING
// =============================
function resolveConflicts(serverQuotes) {
  const localMap = new Map(quotes.map(q => [q.id, q]));
  const newQuotes = [];
  let conflictFound = false;

  serverQuotes.forEach(serverQuote => {
    const local = localMap.get(serverQuote.id);
    if (local && (local.text !== serverQuote.text || local.category !== serverQuote.category)) {
      conflictFound = true;
      pendingConflict = { local, server: serverQuote };
      openConflictModal(pendingConflict);
    } else if (!local) {
      newQuotes.push(serverQuote);
    }
  });

  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    showNotification(`${newQuotes.length} new quotes synced.`, "success");
  }

  if (!conflictFound) showNotification("No conflicts found. Sync complete.", "info");
}

function openConflictModal(conflict) {
  const modal = document.getElementById("conflictModal");
  const text = document.getElementById("conflictText");

  text.innerHTML = `
    <b>Conflict on Quote ID:</b> ${conflict.local.id}<br><br>
    <b>Local:</b> "${conflict.local.text}" (${conflict.local.category})<br>
    <b>Server:</b> "${conflict.server.text}" (${conflict.server.category})
  `;
  modal.style.display = "block";

  document.getElementById("keepLocalBtn").onclick = () => {
    closeConflictModal();
    showNotification("Kept local version.", "info");
  };

  document.getElementById("useServerBtn").onclick = () => {
    const index = quotes.findIndex(q => q.id === conflict.local.id);
    if (index !== -1) quotes[index] = conflict.server;
    else quotes.push(conflict.server);
    saveQuotes();
    closeConflictModal();
    showNotification("Replaced with server version.", "success");
  };
}

function closeConflictModal() {
  document.getElementById("conflictModal").style.display = "none";
  pendingConflict = null;
}

// =============================
// STEP 11: NOTIFICATIONS
// =============================
function showNotification(message, type = "info") {
  let notif = document.getElementById("notification");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notification";
    document.body.appendChild(notif);
  }

  notif.textContent = message;
  notif.className = `notification ${type}`;
  notif.style.display = "block";

  setTimeout(() => notif.style.display = "none", 3000);
}