import express from "./lib/express.js";

const app = express();
app.port;
app.setStatic("public");
app.setViewsDir("views");

app.get("/", (req, res) => {
  if (req.query) console.log("GET data : ", req.query);
  return res.renderFile("index", {
    tool: "EJS",
    string: "",
  });
});

app.get("/:string", (req, res, next) => {
  const string = req.params.string;
  return res.renderFile("index", {
    tool: "EJS",
    string,
  });
});

app.post("/", (req, res) => {
  if (req.files.hasOwnProperty("file")) {
    req.files["file"].forEach((file) => {
      file.upload();
    });
  } else {
    console.log("No files were attached");
  }
  if (req.hasOwnProperty("body")) {
    console.log(req.body);
  }

  return res.redirect("/");
});

app.use((req, res, next) => {});

app.route("/", "PUT", (req, res) => {
  console.log("PUT request encountered");
  return res.send("Method not implemented", {}, 501);
});

app.error(404, (_, res) => {
  return res.sendFile("public/index.html", 404);
});

app.listen(2000);
