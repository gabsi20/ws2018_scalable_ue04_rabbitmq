import yaml from "js-yaml";
import fs from "fs";

export default function(filename) {
  try {
    var doc = yaml.safeLoad(fs.readFileSync(`${filename}`, "utf8"));
    return doc;
  } catch (e) {
    console.log(e);
  }
}
