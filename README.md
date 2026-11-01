# Ateljén – en blogg om porträttmåleri

Individuellt projekt i Programming & Methods (ACE2627), Berghs. Mål: Pass.

## Vad som är gjort
- **Inlägg och navigering:** lista med inlägg, klicka för att läsa, knapp för att gå tillbaka.
- **Lägga till inlägg:** formulär för nya inlägg (kräver inloggning).
- **Inloggning:** logga in med användarnamn och lösenord, och logga ut.
- **Sök:** filtrerar inläggen på rubrik och text medan man skriver.
- **Externt API:** aktuellt väder i Stockholm från [Open-Meteo](https://open-meteo.com/).
- **Responsiv layout:** lättläst text, fungerar på mobil och dator, följer systemets mörka läge.

## Medvetet utelämnat
- **Databas:** inläggen sparas bara i en JavaScript-lista. Nya inlägg försvinner när sidan laddas om (tillåtet för Pass).
- **Säker inloggning:** användarnamn och lösenord ligger i `script.js` och kontrolleras i webbläsaren. Vem som helst kan läsa dem i källkoden. En riktig lösning skulle kontrollera lösenordet på en server och spara det hashat.
- **Kommentarer och AI-funktion:** krävs bara för Pass with distinction.

## Köra projektet
1. Klona repot: `git clone <din-repo-url>`
2. Öppna `index.html` i en webbläsare, eller använd tillägget Live Server i VS Code.

Inga API-nycklar eller tjänster behöver konfigureras.

**Testinloggning:** användarnamn `admin`, lösenord `blogg123`.

## Filer
- `index.html` – struktur
- `style.css` – utseende och mobilanpassning
- `script.js` – logik: inlägg, sök, inloggning, väder
- `slides.pdf` – presentationen
