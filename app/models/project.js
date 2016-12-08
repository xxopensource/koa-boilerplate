import mongoose from 'mongoose';
import BaseSchema from './baseSchema';

const schema = BaseSchema.extend({
    kind: String,
    name: String,
});

module.exports = mongoose.model('Project', schema);