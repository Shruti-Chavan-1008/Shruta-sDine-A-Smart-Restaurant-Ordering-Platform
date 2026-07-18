const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");

const Menu = require("./models/menu");

const app = express();
const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/hotel";

// Temporary cart storage
let card = [];

// EJS configuration
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    res.locals.cartCount = card.length;
    next();
});

// MongoDB connection
async function connectDatabase() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

connectDatabase();

/* -------------------- BASIC ROUTES -------------------- */

app.get("/", (req, res) => {
    res.redirect("/hero");
});

app.get("/hero", (req, res) => {
    res.render("hero");
});

app.get("/category", (req, res) => {
    res.render("category");
});

/* -------------------- MENU ROUTES -------------------- */

// Show all menu items
app.get("/Menu", async (req, res) => {
    try {
        const allMenus = await Menu.find();

        res.render("menu.ejs", {
            allMenus,
            added: req.query.added === "true"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to load menu");
    }
});
// Show form for creating menu item
app.get("/Menu/new", (req, res) => {
    res.render("new");
});

// Create a menu item
app.post("/Menu", async (req, res) => {
    try {
        const newMenu = new Menu(req.body);

        await newMenu.save();

        res.redirect("/Menu");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to create menu item");
    }
});

// Show menu items according to category
app.get("/Menu/:category", async (req, res) => {
    try {
        const { category } = req.params;

        const allMenus = await Menu.find({
            category: category
        });

        res.render("menu.ejs", {
            allMenus,
            added: req.query.added === "true"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to load category");
    }
});
/* -------------------- CART ROUTES -------------------- */

// Add menu item to cart
app.get("/add-to-card/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Menu.findById(id);

        if (!item) {
            return res.status(404).send("Menu item not found");
        }

        card.push(item);

        const previousPage = req.get("referer") || "/Menu";

        const separator = previousPage.includes("?") ? "&" : "?";

        res.redirect(`${previousPage}${separator}added=true`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to add item to cart");
    }
});

// Display cart page
app.get("/card", (req, res) => {
    res.render("card", {
        card
    });
});

// Delete item from cart
app.post("/cart/delete/:id", (req, res) => {
    try {
        const { id } = req.params;

        card = card.filter((item) => {
            return item._id.toString() !== id;
        });

        res.redirect("/card");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to remove item");
    }
});

/* -------------------- CHECKOUT ROUTE -------------------- */

app.post("/checkout", (req, res) => {
    try {
        const {
            tableNumber,
            paymentMethod
        } = req.body;

        if (!tableNumber || !paymentMethod) {
            return res.status(400).send(
                "Table number and payment method are required"
            );
        }

        if (card.length === 0) {
            return res.redirect("/card");
        }

        const orderedItems = card.map((item) => {
            return {
                title: item.title,
                image: item.image,
                price: Number(item.price)
            };
        });

        const subtotal = orderedItems.reduce((sum, item) => {
            return sum + item.price;
        }, 0);

        const gst = subtotal * 0.05;
        const totalAmount = subtotal + gst;

        // Clear cart after copying order information
        card = [];

        res.render("done", {
            tableNumber,
            paymentMethod,
            orderedItems,
            subtotal,
            gst,
            totalAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to complete checkout");
    }
});
 

app.use((req, res) => {
    res.status(404).send("Page not found");
});
 

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});