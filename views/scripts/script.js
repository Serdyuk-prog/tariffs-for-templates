const form = document.querySelector("#form");
const submitBtn = document.querySelector("#submit");
const loader = document.querySelector(".loader");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    submitBtn.classList.add = "disabled";
    submitBtn.disabled = true;
    submitBtn.innerText = "Wait";
    loader.hidden = false;

    fetch(form.action, {
        method: "post",
        body: formData,
    })
        .then((resp) => {
            return resp.blob();
        })
        .then((data) => {
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(data);
            a.download = "result";
            a.click();
            submitBtn.classList.remove("disabled");
            submitBtn.disabled = false;
            loader.hidden = true;
            submitBtn.innerText = "Submit";
        })
        .catch((err) => {
            console.error(err);
        });
});
