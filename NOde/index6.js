import express from 'express';
const app = express();
app.listen(8087, () => {
    console.log("Server is running on port 8087");
});

app.get("/", (req, res) => {
    res.send(req.query.id+req.query.name);
});
