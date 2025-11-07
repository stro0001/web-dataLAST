const mysql = require('mysql');
const express = require('express');
const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yourUsername',
    password: 'yourPassword',
    database: 'yourDatabaseName'
});

connection.connect();

app.get('/data', (req, res) => {
    connection.query('SELECT * FROM yourTable', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
