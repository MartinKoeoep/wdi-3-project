const mongoose = require('mongoose-fill');
const bcrypt = require('bcrypt');
const commentSchema = require('./comment');
const Promise = require('bluebird');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  comments: [ commentSchema ],
  numberOfTrades: { type: Number, default: 0 }
});

userSchema.set('toJSON', {
  virtuals: true,
  transform(doc, json) {
    delete json.password;
    return json;
  }
});

userSchema.virtual('records', {
  localField: '_id',
  foreignField: 'owner',
  ref: 'Record'
});

userSchema.fill('incomingRequests', function(callback){
  const requests = this.records.map(record => {
    return this.model('Request')
      .find({ wantedRecord: record._id })
      .populate('wantedRecord')
      .populate({
        path: 'offeredRecords',
        populate: {
          path: 'owner'
        }
      });
  });
  Promise.all(requests)
    .then(allRequests => {
      const requests = allRequests
        .reduce((flattened, requests) => flattened.concat(requests), [])
        .map(request => {
          request = request.toJSON();
          request._id = request._id.toString();
          delete request.wantedRecord.comments;
          request.offeredRecords.map(record => {
            delete record.comments;
            delete record.owner.comments;
          });
          return request;
        });
      callback(null, _.uniqBy(requests, '_id'));
    });
});

userSchema.fill('outgoingRequests', function(callback){
  const requests = this.records.map(record => {
    return this.model('Request')
      .find({ offeredRecords: record._id })
      .populate('offeredRecords')
      .populate({
        path: 'wantedRecord',
        populate: {
          path: 'owner'
        }
      });
  });
  Promise.all(requests)
    .then(allRequests => {
      const requests = allRequests
        .reduce((flattened, requests) => flattened.concat(requests), [])
        .map(request => {
          request = request.toJSON();
          request._id = request._id.toString();
          delete request.wantedRecord.comments;
          delete request.wantedRecord.owner.comments;
          delete request.offeredRecords.comments;
          return request;
        });

      callback(null, _.uniqBy(requests, '_id'));
    });
});

userSchema.virtual('avgRating')
  .get(function() {
    return Math.floor(this.comments.reduce((sum, comment) => {
      return sum + comment.rating;
    }, 0) / this.comments.length);
  });

userSchema.virtual('passwordConfirmation')
  .set(function setPasswordConfirmation(passwordConfirmation){
    this._passwordConfirmation = passwordConfirmation;
  });

userSchema.pre('validate', function checkPasswordsMatch(next){
  if(this.isModified('password') && this._passwordConfirmation !== this.password){
    this.invalidate('passwordConfirmation', 'does not match');
  }
  next();
});

userSchema.pre('save', function hashPassword(next){
  if(this.isModified('password')){
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  }
  next();
});

userSchema.methods.validatePassword = function validatePassword(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
