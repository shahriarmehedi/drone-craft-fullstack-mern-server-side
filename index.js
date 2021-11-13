const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.is406.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// ASYNC FUNCTION
async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        const database = client.db("DroneCraft");
        const productCollection = database.collection("products");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");
        const reviewCollection = database.collection("reviews");


        //  POST API (CREATE DATA FROM CLIENT)

        // (POST) FOR PRODUCTS
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('Hitting the products post');

            const result = await productCollection.insertOne(product);
            console.log(result);
            res.json(result);
        })


        // (POST) FOR ORDERS
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('Hitting the orders post');

            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json(result);
        })

        // (POST) FOR RATING
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })


        // (POST) FOR USERS
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);

        })



        //  GET API
        app.get('/products', async (req, res) => {

            // RUN FIND OPERATION FOR ALL DATA FROM DATABASE COLLECTION                         
            const cursor = productCollection.find({});

            // CONVERT DATA TO AN ARRAY
            const products = await cursor.toArray();
            res.send(products);
        })


        app.get('/users', async (req, res) => {

            // RUN FIND OPERATION FOR ALL DATA FROM DATABASE COLLECTION                         
            const cursor = userCollection.find({});

            // CONVERT DATA TO AN ARRAY
            const users = await cursor.toArray();
            res.send(users);
        })

        //  GET SINGLE PRODUCT (READ SPECIFIC DATA FROM SERVER DATABASE)
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            console.log('getting specific product', id);
            res.json(product);
        })



        app.get('/orders', async (req, res) => {

            // RUN FIND OPERATION FOR ALL DATA FROM DATABASE COLLECTION                         
            const cursor = orderCollection.find({});

            // CONVERT DATA TO AN ARRAY
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //  GET SINGLE ORDER (READ SPECIFIC DATA FROM SERVER DATABASE)
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.json(order);
        })


        app.get('/reviews', async (req, res) => {

            // RUN FIND OPERATION FOR ALL DATA FROM DATABASE COLLECTION                         
            const cursor = reviewCollection.find({});

            // CONVERT DATA TO AN ARRAY
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        //  PUT API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);


        })


        // admin

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



        //  DELETE API (DELETE DATA FROM CLIENT)
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('Delete request generated from client side for id:', id);
            res.json(result);
        })


        //  PUT API (UPDATE DATA FROM CLIENT)
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus.status,
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            console.log('updating service');
            res.json(result);
        })


    } finally {
        // await client.close();
    }
}
// CALL ASYNC FUNCTION TO EXECUTE
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('Hello from the DroneCraft Server')
});

app.listen(port, () => {
    console.log('Listening to', port)
});
