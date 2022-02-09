const express = require("express");
const path = require("path");
const upload = require("express-fileupload");
const fs = require("fs");
const AppError = require("./AppError");
const morgan = require("morgan"); // consol loging tool
const cp = require("child_process");

const app = express();
let decoder = new TextDecoder();
const encoder = new TextEncoder();

function toPython(text) {
    const { stdout, stderr } = cp.spawnSync("python3", ["codespace/codespace.py", text]);
    return stdout.toString();
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use(morgan("dev")); // will log every request info
app.use(express.urlencoded({ extended: true }));
app.use(upload());

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/", (req, res, next) => {
    if (req.files) {
        const file = req.files.file;
        const text = decoder.decode(file.data);
        const result = toPython(text);

        fs.writeFile("./uploads/test.csv", result, (err) => {
            if (err) {
                return console.log(err);
            }
            res.download("./uploads/test.csv", "result.csv", (err) => {
                if (err) {
                    return console.log(err);
                }
                fs.unlinkSync("./uploads/test.csv");
            });
        });
    } else {
        throw new AppError("no file provided", 400);
    }
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    res.status(status).send(message);
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});
