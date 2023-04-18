import express from "@sanmeet007/simple-express";
import ApiRoutes from "./routes/api.js";
import HomeRoutes from "./routes/home.js";

const app = express();

app.setStatic("public"); // setting public dir
app.setViewsDir("views"); // setting views dir
app.uploaderOptions("uploads", false, {
  limits: {
    fileSize: 1 * 1024 * 1024, // limiting file with size over 1 MB
  },
});

// Handling Normal Routes
app.register("/", HomeRoutes);
app.register("/api", ApiRoutes);

// Handling Error Routes
app.error(404, (_, res) => {
  return res.sendFile("public/errors/404.html");
});

app.error(500, (_, res, e) => {
  console.log(e);
  return res.sendFile("public/errors/500.html");
});

app.error(501, (_, res) => {
  return res.sendFile("public/errors/501.html");
});

app.listen(2000); // Listening for requests
