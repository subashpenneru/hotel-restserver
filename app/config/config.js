var host = "127.0.0.1"; 
var port = 3030;

// const dbUrl = 'mongodb://127.0.0.1:27017/bot';
const dbUrl = "mongodb://hotel:subash1995@ds117334.mlab.com:17334/bot"

const authSource = 'bot';
const dbUser = 'hotel';
const dbPass = 'subash1995';
const secretekey = "ThisisSubashPenneru";
const userName = "subashpenneru@gmail.com";
const password = "nani1995subash";

module.exports = {
    HOST:host,
    PORT:port,
    DBURL:dbUrl,
    AUTHSOURCE:authSource,
    DBUSER:dbUser,
    dbPass:dbPass,
    SECRETKEY:secretekey,
    mailUser:userName,
    mailPass:password
}