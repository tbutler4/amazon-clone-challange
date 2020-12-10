const functions = require('firebase-functions');
const express = require("express");
const cors = require("cors")
const stripe = require("stripe")(
  'insert stripe public key'
)

// API

//  APP CONFIG
const app = express();

// MIDDLEWARES
app.use(cors({ origin: true }));
app.use(express.json());

// API ROUTS
app.get('/', (request, response) => response.status(200).send('hello universe'))

app.post('/payments/create', async (request, response) => {
  const total = request.query.total;
  console.log('Payment request recieved !!!', total)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total, // * SUBunits of total
    currency: 'usd',
  });

  //OK - created
  response.status(201).send({
    clientSecret: paymentIntent.client_secret,
  })
})

// -LISTEN COMMaND
exports.api = functions.https.onRequest(app)
// Example Endpoint
// http://localhost:5001/clone-f32cf/us-central1/api