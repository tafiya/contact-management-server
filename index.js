const express =require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cookieParser=require('cookie-parser');
const app =express();
require('dotenv').config()
const cors =require('cors');
var jwt = require('jsonwebtoken');
const port =process.env.PORT || 5300;

//middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173/",
      "http://localhost:5174/",
      "https://contact-management-1c230.web.app/",
    ],
    credentials: true,
  })
);
 app.use(cookieParser());




const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.bescutn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    
   
    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
const userCollection = client.db("chatNookCollection").collection("users");
    const contactCollection = client.db("management").collection("client");
   
 
      // jwt related api
      app.post('/jwt', async (req, res) => {
          const user = req.body;
          const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
          //console.log('generated token',token)
          res.send({ token });
      })
       // middlewares 
const verifyToken = (req, res, next) => {
  // console.log('inside verify new token==',req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

    //post related apiru
    app.get('/contacts',async(req,res)=>{
 
        const result= await contactCollection.find().toArray(); 
        res.send(result);
    })
    app.get('/contacts/:email', verifyToken, async (req, res) => {
      const query = { email: req.params.email }
      if (req.params.email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const result = await contactCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/contacts', async (req, res) => {
        const item = req.body;
        const result = await contactCollection.insertOne(item);
        console.log(result)
        res.send(result);
      });
 
       //users related api
    app.get('/users', verifyToken,  async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });
      
 
      app.post('/users',async(req,res)=>{
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      })
  




app.get('/',(req,res)=>{
    res.send('contact is running');

})
app.listen(port,()=>{
    console.log(`contact is sitting on port ${port}`);
})