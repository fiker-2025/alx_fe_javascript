// =============================
// STEP 1: INITIALIZE DATA
// =============================
let quotes = [
  { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { id: 2, text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { id: 3, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
];

// =============================
// STEP 2: INITIALIZATION
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) quotes = JSON.parse(savedQuotes);

  populateCategories();
  createAddQuoteForm();

  // Restore last quote or show random
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    document.getElementById("quoteDisplay").innerHTML = lastQuote;
  } else {
    displayRandomQuote();
  }

  // Event listener for "Show New Quote"
  const btn = document.getElementById("newQuote");
  if (btn) btn.addEventListener("click", () => displayRandomQuote());

  // Category filter listener
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) categoryFilter.addEventListener("change", filterQuote);
});

// =============================
// STEP 3: LOCAL STORAGE
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
function displayRandomQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selected = categoryFilter ? categoryFilter.value : "all";

  const filtered =
    selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  const container = document.getElementById("quoteDisplay");
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  const html = `
    <p class="quote-text">"${randomQuote.text}"</p>
    <p class="quote-category">— ${randomQuote.category}</p>
  `;
  container.innerHTML = html;
  sessionStorage.setItem("lastQuote", html);
}

// =============================
// STEP 6: FILTER QUOTES
// =============================
function filterQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selected = categoryFilter ? categoryFilter.value : "all";
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

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.type = "button";
  addBtn.addEventListener("click", addQuote);

  container.append(quoteInput, categoryInput, addBtn);
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

  const newQuote = {
    id: Date.now(),
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote();

  textInput.value = "";
  categoryInput.value = "";
}
