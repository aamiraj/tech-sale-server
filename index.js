const express = require("express");
const app = express();
const port = 5000 || process.env.PORT;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.ghnljed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function getCategory(brand) {
  switch (brand) {
    case "HP":
      return "1";
      break;
    case "Dell":
      return "2";
      break;
    case "Asus":
      return "3";
      break;
    case "Acer":
      return "4";
      break;
    case "Lenovo":
      return "5";
      break;
    case "Apple":
      return "6";
      break;
    default:
      return "0";
  }
}

//console.log(getCategory("Apple"))

const dbName = "tslaptops";

async function main() {
  try {
    const db = client.db(dbName);
    const categoriesCollection = db.collection("categories");
    const laptopsCollection = db.collection("sellingLaptops");
    const usersCollection = db.collection("users");

    app.patch("/products", async (req, res) => {
      const filter = { _id: ObjectId(req.query.id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          advertised: true,
        },
      };
      const result = await laptopsCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    app.delete("/products", async (req, res) => {
      const query = { _id: ObjectId(req.query.id) };
      const result = await laptopsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      let query;
      if (req.query.email) {
        query = { email: req.query.email };
      } else if (req.query.advertised) {
        query = { advertised: true };
      } else {
        query = {};
      }

      const laptopsByUser = await laptopsCollection.find(query).toArray();
      res.send(laptopsByUser);
    });

    app.post("/products", async (req, res) => {
      const {
        seller,
        email,
        product,
        img,
        brand,
        location,
        resalePrice,
        originalPrice,
        yearsOfUse,
        postedTime,
        verifiedUser,
      } = req.body;

      const doc = {
        product: product,
        seller: seller,
        img: img,
        location: location,
        resalePrice: parseFloat(resalePrice),
        originalPrice: parseFloat(originalPrice),
        yearsOfUse: parseInt(yearsOfUse),
        postedTime: postedTime,
        verifiedUser: verifiedUser,
        categoryId: getCategory(brand),
        brand: brand,
        email: email,
      };
      //console.log(doc);
      const result = await laptopsCollection.insertOne(doc);
      res.send(result);
    });

    app.delete("/users", async (req, res) => {
      const query = { _id: ObjectId(req.query.id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      let result;
      if (req.query.email) {
        const email = req.query.email;
        const query = { email: email };

        result = await usersCollection.findOne(query);
      } else if (req.query.role === "buyer") {
        const role = req.query.role;
        const query = { role: role };

        result = await usersCollection.find(query).toArray();
      } else if (req.query.role === "seller") {
        const role = req.query.role;
        const query = { role: role };

        result = await usersCollection.find(query).toArray();
      } else {
        result = await usersCollection.find({}).toArray();
      }

      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const { name, email, role } = req.body;

      const doc = {
        name: name,
        email: email,
        role: role,
        verified: false,
      };

      const result = await usersCollection.insertOne(doc);

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

    
  } finally {
  }

  return "everything working!";
}

main().then(console.log).catch(console.error);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
