// =====================================================
// 1. DATA
// Varje inlägg är en målning som säljs. Verken ligger i
// en lista (array) med objekt. Nya verk läggs till här,
// men försvinner när sidan laddas om. Det räcker för Pass.
// =====================================================
let posts = [
  {
    id: 1,
    title: "White Silence",
    price: "8 500 SEK",
    date: "2026-10-28",
    image: "images/image1.jpg",
    text: "Oil on linen, 50 × 60 cm. Painted over three weeks in the low autumn light. A study of stillness, cool white against warm skin."
  },
  {
    id: 2,
    title: "Shadow Line",
    price: "9 200 SEK",
    date: "2026-10-20",
    image: "images/image2.jpg",
    text: "Oil on canvas, 60 × 75 cm. A single shadow falls across the face and hides the eyes. The rest of the portrait is built around that one shape."
  },
  {
    id: 3,
    title: "Study in Blue",
    price: "6 800 SEK",
    date: "2026-10-12",
    image: "images/image3.jpg",
    text: "Oil on linen, 40 × 50 cm. It started with a thin brown underpainting, then the light areas were built up slowly, layer by layer."
  }
];

// Påhittad användare. OBS: osäkert, eftersom lösenordet
// syns i koden. Det står i README att det är medvetet.
const USER = { username: "admin", password: "blogg123" };
let loggedInUser = null; // null betyder "inte inloggad"

// Galleriets läge
let works = [];        // verken som visas just nu (efter sökning)
let currentIndex = 0;  // vilket verk vi tittar på
let facing = 0;        // vilken av rummets fyra väggar vi står vända mot
let turn = 0;          // hur många grader rummet har vridits totalt
let openPost = null;   // verket som är öppet i VY 2

// =====================================================
// 2. HÄMTA ELEMENT FRÅN HTML
// =====================================================
const listView = document.getElementById("list-view");
const postView = document.getElementById("post-view");
const commissionView = document.getElementById("commission-view");
const searchInput = document.getElementById("search");

const roomEl = document.getElementById("room");
const walls = document.querySelectorAll(".wall"); // de fyra väggarna, nummer 0–3
const leftButton = document.getElementById("turn-left");
const rightButton = document.getElementById("turn-right");

const loginToggle = document.getElementById("login-toggle");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userLabel = document.getElementById("user-label");
const postForm = document.getElementById("post-form");

// =====================================================
// 3. VÄLJ VILKA VERK SOM SKA HÄNGA (SÖKNING)
// =====================================================
function buildWorks() {
  // Sökordet i små bokstäver, så "Blue" och "blue" blir samma
  const searchTerm = searchInput.value.toLowerCase();

  // filter() behåller bara verk där rubrik eller text innehåller sökordet
  works = posts.filter(function (post) {
    return post.title.toLowerCase().includes(searchTerm) ||
           post.text.toLowerCase().includes(searchTerm);
  });

  currentIndex = 0; // börja med första verket
}

// Räknar runt, så att -1 blir sista och "en för mycket" blir första.
// wrap(-1, 4) blir 3, och wrap(4, 4) blir 0.
function wrap(number, size) {
  return ((number % size) + size) % size;
}

// Ger verket som ligger "offset" steg från det vi tittar på
function workAt(offset) {
  return works[wrap(currentIndex + offset, works.length)];
}

// =====================================================
// 4. HÄNG UPP VERK PÅ VÄGGARNA
// Rummet har bara fyra väggar, men det kan finnas fler
// verk. Därför hänger vi bara upp verk på väggen framför
// oss och väggarna till vänster och höger. Väggen bakom
// oss syns inte, så den byter verk innan vi vrider oss
// dit. Då verkar galleriet aldrig ta slut.
// =====================================================
function hangWorks() {
  if (works.length === 0) {
    // Inga verk matchar sökningen: tomma väggar och en notis framför oss
    walls.forEach(function (wall) {
      wall.innerHTML = "";
      wall.dataset.workId = "";
    });
    const note = document.createElement("p");
    note.className = "empty-note";
    note.textContent = "No works match your search. Try another word.";
    walls[wrap(facing, 4)].appendChild(note);
  } else {
    hangOnWall(walls[wrap(facing, 4)], workAt(0));       // framför oss
    hangOnWall(walls[wrap(facing - 1, 4)], workAt(1));   // till höger: nästa verk
    hangOnWall(walls[wrap(facing + 1, 4)], workAt(-1));  // till vänster: förra verket
  }

  // Stäng av pilarna om det inte finns något att vrida till
  leftButton.disabled = works.length === 0;
  rightButton.disabled = works.length === 0;
}

function hangOnWall(wall, post) {
  // Hänger verket redan där? Då gör vi ingenting, så att bilden inte blinkar
  if (wall.dataset.workId === String(post.id)) return;

  wall.dataset.workId = post.id;
  wall.innerHTML = "";
  wall.appendChild(createPainting(post));
}

// Skapar en målning i ram med en museiskylt under
function createPainting(post) {
  const figure = document.createElement("figure");
  figure.className = "painting";

  // Ramen är en knapp: klick öppnar verket
  const frame = document.createElement("button");
  frame.className = "frame";
  frame.setAttribute("aria-label", "Open " + post.title);
  frame.addEventListener("click", function () {
    showPost(post.id);
  });

  // Visa bilden om verket har en, annars en tom duk
  if (post.image) {
    const img = document.createElement("img");
    img.src = post.image;
    img.alt = post.title;
    frame.appendChild(img);
  } else {
    const blank = document.createElement("span");
    blank.className = "blank-canvas";
    blank.textContent = post.title;
    frame.appendChild(blank);
  }

  // Skylten: titel och pris
  const plaque = document.createElement("figcaption");
  plaque.className = "plaque";

  const plaqueTitle = document.createElement("span");
  plaqueTitle.className = "plaque-title";
  plaqueTitle.textContent = post.title;
  plaque.appendChild(plaqueTitle);

  if (post.price) {
    const plaquePrice = document.createElement("span");
    plaquePrice.className = "plaque-price";
    plaquePrice.textContent = post.price;
    plaque.appendChild(plaquePrice);
  }

  figure.appendChild(frame);
  figure.appendChild(plaque);
  return figure;
}

// =====================================================
// 5. VRID SIG I RUMMET
// direction: -1 = vänster, 1 = höger.
// Vi byter verk, fyller väggarna och vrider sedan rummet
// 90 grader. CSS-övergången gör vridningen mjuk.
// =====================================================
function turnRoom(direction) {
  if (works.length === 0) return;

  currentIndex = wrap(currentIndex + direction, works.length);
  facing = facing - direction;      // höger: väggen till höger blir framför oss
  turn = turn + direction * 90;     // höger: vrid rummet 90 grader

  hangWorks();
  roomEl.style.setProperty("--turn", turn + "deg");
}

leftButton.addEventListener("click", function () {
  turnRoom(-1);
});
rightButton.addEventListener("click", function () {
  turnRoom(1);
});

// Piltangenterna fungerar också, men inte när man skriver i ett fält
document.addEventListener("keydown", function (event) {
  const isTyping = event.target.matches("input, textarea");
  if (isTyping || listView.hidden) return;

  if (event.key === "ArrowLeft") turnRoom(-1);
  if (event.key === "ArrowRight") turnRoom(1);
});

// =====================================================
// 6. VISA ETT VERK / FÖRFRÅGAN / TILLBAKA
// =====================================================
function showPost(id) {
  // find() letar upp verket med rätt id
  const post = posts.find(function (p) { return p.id === id; });
  openPost = post;

  document.getElementById("post-view-title").textContent = post.title;
  document.getElementById("post-view-price").textContent = post.price || "";
  document.getElementById("post-view-date").textContent = "Added " + post.date;
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
  commissionView.hidden = true;
  postView.hidden = false;
  postView.scrollIntoView();
}

function showCommissions() {
  listView.hidden = true;
  postView.hidden = true;
  commissionView.hidden = false;
  commissionView.scrollIntoView();
}

function showList() {
  postView.hidden = true;
  commissionView.hidden = true;
  listView.hidden = false;
  listView.scrollIntoView();
}

// "Enquire about this work": öppnar formuläret med verkets namn ifyllt
document.getElementById("enquire-button").addEventListener("click", function () {
  document.getElementById("c-message").value = "Hi! I'm interested in the painting \"" + openPost.title + "\".";
  showCommissions();
});

document.getElementById("back-button").addEventListener("click", showList);
document.getElementById("commission-back").addEventListener("click", showList);
document.getElementById("logo-link").addEventListener("click", function (event) {
  event.preventDefault();
  showList();
});

// =====================================================
// 7. SÖK – hänger om väggarna varje gång man skriver
// =====================================================
searchInput.addEventListener("input", function () {
  buildWorks();
  hangWorks();
  showList();
});

// =====================================================
// 8. INLOGGNING OCH UTLOGGNING
// =====================================================
function updateAuthUI() {
  if (loggedInUser) {
    // Inloggad: visa namn, "Log out" och formuläret för nya verk
    userLabel.textContent = "Logged in as " + loggedInUser;
    userLabel.hidden = false;
    loginToggle.textContent = "Log out";
    postForm.hidden = false;
    loginForm.hidden = true;
  } else {
    // Utloggad: dölj formuläret för nya verk
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
// 9. HÄNG UPP ETT NYTT VERK (bara för inloggade)
// =====================================================
postForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!loggedInUser) return; // extra kontroll

  // Hämta bilden som valdes i formuläret (om någon valdes)
  const imageFile = document.getElementById("post-image").files[0];

  const newPost = {
    id: Date.now(), // unikt id från klockan
    title: document.getElementById("post-title").value,
    price: document.getElementById("post-price").value,
    date: new Date().toISOString().slice(0, 10), // dagens datum
    // createObjectURL ger en tillfällig adress till bilden på datorn
    image: imageFile ? URL.createObjectURL(imageFile) : null,
    text: document.getElementById("post-text").value
  };

  posts.unshift(newPost); // lägg först, så hamnar det på väggen framför oss
  postForm.reset();

  searchInput.value = "";
  buildWorks();
  hangWorks();
  listView.scrollIntoView();
});

// =====================================================
// 10. EXTERNT API: nedräkning till sista beställningsdag
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

    // Räkna ut hur många dagar det är kvar till sista beställningsdag
    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;   // millisekunder per dag
    const daysLeft = Math.ceil((deadline - today) / msPerDay);

    // Villkor: flera dagar kvar, sista dagen, eller för sent?
    if (daysLeft > 1) {
      // <strong> gör antalet dagar fetstilt. innerHTML behövs för att
      // <strong> ska bli fet stil och inte visas som text. Det är säkert
      // här, eftersom daysLeft är en siffra vi räknat ut själva.
      box.innerHTML = "Order within <strong>" + daysLeft + " days</strong> to get your painting before Christmas.";
    } else if (daysLeft === 1) {
      box.textContent = "Last day to order for delivery before Christmas!";
    } else {
      box.textContent = "Orders placed now will be delivered after Christmas.";
    }
  } catch (error) {
    box.textContent = "The Christmas countdown could not be loaded. Check your internet connection and reload the page.";
    console.error(error);
  }
}

// =====================================================
// 11. FÖRFRÅGNINGAR OCH COMMISSIONS
// Öppet för alla. Skickar inget på riktigt, utan visar
// bara ett tack-meddelande.
// =====================================================
const commissionForm = document.getElementById("commission-form");
const commissionThanks = document.getElementById("c-thanks");

commissionForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stoppa att sidan laddas om

  const name = document.getElementById("c-name").value;
  commissionThanks.textContent = "Thanks, " + name + "! I'll get back to you within a few days.";
  commissionThanks.hidden = false;

  commissionForm.reset(); // töm fälten
});

// =====================================================
// 12. STARTA – körs när sidan laddas
// =====================================================
buildWorks();
hangWorks();
updateAuthUI();
loadChristmasCountdown();

// =====================================================
// 13. BILDSPEL I HEADERN
// Var tredje sekund flyttas klassen "active" till nästa
// bild. CSS:en gör att den gamla tonar ut och den nya in.
// =====================================================
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function nextSlide() {
  slides[currentSlide].classList.remove("active");       // tona ut den gamla
  currentSlide = wrap(currentSlide + 1, slides.length);  // nästa bild, och runt igen efter den sista
  slides[currentSlide].classList.add("active");          // tona in den nya
}

// Bildspelet står still för den som har stängt av animationer
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && slides.length > 1) {
  setInterval(nextSlide, 3000); // kör nextSlide var 3000:e millisekund
}
