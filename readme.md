# Simple-Express

#### Simple , clean , minimalist web framework for Node.js.

```javascript
import express from "simple-express";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000);
```

The Simple-Express's idealogy is to provide small, beginner friendly , robust tooling in HTTP servers, making it a great solution for single page applications, websites, hybrids, or public HTTP APIs. Can be used for :

- `Web Applications` :
  Simple-Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- `APIs` :
  With a myriad of HTTP utility methods and middleware at your disposal, creating a robust API is quick and easy.
- `Supports Node.js` :
  Express provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love.

### Express vs Simple-Express

- Beginner Friendly
- Simple and clean
- Preinstalled body parsers
- Preinstalled file extractor
- Clean implementation of middlewares
- Uses EJS for rendering views

### Dependencies

- `busboy` : For extracting files from the request
- `ejs` : For rendering different views
