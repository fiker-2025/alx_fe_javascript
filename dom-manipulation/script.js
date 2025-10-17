// ------------------------------
// Task 3: Sync Quotes with Server + Conflict Resolution
// ------------------------------
async function syncQuotes() {
  try {
    // Fetch server quotes
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Map server data to quote objects
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data overrides duplicates
    serverQuotes.forEach(sq => {
      const index = quotes.findIndex(lq => lq.text === sq.text);
      if (index >= 0) {
        quotes[index] = sq; // overwrite local
      } else {
        quotes.push(sq);
      }
    });

    // Save updated quotes locally
    localStorage.setItem("quotes", JSON.stringify(quotes));

    // Update categories and display a quote
    populateCategories();
    showRandomQuote();

    // POST local quotes to server
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    // Notify user
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