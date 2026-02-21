import express from 'express';
const app = express();
app.listen(8012, () => {
    console.log("Server is running on port 8012");
});

app.get("/", (req, res) => {
    const user={
        name:"Manikiran",
        age:21,
    };
    res.json(user);
});
