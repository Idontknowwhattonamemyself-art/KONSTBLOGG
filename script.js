// =====================================================
// 1. DATA
// Inläggen ligger i en lista (array) med objekt.
// Nya inlägg läggs till här, men försvinner när sidan
// laddas om. Det räcker för Pass.
// =====================================================
let posts = [
  {
    id: 1,
    title: "SHOP",
    date: "2026-10-28",
    image: "images/image1.jpg",
    text: "Oil on linen, 50 × 60 cm. Painted over three weeks in the low autumn light. Price: 8 500 SEK. Use the commission form to ask about it."
  },
  {
    id: 2,
    title: "COMMISSIONS SLOTS OPEN FOR DECEMBER",
    date: "2026-10-20",
    image: "images/image2.jpg",
    text: "I'm taking three portrait commissions before Christmas. Send me a photo and an idea through the form, and I'll reply with a price and timeline."
  },
  {
    id: 3,
    title: "HOW I MAKE MY PORTRAITS COME TOGETHER",
    date: "2026-10-12",
    image: "images/image3.jpg",
    text: "Every portrait starts with a thin brown underpainting. Then I build up the light areas slowly, layer by layer, until the face feels alive."
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

    // Visa bilden, men bara om inlägget har en bild
     li.appendChild(titleButton);
    if (post.image) {
      const img = document.createElement("img");
      img.src = post.image;
      img.alt = post.title;
      img.className = "post-thumb";
      img.addEventListener("click", function () {
        showPost(post.id); // även bilden öppnar inlägget
      });
      li.appendChild(img);
    }

   
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

  const postImage = document.getElementById("post-view-image");
  if (post.image) {
    postImage.src = post.image;
    postImage.alt = post.title;
    postImage.hidden = false;
  } else {
    postImage.hidden = true;
  }

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
    userLabel.textContent = "Logged in as " + loggedInUser;
    userLabel.hidden = false;
    loginToggle.textContent = "Log out";
    postForm.hidden = false;
    loginForm.hidden = true;
  } else {
    // Utloggad: dölj formuläret för nya inlägg
    userLabel.hidden = true;
    loginToggle.textContent = "Log in";
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
// 8. EXTERNT API: nedräkning till jul
// Hämtar Sveriges helgdagar från Nager.Date.
// Ingen API-nyckel behövs.
// =====================================================
async function loadChristmasCountdown() {
  const year = new Date().getFullYear();   // årtalet just nu, t.ex. 2026
  const url = "https://date.nager.at/api/v3/PublicHolidays/" + year + "/SE";

  const box = document.getElementById("countdown");

  try {
    const response = await fetch(url);       // skicka förfrågan
    const holidays = await response.json();  // svaret blir en lista med helgdagar

    // find() letar upp juldagen (25 december) i listan
    const christmas = holidays.find(function (holiday) {
      return holiday.date.endsWith("-12-25");
    });

  // Sista beställningsdag: 14 dagar före juldagen
    const christmasDate = new Date(christmas.date);
    const deadline = new Date(christmasDate);
    deadline.setDate(deadline.getDate() - 14);

    // Gör om datumet till text, t.ex. "11 December"
    const deadlineText = deadline.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

    // Villkor: har sista dagen passerat?
    const today = new Date();
    if (today < deadline) {
      box.textContent = "Order before " + deadlineText + " to get your painting delivered before Christmas.";
    } else {
      box.textContent = "Orders placed now will be delivered after Christmas.";
    }
  } catch (error) {
    box.textContent = "The Christmas countdown could not be loaded. Check your internet connection and reload the page.";
    console.error(error);
  }
}
  

// =====================================================
// 9. STARTA – körs när sidan laddas
// =====================================================
renderList();
updateAuthUI();
loadChristmasCountdown();
