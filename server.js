const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. ADMIN CREDENTIALS --- 
const ADMIN_USER = "admin";
const ADMIN_PASS = "GenZ2026";
const ADMIN_TOKEN = "enc_token_778899";

// --- 2. DYNAMIC CONTENT DATABASE (CMS STATE) ---
let websiteContent = {
    sections: {
        questions: true,
        artifacts: true,
        author: true
    },
    links: {
        amazon: "https://www.amazon.in/",
        flipkart: "https://www.flipkart.com/",
        myntra: "https://www.myntra.com/"
    },
    images: {
        images: {
    authorProfile: "https://photos.fife.usercontent.google.com/pw/AP1GczM2vm2edZLq94KmVJaUeYncXEjsSsjBZk1NBlB80FyjOL4PFGiGmosPgQ=w147-h196-no?authuser=0"
}    }
};

// --- 3. LIVE REVIEWS DATABASE ---
let reviewsData = [
    { id: 1, handle: "@real_talker", text: "The visual of the pressure meter on the site is exactly how my brain feels daily. Securing the PDF now.", timestamp: Date.now() - 3600000 },
    { id: 2, handle: "@unplugged_gen", text: "The toxic scroll animation at the top is way too accurate. We are literally feeding our anxiety.", timestamp: Date.now() - 7200000 },
    { id: 3, handle: "@aesthetic_killer", text: "The 'Kill the Persona' section hit entirely too close to home. Buying the physical copy from Amazon right now.", timestamp: Date.now() - 10800000 }
];

// --- 4. ADMIN AUTHENTICATION ROUTES ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// --- 5. CMS CONTENT ROUTES ---
app.get('/api/content', (req, res) => {
    res.json(websiteContent);
});

app.post('/api/content', (req, res) => {
    const token = req.headers.authorization;
    if (token !== ADMIN_TOKEN) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    websiteContent = { ...websiteContent, ...req.body };
    res.json({ success: true, message: "Website updated" });
});

// --- 6. REVIEWS ROUTES ---
app.get('/api/reviews', (req, res) => {
    res.json(reviewsData.slice().reverse()); 
});

app.post('/api/reviews', (req, res) => {
    const { handle, text } = req.body;
    if(!handle || !text) return res.status(400).json({ error: "Data missing" });
    
    const newReview = {
        id: Date.now(),
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        text: text,
        timestamp: Date.now()
    };
    reviewsData.push(newReview);
    res.status(201).json({ success: true, review: newReview });
});

app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`[NETWORK LIVE]  CMS Engine & Routing Active.`);
    console.log(`[MAIN GRID]     http://localhost:${PORT}`);
    console.log(`[ADMIN PANEL]   http://localhost:${PORT}/admin.html`);
    console.log(`=============================================================\n`);
});