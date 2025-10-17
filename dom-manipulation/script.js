// ------------------------------
// Task 3: Server Sync + Conflict Resolution
// ------------------------------

// Fetch quotes from server (GET only)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Map server data to quotes
    return serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Error fetching server quotes:", err);
    return [];
  }
}

// Sync quotes with server (GET + POST + conflict resolution)
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Conflict resolution: server data overwrites duplicates
    serverQuotes.forEach(sq => {
      const index = quotes.findIndex(lq => lq.text === sq.text);
      if (index >= 0) {
        quotes[index] = sq; // overwrite local
      } else {
        quotes.push(sq);
      }
    });

    // Save locally
    localStorage.setItem("quotes", JSON.stringify(quotes));

    // Update categories and display
    populateCategories();
    showRandomQuote();

    // POST local quotes to server
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    showNotification("Synced with server successfully (GET + POST).", "#28a745");

  } catch (err) {
    console.error("Server sync failed:", err);
    showNotification("Server sync failed.", "#dc3545");
  }
}

// ------------------------------
// Notification helper
// ------------------------------
function showNotification(message, color) {
  const notification = document.getElementById("notification");
  if (!notification) return;
  notification.textContent = message;
  notification.style.backgroundColor = color;
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, 4000);
}