import Koa from 'koa'
import convert from 'koa-convert'
import onerror from 'koa-onerror'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import mongoose from 'mongoose'
import * as Middlewares from './middlewares'

const app = new Koa();

// middlewares
onerror(app);
app.use(convert(bodyparser()));
app.use(convert(logger()));
app.use(convert(conditional()));
app.use(convert(etag()));

// db
mongoose.connect('mongodb://localhost:27017/koa-boilerplate', function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});

// models
app.use(Middlewares.model(app, __dirname+'/models'));

// routers
app.use(Middlewares.router(__dirname+'/controllers'));

// services
app.use(Middlewares.service(app, __dirname+'/services'));

app.on('error', function (err, ctx) {
    console.error(err);
});

module.exports = app;