import express from "express";
import fs from "fs";
import methodOverride from "method-override";

const app = express();
const port = 3000;
let path = "";
let entries = [];
let entryPath= [];

app.use(express.urlencoded({extended: true}));

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
        var method = req.body._method
        console.log(method,req.body._method)
        delete req.body._method
        return method
    }
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));

function removeSpaces(str) {
    let newStr = str.toLowerCase();
    newStr = newStr.replace(/ /g, "-");
    return newStr;
}

function createNewEntry(title, content) {
    const header = '<%- include("./partials/header.ejs") %>';
    const nav = '<%- include("./partials/navbar.ejs") %>';
    const footer = '<%- include("./partials/footer.ejs") %>';
    let fileName = removeSpaces(title);
    fs.writeFile(`./views/${fileName}.ejs`, `${header} ${nav} <div class="container"> <h2>${title}</h2> <p>${content}</p> </div> <div class="container"> <form action="/post/<%= locals.path %>" method="POST"><input type="hidden" name="_method" value="DELETE"><button class="btn btn-primary d-inline-flex align-items-center" type="submit">Delete post</button></form></div> ${footer}`, (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
    });
    entries.push(title);
    entryPath.push(fileName);
}

function deleteFromArrays(path) {
    const index = entryPath.indexOf(path);
    if (index !== -1) {
        let removedEntry = entryPath.splice(index, 1);
        removedEntry = entries.splice(index, 1);
        console.log("The values have been removed /n" + entries + "/n" + entryPath);
    }

}

app.get("/", (req, res) => {
    res.render("index.ejs", {
        entries: entries,
        entryPath: entryPath
    });
});

app.get("/new", (req, res) => {
    res.render("newEntry.ejs");
});

app.get("/all", (req, res) => {
    res.render("all.ejs", {
        entries: entries,
        entryPath: entryPath
    });
});

app.get("/post/:dynamicPath", (req, res) => {
    const file = req.params.dynamicPath;
    res.render(`${file}.ejs`, {
        path: file
    });
});

app.post("/submit", (req, res) => {
    let title = req.body.title;
    let content = req.body.content;
    createNewEntry(title, content);
    res.render("index.ejs");
});


app.delete("/post/:dynamicPath", (req, res) => {
    console.log("delete is called")
    const file = req.params.dynamicPath;
    fs.unlink(`./views/${file}.ejs`, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return;
        }
        console.log('File deleted successfully');
    });
    deleteFromArrays(file);
    res.render("all.ejs", {
        entries: entries,
        entryPath: entryPath
    });
});


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})