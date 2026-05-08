# Crystal Keeper

Crystal Keeper is a lightweight single-page web app for tracking a personal crystal collection.

## Features

- Add crystal purchases with the crystal name, piece type, price, store, listing link, purchase date, notes, and photo.
- Browse a built-in crystal catalogue with common benefits and see whether each crystal is already owned.
- Search the catalogue to get an instant owned / not owned indicator.
- Review collection totals for number of pieces, unique crystals, and total spend.
- Keep data locally in the browser with `localStorage`, so your collection is still available when you refresh the page.

## Running the app

Because this project is a static site, you can open `index.html` directly in a browser, or serve it locally with Python:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
