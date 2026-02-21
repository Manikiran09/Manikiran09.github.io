import express from 'express';
const app = express();
app.listen(8071, () => {
    console.log("Server is running on port 8071");
});
app.use(express.json());

const users=[
    {
        id:11,
        name:"Manikiran",
        email:"manikiran@.com"
    },
    {
        id:27,
        name:"SHIVA",
        email:"shiva@.com"
    },
    {
        id:221,
        name:"showman",
        email:"showman@.com"
    },
];

app.get("/", (req, res) => {
   
   
   res.json(users);
});

app.get("/:id", (req, res) => {
    const result = users.find((user) => user.id === parseInt(req.params.id));
    if(result){
        res.json(result);
    }else{
        res.status(404).json({message:"User not found"});
    }
});

app.post("/", (req, res) => {
    const user = req.body;
    users.push(user);
res.json(user);
});

app.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    users.splice(index, 1);
    res.json(users);
});
