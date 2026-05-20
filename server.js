const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// 50mb limit allows for high-quality Base64 Image Uploads from the Admin Panel
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. SYSTEM SECURITY CREDENTIALS --- 
let ADMIN_USER = "admin";
let ADMIN_PASS = "GenZ2026";
let ADMIN_TOKEN = "enc_token_778899";

// --- EMAIL SETUP (REQUIRED FOR FORGOT PASSWORD) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'RKUAMRJALORE@GMAIL.COM', // Replace with your email
        pass: 'zyxf welv qjgr luxi'  // Replace with your 16-digit Google App Password
    }
});

// --- 2. CMS MASTER STATE ---
let websiteContent = {
    sections: { questions: true, artifacts: true, author: true },
    pricing: { bookPrice: "350" },
    reviewPanel: { title: "Live Network Feed", subtitle: "Inject Your Truth" },
    links: { 
        amazon: "https://www.amazon.in/", 
        flipkart: "https://www.flipkart.com/", 
        myntra: "https://www.myntra.com/" 
    },
    social: {
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
        x: "https://x.com",
        linkedin: "https://linkedin.com"
    },
    text: {
        authorP1: "I didn't write this from the outside; I wrote it while figuring out how to pick the lock from the inside. I watched the algorithm turn friends into metrics and passions into aesthetic trends.",
        authorP2: "This isn't theory. This is survival. Let's dismantle the fake reality and build something authentic."
    },
    images: {
        authorProfile: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80",
        bookFront: "",
        bookPov: "",
        bookBack: ""
    }
};

// --- 3. REVIEWS DATABASE (WITH MODERATION STATUS) ---
let reviewsData = [
    { id: 1, handle: "@system_node", text: "The network is live. Awaiting user input.", timestamp: Date.now(), status: "approved" }
];

// --- 4. AUTHENTICATION & SECURITY ROUTES ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

app.post('/api/admin/update-credentials', (req, res) => {
    if (req.headers.authorization !== ADMIN_TOKEN) return res.status(403).json({ error: "Unauthorized" });
    const { newUser, newPass } = req.body;
    if (newUser) ADMIN_USER = newUser;
    if (newPass) ADMIN_PASS = newPass;
    res.json({ success: true, message: "Security credentials updated." });
});

app.post('/api/admin/forgot-password', async (req, res) => {
    try {
        await transporter.sendMail({
            from: 'RKUAMRJALORE@GMAIL.COM',
            to: 'RKUAMRJALORE@GMAIL.COM',
            subject: 'SYSTEM OVERRIDE: Admin Credentials',
            text: `Architect, your current secure credentials are:\nUsername: ${ADMIN_USER}\nPassword: ${ADMIN_PASS}`
        });
        res.json({ success: true });
    } catch (error) {
        console.log("Email Error: Did you set up the Google App Password?", error);
        res.status(500).json({ error: "Email configuration missing." });
    }
});

// --- 5. CMS ROUTES ---
app.get('/api/content', (req, res) => res.json(websiteContent));

app.post('/api/content', (req, res) => {
    if (req.headers.authorization !== ADMIN_TOKEN) return res.status(403).json({ error: "Unauthorized" });
    // Merge new data keeping existing structure
    websiteContent.pricing = { ...websiteContent.pricing, ...req.body.pricing };
    websiteContent.reviewPanel = { ...websiteContent.reviewPanel, ...req.body.reviewPanel };
    websiteContent.links = { ...websiteContent.links, ...req.body.links };
    websiteContent.social = { ...websiteContent.social, ...req.body.social };
    websiteContent.text = { ...websiteContent.text, ...req.body.text };
    websiteContent.images = { ...websiteContent.images, ...req.body.images };
    res.json({ success: true });
});

// --- 6. REVIEWS & MODERATION ROUTES ---
// Public Route: Only gets APPROVED reviews
app.get('/api/reviews', (req, res) => {
    res.json(reviewsData.filter(r => r.status === "approved").slice().reverse());
});

// Public Route: Submit a review (Defaults to PENDING)
app.post('/api/reviews', (req, res) => {
    const { handle, text } = req.body;
    if(!handle || !text) return res.status(400).json({ error: "Data missing" });
    reviewsData.push({ id: Date.now(), handle: handle.startsWith('@') ? handle : `@${handle}`, text, timestamp: Date.now(), status: "pending" });
    res.status(201).json({ success: true });
});

// Admin Route: Gets ALL reviews (Pending + Approved)
app.get('/api/admin/reviews', (req, res) => {
    if (req.headers.authorization !== ADMIN_TOKEN) return res.status(403).json({ error: "Unauthorized" });
    res.json(reviewsData.slice().reverse());
});

// Admin Route: Approve a Pending Review
app.post('/api/admin/reviews/:id/approve', (req, res) => {
    if (req.headers.authorization !== ADMIN_TOKEN) return res.status(403).json({ error: "Unauthorized" });
    const review = reviewsData.find(r => r.id == req.params.id);
    if(review) { review.status = "approved"; res.json({ success: true }); }
    else res.status(404).json({ error: "Not found" });
});

// Admin Route: Delete/Reject a Review
app.delete('/api/admin/reviews/:id', (req, res) => {
    if (req.headers.authorization !== ADMIN_TOKEN) return res.status(403).json({ error: "Unauthorized" });
    reviewsData = reviewsData.filter(r => r.id != req.params.id);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`\n=== [SYSTEM ONLINE] PORT: ${PORT} ===\n`);
});