//we are creating a web server using express.

//get.
// get has two parameters first is the route itself and the second one is the callback the callback thas the res and req when the client call this route the data is send to the client.

//middle ware has the control of res and req of any api.

const express = require ('express'); //using to create the web server using express.
const app = express (); //storing the web server into the app
const bodyParser = require ('body-parser'); //it parses the data to the json format.
const morgan = require ('morgan'); //this is a middle ware library so we have to put in app.use.
const mongoose = require ('mongoose'); //used to use the database for fetching the data from the database.
const errorHandler = require ('./helpers/error-handler');
const cors = require ('cors');
require ('dotenv/config'); //ye use kiya hai taki jo .env file banai hai usko kr pae.
const authJwt = require ('./helpers/jwt');

//middleware
app.use (cors ());
app.options ('*', cors ());
app.use (bodyParser.json ()); //used to load the bodyparser to make use of the json data.
app.use (morgan ('tiny')); //consoles the information about which request is initiated.
app.use (authJwt ());
app.use (errorHandler);

//middleware ends

// Routes
const categoriesRoutes = require ('./routes/categories');
const productsRoutes = require ('./routes/products');
const usersRoute = require ('./routes/users');
const ordersRoutes = require ('./routes/orders');

const api = process.env.API_URL; //yaha use kr liya hai usko .env ko variable access krne ke liye.

//basic formation of api is
//http://localhost:3000/api/v1/products

app.use (`${api}/categories`, categoriesRoutes);
app.use (`${api}/products`, productsRoutes);
app.use (`${api}/users`, usersRoute);
app.use (`${api}/orders`, ordersRoutes);

//connecting mongoose.
//Database
mongoose
  .connect (process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'barter-database',
  })
  .then (() => {
    console.log ('database connection is ready...');
  })
  .catch (err => {
    console.log (err);
  }); //connectionstring jo hai wo .env me pdi hai
//mongoose should be connected to the application before running the port so we have used mongoose.connect before starting the port.

// app.listen (3000, (req, res) => {
//   console.log ('The server is started now.'); //------------the port on which the server will be running.
// });

// post=sbse phel data ko postman ke through post request se bheja hai mongodb ke andr aur mongo ke andr sab data save ho gya hai.
// get=ab get request se jo data database ke andr hai usko sbse phle to get request ke through psotman me laege aur fhir waha se front end me use kr sakte hai.

//prodution

var server = app.listen (process.env.PORT || 3000, function () {
  var port = server.address ().port;
  console.log ('express is working on port' + port);
});
