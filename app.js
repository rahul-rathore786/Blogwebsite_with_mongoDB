
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const homeStartingContent = "A daily blog website is a public platform that enables people to publish their personal blogs, stories, and experiences. It serves as a virtual community of individuals who share their daily lives, offering support, guidance, and inspiration to one another. While maintaining a daily blog on a public website comes with potential risks, the benefits of the platform outweigh the risks for many individuals. It is an excellent resource for aspiring writers, bloggers, and individuals seeking personal growth and connection.";
const aboutContent = "At our daily blog website, we believe in the power of personal reflection and community support. We understand that maintaining a daily blog can be a challenging task, which is why we have created a platform that enables individuals to connect with like-minded people and share their experiences. Our website provides users with various tools and features to customize their blogs, allowing them to add multimedia content and engage with their audience. We strive to create a safe and supportive environment for our users, where they can be their authentic selves and grow personally and professionally. Join our community today and start your journey of self-reflection and growth.";

const contactContent = "Our Email id is dailyblogs@gmail.com";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true , useUnifiedTopology: true } );

// schema for post collection 
const postSchema = {
  title: String,
  content: String
};

// model for post collection
const Post = mongoose.model("Post", postSchema);

//Schema for contact 
const contactSchema = {
  name: String,
  email: String,
  subject: String,
  message: String
};

//Model for contact
const contactForm = mongoose.model("Contact", contactSchema);


app.get("/", function (req, res) {

  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const newpost = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  newpost.save(function (err) {
    if (!err) {
      res.redirect("/compose");
    }
  });
});

app.post("/contactus", function (req, res) { 
  const newcontactForm = new contactForm({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message

  });

  newcontactForm.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });

});

app.get("/posts/:postId", function (req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});


app.listen(3100, function () {
  console.log("Server started on port 3100");
});
