var pgp = require('pg-promise')();

pgp.pg.defaults.ssl = true;

var db = pgp('postgres://gchoycnigdtrnp:205fd9c4f52b8451fd8311e8efa22b2f4742b13e3c40eaef48e361bd385ec8ca@ec2-54-243-187-133.compute-1.amazonaws.com:5432/d6equnpp3mb5k0');

module.exports = db;