// TODO implement the files

import express from "./lib/express.js";

const app = express();
app.setStatic("public");
app.setViewsDir("views");

app.get("/", (req, res) => {
  console.log(req.query);
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
  const data = await req.body;
  console.log(data);
  return res.json({
    success: true,
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
