
// Install requried npm pakage

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require("md5");
// User is Not login
var isLogin = false;

const homeStartingContent = "A daily blog website is a public platform that enables people to publish their personal blogs, stories, and experiences. It serves as a virtual community of individuals who share their daily lives, offering support, guidance, and inspiration to one another. While maintaining a daily blog on a public website comes with potential risks, the benefits of the platform outweigh the risks for many individuals. It is an excellent resource for aspiring writers, bloggers, and individuals seeking personal growth and connection.";
const aboutContent = "At our daily blog website, we believe in the power of personal reflection and community support. We understand that maintaining a daily blog can be a challenging task, which is why we have created a platform that enables individuals to connect with like-minded people and share their experiences. Our website provides users with various tools and features to customize their blogs, allowing them to add multimedia content and engage with their audience. We strive to create a safe and supportive environment for our users, where they can be their authentic selves and grow personally and professionally. Join our community today and start your journey of self-reflection and growth.";

const contactContent = "Our Email id is dailyblogs@gmail.com";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true, useUnifiedTopology: true });

// schema for post collection 
const postSchema = {
  title: String,
  name: String,
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

//Create User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String


});
//Creating a model for the schema and export it so that we can use in our routes file
const User = mongoose.model("User", userSchema);

// home route
app.get("/", function (req, res) {
  res.render("login", { errMsg: "", name: "", password: "" });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get("/login", (req, res) => {
  res.render("login", { errMsg: "", name: "", password: "" });
});

// Register user
app.post("/register", function (req, res) {
  const name = req.body.name
  const email_by_reg = req.body.email; //Getting Email From The Request Body
  const password_by_reg = md5(req.body.password); //Getting Password From The Request Body And Hashing It Using MD5
  //Create A New User
  const newUser = new User({
    name: name,
    email: email_by_reg,
    password: password_by_reg

  });

  //Save The New User To The Database with callback function old way

  // newUser.save(function (err) {
  //     if (err) {
  //         console.log(err);
  //     } else {
  //         res.render("secrets");
  //     }
  // });

  // save the new user to the data base without callback new way
  newUser.save().then(() => {
    // res.render("home");
    isLogin = true;
    if (isLogin == true) {
      res.redirect("/secret");

    }

  }).catch((err) => {
    console.log(err);
  }
  );

}
);

// Login users
app.post("/login", function (req, res) {
  const email_by_lg = req.body.email;
  const password_by_lg = md5(req.body.password);

  // New way supported by new version of mongoose withoutcall back

  User.findOne({
    email: email_by_lg
  }).then((foundUser) => {

    if (foundUser) {
      //If User Is Found Then Check If The Password Is Correct Or Not
      if (foundUser.password === password_by_lg) {
        isLogin = true;
        if (isLogin == true) {
          res.redirect("/secret");
        } else {
          res.redirect("/login");
        }

      } else {
        res.render("login", { errMsg: "password incorrect", name: email_by_lg, password: password_by_lg });
      }
    } else {
      res.render("login", { errMsg: "Email does not exists ", name: email_by_lg, password: password_by_lg });
    }
  }).catch((err) => {
    console.log(err);
  })

  // findOne with callback function old way not supported by new mongoose version

  // User.findOne({
  //     email: email
  // }, function (err, foundUser) {
  //     if (err) {
  //         console.log(err);
  //     } else {
  //         if (foundUser) {
  //             //If User Is Found Then Check If The Password Is Correct Or Not
  //             if (foundUser.password === password) {
  //                 res.render("secrets");
  //             } else {
  //                 res.send("Incorrect Password");
  //             }
  //         } else {
  //             res.send("User Not Found");
  //         }
  //     }
  // });
});


app.get("/secret", function (req, res) {
  if (isLogin == true) {
    Post.find({}, function (err, posts) {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
      });
    });
  }
  else {
    res.redirect("/login");
  }
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const newpost = new Post({
    title: req.body.postTitle,
    name: req.body.name,
    content: req.body.postBody
  });


  newpost.save(function (err) {
    if (!err) {
      res.redirect("/secret");
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
       res.redirect("/secret");
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

app.get("/logout", function (req, res) {
  isLogin = false;
  res.redirect("/login");
});


app.listen(3100, function () {
  console.log("Server started on port 3100");
});
