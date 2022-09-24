import express from "./lib/express.js";

const app = express();
app.setStatic("public");
app.setViewsDir("views");

app.get("/", (req, res) => {
  return res.renderFile("index", {
    tool: "EJS",
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
