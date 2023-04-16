import { Router } from "@sanmeet007/simple-express";

const router = new Router();

router.get("/", (req, res) => {
  return res.json({});
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  if (!isNaN(id)) {
    return res.renderFile("index", {
      tool: "EJS",
      string: id,
    });
  }
  return res.error(404);
});

export default router;
