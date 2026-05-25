// js/tvmaze.js

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

// 1. Listen for Search Clicks
searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    searchResults.innerHTML = '<p>Searching...</p>'; // Loading state
    
    try {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
        const data = await res.json();
        renderSearchResults(data);
    } catch (err) {
        console.error("TVMaze Error:", err);
        searchResults.innerHTML = '<p class="error-text">Failed to fetch shows. Try again.</p>';
    }
});

// Allow hitting "Enter" to search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

// 2. Render the Results
function renderSearchResults(results) {
    searchResults.innerHTML = ''; // Clear loading text

    if (results.length === 0) {
        searchResults.innerHTML = '<p>No shows found. Try a different name.</p>';
        return;
    }

    results.forEach(item => {
        const show = item.show;
        
        // Grab the image if it exists, otherwise use a placeholder
        const imageUrl = show.image ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';

        // Create the card element
        const card = document.createElement('div');
        card.className = 'show-card';
        card.innerHTML = `
            <img src="${imageUrl}" alt="${show.name}" style="width:100%; border-radius:4px; margin-bottom: 10px;">
            <h3 style="margin: 0 0 5px 0;">${show.name}</h3>
            <p style="font-size: 0.9rem; color: gray; margin: 0 0 15px 0;">Status: ${show.status}</p>
            <button class="track-btn" 
                data-id="${show.id}" 
                data-name="${show.name}" 
                data-status="${show.status}">
                Track Show
            </button>
        `;
        
        searchResults.appendChild(card);
    });

    // 3. Attach event listeners to all the newly created 'Track' buttons
    document.querySelectorAll('.track-btn').forEach(btn => {
        btn.addEventListener('click', trackShowToDatabase);
    });
}
