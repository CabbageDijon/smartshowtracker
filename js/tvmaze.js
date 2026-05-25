async function searchShows(query) {
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
  const data = await res.json();
  return data;
}

// Logic for Requirement #5: Episode urgency indicators
function getEpisodeUrgency(airdate) {
  if (!airdate) return "No upcoming date";

  const episodeDate = new Date(airdate);
  const today = new Date();
  const diffTime = episodeDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: "Airs Today!", class: "alert-today" };
  if (diffDays === 1) return { text: "Airs in 24 Hours", class: "alert-24h" };
  if (diffDays > 1 && diffDays <= 7)
    return { text: `Airs in ${diffDays} days`, class: "alert-7d" };

  return { text: `Airs in ${diffDays} days`, class: "normal" };
}
