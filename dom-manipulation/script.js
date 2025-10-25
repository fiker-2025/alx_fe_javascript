// =============================
// STEP 1: INITIALIZE DATA
// =============================
let quotes = [
  { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { id: 2, text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { id: 3, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
];

let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

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
    displayRandomQuote();
  }

  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuote);
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
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) categoryFilter.value = savedCategory;
}

// =============================
// STEP 5: DISPLAY RANDOM QUOTE
// =============================
function displayRandomQuote(filteredQuotes = quotes) {
  const container = document.getElementById("quoteDisplay");
  if (!container) return;

  const selectedCategory = document.getElementById("categoryFilter").value || "all";
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    container.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];

  container.innerHTML = `
    <p class="quote-text">"${randomQuote.text}"</p>
    <p class="quote-category">— ${randomQuote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", container.innerHTML);
}

// =============================
// STEP 6: FILTER BY CATEGORY
// =============================
function filterQuote() {
  const selected = document.getElementById("categoryFilter").value || "all";
  localStorage.setItem("selectedCategory", selected);
  displayRandomQuote();
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
  quoteInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;
  categoryInput.id = "newQuoteCategory";

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add Quote";

  form.append(quoteInput, categoryInput, submitBtn);
  container.appendChild(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote();
  });
}

// =============================
// STEP 8: ADD QUOTE FUNCTION
// =============================
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { id: Date.now(), text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote([newQuote]);
  textInput.value = "";
  categoryInput.value = "";
}

// =============================
// STEP 9: EXPORT & IMPORT JSON
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
    populateCategories();
    displayRandomQuote();
  };
  reader.readAsText(event.target.files[0]);
}
