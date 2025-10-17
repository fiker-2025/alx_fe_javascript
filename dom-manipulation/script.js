// Default quotes (used only if none saved in localStorage)
const defaultQuotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Productivity" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// Storage keys
const LOCAL_KEY = "dq_quotes_v1";
const SESSION_KEY = "dq_last_viewed_v1";

// Quotes array
let quotes = [];

// --- STORAGE HANDLING ---

// Load quotes from localStorage
function loadQuotes() {
  const saved = localStorage.getItem(LOCAL_KEY);
  if (saved) {
    try {
      quotes = JSON.parse(saved);
    } catch {
      quotes = [...defaultQuotes];
    }
  } else {
    quotes = [...defaultQuotes];
  }
  saveQuotes(); // ensure stored
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
}

// --- QUOTE FUNCTIONS ---

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available. Add one below!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <p class="category">— ${quote.category}</p>
  `;

  // Save last viewed index to sessionStorage
  sessionStorage.setItem(SESSION_KEY, randomIndex);
}

function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  quoteDisplay.innerHTML = `
    <p>✅ New quote added successfully!</p>
    <p class="category">Category: ${quoteCategory}</p>
  `;
}

// --- TASK 0 FUNCTION (Checker requirement) ---
function createAddQuoteForm() {
  const container = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes (JSON)";
  exportButton.addEventListener("click", exportToJson);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(addButton);
  container.appendChild(exportButton);
  container.appendChild(importInput);

  document.body.appendChild(container);
}

// --- JSON IMPORT / EXPORT ---

function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(file);
}

// --- INIT ---
loadQuotes();
newQuoteButton.addEventListener("click", showRandomQuote);
createAddQuoteForm();