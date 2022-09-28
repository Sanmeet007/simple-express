const path = require("path");
const fs = require("fs");
const os = require("os");
const busboy = require("busboy");

class File {
  tempName = null;
  tempLocation = null;
  info = null;
  isOverLimit = false;
  #filesize = 0;
  #uploadsDir;

  constructor(uploadsDir, info, fileStream) {
    this.info = info;
    this.tempName = "[" + Date.now() + "]" + info.filename;
    this.tempLocation = "";
    this.#uploadsDir = uploadsDir;
    const tempDir = os.tmpdir();

    let dataChunks = [];

    fileStream.on("limit", (e) => {
      this.isOverLimit = true;
    });

    fileStream.on("data", (data) => {
      if (!this.isOverLimit) {
        this.#filesize += Buffer.byteLength(data);
        dataChunks.push(data);
      }
    });

    fileStream.on("close", () => {
      if (!this.isOverLimit) {
        const tempFileLocation = tempDir + path.sep + this.tempName;
        fs.writeFileSync(tempFileLocation, Buffer.concat(dataChunks));
        this.tempLocation = tempFileLocation;
      }
    });
  }

  get size() {
    return this.#filesize;
  }

  upload(uploadFolderPath = null, fileName = null) {
    if (this.isOverLimit) {
      console.log("over");
      throw Error("File is over limit");
    }
    if (uploadFolderPath == null) uploadFolderPath = this.#uploadsDir;

    let finalFileName = "";
    try {
      if (fileName != null) {
        finalFileName = fileName;
      } else {
        finalFileName = "[" + Date.now() + "]" + this.info.filename;
      }

      if (!fs.existsSync(uploadFolderPath)) {
        try {
          fs.mkdirSync(uploadFolderPath);
        } catch (e) {
          uploadFolderPath = "uploads";
        }
      }

      const readStream = fs.createReadStream(this.tempLocation);
      const writeStream = fs.createWriteStream(
        uploadFolderPath + path.sep + finalFileName
      );
      readStream.pipe(writeStream).on("close", () => {
        fs.unlinkSync(this.tempLocation);
      });
      return true;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }
}

const XMLParser = (data) => {
  return data;
};

const withoutFileParse = (data, delimiter = "&") => {
  const returnObject = {};
  const reqData = data.toString();
  try {
    reqData
      .split(delimiter)
      .filter((x) => x != "")
      .forEach((d) => {
        const exp = /(?<key>\w+)=(?<value>.*)/gm;
        const result = exp.exec(d);
        const { key, value } = { ...result.groups }; // to prevent the object prototype null error
        returnObject[key] = decodeURIComponent(value.replace(/\+/g, "%20"));
      });

    return returnObject;
  } catch (E) {
    return { data: reqData };
  }
};

const withFileParse = (uploadsDir, req, options = {}) => {
  const returnObject = {};
  const files = {};

  return new Promise((resolver, rejector) => {
    try {
      const bb = busboy({ headers: req.headers, ...options });
      bb.on("file", (name, file, info) => {
        if (info.filename != undefined) {
          if (!files.hasOwnProperty(name)) {
            files[name] = [];
            files[name].push(new File(uploadsDir, info, file));
          } else {
            files[name].push(new File(uploadsDir, info, file));
          }
        } else {
          file.resume();
        }
      });

      bb.on("field", (name, val, _) => {
        returnObject[name] = val;
      });
      bb.on("close", () => {
        req.files = files;
        return resolver(returnObject);
      });
      bb.on("error", (e) => {
        return rejector(e);
      });
      req.pipe(bb);
    } catch (E) {
      return rejector(E);
    }
  });
};

const bodyParser = async (
  req,
  options = {
    uploadsDir: "uploads",
    options: {},
  }
) => {
  return new Promise(async (resolver, rejector) => {
    try {
      if (req.method != "POST") return resolver(null); // suppress other requests

      const contentType = req.headers["content-type"];
      const formEncType = contentType.split(";")[0];
      const returnObject = {};
      if (formEncType == "multipart/form-data") {
        const busboyOptions = options.options;
        const uploadsDir = options.uploadsDir;
        const result = await withFileParse(uploadsDir, req, busboyOptions);
        Object.assign(returnObject, result);
        resolver(returnObject);
      } else if (formEncType == "application/x-www-form-urlencoded") {
        req.on("data", (data) => {
          Object.assign(returnObject, withoutFileParse(data, "&"));
          return resolver(returnObject);
        });
      } else if (formEncType == "text/plain") {
        req.on("data", (data) => {
          Object.assign(returnObject, withoutFileParse(data, "\n"));
          return resolver(returnObject);
        });
      } else if (formEncType == "application/json") {
        req.on("data", (d) => {
          return resolver(JSON.parse(d.toString()));
        });
      } else if (formEncType == "application/xml") {
        req.on("data", (d) => {
          return resolver(XMLParser(d.toString()));
        });
      } else {
        return resolver(null);
      }
    } catch (E) {
      console.log(E);
      return rejector(E);
    }
  });
};

module.exports = bodyParser;
