var fs = require("fs");
var path = require("path");

var handlebars = require("handlebars");
var copydir = require("copy-dir");
var config = require("./config.json");
var site = require("./site.json");
var src = "./" + config.src;
var dest = "./" + config.dest;

makeDirIfNotExist(dest);
makeDirIfNotExist(path.join(dest, "css"));
copydir.sync(path.join(src, "css"), path.join(dest, "css"));
makeDirIfNotExist(path.join(dest, "img"));
copydir.sync(path.join(src, "img"), path.join(dest, "img"));
makeDirIfNotExist(path.join(dest, "warpzone"));
copydir.sync(path.join(src, "pages/warpzone"), path.join(dest, "warpzone"));


let data = {};
data.site = site;
addPageData(data);

function addPageData(data) {
  var newData = data;


  newData.site.pages.forEach((page) => {
    if (page.showInNav){
      var pageName = page.file.replace(".html", "").toLowerCase();

      
      var jsonPath = path.join(src, "pages", pageName + ".json");
      if (fs.existsSync(jsonPath)){
        newData[pageName] = require("./" + jsonPath);
      }
    }
  });

  newData["games"].sort(function(a, b) {
    return new Date(b.released) - new Date(a.released);
  });
  return newData;
}

data["games"].sort(function(a, b) {
  return new Date(b.released) - new Date(a.released);
});
fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));


data.site.pages.forEach((page) => {
  var pageName = page.file.replace(".html", "").toLowerCase();
  var fileName = page.file;
  
  createPage(pageName, data, path.join(dest, fileName));
});

function insertPartials(templateName) {
  var completeTemplate = fs.readFileSync(path.join(src, config.templatesDirectory, templateName + ".hbs"), "utf8");
  config.partials.forEach((partial) => {
    var partialTemplate = fs.readFileSync(path.join(src, config.partialsDirectory, partial + ".hbs"), "utf8");
    var partialTag = "{{>tag}}".replace("tag", partial);
    completeTemplate = completeTemplate.replace(partialTag, partialTemplate);
  });
  return completeTemplate;
}

function createPage(templateName, data, outputFileName) {
  var html = renderFromExternalTemplate(insertPartials(templateName), data);
  fs.writeFileSync(outputFileName, html);
}

function renderFromExternalTemplate(template, data){
  var template = handlebars.compile(template);
  return template(data);
}

function truncate(string, length){
  if (string.length > length)
  return string.substring(0, length)+'...';
  else
  return string;
};

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

function makeDirIfNotExist(filePath) {
  if (!fs.existsSync(filePath)){
    fs.mkdirSync(filePath);
  }
}
