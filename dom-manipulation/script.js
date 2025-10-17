// ✅ Task 3: Simulate fetching quotes from a server and syncing local data
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Simulate server quotes using the placeholder data
    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Simple conflict resolution: server data overrides duplicates
    const localQuotes = loadQuotes();
    const updatedQuotes = [
      ...localQuotes.filter(
        lq => !serverQuotes.some(sq => sq.text === lq.text)
      ),
      ...serverQuotes
    ];

    quotes = updatedQuotes;
    saveQuotes();

    // Optional: notify user of sync
    alert("Quotes synced with server successfully!");
    showRandomQuote();
    populateCategories();

  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}