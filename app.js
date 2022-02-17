const express = require("express");
const path = require("path");
const upload = require("express-fileupload");
const fs = require("fs");
const AppError = require("./AppError");
const cp = require("child_process");
const catchAsyc = require("./utils/catchAsync");

const app = express();

function runPython(path) {
    return new Promise((resolve, reject) => {
        cp.exec("./codespace/venv/bin/python codespace/tariffB.py " + path, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            if (stderr) {
                console.log("internal message:");
                console.log(stderr);
            }
            resolve(stdout);
        });
    });
}

function fileDownload(path, res) {
    return new Promise((resolve, reject) => {
        res.download(path, "result.csv", (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(upload());

app.get("/", (req, res) => {
    res.render("index");
});

app.post(
    "/",
    catchAsyc(async (req, res) => {
        if (req.files) {
            const file = req.files.file;
            await file.mv("./uploads/file.csv", async (err) => {
                if (err) {
                    throw new AppError(err);
                } else {
                    try {
                        console.log("start");
                        await runPython("./uploads/file.csv");
                        await fileDownload("./codespace/Res/ans.csv", res);
                        fs.unlinkSync("./uploads/file.csv");
                        fs.unlinkSync("./codespace/Res/ans.csv");
                        console.log("end");
                    } catch (err) {
                        throw new AppError(err);
                    }
                }
            });
        } else {
            throw new AppError("no file provided", 400);
        }
    })
);

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    res.status(status).send(message);
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});
