const koa = require('koa');
const serve = require('koa-static');
const cors = require('koa2-cors');
const path = require('path');

const app = new koa();
app.use(cors({ origin: '*'}))
app.use(serve(path.resolve(__dirname, '../assets')));

app.listen(3000);
