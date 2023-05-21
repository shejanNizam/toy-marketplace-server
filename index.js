const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 7000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jjtu4en.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //   all operations start
    const toysCollection = client.db("toyMarketplaceDB").collection("allToys");

    // read operation ( GET method )
    app.get("/toys", async (req, res) => {
      const result = await toysCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // Read Operation { find single documents and also find for update }
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // Read Operation { find some documents using query }
    app.get("/my_toys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await toysCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // create document from users ( POST method )
    app.post("/post_toys", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await toysCollection.insertOne(body);
      res.send(result);
      console.log(result);
    });

    // Update Operation { find single documents using id }
    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const toy = req.body;
      console.log(toy);
      const updatedToy = {
        $set: {
          seller_name: toy.seller_name,
          email: toy.email,
          toy_name: toy.toy_name,
          photo_url: toy.photo_url,
          category: toy.category,
          price: toy.price,
          rating: toy.rating,
          quantity: toy.quantity,
          details: toy.details,
        },
      };
      const result = await toysCollection.updateOne(
        filter,
        updatedToy,
        options
      );
      res.send(result);
    });

    // Delete Operation { find single documents using id }
    app.delete("/my_toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    //   all operations end

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("TOY MARKETPLACE SERVER is running");
});

app.listen(port, () => {
  console.log(`TOY MARKETPLACE SERVER is running on port: ${port}`);
});
