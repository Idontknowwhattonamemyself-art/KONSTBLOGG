# In Print

An online gallery and shop for original oil portraits. Visitors stand inside a virtual gallery room and turn from wall to wall to see the paintings for sale. Each painting can be opened to read about it, see the price and send an enquiry.

The project follows the assignment's alternative brief: a marketing site for a business instead of a personal blog. The paintings work as the site's article feed, and the owner can log in and add new ones.

Built with plain HTML, CSS and JavaScript, with no frameworks or build tools.

## Features

| Feature | How it works on the site |
|---|---|
| **Content and navigation** | The paintings hang on the walls of the gallery room. Clicking a painting opens it with image, price and description. *Back to the gallery* returns to the room. |
| **Adding content** | When logged in, the owner can use *Hang a new work* to add a painting with title, price, image and text. It appears on the wall straight away. |
| **Layout and readability** | The gallery fills the screen and adapts to both desktop and mobile. Text uses readable sizes, and keyboard focus is visible. |
| **JavaScript: search** | *Find a work* in the top left filters the paintings by title and description as you type. |
| **External API** | The site fetches Swedish public holidays from [Nager.Date](https://date.nager.at), finds Christmas Day, and shows how many days are left to order a painting for delivery before Christmas. |
| **Authentication** | *Log in* and *Log out* in the top right. Visitors must be logged in to add a painting. |

### Extra

- **3D gallery room:** the room is built with CSS 3D transforms (`perspective`, `rotateY`, `translateZ`). The arrow buttons or the arrow keys turn the room 90 degrees to the next wall. The gallery loops, so it works with any number of paintings.
- **Header slideshow:** images fade into each other behind the *In Print* title.
- **Enquiry form:** *Enquire about this work* opens a form with the painting's name filled in.
- **Reduced motion:** visitors who have turned off animations in their system settings get no turning animation or slideshow.

## External API

```
https://date.nager.at/api/v3/PublicHolidays/{year}/SE
```

- **Request:** the current year and the country code `SE`. No API key is needed.
- **Response:** a JSON list of Swedish public holidays, each with fields such as `date`, `localName` and `name`.
- **Use:** the code finds the holiday on 25 December with `find()`, subtracts 14 days to get the last order date, and calculates the number of days left.
- **Errors:** if the request fails, a message is shown instead and the rest of the site keeps working.

## Deliberately left out

- **Database:** paintings are stored in a JavaScript array. New paintings, and their images, disappear when the page is reloaded.
- **Secure login:** the username and password are stored in `script.js` and checked in the browser, so anyone can read them in the source code. A real solution would check a hashed password on a server.
- **Sending enquiries:** the enquiry form only shows a confirmation message. Actually sending it would need a server or an email service.
- **Checkout and payment:** there is no real shop checkout.
- **Comments and AI features.**

## Running the project

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Open `index.html` in a web browser, or use the Live Server extension in VS Code.

No API keys or services need to be configured. An internet connection is needed for the countdown and the fonts.

**Test login:** username `admin`, password `blogg123`

## Files

```
index.html   structure of the page
style.css    layout, the 3D gallery room and the mobile version
script.js    paintings, gallery, search, login, adding paintings and the API
images/      paintings and slideshow images
slides.pdf   presentation
```

## Use of AI

I used Claude as an assistant throughout the project. Claude suggested a structure for the site, generated a first version of the code, and explained each part in Swedish. I tested every change in the browser, adapted the design and content, and asked follow-up questions about the parts I did not understand. The code comments are in Swedish so that I could follow each section.

Examples of problems along the way:

- When I replaced the weather API with the holiday API, leftover code from the old function stopped the whole page from working. The browser console showed `await is only valid in async functions`, and I learned to read the error and line number to find the leftover code.
- Images did not show at first because the file paths in `script.js` did not include the `images/` folder.

The images on the site are AI-generated placeholders.

## Credits

- Holiday data: [Nager.Date](https://date.nager.at)
- Fonts: Anton, Inter and Spectral from [Google Fonts](https://fonts.google.com)
