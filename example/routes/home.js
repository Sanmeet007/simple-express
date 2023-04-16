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
  if (req.query) console.log("GET data : ", req.query); // wildcard urls
  return res.sendFile("public/index.html");
});

export default router;
