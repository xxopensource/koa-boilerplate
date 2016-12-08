import {
    Schema
} from 'mongoose';
import extend from 'mongoose-schema-extend';

const schema = new Schema({},{
    id: false,
    timestamps: false,
    versionKey: false,
    discriminatorKey: false,
    toJSON:{
        virtuals: true
    }
});

export default schema;
