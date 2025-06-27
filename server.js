require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const https = require("https");
const API_KEY = '727459866db72d60016740d5';
const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/EUR`;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const cors = require("cors");
const app = express();

// Use CORS with specific origin
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Allow only your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "itech059"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL database!");
    }
});

// Update Exchange Rates Function
function updateExchangeRates() {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const { conversion_rates } = JSON.parse(data);
                const supported = ['USD', 'UAH'];

                supported.forEach(currency => {
                    const rate = conversion_rates[currency];
                    db.query(
                        `REPLACE INTO exchange_rates (base_currency, target_currency, rate) VALUES (?, ?, ?)`,
                        ['EUR', currency, rate],
                        (err) => { if (err) console.error(err); }
                    );
                });
            } catch (e) {
                console.error("Error parsing exchange rate response:", e);
            }
        });
    }).on('error', (e) => {
        console.error("HTTPS request failed:", e);
    });
}

// Call immediately and every 6 hours
setInterval(updateExchangeRates, 6 * 60 * 60 * 1000);
updateExchangeRates();

// API: Get Exchange Rates
app.get('/api/exchange_rates', (req, res) => {
    db.query(
        'SELECT target_currency, rate FROM exchange_rates WHERE base_currency = "EUR"',
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            const rates = {};
            results.forEach(row => {
                rates[row.target_currency] = row.rate;
            });

            res.json({ base: 'EUR', rates });
        }
    );
});

// User Registration
app.post("/register", async (req, res) => {
    const { email, first_name, password } = req.body;

    // Log incoming data
    console.log("Received data: ", { email, first_name, password });

    // Validate the input (basic check)
    if (!email || !first_name || !password) {
        console.log("Validation failed: All fields are required.");
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the email already exists in the database
    console.log("Checking if email already exists...");
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log("Error during email check:", error);
            return res.status(500).json({ message: 'Database error occurred.' });
        }

        console.log("Email check results: ", results);

        // If email already exists, send a response
        if (results.length > 0) {
            console.log("Email already registered.");
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Hash the password before storing it
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password: ", hashedPassword);

        // Insert the new user into the database
        const query = 'INSERT INTO users (email, first_name, password) VALUES (?, ?, ?)';

        // Log the data being inserted
        console.log("Inserting user with data: ", { email, first_name, hashedPassword });

        db.query(query, [email, first_name, hashedPassword], (err, result) => {
            if (err) {
                console.error("Database query error: ", err);
                return res.status(500).json({ message: 'Error saving user to the database.' });
            }

            console.log("User inserted successfully:", result);
            // If insertion is successful, send success response
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
});

// User Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                res.json({ success: true, message: "Login successful!" });
            } else {
                res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    });
});

// Получение всех товаров
app.get("/api/items", (req, res) => {
    const query = "SELECT * FROM items ORDER BY id DESC";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching items:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});

// Gеt items by category
app.get("/api/items/category/:category", (req, res) => {
    const category = req.params.category;
    const query = "SELECT * FROM items WHERE category = ? ORDER BY id DESC";

    db.query(query, [category], (err, results) => {
        if (err) {
            console.error("Error fetching items by category:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});

// Get item details by ID
app.get("/api/items/:id", (req, res) => {
    const itemId = req.params.id;
    const query = "SELECT * FROM items WHERE id = ? LIMIT 1";

    db.query(query, [itemId], (err, results) => {
        if (err) {
            console.error("Error fetching item details:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json(results[0]);
    });
});

// Create a new item
app.post("/api/items", (req, res) => {
    const { name, category, price, description, image_url } = req.body;

    // Basic validation of required fields
    if (!name || !category || !price) {
        return res.status(400).json({ error: "Name, category and price are required" });
    }

    const query = "INSERT INTO items (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)";

    db.query(query, [name, category, price, description, image_url], (err, result) => {
        if (err) {
            console.error("Error creating item:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
            message: "Item created successfully",
            itemId: result.insertId
        });
    });
});

// Update an existing item
app.put("/api/items/:id", (req, res) => {
    const itemId = req.params.id;
    const { name, category, price, description, image_url } = req.body;

    // Check if the item exists
    if (!name || !category || !price) {
        return res.status(400).json({ error: "Name, category and price are required" });
    }

    const query = "UPDATE items SET name = ?, category = ?, price = ?, description = ?, image_url = ? WHERE id = ?";

    db.query(query, [name, category, price, description, image_url, itemId], (err, result) => {
        if (err) {
            console.error("Error updating item:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ message: "Item updated successfully" });
    });
});

// Item deletion
app.delete("/api/items/:id", (req, res) => {
    const itemId = req.params.id;
    const query = "DELETE FROM items WHERE id = ?";

    db.query(query, [itemId], (err, result) => {
        if (err) {
            console.error("Error deleting item:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ message: "Item deleted successfully" });
    });
});

// API endpoint to search for teas or get all teas
app.get('/api/items', (req, res) => {
    const searchQuery = req.query.q || '';
    const getAllTeas = req.query.all === 'true';

    // If we're getting all teas
    if (getAllTeas) {
        const sql = 'SELECT * FROM items ORDER BY name ASC';

        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching all items:', err);
                return res.status(500).json({ error: 'Failed to fetch items' });
            }

            res.json(results);
        });
        return;
    }

    // If the search query is empty, return an empty array
    if (!searchQuery.trim()) {
        return res.json([]);
    }

    // Clean the search query
    const cleanQuery = searchQuery.trim().toLowerCase();

    // Use SQL query for matching terms
    const sql = `
        SELECT * FROM items 
        WHERE 
            LOWER(origin) LIKE ? OR 
            LOWER(name) LIKE ? 
        ORDER BY name ASC
    `;

    const searchPattern = `%${cleanQuery}%`;

    // Execute query with proper error handling
    db.query(sql, [searchPattern, searchPattern], (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.status(500).json({ error: 'Failed to fetch items' });
        }

        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));