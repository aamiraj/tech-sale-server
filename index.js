const express = require("express");
const app = express();
const port = 5000 || process.env.PORT;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.ghnljed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbName = "tslaptops";

async function main() {
  try {
    const db = client.db(dbName);
    const categoriesCollection = db.collection("categories");
    const laptopsCollection = db.collection("laptops");
    const usersCollection = db.collection("users");

    app.get('/users', async (req, res)=>{
      const email = req.query.email
      const query = {email:email}
      
      const result = await usersCollection.findOne(query)
      
      res.send(result)
    })

    app.post("/users", async (req, res) => {
      const { name, email, role } = req.body;

      const doc = {
        name: name,
        email: email,
        role: role,
        verified: false
      };

    const result = await usersCollection.insertOne(doc)
      
    res.send(result);
    });

    app.get("/categories/:id", async (req, res) => {
      const query = { categoryId: req.params.id };
      const laptopsById = await laptopsCollection.find(query).toArray();
      res.send(laptopsById);
    });

    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.send(categories);
    });

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } finally {
  }

  return "everything working!";
}

main().then(console.log).catch(console.error);
