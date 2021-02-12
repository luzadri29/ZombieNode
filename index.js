const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {
  getLocations,
  getZombies,
  getZombiesLocation,
  updateZombieLocation,
} = require('./source');

const port = process.env.PORT || 80;
app.use(function (req, res, next) {
res.header('Access-Control-Allow-Origin', 'http://zombiesmanager.suyland.com');
res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH');
res.header('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept, Authorization, cache-control'
);
next();
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/locations', getLocations);

app.get('/zombies', getZombies);

app.get('/zombies/location', getZombiesLocation);

app.patch('/zombie/:zombieId/location', updateZombieLocation);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});