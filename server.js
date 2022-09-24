// TODO implement the famous parser for requests and files ... Also implement the :id thing

import express from "./lib/express.js";

const app = express();
app.setStatic("public");
app.setViewsDir("views");

app.get("/", (req, res) => {
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

app.post("/", (req, res) => {
  return res.json({
    id: "1",
    user: "admin",
  });
});

app.use((req, res) => {
  if (req.method != "POST" && req.method != "GET") return res.error(501);
  else return res.error(404);
});

app.error(404, (_, res) => {
  return res.sendFile("public/404.html");
});

app.listen(2000);
