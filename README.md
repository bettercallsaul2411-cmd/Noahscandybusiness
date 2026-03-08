# Noah's Candy Business (Demo)

Simple candy business community board demo with:

- Create community posts
- Category filter
- Admin delete actions
- Server-side blocked-word filtering
- Browser-playable "Candy Catch" mini-game
- Language review filter to verify text is clean
- Apply -> Worker flow that requests School ID and Name

## Run locally

```bash
npm install
npm start
```

Then open the URL printed in your terminal (usually `http://localhost:3000`).


## Troubleshooting

If `http://localhost:3000` does not open:

- Run `npm start` from the project folder first.
- If needed, force localhost-only mode: `npm run start:local`
- The server now prioritizes localhost loopback binding and keeps trying higher ports automatically until it finds a working one.
- Try `http://127.0.0.1:<port>` or `http://[::1]:<port>` using the printed port.
- Quick health check: `curl http://127.0.0.1:<port>/health`

- If your machine prefers IPv6 localhost, start with: `HOST=:: npm start` (uses dual-stack where supported).
