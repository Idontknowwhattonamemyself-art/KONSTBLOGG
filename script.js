// =====================================================
// 1. DATA
// Inläggen ligger i en lista (array) med objekt.
// Nya inlägg läggs till här, men försvinner när sidan
// laddas om. Det räcker för Pass.
// =====================================================
let posts = [
  {
    id: 1,
    title: "Varför jag målar ansikten",
    date: "2026-10-12",
    text: "Ett ansikte förändras hela tiden. En liten skugga under ögat kan göra någon trött eller eftertänksam. Det är det jag försöker fånga när jag målar realistiska porträtt i olja."
  },
  {
    id: 2,
    title: "Ljuset i ateljén på hösten",
    date: "2026-10-20",
    text: "Novemberljuset i Stockholm är lågt och blått. Jag målar mest på förmiddagen nu, innan det försvinner. Kallt ljus ger varma skuggor, och det märks direkt på huden i porträtten."
  },
  {
    id: 3,
    title: "Tre färger jag aldrig klarar mig utan",
    date: "2026-10-28",
    text: "Titanvitt, bränd umbra och ultramarin. Med de tre kommer jag långt innan jag ens behöver öppna fler tuber. Begränsad palett tvingar fram bättre beslut."
  }
];

// Påhittad användare. OBS: osäkert, eftersom lösenordet
// syns i koden. Det står i README att det är medvetet.
const USER = { username: "admin", password: "blogg123" };
let loggedInUser = null; // null betyder "inte inloggad"

// =====================================================
// 2. HÄMTA ELEMENT FRÅN HTML
// =====================================================
const listView = document.getElementById("list-view");
const postView = document.getElementById("post-view");
const postList = document.getElementById("post-list");
const noResults = document.getElementById("no-results");
const searchInput = document.getElementById("search");

const loginToggle = document.getElementById("login-toggle");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userLabel = document.getElementById("user-label");
const postForm = document.getElementById("post-form");

// =====================================================
// 3. VISA LISTAN MED INLÄGG
// =====================================================
function renderList() {
  // Sökordet i små bokstäver, så "Ljus" och "ljus" blir samma
  const searchTerm = searchInput.value.toLowerCase();

  // filter() behåller bara inlägg där rubrik eller text innehåller sökordet
  const matches = posts.filter(function (post) {
    return post.title.toLowerCase().includes(searchTerm) ||
           post.text.toLowerCase().includes(searchTerm);
  });

  postList.innerHTML = ""; // töm listan innan vi ritar om den

  // Skapa ett listelement per inlägg
  matches.forEach(function (post) {
    const li = document.createElement("li");

    const titleButton = document.createElement("button");
    titleButton.textContent = post.title;
    titleButton.addEventListener("click", function () {
      showPost(post.id);
    });

    const excerpt = document.createElement("p");
    excerpt.className = "excerpt";
    excerpt.textContent = post.text.slice(0, 90) + "…"; // första 90 tecknen

    li.appendChild(titleButton);
    li.appendChild(excerpt);
    postList.appendChild(li);
  });

  // Visa "inga träffar" om listan blev tom
  noResults.hidden = matches.length > 0;
}

// =====================================================
// 4. VISA ETT INLÄGG / GÅ TILLBAKA
// =====================================================
function showPost(id) {
  // find() letar upp inlägget med rätt id
  const post = posts.find(function (p) { return p.id === id; });

  document.getElementById("post-view-title").textContent = post.title;
  document.getElementById("post-view-date").textContent = post.date;
  document.getElementById("post-view-text").textContent = post.text;

  listView.hidden = true;
  postView.hidden = false;
  window.scrollTo(0, 0);
}

function showList() {
  postView.hidden = true;
  listView.hidden = false;
  renderList();
}

document.getElementById("back-button").addEventListener("click", showList);
document.getElementById("logo-link").addEventListener("click", function (event) {
  event.preventDefault();
  showList();
});

// =====================================================
// 5. SÖK – kör renderList varje gång man skriver
// =====================================================
searchInput.addEventListener("input", renderList);

// =====================================================
// 6. INLOGGNING OCH UTLOGGNING
// =====================================================
function updateAuthUI() {
  if (loggedInUser) {
    // Inloggad: visa namn, "Logga ut" och formuläret för nya inlägg
    userLabel.textContent = "Inloggad som " + loggedInUser;
    userLabel.hidden = false;
    loginToggle.textContent = "Logga ut";
    postForm.hidden = false;
    loginForm.hidden = true;
  } else {
    // Utloggad: dölj formuläret för nya inlägg
    userLabel.hidden = true;
    loginToggle.textContent = "Logga in";
    postForm.hidden = true;
  }
}

loginToggle.addEventListener("click", function () {
  if (loggedInUser) {
    loggedInUser = null;          // logga ut
    updateAuthUI();
  } else {
    loginForm.hidden = !loginForm.hidden; // visa/dölj formuläret
  }
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stoppa att sidan laddas om

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Villkor: stämmer båda med vår användare?
  if (username === USER.username && password === USER.password) {
    loggedInUser = username;
    loginError.hidden = true;
    loginForm.reset();
    updateAuthUI();
  } else {
    loginError.hidden = false;
  }
});

// =====================================================
// 7. LÄGG TILL ETT INLÄGG (bara för inloggade)
// =====================================================
postForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!loggedInUser) return; // extra kontroll

  const newPost = {
    id: Date.now(), // unikt id från klockan
    title: document.getElementById("post-title").value,
    date: new Date().toISOString().slice(0, 10), // dagens datum, t.ex. 2026-11-01
    text: document.getElementById("post-text").value
  };

  posts.unshift(newPost); // lägg först i listan
  postForm.reset();
  renderList();
});

// =====================================================
// 8. EXTERNT API: väder i Stockholm från Open-Meteo
// Ingen API-nyckel behövs.
// =====================================================
async function loadWeather() {
  const url = "https://api.open-meteo.com/v1/forecast" +
              "?latitude=59.33&longitude=18.07" +
              "&current=temperature_2m,wind_speed_10m";

  const weatherBox = document.getElementById("weather");

  try {
    const response = await fetch(url);      // skicka förfrågan
    const data = await response.json();     // gör om svaret till ett JS-objekt

    const temp = Math.round(data.current.temperature_2m);
    const wind = Math.round(data.current.wind_speed_10m);

    weatherBox.textContent = "Stockholm just nu: " + temp + " °C, vind " + wind + " km/h";
  } catch (error) {
    weatherBox.textContent = "Vädret kunde inte hämtas. Kontrollera internetanslutningen och ladda om sidan.";
    console.error(error);
  }
}

// =====================================================
// 9. STARTA – körs när sidan laddas
// =====================================================
renderList();
updateAuthUI();
loadWeather();
