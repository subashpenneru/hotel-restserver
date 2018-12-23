var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "subash",
    password: "root",
    database: "hotel",
});

connection.connect((err)=>{
    if(err) throw err;
    console.log("Db Connected via MYSQL");
    
})

module.exports = connection;