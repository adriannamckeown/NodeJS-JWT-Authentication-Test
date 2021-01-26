const express = require('express');
const app = express();
const mysql = require('mysql');

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

//MySQL database connection
var connection = mysql.createConnection({
    host        : 'sql9.freemysqlhosting.net',
    user        : 'sql9374284',
    password    : 'GHkghQTuES',
    database    : 'sql9374284'
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

app.post('/api/signup', async (req, res) => {
    const {username, password} = req.body;
    const pwd = crypto.createHash('sha256').update(password).digest('hex');
    const date = new Date().toJSON().slice(0,10);
    connection.connect();
    connection.query('INSERT INTO user VALUES("", ?, ?, ?)', [username, pwd, date], function(error, results, fields) {  
        connection.end();
        if (error) throw error;
        res.json(results);
    });
});

app.get('/api/signup', async (req, res) => {
    connection.connect();
    connection.query('SELECT * FROM user', function(error, results, fields) {
        connection.end();
        if (error) throw error;
        res.json(results)
    });
});


//SELECT * users maybe????
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m'});
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings that only logged in people can access'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});