import express from "express";
const app = express();
app.use(express.json());
app.listen(8012, () => {
  console.log("Server is running on port 8012");
});

app.get("/", (req, res) => {
    console.log(req.url);
    console.log(req.method);
    res.send("Response from the server on get request");  
});

app.post("/", (req, res) => {
    console.log(req.url);
    console.log(req.method);
    res.send("Response from the server on post request");  
    console.log(req.body)

});

