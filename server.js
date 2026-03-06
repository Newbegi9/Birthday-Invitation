const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ngrok = require('@ngrok/ngrok');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'rsvps.json');
const ADMIN_PIN = '1234';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Helpers ----------
function readData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return { guests: [] };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function authAdmin(req, res) {
    const pin = req.headers['x-admin-pin'];
    if (pin !== ADMIN_PIN) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }
    return true;
}

// ---------- Guest API ----------

// GET /api/invite/:token  — validate token and return guest info
app.get('/api/invite/:token', (req, res) => {
    const { token } = req.params;
    const data = readData();
    const guest = data.guests.find(g => g.token === token);
    if (!guest) {
        return res.status(404).json({ error: 'Invalid invite link' });
    }
    res.json({
        name: guest.name,
        rsvp: guest.rsvp,
        respondedAt: guest.respondedAt
    });
});

// POST /api/rsvp  — submit RSVP (prevents duplicates server-side)
app.post('/api/rsvp', (req, res) => {
    const { token, response } = req.body;
    if (!token || !['yes', 'no'].includes(response)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const data = readData();
    const guest = data.guests.find(g => g.token === token);
    if (!guest) {
        return res.status(404).json({ error: 'Invalid invite link' });
    }
    if (guest.rsvp !== null) {
        return res.status(409).json({ error: 'Already responded', rsvp: guest.rsvp });
    }

    guest.rsvp = response;
    guest.respondedAt = new Date().toISOString();
    writeData(data);

    res.json({ success: true, name: guest.name, rsvp: guest.rsvp });
});

// ---------- Admin API ----------

// GET /api/admin/stats
app.get('/api/admin/stats', (req, res) => {
    if (!authAdmin(req, res)) return;
    const data = readData();
    const yes = data.guests.filter(g => g.rsvp === 'yes').length;
    const no = data.guests.filter(g => g.rsvp === 'no').length;
    const pending = data.guests.filter(g => g.rsvp === null).length;
    res.json({ total: data.guests.length, yes, no, pending });
});

// GET /api/admin/guests
app.get('/api/admin/guests', (req, res) => {
    if (!authAdmin(req, res)) return;
    const data = readData();
    res.json(data.guests);
});

// POST /api/admin/guests  — add new guest, returns unique token
app.post('/api/admin/guests', (req, res) => {
    if (!authAdmin(req, res)) return;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const data = readData();
    const token = uuidv4();
    const guest = {
        token,
        name: name.trim(),
        rsvp: null,
        respondedAt: null,
        createdAt: new Date().toISOString()
    };
    data.guests.push(guest);
    writeData(data);
    res.json(guest);
});

// DELETE /api/admin/guests/:token
app.delete('/api/admin/guests/:token', (req, res) => {
    if (!authAdmin(req, res)) return;
    const { token } = req.params;
    const data = readData();
    const before = data.guests.length;
    data.guests = data.guests.filter(g => g.token !== token);
    if (data.guests.length === before) {
        return res.status(404).json({ error: 'Guest not found' });
    }
    writeData(data);
    res.json({ success: true });
});

// Serve admin.html for /admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, async () => {
    console.log(`\n🎉 Birthday RSVP App running locally at http://localhost:${PORT}`);
    console.log(`🔐 Admin PIN: ${ADMIN_PIN}`);
    console.log(`\n⏳ Opening ngrok tunnel...`);

    try {
        const listener = await ngrok.forward({ addr: PORT });
        const url = listener.url();
        console.log(`\n✅ Public URL ready! (no password needed for guests)`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🌐 PUBLIC URL  : ${url}`);
        console.log(`📊 Admin Panel : ${url}/admin.html`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`👆 Open the Admin Panel URL above in your browser.`);
        console.log(`   Guest invite links will use this public URL automatically.\n`);
    } catch (err) {
        console.error('\n⚠️  Could not open ngrok tunnel:', err.message);
        if (err.message.includes('authtoken')) {
            console.log(`   Run this command with your token from https://dashboard.ngrok.com/authtokens:`);
            console.log(`   ngrok config add-authtoken YOUR_TOKEN_HERE\n`);
        }
        console.log(`   Local admin still works at: http://localhost:${PORT}/admin.html\n`);
    }
});
