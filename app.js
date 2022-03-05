const express = require("express");
const path = require("path");
const upload = require("express-fileupload");
const fs = require("fs");
const AppError = require("./AppError");
const cp = require("child_process");
const catchAsync = require("./utils/catchAsync");
const Logger = require("./utils/Logger")

const app = express();

function runPython(path) {
    return new Promise((resolve, reject) => {
        cp.exec("python3 codespace/tariffB.py " + path, (error, stdout, stderr) => {
            error ? reject(stderr) : resolve(stdout)
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

app.use(express.urlencoded({extended: true}));
app.use(upload());
app.use(express.static(path.join(__dirname, 'views')))

app.get("/", (req, res) => {
    res.render("index");
});

function generateTempName() {
    return new Date().getTime()
}


app.post("/", catchAsync(async (req, res) => {
    const logger = new Logger()

    if (req.files) {
        const postfix = generateTempName()

        logger.log(`Received request. Postfix - ${postfix}`)

        const file = req.files.file;
        await file.mv(`./uploads/file_${postfix}.csv`, async (err) => {
            if (err) {
                logger.error(`Unable to download file as file_${postfix}.csv`)
                throw new AppError(err);
            } else {
                logger.error("File downloaded. Running the script")

                try {
                    await runPython(`./uploads/file_${postfix}.csv`);
                } catch (e) {
                    logger.error("Unable to process file. Script finished working abnormally")
                    logger.error(`-- Output:\n${e}`)
                    logger.error(`-- End output`)
                    throw new AppError("abnormal exit")
                }

                logger.log("Script has finished working. Uploading file")

                try {
                    await fileDownload(`./codespace/Res/file_${postfix}.csv`, res);
                    fs.unlinkSync(`./uploads/file_${postfix}.csv`);
                    fs.unlinkSync(`./codespace/Res/file_${postfix}.csv`);
                } catch (err) {
                    logger.error(`Unable to upload file_${postfix}.csv`)
                    throw new AppError(err);
                }
            }
        });
    } else {
        logger.warn("Received request, but no file provided")
        throw new AppError("no file provided", 400);
    }
}));

app.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong"} = err;
    res.status(status).send(message);
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});
