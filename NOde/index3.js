import express from "express";
const app = express();
app.use(express.json());
app.listen(8092, () => {
  console.log("Server is running on port 8092");
});

app.get("/morning", (req, res) => {
    res.send("Good Morning!");
});

app.get("/evening", (req, res) => {
    res.send("Good Evening!");
});

app.get("/", (req, res) => {
    res.send("Server is running. Try /morning or /evening");
});

app.post("/", (req, res) => {
    console.log(req.url);
    console.log(req.method);
    console.log(req.body);
    res.send("Response from the server on post request");

});

