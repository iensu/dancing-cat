const koa = require('koa');
const serve = require('koa-static');
const cors = require('koa2-cors');
const path = require('path');

const port = process.env.PORT || 3000;

const app = new koa();
app.use(cors({ origin: '*'}))
app.use(serve(path.resolve(__dirname, '../public')));

app.listen(port, () => console.log(`Server running on port: ${port}`));
