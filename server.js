const express = require("express");
const multer = require("multer");
const mongoClient = require("mongodb").MongoClient;
var path = require("path");

const app = express();
const port = 8080;
const mongoUrl =
  "mongodb+srv://user-321:northeastern5610@cluster0.3uxdm.mongodb.net/Project2?retryWrites=true&w=majority";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// to support JSON-encoded bodies
app.use(express.json());

// Render static files
app.use(express.static("public"));

app.post("/story", upload.single("story-pic"), (req, res) => {
  mongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    var dbo = db.db("proj2");
    var story = {
      username: req.body.username,
      content: req.body.content,
      datetime: new Date(),
    };
    if (req.file) {
      story.imageName = req.file.filename;
    }
    dbo.collection("stories").insertOne(story, function (err) {
      if (err) throw err;
      db.close();
    });
  });
  res.redirect("/");
});

app.get("/getStories", function (req, res) {
  res.set("Content-Type", "text/html");
  mongoClient.connect(mongoUrl, function (err, db) {
    if (err) {
      throw err;
    }
    var dbo = db.db("proj2");
    dbo
      .collection("stories")
      .find({})
      .toArray(function (err, result) {
        if (err) {
          throw err;
        }
        exports.stories = result;
        res.status(200).send({ result: result });
        db.close();
      });
  });
});

app.get("/main", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/landing-page.html"));
});

app.listen(port);
