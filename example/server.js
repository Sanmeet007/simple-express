import express from "@sanmeet007/simple-express";

const app = express();

app.setStatic("public"); // setting public dir
app.setViewsDir("views"); // setting views dir
app.uploaderOptions("uploads", false, {
  limits: {
    fileSize: 1 * 1024 * 1024, // limiting file with size over 1 MB
  },
});

app.get("/", (req, res) => {
  if (req.query) console.log("GET data : ", req.query); // wildcard urls
  return res.sendFile("public/index.html");
});

app.route("/user", "GET", (req, res) => {
  return res.json({
    id: 0,
    isAdmin: true,
    data: "...",
  }); // sending a json response
});

app.get("/:id", (req, res, next) => {
  const id = req.params.id;
  if (!isNaN(id)) {
    return res.renderFile("index", {
      tool: "EJS",
      string: id,
    });
  }
  return res.error(404);
});

app.post("/", (req, res) => {
  if (req.files != null && req.files.hasOwnProperty("file")) {
    req.files["file"].forEach((file) => {
      if (!file.isOverLimit) {
        file.upload();
      } else {
        console.log("File over limit");
      }
    });
  }

  if (req.body != null) {
    console.log(req.body);
  }

  return res.redirect("/");
});

app.error(404, (_, res) => {
  return res.sendFile("public/errors/404.html");
});

app.error(500, (_, res) => {
  return res.sendFile("public/errors/500.html");
});

app.error(501, (_, res) => {
  return res.sendFile("public/errors/501.html");
});

app.listen(2000, "localhost", (e) => {
  console.log("Simple express rocks !");
}); // Listening for requests
