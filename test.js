const { exec } = require("child_process");

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec("./codespace/venv/bin/python codespace/tariffB.py " + cmd, (error, stdout, stderr) => {
            if (error) {
                console.log("big error");
                return reject(error);
            }
            if (stderr) {
                console.log("small error");
                // return reject(stderr);
                console.log(stderr);
            }
            resolve(stdout);
        });
    });
}

// usage example
(async () => {
    try {
        console.log("start");
        const result = await run("./uploads/file.csv");
        console.log("result");
    } catch (err) {
        console.log("Error");
        console.log(err);
    }
})();
