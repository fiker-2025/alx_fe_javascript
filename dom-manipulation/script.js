// ------------------------------
// Task 2: Dynamic Filtering + Storage + JSON
// ------------------------------
let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// ------------------------------
// Load and Save Functions
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
// Show Random Quote
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

// ------------------------------
// Create Add Quote Form
// ------------------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

// ------------------------------
// Add New Quote
// ------------------------------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // Update dropdown if new category
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added!");
  } else {
    alert("Please enter both quote and category!");
  }
}

// ------------------------------
// Category Filter Functions
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

  // Restore saved filter
  const lastFilter = localStorage.getItem("lastFilter") || "all";
  categoryFilter.value = lastFilter;
}

function getFilteredQuotes() {
  const filter = categoryFilter.value;
  if (filter === "all") return quotes;
  return quotes.filter(q => q.category === filter);
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);
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
// Initialize App
// ------------------------------
loadQuotes();
populateCategories();
createAddQuoteForm();

// Show last quote if any
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const quote = JSON.parse(last);
  quoteDisplay.innerHTML = `
    <p>${quote.text}</p>
    <p class="category">Category: ${quote.category}</p>
  `;
}

newQuoteBtn.addEventListener("click", showRandomQuote);