const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
require('dotenv').config();



const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.uzz7izn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next){
//     const authHeader = req.headers.authorization;
//     if(!authHeader){
//         res.status(401).send({message: 'unAuthorized user'})
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err,     decoded){
//         if(err){
//             res.status(401).send({message: 'unAuthorized user'})
//         }
//         req.decoded = decoded;
//         next();
//     })
// }
 
async function run(){
    try{
        const serviceCollections = client.db('eventPhoto').collection('photoServices');
        const reviewCollections = client.db('eventPhoto').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({token})
        })

        app.get('/', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query).limit(3).sort({"_id": -1});
            const services = await cursor.toArray();
            res.send(services)
        })
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query).sort({"_id": -1});
            const services = await cursor.toArray();
            res.send(services)
        })

        app.post('/services', async(req, res) => {
            const newService = req.body;
            const result = await serviceCollections.insertOne(newService);
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const service = await serviceCollections.findOne(query);
            res.send(service)
        })

        app.get('/review',  async (req, res) => {
            // console.log(req.decoded)
            let query = {};
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
             const cursor = reviewCollections.find(query).sort({"_id": -1});
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        // app.get('/review', async (req, res) => {
        //     const query = {};
        //     const cursor = reviewCollections.find(query);
        //     const reviews = await cursor.toArray();
        //     res.send(reviews)
        // })

        app.post('/review', async(req, res) => {
            const newReview = req.body;
            const result = await reviewCollections.insertOne(newReview);
            res.send(result)
        })

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await reviewCollections.deleteOne(query);
            res.send(result)
        })
        // app.patch('/review/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id:ObjectId(id)};
        //     const review = req.body.review;
        //     const updatedReview = {
        //         $set : {
        //             review: review
        //         }
        //     }
        //     const result = await reviewCollections.updateOne(query, updatedReview);
        //     res.send(result)
        // })
    }
    finally{

    }
}
run().catch(error => console.log(error))

app.get('/', (req, res) => {
    res.send('hello')
})

app.listen(port, ()=> {
    console.log(`running in ${port}` )
})