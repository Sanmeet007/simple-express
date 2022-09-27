import express from "@sanmeet007/simple-express";

const app = express();

app.setStatic("public"); // setting public dir
app.setViewsDir("views"); // setting views dir

// Now server supports only get and posts requests
app.use((req, res, next) => {
  if (req.method != "GET" && req.method != "POST") return res.error(501);
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
      file.upload();
    });
  }

  if (req.body != null) {
    console.log(req.body);
  }

  return res.redirect("/");
});

app.error(404, (_, res) => {
  return res.sendFile("public/errors/404.html", 404);
});

app.error(500, (_, res) => {
  return res.sendFile("public/errors/500.html", 500);
});

app.error(501, (_, res) => {
  return res.sendFile("public/errors/501.html", 500);
});

app.listen(2000, "localhost", (e) => {
  console.log("Simple express rocks !");
}); // Listening for requests
