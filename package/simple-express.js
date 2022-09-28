const bodyParser = require("./utils/body-parser.js");
const http = require("http");
const ejs = require("ejs");
const fs = require("fs");

class RequestHandlerObject {
  /** @type {Number}*/
  id;

  /** @type {String}*/
  url;

  /** @type {String}*/
  method;

  /** @type {Function}*/
  callBack;

  /** @type {Function}*/
  next;

  /** @type {Number}*/
  errorCode;
}

class ExpressResponse extends http.ServerResponse {
  /**
   * Set headers
   *
   * @example
   *
   * res.setHeaders({
   *  "Content-Type" : "application/json"
   * })
   *
   * @param {object} headers [Adds the object passed as arg to the header object]
   * @returns void
   */
  setHeaders(headers) {}

  /**
   *
   * Ends the sever response with error. The error response is handled with the error code passed as arg.
   *
   * @example
   *
   * app.error(404, (_, res) => {
   *   return res.sendFile("public/index.html", 404);
   * });
   *
   *
   * @param {number} errorCode
   * @returns {HTTPResponse}
   *
   * `NOTE` : You need to edit the response given by the sendFile or send or render etc
   *
   */
  error(errorCode) {}

  /**
   *
   * Renders the string using ejs and finally returns the HTTPResponse
   *
   * @example
   *
   * app.get("/", (req, res) => {
   *   return res.render("<h1> ID : <%= id %> </h1>"{
   *    id : 7
   *   }); // params
   * });
   *
   * @param {String} fileContents
   * @param {object} params
   * @param {number} statusCode
   * @param {number=200} statusCode
   * @param {object=} headers
   * @returns {ExpressResponse} [Returns rendered string and serves the view]
   *
   * `NOTE` : It will stop the server if encounters any errors commited by the dev .. Unhandled to prevent any looping.
   */
  render(fileContents, params, statusCode = 200, headers = {}) {}

  /**
   *
   * Renders the string using ejs and finally returns the HTTPResponse
   *
   * @example
   *
   * app.get("/", (req, res) => {
   *   return res.renderFile("index", {
   *    key : "..."
   *   }); // params
   * });
   *
   * @param {FilePath} filePath
   * @param {object} params
   * @param {number} statusCode
   * @param {number=200} statusCode
   * @param {object} headers
   * @returns {ExpressResponse} [Renders the whole view and returns the response]
   *
   *`NOTE` : It will stop the server if encounters any errors commited by the dev .. Unhandled to prevent any looping.
   */
  async renderFile(filePath, params = {}, statusCode = 200, headers = {}) {}

  /**
   * @param {URL} url
   * @param {number} redirectCode
   * @param {number=302} redirectCode
   * @returns {ExpressResponse}
   */
  redirect(url, redirectCode = 302) {}

  /**
     *
     * Sends the whole file
     *
     * @example
     *
     * app.get("/", (req, res) => {
     *   return res.sendFile("public/index.html");
     * });

     * @param {FilePath} filePath
     * @param {number} statusCode
     * @param {number=200} statusCode
     * @param {object} headers
     * @returns {HTTPResponse} Sends the file
     *
     *`NOTE` : It will stop the server if encounters any errors commited by the dev .. Unhandled to prevent any looping.
     */
  sendFile(filePath, statusCode = 200, headers = {}) {}

  /**
     *
     * Sends the whole file
     *
     * @example
     *
     * app.get("/", (req, res) => {
     *   return res.send("public/index.html");
     * });

     * @param {String} contents
     * @param {number} statusCode
     * @param {number=200} statusCode
     * @param {object} headers
     * @param {object=} headers
       * @returns {ExpressResponse} [Sends the file ]
       *
       *`NOTE` : It will stop the server if encounters any errors commited by the dev .. Unhandled to prevent any looping.
       */
  send(
    contents,
    statusCode = 200,
    headers = {
      "Content-Type": "text/html",
    }
  ) {}

  /**
   * Returns JSON response
   *
   * @example
   *
   * app.error(505, (_, res) => {
   *  return res.json({
   *    "error" : "true"
   *    "message" : "internal server error"
   *  }, 505);
   * });
   *
   * @param {object} object
   * @param {number} statusCode
   * @param {number=200} statusCode
   * @param {object} optionalHeaders
   * @param {object=} optionalHeaders
   * @returns {ExpressResponse} Returns JSON response
   */
  json(object, statusCode = 200) {}
}

class ExpressRequest extends http.IncomingMessage {
  /** @type {object} */
  body;

  /** @type {object}*/
  query;

  /** @type {object}*/
  params;

  /** @type {object}*/
  files;
}

/**
 * A number, or a string containing a number.
 *
 * @typedef {http.Server} HTTPServer
 * @typedef {String} URLPrefix
 * @typedef {String} RequestMethod
 * @typedef {String} DirPath
 * @typedef {String} URLPath
 * @typedef {String} StaticPath
 * @typedef {String} FilePath
 * @typedef {Number} PortNumber
 * @typedef {http.IncomingMessage} HTTPRequest
 * @typedef {http.ServerResponse} HTTPResponse
 *
 *
 *
 * @callback NextHandler
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * @returns void
 *
 * @callback RequestHandler
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * @param {Function} next
 * @returns void
 *
 *
 * @callback ErrorRequestHandler
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * @param {Function} next
 * @returns void
 *
 *
 */

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

/**
 *
 * @param {HTTPRequest} Request [Client request]
 * @param {RequestHandlerObject} RequestHandlerObject [Client request matcher]
 * @returns {Boolean} [returns true if the req.url == math.url]
 */
const wildCardCheck = (
  /**@type {HTTPRequest} */ req,
  /**@type {RequestHandlerObject} */ match
) => {
  const req_url = req.url;
  const match_url = match.url;
  try {
    const path = req_url.split("/").filter((x) => x != "");
    const last_path = path[path.length - 1];
    if (last_path[0] == "?") {
      const real_path = req_url.replace(last_path, "");
      if (real_path == match_url) {
        const url = new URL("http://example.com/" + last_path);

        req.query = Object.fromEntries(url.searchParams);

        return true;
      }
    }
    return false;
  } catch (_) {
    return false;
  }
};

/**
 *
 * @param {HTTPRequest} Request [Client request]
 * @param {RequestHandlerObject} RequestHandlerObject [Client request matcher]
 * @returns {Boolean} [returns true if the req.url == math.url]
 */
const matchURL = (
  /** @type {HTTPRequest} */ req,
  /**  @type {RequestHandlerObject}*/ match
) => {
  const req_url = req.url;
  const match_url = match.url;

  if (req_url == match_url) {
    return true;
  } else if (wildCardCheck(req, match)) {
    return true;
  } else {
    if (match_url.includes(":")) {
      try {
        let m;
        const final_object = {};
        const req_result = req_url
          .split("/")
          .filter((x) => x != "")
          .map((x) => decodeURIComponent(x));

        const match_exp = /\/:(?<p>\w+)/gm;
        const match_result = [];
        while ((m = match_exp.exec(match_url))) {
          match_result.push(m.groups.p);
        }

        if (match_result.length == req_result.length) {
          match_result.forEach((k, i) => (final_object[k] = req_result[i]));
          req.params = {};
          Object.assign(req.params, final_object);
          return true;
        }
      } catch (E) {
        return false;
      }
    }
    return false;
  }
};

class Express {
  #http = http;
  /** @type {HTTPServer} */
  #server = null;

  /** @type {Array<RequestHandlerObject>} */
  #requests = [];

  /**@type {Number} */
  #registerId = 0;

  /**@type {PortNumber} */
  #port = 3000;

  /** @type {DirPath} */
  #staticDirPath = null;

  /** @type {Array<StaticPath>}  */
  #staticPaths = [];

  /** @type {String} */
  #dhost = "localhost";

  /** @type {DirPath} */
  #viewsDirPath = "views";

  /**
   * Sets or Returns the port number for Express server.
   * @type {PortNumber}
   */
  get port() {
    return this.#port;
  }

  /**
   * Sets or Returns the port number for Express server.
   */
  get host() {
    return this.#dhost;
  }

  set port(val) {
    this.#port = val;
  }

  /**
   * Returns the directory , used for serving the staic files.
   */
  get staticDir() {
    return this.#staticDirPath;
  }

  /**
   * Returns all possible static paths ... Extracts all paths from the static directory provided by the user
   */
  get staticFiles() {
    return this.#staticPaths;
  }

  /**
   * Returns all possible static url paths ... Extracts all paths from the static directory provided by the user
   */
  get staticFilesURL() {
    const dir = this.#staticDirPath;

    const urls = this.#staticPaths.map((path) => {
      path = path.replace(dir, "");
      path = `http://:${this.host}${this.port}${path}`;
      return path;
    });
    return urls;
  }

  /**
   * Returns the views directory , ejs views will this for render views.
   */
  get viewsDir() {
    return this.#viewsDirPath;
  }

  /**
   * Maps and returns all the possible routes excluding the wildcard urls.
   */
  get urls() {
    /** @type {Array<URLPath>} */
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

  /**
   *
   * Acts as middleware , can listen to requests or end reponses based on user needs .
   *
   * @example
   *
   * app.use(async (req, res, next) => {
   *    const isAdmin = await Authenticate(req.body.user);
   *    if(!isAdmin) return res.error(403);
   * });
   *
   * app.get("/admin" , ...)
   *
   *
   *
   * @param {RequestHandler} MiddleWareFunction
   */
  use(
    /** @type {RequestHandler} */
    func
  ) {
    this.#requests.push({
      method: "ANY",
      url: "",
      callBack: func,
      id: this.#registerId++,
    });
  }

  error(
    errorCode,

    /** @type {ErrorRequestHandler} */
    func
  ) {
    this.#requests.push({
      method: "ERROR",
      url: "",
      callBack: func,
      id: this.#registerId++,
      errorCode,
    });
  }

  /**
   * Handles Incoming GET request
   * 
   * @example 
   * app.get("/", (req, res) => {
   *  return res.send("Hello world"); // Ends the response
   * });
   *
   * @param  {String} URLPrefix [matches the url prefix with all other corresponding methods]
   * @param  {Function} RequestHandler [Handles the request or Acts as middleware which can be used by next()]
   * @param {Function} Function  [Handles the request from middleware. Must return a response]
   * @return {HTTPResponse} [Returns valid HTTP response ]
   *

   */

  get(
    /** @type {URLPrefix} */ url,
    /** @type {RequestHandler}*/ func,
    /** @type {NextHandler} */ next = null
  ) {
    this.#requests.push({
      method: "GET",
      url: url,
      callBack: func,
      next,
      id: this.#registerId++,
    });
  }

  /**
   * Handles Incoming POST request
   *
   * @example
   * app.post("/", (req, res) => {
   *  return res.json( {
   *    "framework" : "express"
   *  }); // Sends JSON reponse
   * });
   *
   * @param  {String} URLPrefix [matches the url prefix with all other corresponding methods]
   * @param  {Function} RequestHandler [Handles the request or Acts as middleware which can be used by next()]
   * @param {Function} Function  [Handles the request from middleware. Must return a response]
   * @return {HTTPResponse} [Returns valid HTTP response ]
   *
   */

  post(
    /** @type {URLPrefix} */ url,
    /** @type {RequestHandler} */ func,
    /** @type {NextHandler} */ next = null
  ) {
    this.#requests.push({
      method: "POST",
      url: url,
      callBack: func,
      next,
      id: this.#registerId++,
    });
  }

  /**
   * Handles Incoming POST request
   *
   * @example
   * app.post("/", (req, res) => {
   *  return res.json( {
   *    "framework" : "express"
   *  }); // Sends JSON reponse
   * });
   *
   * @param  {String} URLPrefix [matches the url prefix with all other corresponding methods]
   * @param  {Function} RequestHandler [Handles the request or Acts as middleware which can be used by next()]
   * @param {(Function|null)} NextHandler  [Handles the request from middleware. Must return a response]
   * @return {HTTPResponse} [Returns valid HTTP response ]
   *
   */

  route(
    /** @type {URLPrefix} */ url,
    /** @type {RequestMethod} */ method,
    /** @type {RequestHandler} */ func,
    /** @type {NextHandler} */ next = null
  ) {
    if (method == "ANY") throw Error("Method not allowed");

    this.#requests.push({
      method: method,
      url: url,
      callBack: func,
      next,
      id: this.#registerId++,
    });
  }

  /**
   * Sets the view dir path from which ejs renders the views
   * @param {DirPath} dirPath
   */
  setViewsDir(dirPath) {
    this.#viewsDirPath = dirPath;
  }

  #addStaticPaths() {
    const staticPaths = ls(this.#staticDirPath);
    this.#staticPaths = staticPaths;
    return staticPaths;
  }

  /**
   * Sets the public or static dir path from which all the static files will be served
   * @param {DirPath} staticDirPath
   */
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

  #addResponseMethods(
    /** @type {HTTPRequest} */ request,
    /** @type {HTTPResponse} */ response
  ) {
    response.setHeaders = (headers) => {
      Object.entries(headers).forEach(([k, v]) => {
        response.setHeader(k, v);
      });
    };

    response.error = (errorCode) => {
      try {
        const [req, res] = [request, response];

        response.writeHead(errorCode);
        const errorHandlers = this.#requests.filter(
          (ec) => ec.errorCode == errorCode
        );
        if (errorHandlers.length > 0) {
          return errorHandlers[0].callBack(req, res);
        }
        return response.end();
      } catch (E) {
        console.warn(E);
        response.writeHead(500);
        return response.end();
      }
    };

    response.redirect = (url, redirectCode = 302) => {
      response.writeHead(redirectCode, {
        Location: url,
      });
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
      params = {},
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
      response.setHeaders(headers);
      return response.end(string);
    };

    /**
     * Returns JSON response
     *
     * @param {object} object
     * @returns {ExpressResponse}
     */
    response.json = (object, statusCode = 200, optionalHeaders = {}) => {
      try {
        response.writeHead(statusCode, {
          headers: {
            "Content-Type": "application/json",
            ...optionalHeaders,
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
    this.#server = this.#http.createServer(
      async (
        /** @type {ExpressRequest} */ req,
        /** @type {ExpressResponse} */ res
      ) => {
        try {
          const requestHandlers = this.#requests.filter(
            (el) => el.method != "ERROR"
          );
          req.body = await bodyParser(req);
          this.#addResponseMethods(req, res);

          for (let i = 0; i < requestHandlers.length; i++) {
            const currentRequestHandler = requestHandlers[i];
            const urlMatches = matchURL(req, currentRequestHandler);
            if (
              req.method.toLowerCase() ==
                currentRequestHandler.method.toLowerCase() &&
              urlMatches
            ) {
              if (typeof currentRequestHandler.next == "function") {
                let nextReturnValue;
                const next = () => {
                  nextReturnValue = currentRequestHandler.next(req, res);
                  return nextReturnValue;
                };

                const handlerReturn = currentRequestHandler.callBack(
                  req,
                  res,
                  next
                );

                if (handlerReturn == null) {
                  const nextReturnValue = currentRequestHandler.next(req, res);

                  if (nextReturnValue != null) {
                    return nextReturnValue;
                  } else {
                    console.log("Next didn't end response");
                    return res.end("");
                  }
                } else {
                  return handlerReturn;
                }
              } else {
                return currentRequestHandler.callBack(req, res);
              }
            } else {
              if (currentRequestHandler.method == "ANY") {
                let wasNextCalled = false;
                const next = () => {
                  wasNextCalled = true;
                  return;
                };

                const handlerReturn = currentRequestHandler.callBack(
                  req,
                  res,
                  next
                );

                if (wasNextCalled) continue;
                if (handlerReturn != null) return;
              }
            }
          }
          res.writeHead(404, "Page not found");
          return res.end();
        } catch (E) {
          return res.error(500);
        }
      }
    );
  }

  /**
   * @param {PortNumber} port
   * @param {string} host
   * @param {Function} callBack
   * @returns {http.Server} HTTPServer [Returns http.server]
   * Listen for connections.
   *
   * A node `http.Server` is returned, with this
   * application (which is a `Function`) as its
   * callback. This listen for the requests and reponses for the same.
   */

  listen(port = 3000, host = "localhost", cb = null) {
    try {
      this.#createServerAndHandleRequests();
      return this.#server.listen(port, host, (e) => {
        this.#port = port;
        this.#dhost = host;
        if (typeof port != "number") throw Error("Invalid port number");
        console.log(`Server started at : http://${this.host}:${this.port}`);
        if (typeof cb == "function") cb(e);
      });
    } catch (E) {
      console.log(E);
    }
  }
}
const express = () => {
  return new Express();
};

module.exports = express;
