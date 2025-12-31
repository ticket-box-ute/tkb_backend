const express = require("express");
const app = express();
const port = 8080;
const routes = require("./routes/routes")
const db = require("./config/db_config")
var cors = require('cors')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

db.connect();
routes(app)

app.listen(port, () => console.log(`server running at port ${port}`));