const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: {
    type: String,
    unique: true,
  },
  pushToken: {
    type: String,
    unique: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
