var host = '127.0.0.1';
var port = 3030;

// const dbUrl = 'mongodb://127.0.0.1:27017/bot';
const dbUrl =
  process.env.MONGO_URI ||
  'mongodb+srv://rootuser:root@mlab.sjox9.mongodb.net/bot?retryWrites=true&w=majority';

const authSource = 'bot';
const dbUser = 'rootuser';
const dbPass = 'root';
const secretekey = 'ThisisSubashPenneru';
const userName = 'subashpenneru@gmail.com';
const password = 'nani1995subash';

module.exports = {
  HOST: process.env.HOST || host,
  PORT: process.env.PORT || port,
  DBURL: dbUrl,
  AUTHSOURCE: authSource,
  DBUSER: dbUser,
  dbPass: dbPass,
  SECRETKEY: secretekey,
  mailUser: userName,
  mailPass: password,
};
