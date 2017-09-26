const http = require("http"),
    fs = require("fs"),
    path = require("path"),
    mime = require("mime"),
    listDir = require("./list_dir"),
    url = require("url"),
    Cookies = require("cookies"),
    Keygrip = require("keygrip");

    const keys = new Keygrip(["SEKRIT2", "SEKRIT1"]);

    const user = "ashwin",
        pass = "ashwin";

http.createServer(function (req, res) {
    var url_parts = url.parse(req.url, true);
    var cookies = new Cookies( req, res, { "keys": keys } );
    if(url_parts.pathname == "/") {
        if(cookies.get("login", {signed: true}) != undefined) {
            fs.readFile('./index.html', function (err, html) {
                if (err) {
                    res.writeHead(500);
                    res.write("Internal Server Error - " + err.toString());
                    res.end();
                } else {
                    res.writeHeader(200, {"Content-Type": "text/html"});
                    res.write(html);
                    res.end();
                }
            });
        } else {
            fs.readFile('./login.html', function (err, html) {
                if (err) {
                    res.writeHead(500);
                    res.write("Internal Server Error - " + err.toString());
                    res.end();
                } else {
                    res.writeHeader(200, {"Content-Type": "text/html"});
                    res.write(html);
                    res.end();
                }
            });
        }
    } else if(url_parts.pathname == "/list_dir") {
        if(cookies.get("login", {signed: true}) != undefined) {
            cookies.set("login", "1", {signed: true, maxAge: 10000});
            listDir(url_parts.query.path || "/", function(err, list) {
                if(err == null) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(list));
                    res.end();
                } else {
                    res.writeHead(500);
                    res.write("Internal Server Error - " + err.toString());
                    res.end();
                }
            });
        } else {
            if(req.headers && req.headers.referer && req.headers.referer.length > 0) {
                res.writeHead(401, {'Content-Type': 'test/plain'});
                res.write("Unauthorized");
                res.end();
            } else {
                res.writeHead(301, {
                    Location: "http" + (req.socket.encrypted ? "s" : "") + "://" +
                    req.headers.host
                });
                res.end();
            }
        }
    } else if(url_parts.pathname == "/get_file") {
        if(cookies.get("login", {signed: true}) != undefined) {
            cookies.set("login", "1", {signed: true, maxAge: 10000});
            var file = url_parts.query.path;

            var filename = path.basename(file);
            var mimetype = mime.getType(file);

            if(mimetype.indexOf("image/") == 0 || mimetype.indexOf("audio/") == 0 || mimetype.indexOf("video/") == 0) {
                res.setHeader('Content-Disposition', 'inline');
            } else {
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            }
            res.setHeader('Content-Type', mimetype);

            var fileStream = fs.createReadStream(file);
            fileStream.pipe(res);
        } else {
            if(req.headers && req.headers.referer && req.headers.referer.length > 0) {
                res.writeHead(401, {'Content-Type': 'test/plain'});
                res.write("Unauthorized");
                res.end();
            } else {
                res.writeHead(301, {
                    Location: "http" + (req.socket.encrypted ? "s" : "") + "://" +
                    req.headers.host
                });
                res.end();
            }
        }

    } else if(url_parts.pathname == "/login") {
        if(url_parts.query.username == user && url_parts.query.password == pass) {
            cookies.set("login", "1", {signed: true, maxAge: 10000});
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write("Success");
            res.end();
        } else {
            res.writeHead(401, {'Content-Type': 'test/plain'});
            res.write("Unauthorized");
            res.end();
        }
    } else {
        res.writeHead(404);
        res.write("Not Found");
        res.end();
    }

}).listen(8080);
console.log("");
console.log("Listening on http://127.0.0.1:8080");

