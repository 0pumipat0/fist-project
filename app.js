const express = require("express");
const app = express();s


app.use(express.json())



app.listen(3000, () => {
    console.log('Server started: success');
});