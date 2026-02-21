import express from "express";
const app = express();
app.listen(1912, () => {
    console.log("Server is running on port 1912");
});

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.get("/:id", (req, res) => {
    const { id } = req.params;
    console.log(id);
    res.send("Hello world with id " + id);
});

app.get("/:id/:name", (req, res) => {
    const { id, name } = req.params;
    res.send(id);
    res.send(name);
    res.send("Hello world with id " + id + " and name " + name);
});

