// js/appwrite.js

// Destructure the classes we need from the global Appwrite object (loaded via CDN)
const { Client, Account, Databases, ID, Query } = Appwrite;

// Initialize the Appwrite Client
const client = new Client()
  .setEndpoint("https://appwrite.showtrax.duckdns.org/v1") // e.g., https://appwrite.yourdomain.com/v1
  .setProject("[6a149322003e7c989cf3]"); // e.g., 65a8f9b...

// Initialize the services we will use
const account = new Account(client);
const databases = new Databases(client);

// Constants for your database (You'll need these in the next phase)
const DATABASE_ID = "[6a14938000305b4a32b9]";
const COLLECTION_ID = "[6a14938900324aa39879]";

async function trackShowToDatabase(e) {
  // 1. Enforce Authentication
  if (!currentUser) {
    alert("You must be logged in to track shows!");
    document.getElementById("auth-modal").classList.remove("hidden"); // Pop open login modal
    return;
  }

  // 2. Extract data from the button we clicked
  const btn = e.target;
  const tvmazeId = parseInt(btn.getAttribute("data-id"));
  const showName = btn.getAttribute("data-name");
  const status = btn.getAttribute("data-status");

  // 3. UI Feedback (Show it's loading)
  btn.textContent = "Saving...";
  btn.disabled = true;

  try {
    // 4. Send data to Appwrite
    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(), // Let Appwrite generate the document ID
      {
        userId: currentUser.$id,
        tvmazeId: tvmazeId,
        showName: showName,
        status: status,
      },
    );

    // 5. Success UI
    btn.textContent = "Tracked ✓";
    btn.style.backgroundColor = "#16a34a"; // Green success color
    btn.style.color = "white";
  } catch (err) {
    console.error("Database Error:", err);

    // Handle the "Unique Index" error if they already track this show
    if (err.code === 409) {
      btn.textContent = "Already Tracked!";
    } else {
      alert("Failed to track show: " + err.message);
      btn.textContent = "Track Show";
      btn.disabled = false;
    }
  }
}
