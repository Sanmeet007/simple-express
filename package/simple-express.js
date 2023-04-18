const bodyParser = require("./utils/body-parser.js");
const http = require("http");
const ejs = require("ejs");
const fs = require("fs");
const fsMethods = require("./utils/fs-methods.js");

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
   * @param {object} errorObject
   * @param {object=} errorObject
   * @returns {HTTPResponse}
   *
   *
   */
  error(errorCode, errorObject = null) {}

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
   * @param {String} contents
   * @param {object} params
   * @param {number} statusCode
   * @param {number=200} statusCode
   * @param {object=} headers
   * @returns {ExpressResponse} [Returns rendered string and serves the view]
   *
   */
  render(contents, params, statusCode = 200, headers = {}) {}

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
   *  }, 500);
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
 * @param {Error} error
 * @param {Function} next
 * @returns void
 *
 *
 */

/**
 * @typedef MatchObject
 * @prop {object} params
 * @prop {object} query
 */

class UrlMatcher {
  #params = {};
  #query = {};
  #ismatch = false;

  constructor(
    /** @type {string} */
    req_url,
    /** @type {string} */
    match_url
  ) {
    if (
      req_url === null ||
      req_url === undefined ||
      match_url === undefined ||
      match_url === null
    ) {
      throw Error("Request URL or Match URL can't be empty");
    }
    const url = new URL(req_url.trim(), "https://example.com");
    const query = Object.fromEntries(url.searchParams);
    this.#query = query;

    if (url.pathname.endsWith("/"))
      url.pathname = url.pathname.slice(0, url.pathname.length - 1);

    const matchArray = match_url.trim().split("/");
    const reqArray = url.pathname.split("/");
    const objectArr = [];
    let wasBreak = false;

    if (matchArray.length === reqArray.length) {
      for (let i = 0; i < matchArray.length; i++) {
        if (matchArray[i] !== reqArray[i]) {
          if (matchArray[i].startsWith(":")) {
            const key = matchArray[i].slice(1);
            const value = reqArray[i];
            objectArr.push([key, value]);
          } else {
            this.#ismatch = false;
            wasBreak = true;
            break;
          }
        }
      }
      if (!wasBreak) {
        this.#params = Object.fromEntries(objectArr);
        this.#ismatch = true;
      }
    } else {
      this.#ismatch = false;
    }
  }

  /** @returns  {boolean} */
  isMatch() {
    return this.#ismatch;
  }

  /** @returns {MatchObject} */
  getObject() {
    return {
      params: this.#params,
      query: this.#query,
    };
  }
}

class Uuid {
  static currrentId = 0;
}

class ExpressRouter {
  /**
   * @type  {Array<RequestHandlerObject>}
   * @protected
   */
  _requests = [];

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
    this._requests.push({
      method: "ANY",
      url: "",
      callBack: func,
      id: ++Uuid.currrentId,
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
    this._requests.push({
      method: "POST",
      url: url,
      callBack: func,
      next,
      id: ++Uuid.currrentId,
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
    this._requests.push({
      method: "GET",
      url: url,
      callBack: func,
      next,
      id: ++Uuid.currrentId,
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

    this._requests.push({
      method: method,
      url: url,
      callBack: func,
      next,
      id: ++Uuid.currrentId,
    });
  }
}

class Express extends ExpressRouter {
  #http = http;
  /** @type {HTTPServer} */
  #server = null;

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

  /** @type {DirPath} */
  #uploadDirPath = "uploads";

  /** @type {object} */
  #busboyOptions = {};

  /** @type {boolean} */
  #useTempDir = false;

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
   * Returns the views directory , ejs views will use this for render views.
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
    this._requests.forEach((req) => {
      const toBePushedUrl = `http://${this.host}:${this.port}${req.url}`;
      if (!urlPaths.includes(toBePushedUrl)) {
        urlPaths.push(toBePushedUrl);
      }
    });
    return urlPaths;
  }

  /**
   *
   * Sets the default uploads directory path and adds busboy options if needed
   * @param {DirPath} uploadDirPath
   * @param {Boolean} useTempDir
   * @param {Object} uploadOptions
   */

  uploaderOptions(
    uploadDirPath = "uploads",
    useTempDir = false,
    uploadOptions = {}
  ) {
    this.#useTempDir = useTempDir;
    this.#uploadDirPath = uploadDirPath;
    this.#busboyOptions = uploadOptions;
  }

  /**
   *
   * Creates a new router object. Used for making code modular.
   *
   * @example
   *
   *
   * // api.js
   * import {Router} from "@sanmeet007/simple-express";
   * router.get("/", (req , res) =>{
   *     return res.json({
   *      "message" : "API is working correctly."
   *    });
   * });
   *
   * export default router;
   *
   * // server.js
   *
   * import ApiRoutes from "./api.js";
   * app.register("/api" , ApiRoutes);
   *
   *
   * @param {String} path
   * @param {ExpressRouter} blueprint
   */
  register(
    /** @type {String}*/ path,
    /** @type {ExpressRouter} */
    blueprint
  ) {
    const requests = blueprint._requests.map((x) => {
      if (x.url === "/") x.url = "";
      x.url = path + x.url;
      return x;
    });
    this._requests.push(...requests);
  }

  /**
   *
   * Listens for a particular status error code and fires a callback which has access to the error.
   *
   * @param {ErrorRequestHandler} ErrorHandler
   *
   * Note : When 500 error code is handled then the logger will not longer log error to the console. You need to manually log the error.
   */

  error(
    errorCode,

    /** @type {ErrorRequestHandler} */
    func
  ) {
    this._requests.push({
      method: "ERROR",
      url: "",
      callBack: func,
      id: ++Uuid.currrentId,
      errorCode,
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
    const staticPaths = fsMethods.ls(this.#staticDirPath);
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
          const url = fsMethods.toURLPath(path, this.staticDir);
          this._requests.push({
            method: "GET",
            url,
            callBack: (req, res) => {
              return res.sendFile(path);
            },
            id: ++Uuid.currrentId,
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

    response.error = (errorCode, /** @type {Error?} */ errorObject = null) => {
      try {
        if (errorCode == null || errorCode == undefined) {
          errorCode = 500;
          errorObject = Error("ErrorCode not specified");
        }

        const [req, res] = [request, response];

        response.writeHead(errorCode);
        const errorHandlers = this._requests.filter(
          (ec) => ec.errorCode == errorCode
        );
        if (errorHandlers.length > 0) {
          return errorHandlers[0].callBack(req, res, errorObject);
        } else {
          if (errorObject != null) console.error(errorObject);
        }
        return response.end();
      } catch (E) {
        console.warn(E.message);
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
    response.render = (contents, params, statusCode = 200, headers = {}) => {
      response.statusCode = statusCode;
      response.setHeaders(headers);

      const data = ejs.render(contents, params);
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
      try {
        if (this.#viewsDirPath != null) {
          let path = "";
          if (!filePath) throw Error("Filepath cant be empty");

          if (filePath.slice(-4) != ".ejs") {
            path = this.viewsDir + "/" + filePath + ".ejs";
          } else {
            path = this.viewsDir + "/" + filePath;
          }
          const data = await ejs.renderFile(path, params);

          return response.end(data);
        } else {
          return response.error(500, Error("Views directory not set"));
        }
      } catch (E) {
        return response.error(500, E);
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
      response.writeHead(statusCode, {
        ...headers,
      });
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

        return response.end(JSON.stringify(object, null, 4));
      } catch (E) {
        return response.error(500, E);
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
          const requestHandlers = this._requests.filter(
            (el) => el.method != "ERROR"
          );

          req.body = await bodyParser(req, this.#useTempDir, {
            uploadsDir: this.#uploadDirPath,
            options: this.#busboyOptions,
          });

          this.#addResponseMethods(req, res);

          for (let i = 0; i < requestHandlers.length; i++) {
            const currentRequestHandler = requestHandlers[i];

            const matcherObject = new UrlMatcher(
              req.url,
              currentRequestHandler.url
            );
            const urlMatches = matcherObject.isMatch();
            const matchObjectDetails = matcherObject.getObject();

            req.params = matchObjectDetails.params;
            req.query = matchObjectDetails.query;

            if (
              req.method.toLowerCase() ==
                currentRequestHandler.method.toLowerCase() &&
              urlMatches
            ) {
              if (typeof currentRequestHandler.next == "function") {
                let nextReturnValue;
                const next = async () => {
                  if (
                    currentRequestHandler.next.constructor.name ==
                    "AsyncFunction"
                  ) {
                    nextReturnValue = await currentRequestHandler.next(
                      req,
                      res
                    );
                  } else {
                    nextReturnValue = currentRequestHandler.next(req, res);
                  }
                  return nextReturnValue;
                };

                let handlerReturn = null;
                if (
                  currentRequestHandler.callBack.constructor.name ==
                  "AsyncFunction"
                ) {
                  handlerReturn = await currentRequestHandler.callBack(
                    req,
                    res,
                    next
                  );
                } else {
                  handlerReturn = currentRequestHandler.callBack(
                    req,
                    res,
                    next
                  );
                }

                if (handlerReturn == null) {
                  let nextReturnValue = null;

                  if (
                    currentRequestHandler.next.constructor.name ==
                    "AsyncFunction"
                  ) {
                    nextReturnValue = await currentRequestHandler.next(
                      req,
                      res
                    );
                  } else {
                    nextReturnValue = currentRequestHandler.next(req, res);
                  }

                  if (nextReturnValue != null) {
                    return nextReturnValue;
                  } else {
                    throw Error("Next didn't end the reponse");
                  }
                } else {
                  return handlerReturn;
                }
              } else {
                let returnValue = null;
                if (
                  currentRequestHandler.callBack.constructor.name ==
                  "AsyncFunction"
                ) {
                  returnValue = await currentRequestHandler.callBack(req, res);
                } else {
                  returnValue = currentRequestHandler.callBack(req, res);
                }
                return returnValue;
              }
            } else {
              if (currentRequestHandler.method == "ANY") {
                let wasNextCalled = false;
                const next = () => {
                  wasNextCalled = true;
                  return;
                };

                let handlerReturn = null;
                if (
                  currentRequestHandler.callBack.constructor.name ==
                  "AsyncFunction"
                ) {
                  handlerReturn = await currentRequestHandler.callBack(
                    req,
                    res,
                    next
                  );
                } else {
                  handlerReturn = currentRequestHandler.callBack(
                    req,
                    res,
                    next
                  );
                }

                if (wasNextCalled) continue;
                if (handlerReturn != null) return;
              }
            }
          }

          if (req.method.toLowerCase() == "get") {
            return res.error(404);
          } else {
            return res.error(501);
          }
        } catch (E) {
          return res.error(500, E);
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

  listen(port = 3000, host = null, cb = null) {
    try {
      this.#createServerAndHandleRequests();
      return this.#server.listen(port, host, (e) => {
        this.#port = port;
        this.#dhost = host;
        if (typeof port != "number") throw Error("Invalid port number");
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
module.exports.Router = ExpressRouter;
