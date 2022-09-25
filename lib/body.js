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

/*
const withFileParse = (data) => {
  const returnObject = {};
  let fieldData, fileData;
  const fieldsExp = /name="(?<key>\w+)"\s+(?<value>\w+)/gm;
  while ((fieldData = fieldsExp.exec(data))) {
    const { key, value } = { ...fieldData.groups };
    returnObject[key] = decodeURIComponent(value);
  }
  //   TODO add a file parser
  return returnObject;
};


    if (formEncType == "multipart/form-data") {
      req.on("data", (data) => {
        Object.assign(returnObject, withFileParse(data));
        resolver(returnObject);
      });
    } else
*/

const bodyParser = async (req) => {
  return new Promise(async (resolver, rejector) => {
    if (req.method != "POST") return resolver(null); // suppress other requests

    const contentType = req.headers["content-type"];
    const formEncType = contentType.split(";")[0];
    const returnObject = {};
    if (formEncType == "application/x-www-form-urlencoded") {
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
