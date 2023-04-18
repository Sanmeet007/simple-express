const fs = require("fs");

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

module.exports = { toURLPath, ls };
