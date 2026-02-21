import express from 'express';
const app = express();
app.use(express.json());

app.listen(8087, () => {
    console.log("Server is running on port 8087");
});
const products=[
    {
        id:1,
        name:"Laptop",
        price:1000,
    },
    {
        id:2,
        name:"Phone",
        price:500,
    },
    {
        id:3,
        name:"Tablet",
        price:300,
    },
];

app.get("/", (req, res) => {
    res.json(products);
});

app.post("/", (req, res) => {
    const { id, name, price } = req.body;

    if (id == null || !name || price == null) {
        return res.status(400).json({ message: "id, name and price are required" });
    }

    const alreadyExists = products.some((product) => product.id === Number(id));
    if (alreadyExists) {
        return res.status(409).json({ message: "Product with this id already exists" });
    }

    const newProduct = {
        id: Number(id),
        name: String(name),
        price: Number(price),
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    products.splice(index, 1);
    res.json(products);
});

