import express from "./lib/express.js";

const app = express();
app.setStatic("public");
app.setViewsDir("views");

app.get("/", (req, res) => {
  if (req.query) console.log("GET data : ", req.query);

  return res.renderFile("index", {
    tool: "EJS",
    string: "",
  });
});

app.get("/:string", (req, res) => {
  const string = req.params.string;
  return res.renderFile("index", {
    tool: "EJS",
    string,
  });
});

app.post("/", async (req, res) => {
  req.files["file"].forEach((file) => {
    file.upload();
  });
  console.log(req.body);
  return res.redirect("/");
});

app.error(404, (_, res) => {
  return res.sendFile("public/404.html");
});

app.listen(2000);
