const express = require("express");
const path = require("path");
const upload = require("express-fileupload");
const fs = require("fs");

const app = express();
let decoder = new TextDecoder();
const encoder = new TextEncoder();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(upload());

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/", (req, res) => {
    if (req.files) {
        const file = req.files.file;
        console.dir(file);
        console.log(decoder.decode(file.data));

        file.mv("./uploads/" + file.name, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.download("./uploads/" + file.name, "result.csv", (err) => {
                    if (err) {
                        res.send(err);
                    } else {
                        fs.unlinkSync("./uploads/" + file.name);
                    }
                });
            }
        });
    } else {
        throw Error();
    }
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});
