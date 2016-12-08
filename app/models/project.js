import mongoose, {
    Schema
} from 'mongoose';

const schema = new Schema({
    kind: String,
    name: String,
});

module.exports = mongoose.model('Project', schema);