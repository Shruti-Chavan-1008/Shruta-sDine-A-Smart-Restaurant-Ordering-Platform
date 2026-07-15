const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Menu = require("./models/menu");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/hotel";

// Temporary cart array
let card = [];

main()
    .then(() => {
        console.log("Database is connected");
    })
    .catch((error) => {
        console.log("Database connection error:", error);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

// App configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


// Home page
app.get("/hero", (req, res) => {
    res.render("hero.ejs");
});


// Display all menu items
app.get("/Menu", async (req, res) => {
    try {
        const allMenus = await Menu.find();

        res.render("menu.ejs", { allMenus });
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to load menu");
    }
});


// Category page
app.get("/category", (req, res) => {
    res.render("category.ejs");
});


// New menu form
app.get("/Menu/new", (req, res) => {
    res.render("new.ejs");
});


// Add new menu item
app.post("/Menu", async (req, res) => {
    try {
        const newMenu = new Menu(req.body);

        await newMenu.save();

        res.redirect("/category");
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to add menu item");
    }
});


// Display menu according to category
app.get("/Menu/:category", async (req, res) => {
    try {
        const { category } = req.params;

        const allMenus = await Menu.find({ category });

        res.render("menu.ejs", { allMenus });
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to load category");
    }
});


// Add item to cart
app.get("/add-to-card/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Menu.findById(id);

        if (!item) {
            return res.status(404).send("Menu item not found");
        }

        /*
        Prevent adding the same item multiple times.
        Remove this check when duplicate items are allowed.
        */
        const alreadyAdded = card.some(
            (cartItem) => cartItem._id.toString() === id
        );

        if (!alreadyAdded) {
            card.push(item);
        }

        res.redirect("/card");
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to add item to cart");
    }
});


// Display cart
app.get("/card", (req, res) => {
    res.render("card.ejs", { card });
});


// Delete item from the temporary cart array
app.post("/cart/:id", (req, res) => {
    const { id } = req.params;

    card = card.filter((item) => {
        return item._id.toString() !== id;
    });

    res.redirect("/card");
});
app.delete("/cart/:id", async (req, res) => {
    await Cart.findByIdAndDelete(id);
});


// Checkout
app.post("/checkout", (req, res) => {
    const {
        tableNumber,
        paymentMethod,
        totalAmount
    } = req.body;

    res.render("done.ejs", {
        tableNumber,
        paymentMethod,
        totalAmount
    });
});


app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});