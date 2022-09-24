import http from "http";
import fs from "fs";

const ls = (staticDirectoryPath) => {
  const staticPaths = [];
  const listPaths = (dirPath) => {
    const dirs = fs.readdirSync(dirPath);
    dirs.forEach((path) => {
      const current_path = dirPath + "/" + path;
      const lst = fs.lstatSync(current_path);
      if (lst.isDirectory()) {
        listPaths(current_path);
      } else {
        staticPaths.push(current_path);
      }
    });
  };

  listPaths(staticDirectoryPath);
  return staticPaths;
};

const toURLPath = (path, dirPath) => {
  path = path.replace(dirPath, "");
  return path;
};

class Express {
  #http = http;
  #server = null;
  #requests = [];
  #registerId = 0;
  #port = 3000;
  #staticDirPath = null;
  #staticPaths = [];
  host = "localhost";

  get port() {
    return this.#port;
  }
  set port(val) {
    this.#port = val;
  }
  get staticDir() {
    return this.#staticDirPath;
  }

  get staticFiles() {
    return this.#staticPaths;
  }
  get staticFilesURL() {
    const dir = this.#staticDirPath;

    const urls = this.#staticPaths.map((path) => {
      path = path.replace(dir, "");
      path = `http://:${this.host}${this.port}${path}`;
      return path;
    });
    return urls;
  }

  get urls() {
    const urlPaths = [];
    urlPaths.concat(this.staticFilesURL);
    this.#requests.forEach((req) => {
      const toBePushedUrl = `http://${this.host}:${this.port}${req.url}`;
      if (!urlPaths.includes(toBePushedUrl)) {
        urlPaths.push(toBePushedUrl);
      }
    });
    return urlPaths;
  }
  use(func) {
    this.#requests.push({
      type: "ANY",
      method: func,
      id: this.#registerId++,
    });
  }
  //   Handles the get request methods
  get(url, func) {
    this.#requests.push({
      method: "GET",
      url: url,
      callBack: func,
      id: this.#registerId++,
    });
  }

  //   Handles the post request methods
  post(url, func) {
    this.#requests.push({
      method: "POST",
      url: url,
      callBack: func,
      id: this.#registerId++,
    });
  }

  #addStaticPaths() {
    const staticPaths = ls(this.#staticDirPath);
    this.#staticPaths = staticPaths;
    return staticPaths;
  }

  setStatic(staticDirPath) {
    this.#staticDirPath = staticDirPath;

    const paths = this.#addStaticPaths();
    try {
      if (paths.length > 0) {
        paths.forEach((path) => {
          const url = toURLPath(path, this.staticDir);
          this.#requests.push({
            method: "GET",
            url,
            callBack: (req, res) => {
              return res.sendFile(path);
            },
            id: this.#registerId++,
          });
        });
      }
    } catch (e) {
      console.warn("Unable to set directory");
      console.log(e);
    }
  }
  #addResponseMethods(response) {
    response.setHeaders = (headers) => {
      Object.entries(headers).forEach(([k, v]) => {
        response.setHeader(k, v);
      });
    };
    response.sendFile = (filePath) => {
      try {
        const data = fs.readFileSync(filePath, (err, data) => {
          return data;
        });
        response.writeHead(200);
        return response.end(data);
      } catch (E) {
        console.log(E);
        response.writeHead(404, "File not found");
        return response.end("File not found on server ");
      }
    };
    response.send = (string, options = {}, statusCode = 200) => {
      if (options.html == true) {
        response.setHeader("Content-Type", "text/html");
      } else {
        response.setHeader("Content-Type", "text/plain");
      }
      response.statusCode = statusCode;
      response.end(string);
    };
    response.json = (object) => {
      try {
        response.writeHead(200, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        return response.end(JSON.stringify(object));
      } catch (E) {
        console.log(E);
        response.writeHead(500, "Internal server Error");
        return response.end();
      }
    };
  }
  #createServerAndHandleRequests() {
    this.#server = this.#http.createServer((req, res) => {
      const requestHandlers = this.#requests.filter(
        (el) => el.url == req.url && el.method == req.method
      );
      const handlersLength = requestHandlers.length;
      if (handlersLength > 0) {
        const requesthandler = requestHandlers[handlersLength - 1];
        this.#addResponseMethods(res);
        return requesthandler.callBack(req, res);
      } else {
        res.writeHead(404, "Page not found");
        return res.end();
      }
    });
    this.#server;
  }
  // Starts the server
  listen(port = 3000, cb = null) {
    this.#createServerAndHandleRequests();
    this.#server.listen(port, () => {
      this.#port = port;
      if (typeof port != "number") throw Error("Invalid port number");
      console.log(`Server started : http://localhost:${port}`);
      if (typeof cb == "function") cb();
    });
  }
}
const express = () => {
  return new Express();
};

export default express;
