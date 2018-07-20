let Immutable = require('immutable');
let ConfigDefault = require('./config');
let ConfigLocal = require('./config-local');

let config_default = Immutable.Map(ConfigDefault)
let config_local = Immutable.Map(ConfigLocal)
let config = config_default.merge(config_local)

module.exports = config.toJS()