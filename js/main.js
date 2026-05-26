// Theme Toggle
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Load saved theme
if (localStorage.getItem("theme")) {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme"),
  );
}

// Simple SPA Routing
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    // Hide all pages
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.add("hidden"));
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.remove("active"));

    // Show target page
    const target = e.target.getAttribute("data-target");
    const targetPage = document.getElementById(target);
    targetPage.classList.remove("hidden");
    targetPage.classList.add("active");
  });
});

// 1. Urgency Calculator (From your original requirements)
function getEpisodeUrgency(airdate) {
  if (!airdate) return { text: "Date TBD", class: "normal" };

  const episodeDate = new Date(airdate);
  const today = new Date();

  // Strip the time to just compare the dates accurately
  today.setHours(0, 0, 0, 0);
  const epDateOnly = new Date(episodeDate);
  epDateOnly.setHours(0, 0, 0, 0);

  const diffTime = epDateOnly - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: "Airs Today!", class: "alert-today" };
  if (diffDays === 1) return { text: "Airs in 24 Hours", class: "alert-24h" };
  if (diffDays > 1 && diffDays <= 7)
    return { text: `Airs in ${diffDays} days`, class: "alert-7d" };
  if (diffDays < 0) return { text: "Aired Recently", class: "normal" };

  return { text: `Airs in ${diffDays} days`, class: "normal" };
}

// 2. Load Dashboard Logic
async function loadDashboard() {
  const grid = document.getElementById("tracked-shows-grid");

  if (!currentUser) {
    grid.innerHTML = "<p>Please log in to see your tracked shows.</p>";
    return;
  }

  grid.innerHTML = "<p>Loading your shows...</p>";

  try {
    // A. Fetch the user's saved shows from Appwrite
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("userId", currentUser.$id),
    ]);

    const shows = response.documents;

    if (shows.length === 0) {
      grid.innerHTML =
        "<p>You aren't tracking any shows yet. Go to Search to add some!</p>";
      return;
    }

    grid.innerHTML = ""; // Clear loading text

    // B. Loop through shows and get LIVE data from TVMaze
    for (const show of shows) {
      // The ?embed=nextepisode parameter gets the show AND the next episode in one API call!
      const res = await fetch(
        `https://api.tvmaze.com/shows/${show.tvmazeId}?embed=nextepisode`,
      );
      const tvData = await res.json();

      // C. Determine the episode status
      let urgencyHtml = "";
      if (tvData._embedded && tvData._embedded.nextepisode) {
        const nextEp = tvData._embedded.nextepisode;
        const urgency = getEpisodeUrgency(nextEp.airstamp);
        // We use inline CSS colors here, but you can move these to your style.css variables
        urgencyHtml = `<p class="${urgency.class}" style="font-weight:bold;">${urgency.text} <br>(Season ${nextEp.season}, Ep ${nextEp.number})</p>`;
      } else if (tvData.status === "Ended") {
        urgencyHtml = `<p style="color: gray;">Show Ended</p>`;
      } else {
        urgencyHtml = `<p>Next season TBD</p>`;
      }

      // D. Render the Card
      const imageUrl = tvData.image
        ? tvData.image.medium
        : "https://via.placeholder.com/210x295?text=No+Image";

      const card = document.createElement("div");
      card.className = "show-card";
      card.innerHTML = `
                <img src="${imageUrl}" alt="${tvData.name}" style="width:100%; border-radius:4px; margin-bottom: 10px;">
                <h3 style="margin: 0 0 5px 0;">${tvData.name}</h3>
                ${urgencyHtml}
                <button class="remove-btn" data-doc-id="${show.$id}" style="margin-top: 10px; background-color: #ef4444;">Untrack</button>
            `;
      grid.appendChild(card);
    }

    // E. Attach "Untrack" event listeners
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const docId = e.target.getAttribute("data-doc-id");
        e.target.textContent = "Removing...";
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, docId);
        loadDashboard(); // Reload the grid
      });
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    grid.innerHTML = '<p class="error-text">Failed to load dashboard.</p>';
  }
}
