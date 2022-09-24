import express from "./lib/express.js";

const app = express();
app.setStatic("public");
app.get("/", (req, res) => {
  return res.send("Hello world");
});
app.post("/", (req, res) => {});

app.listen(2000);
