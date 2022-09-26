import busboy from "busboy";
import fs from "fs";
import os from "os";
import path from "path";

class File {
  type = null;
  tempName = null;
  tempLocation = null;
  info = null;

  constructor(fileName, info, fileStream) {
    this.type = fileName;
    this.info = info;
    this.tempName = "[" + Date.now() + "]" + info.filename;
    this.tempLocation = "";
    const tempDir = os.tmpdir();

    let dataChunks = [];

    fileStream.on("data", (data) => {
      dataChunks.push(data);
    });

    fileStream.on("close", () => {
      const tempFileLocation = tempDir + path.sep + this.tempName;
      fs.writeFileSync(tempFileLocation, Buffer.concat(dataChunks));
      this.tempLocation = tempFileLocation;
    });
  }

  upload(uploadFolderPath, fileName = null) {
    let finalFileName = "";
    try {
      if (fileName != null) {
        finalFileName = fileName;
      } else {
        finalFileName = "[" + Date.now() + "]" + this.info.filename;
      }

      if (!fs.existsSync(uploadFolderPath)) fs.mkdir(uploadFolderPath);

      const readStream = fs.createReadStream(this.tempLocation);
      const writeStream = fs.createWriteStream(
        uploadFolderPath + path.sep + finalFileName
      );
      readStream.pipe(writeStream).on("close", () => {
        fs.unlinkSync(this.tempLocation);
      });
      return true;
    } catch (e) {
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

const withFileParse = (req) => {
  const returnObject = {};
  const files = [];

  return new Promise((resolver, rejector) => {
    const bb = busboy({ headers: req.headers });
    bb.on("file", (name, file, info) => {
      files.push(new File(name, info, file));
    });

    bb.on("field", (name, val, _) => {
      returnObject[name] = val;
    });
    bb.on("close", () => {
      req.files = files;
      resolver(returnObject);
    });
    req.pipe(bb);
  });
};

const bodyParser = async (req) => {
  return new Promise(async (resolver, rejector) => {
    if (req.method != "POST") return resolver(null); // suppress other requests

    const contentType = req.headers["content-type"];
    const formEncType = contentType.split(";")[0];
    const returnObject = {};
    if (formEncType == "multipart/form-data") {
      Object.assign(returnObject, await withFileParse(req));
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
  });
};

export default bodyParser;
