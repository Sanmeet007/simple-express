import { Router } from "@sanmeet007/simple-express";

const router = new Router();

router.post("/", (req, res) => {
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

router.get("/", (req, res) => {
  return res.sendFile("public/index.html");
});

router.get("/test", (req, res) => {
  // Example :  http://localhost:2000/test/?q=Hello%20World

  const query = req.query.q;
  return res.renderFile("index.ejs", {
    q: query ?? "",
  });
});

export default router;
