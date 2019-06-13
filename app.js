const http = require('http');

const exp = require('express');
const bodyParser = require("body-parser")

const path = require('path')

const realTimeOptions = require('./js/realTimeDataLibrary.js')

const app = exp()

const port = process.env.PORT;
const key = process.env.tradier;


app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/js', exp.static(path.join(__dirname, '/js')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'temp.html')))

app.post('/', function(req, res){
    var ticker = req.body.ticker
    res.json({"test": "test"
    });
    //res.json(realTimeOptions.getData(key, ticker));
})

app.listen(port, () => console.log("Server running at http://localhost:%d", port));




