import { Router } from "@sanmeet007/simple-express";

const router = new Router();

const books = [
  {
    id: 1,
    author: "Chinua Achebe",
    country: "Nigeria",
    imageLink: "images/things-fall-apart.jpg",
    language: "English",
    link: "https://en.wikipedia.org/wiki/Things_Fall_Apart\n",
    pages: 209,
    title: "Things Fall Apart",
    year: 1958,
  },
  {
    id: 2,
    author: "Hans Christian Andersen",
    country: "Denmark",
    imageLink: "images/fairy-tales.jpg",
    language: "Danish",
    link: "https://en.wikipedia.org/wiki/Fairy_Tales_Told_for_Children._First_Collection.\n",
    pages: 784,
    title: "Fairy tales",
    year: 1836,
  },
  {
    id: 3,
    author: "Dante Alighieri",
    country: "Italy",
    imageLink: "images/the-divine-comedy.jpg",
    language: "Italian",
    link: "https://en.wikipedia.org/wiki/Divine_Comedy\n",
    pages: 928,
    title: "The Divine Comedy",
    year: 1315,
  },
];

router.get("/", (_, res) => {
  return res.error(501);
});

router.get("/books", (_, res) => {
  return res.json(books);
});

router.get("/books/:book_id", (req, res) => {
  const id = parseInt(req.params.book_id);
  if (!isNaN(id)) {
    const bookIndex = books.map((x) => x.id).indexOf(id);
    if (bookIndex >= 0) {
      return res.json(books[bookIndex]);
    } else return res.error(404);
  }
  return res.error(404);
});

export default router;
