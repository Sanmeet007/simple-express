import http from "http";
import fs from "fs";
import ejs from "ejs";

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
  #viewsDirPath = "views";

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
  get viewsDir() {
    return this.#viewsDirPath;
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
      method: "ANY",
      url: "",
      callBack: func,
      id: this.#registerId++,
    });
  }

  error(errorCode, func) {
    this.#requests.push({
      method: "ERROR",
      url: "",
      callBack: func,
      id: this.#registerId++,
      errorCode,
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

  setViewsDir(dirPath) {
    this.#viewsDirPath = dirPath;
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

  #addResponseMethods(request, response) {
    response.setHeaders = (headers) => {
      Object.entries(headers).forEach(([k, v]) => {
        response.setHeader(k, v);
      });
    };

    response.error = (errorCode) => {
      const [req, res] = [request, response];

      response.writeHead(errorCode);
      const errorHandlers = this.#requests.filter(
        (ec) => ec.errorCode == errorCode
      );
      if (errorHandlers.length > 0) {
        return errorHandlers[0].callBack(req, res);
      }
      return response.end();
    };

    // It will stop the server if encounters any errors commited by the dev .. Unhandled to prevent any looping
    response.render = (
      fileContents,
      params,
      statusCode = 200,
      headers = {}
    ) => {
      response.statusCode = statusCode;
      response.setHeaders(headers);

      const data = ejs.render(fileContents, params);
      return response.end(data);
    };

    response.renderFile = async (
      filePath,
      params,
      statusCode = 200,
      headers = {}
    ) => {
      response.statusCode = statusCode;
      response.setHeaders(headers);

      if (this.#viewsDirPath != null) {
        let path = "";

        if (filePath.slice(-4) != ".ejs") {
          path = this.viewsDir + "/" + filePath + ".ejs";
        } else {
          path = this.viewsDir + "/" + filePath;
        }

        const data = await ejs.renderFile(path, params);
        return response.end(data);
      } else {
        throw Error("Views directory not set");
      }
    };

    // It will stop the server if encounters any errors commited by the dev .. Unhandled to prevent any looping
    response.sendFile = (filePath, statusCode = 200, headers = {}) => {
      response.statusCode = statusCode;
      response.setHeaders(headers);

      const data = fs.readFileSync(filePath, (err, data) => {
        return data;
      });
      return response.end(data);
    };

    response.send = (
      string,
      statusCode = 200,
      headers = {
        "Content-Type": "text/html",
      }
    ) => {
      response.statusCode = statusCode;
      response.setHeader(headers);
      return response.end(string);
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
        return response.error(500);
      }
    };
  }
  #createServerAndHandleRequests() {
    this.#server = this.#http.createServer((req, res) => {
      const requestHandlers = this.#requests.filter(
        (el) => el.method != "ERROR"
      );

      this.#addResponseMethods(req, res);

      for (let i = 0; i < requestHandlers.length; i++) {
        const currentRequestHandler = requestHandlers[i];
        if (
          req.method == currentRequestHandler.method &&
          req.url == currentRequestHandler.url
        ) {
          return currentRequestHandler.callBack(req, res);
        } else {
          if (currentRequestHandler.method == "ANY") {
            if (currentRequestHandler.callBack(req, res) != undefined) return;
          }
        }
      }
      res.writeHead(404, "Page not found");
      return res.end();
    });
    this.#server;
  }
  // Starts the server
  listen(port = 3000, cb = null) {
    try {
      this.#createServerAndHandleRequests();
      this.#server.listen(port, () => {
        this.#port = port;
        if (typeof port != "number") throw Error("Invalid port number");
        console.log(`Server started at : http://localhost:${port}`);
        if (typeof cb == "function") cb();
      });
    } catch (E) {
      console.log(E);
    }
  }
}
const express = () => {
  return new Express();
};

export default express;
