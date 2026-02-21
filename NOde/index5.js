import express from "express";
const app = express();
app.listen(8085, () => {
    console.log("Server is running on port 8085");
});

app.get("/", (req, res) => {
    res.send(req.headers.authorization );
});