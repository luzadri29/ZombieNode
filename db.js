const mysql = require('mysql');
let nconf = require('nconf');
const config = require(process.env.DB_CONFIG_PATH);
nconf.overrides(config);
const dbConfig = nconf.get('db');
const getProductConnection = () => {
  let newPool;
  try {
    newPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      port: dbConfig.port,
      password: dbConfig.password,
      database: dbConfig.database,
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: dbConfig.queueLimit,
    });
  } catch (err) {
    console.log('Error', err);
  }
  return newPool;
};

const query = ({ sql, params }) => {
  return new Promise((resolve, reject) => {
    try {
      getProductConnection().getConnection(function (err, connection) {
        try {
          console.info('Connection ID: ' + connection.threadId);
          connection.query(sql, params, function (error, results, fields) {
            if (error) {
              console.error(error);
              connection.release();
              reject(results);
              return;
            }
            connection.release();
            resolve(results);
          });
          connection.on('error', function (err) {
            reject(err);
            return;
          });
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { query };