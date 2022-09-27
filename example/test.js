import fs from "fs";

const paths = [];

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
  path = path.replace(dirPath + "/", "");
  path = "/" + path;
  return path;
};

// console.log(ls("public"));
// console.log([1, 3, 3, 5][]);

// console.log(
//   (function () {
//     console.log("j");
//   })()
// );

// console.log("dkndf".slice(-4));

const matchURL = (req_url, match_url) => {
  if (req_url == match_url) {
    return true;
  } else {
    if (match_url.includes(":")) {
      let m;
      const final_object = {};
      const req_exp = /\/(?<p>\w+)/gm;
      const req_result = [];
      while ((m = req_exp.exec(req_url))) {
        req_result.push(m.groups.p);
      }

      const match_exp = /\/:(?<p>\w+)/gm;
      const match_result = [];
      while ((m = match_exp.exec(match_url))) {
        match_result.push(m.groups.p);
      }

      if (match_result.length == req_result.length) {
        match_result.forEach((k, i) => (final_object[k] = req_result[i]));
        console.log(final_object);
        return true;
      }
    }
    return false;
  }
};

// matchURL("/adsss/dfa", "/:id/:il");
const url = new URL("http://example.com/?id=10%20");
console.log(Object.fromEntries(url.searchParams));
