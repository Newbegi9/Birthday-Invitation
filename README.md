# 🎂 Birthday Invitation & RSVP Tracker

A simple web app for sharing a unique birthday invitation link and tracking guest RSVPs.

## Overview

This app lets a host share a link to a birthday invitation page. Guests open the link, submit their RSVP, and responses are collected so the host can keep track of who's coming.

## Features

- Shareable invitation link/page
- Guest-facing RSVP form
- Server-side storage of RSVP responses
- Local server can be tunneled to a public URL (via ngrok) so guests can access it without deploying to a host

## Tech Stack

- **Backend:** Node.js + [Express](https://expressjs.com/)
- **Frontend:** HTML, CSS, JavaScript (served from `public/`)
- **Utilities:** [uuid](https://www.npmjs.com/package/uuid) for generating unique IDs, [@ngrok/ngrok](https://www.npmjs.com/package/@ngrok/ngrok) for exposing the local server publicly
- **Storage:** Flat-file JSON (`rsvps.json`) — no external database required

## Project Structure

```
Birthday-Invitation/
├── public/              # Frontend assets (HTML, CSS, JS)
├── rsvps.json           # Stored RSVP responses
├── server.js            # Express server and routes
├── package.json
├── package-lock.json
├── .gitignore
└── .gitattributes
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended) and npm

### Installation

```bash
git clone https://github.com/Newbegi9/Birthday-Invitation.git
cd Birthday-Invitation
npm install
```

### Running locally

```bash
npm start
```

This runs `node server.js`. Once it's running, open the app in your browser at the local address/port configured in `server.js` (update this section with the exact URL once confirmed).

### Sharing the invite publicly (optional)

The project includes `@ngrok/ngrok`, which can tunnel your local server to a public URL so guests can RSVP without you needing to deploy anywhere.

1. Sign up at [ngrok](https://dashboard.ngrok.com) and grab an authtoken.
2. Configure the token as required by `server.js` (e.g. environment variable or config).
3. Start the server — the public ngrok URL will be generated and can be shared with guests.

> Fill in exact steps here once you confirm how the ngrok token is wired up in `server.js`.

## How It Works

1. Host starts the server and shares the invitation link with guests.
2. Guests open the link and submit their RSVP details through the form in `public/`.
3. The server saves each response to `rsvps.json`.
4. The host can review `rsvps.json` (or a dashboard page, if one exists) to see who's confirmed.

## Roadmap Ideas

- [ ] Host-facing dashboard to view/filter RSVPs in the UI
- [ ] Move storage from a flat JSON file to a lightweight database
- [ ] Email or SMS confirmation for guests after they RSVP
- [ ] One-click deploy option instead of relying on an ngrok tunnel

## Contributing

This started as a personal project for a birthday — feel free to fork it and adapt it for your own event.

## License

No license has been specified yet. If you plan to share this publicly, consider adding one (MIT is a common, permissive choice for small projects like this).
