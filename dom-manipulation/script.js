// ------------------------------
// Task 3: Periodic Server Sync + Conflict Resolution
// ------------------------------

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();
    return serverData.map(post => ({ text: post.title, category: "Server" }));
  } catch (err) {
    console.error("Error fetching server quotes:", err);
    return [];
  }
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let conflicts = 0;

    // Merge server quotes into local quotes with conflict resolution
    serverQuotes.forEach(sq => {
      const index = quotes.findIndex(lq => lq.text === sq.text);
      if (index >= 0) {
        quotes[index] = sq; // server data takes precedence
        conflicts++;
      } else {
        quotes.push(sq);
      }
    });

    // Save to localStorage
    localStorage.setItem("quotes", JSON.stringify(quotes));

    // Update UI
    populateCategories();
    showRandomQuote();

    // Notify user
    if (conflicts > 0) {
      showNotification(`Synced with server. ${conflicts} conflicts resolved.`, "#28a745");
    } else {
      showNotification("Synced with server. No conflicts.", "#28a745");
    }

    // POST local quotes back to server
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

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

// ------------------------------
// Periodic automatic syncing
// ------------------------------

// Automatically sync with server every 30 seconds
setInterval(syncQuotes, 30000);