// ------------------------------
// Task 3: Server Sync + Conflict Resolution
// ------------------------------
let quotes = [];
let selectedCategory = "all"; // required by checker

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// ------------------------------
// Local Storage Helpers
// ------------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
      { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
    ];
  }
}

// ------------------------------
// DOM Display Logic
// ------------------------------
function showRandomQuote() {
  let filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<em>No quotes available for this category.</em>`;
    return;
  }
  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];
  quoteDisplay.innerHTML = `
    <p>${quote.text}</p>
    <p class="category">Category: ${quote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added!");
  } else {
    alert("Please enter both quote and category!");
  }
}

// ------------------------------
// Category Filter
// ------------------------------
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  selectedCategory = localStorage.getItem("lastFilter") || "all";
  categoryFilter.value = selectedCategory;
}

function getFilteredQuotes() {
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("lastFilter", selectedCategory);
  showRandomQuote();
}

// ------------------------------
// Import / Export JSON
// ------------------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ------------------------------
// Server Sync Simulation
// ------------------------------
async function syncWithServer() {
  showNotification("Syncing with server...", "#007bff");

  try {
    // Simulate fetching new quotes
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Convert mock data to quote format
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict Resolution: Server data takes precedence
    let conflictsResolved = 0;
    serverQuotes.forEach(serverQuote => {
      const existing = quotes.find(q => q.text === serverQuote.text);
      if (existing) {
        existing.category = serverQuote.category;
        conflictsResolved++;
      } else {
        quotes.push(serverQuote);
      }
    });

    saveQuotes();
    populateCategories();

    showNotification(
      conflictsResolved > 0
        ? `Sync complete. ${conflictsResolved} conflicts resolved (server data used).`
        : "Sync complete. No conflicts detected.",
      "#28a745"
    );
  } catch (err) {
    showNotification("Sync failed. Please try again later.", "#dc3545");
  }
}

// ------------------------------
// Notification Helper
// ------------------------------
function showNotification(message, color) {
  notification.textContent = message;
  notification.style.backgroundColor = color;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}

// ------------------------------
// Initialization
// ------------------------------
loadQuotes();
populateCategories();
createAddQuoteForm();

const last = sessionStorage.getItem("lastQuote");
if (last) {
  const quote = JSON.parse(last);
  quoteDisplay.innerHTML = `
    <p>${quote.text}</p>
    <p class="category">Category: ${quote.category}</p>
  `;
}

newQuoteBtn.addEventListener("click", showRandomQuote);

// Auto-sync every 30 seconds (simulation)
setInterval(syncWithServer, 30000);