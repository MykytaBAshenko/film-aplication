const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const moment = require("moment");
const filmRouter = express.Router();
const userRouter = express.Router();
const config = require("./config/key");
const secret = require("./config/key").SECRET;
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minglength: 5,
  },

  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), secret);
  var oneHour = moment().add(1, "hour").valueOf();

  user.tokenExp = oneHour;
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, secret, function (err, decode) {
    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

let auth = (req, res, next) => {
  let token = req.cookies.w_auth;

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      });

    req.token = token;
    req.user = user;
    next();
  });
};

const filmSchema = mongoose.Schema(
  {
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    year: {
      type: Number,
    },
    format: {
      type: String,
      default: "",
    },
    stars: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Film = mongoose.model("film", filmSchema);

const connect = mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

if (process.env.NODE_ENV === "production") {
  app.use(cors());
} else app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


filmRouter.post("/upload/films", auth, (req, res) => {
  let all_ok = true;
  for (let yy = 0; yy < req.body.length; yy++) {
    Film.find({
      title: { $in: req.body[yy].title },
      format: { $in: req.body[yy].format },
    }).exec((err, films) => {
      for (let ii = 0; ii < films.length; ii++)
        if (JSON.stringify(films[ii].stars) == JSON.stringify(req.body[yy].stars) && parseInt(films[ii].year) === parseInt(req.body[yy].year))
          all_ok = false;
      if (yy == req.body.length - 1) {
        if (all_ok) {
            for (let j = 0; j < req.body.length; j++)
                req.body[j].writer = mongoose.Types.ObjectId(req.body[j].writer);
            Film.collection.insert(req.body, function (err, docs) {
                if (err) {
                return res.json(err);
                } else {
                return res.json("Films added!");
                }
            });
        }
        else return res.json("Non-unique film is present");
      }
    });
  }
});

filmRouter.post("/upload/film", auth, (req, res) => {
  const new_film = new Film(req.body);
  new_film.writer = mongoose.Types.ObjectId(req.body.writer);
  Film.find({
    title: { $in: req.body.title },
    format: { $in: req.body.format },
  }).exec((err, films) => {
    let all_ok = true;
    for (let ii = 0; ii < films.length; ii++)
      if (JSON.stringify(films[ii].stars) == JSON.stringify(req.body.stars) && parseInt(req.body.year) === films[ii].year)
        all_ok = false;
    if (all_ok)
      new_film.save((err) => {
        if (err) return res.status(400).json({ success: false, err: err });
        return res.status(200).json({ success: true });
      });
    else
      return res
        .status(200)
        .json({ success: false, err: "Such film already exists" });
  });
});

filmRouter.post("/update/film/:id", auth, async (req, res) => {
  Film.find({
    title:  req.body.title,
    format:req.body.format
  }).exec((err, films) => {
    let all_ok = true;
    for (let ii = 0; ii < films.length; ii++)
      if (JSON.stringify(films[ii].stars) == JSON.stringify(req.body.stars) && parseInt(req.body.year) === films[ii].year)
        all_ok = false;
    if (all_ok)
      Film.findById(req.body._id)
        .then((film) => {
          film._id = mongoose.Types.ObjectId(req.body._id);
          film.title = req.body.title;
          film.writer = mongoose.Types.ObjectId(req.body.writer);
          film.year = req.body.year;
          film.format = req.body.format;
          film.stars = req.body.stars;
          film
            .save()
            .then(() => {
              return res
                .status(200)
                .json({ success: true, message: "film Updated" });
            })
            .catch((err) =>
              res.status(200).json({ success: false, message: `Error ${err}` })
            );
        })
        .catch((err) =>
          res.status(200).json({ success: false, message: `Error ${err}` })
        );
    else
      return res
        .status(200)
        .json({ success: false, message: "Such film already exists" });
  });
});


filmRouter.post("/my/films",auth, (req, res) => {
    Film.find({writer: req.user._id}).populate("writer").exec((err, films) => {
        if (err) return res.status(400).json({ success: false, err })
        res.status(200).json({ success: true, films })
    })
});


filmRouter.post("/films",auth, (req, res) => {
    let sortBy = "_id"
    let order = "asc"
    if(req.body.SortBy == 1) {
        sortBy = "title"
        order = "asc"
    }
    if(req.body.SortBy == -1) {
        sortBy = "title"
        order = "desc"
    }
    let find_args = {}
    console.log(req.body)
    if(req.body.OnlyMine)
        find_args.writer = req.user._id
    if(req.body.Title)
        find_args.title = { "$regex": req.body.Title, "$options": "i" }
  Film.find(find_args)
    .populate("writer")
    .exec((err, films) => {
        if(sortBy == "title" && order == "asc"){
            films.sort((a, b) =>
                  a.title.toUpperCase() > b.title.toUpperCase()
                    ? 1
                    : a.title.toUpperCase() === b.title.toUpperCase()
                    ? 0
                    : -1
                );
            }
        if(sortBy == "title" && order == "desc"){
        films.sort((a, b) =>
              a.title.toUpperCase() > b.title.toUpperCase()
                ? -1
                : a.title.toUpperCase() === b.title.toUpperCase()
                ? 0
                : 1
            );
        }
        let filtered_on_stars = []
        if(req.body.Star){
            for(let oo = 0; oo < films.length; oo++){
                let gg = false
                for(let yy = 0; yy < films[oo].stars.length;yy++){
                    if(films[oo].stars[yy].toLowerCase().indexOf(req.body.Star.toLowerCase() )!=-1)
                        gg = true
                }
                if(gg)
                    filtered_on_stars.push(films[oo])
            }
        }else{
            filtered_on_stars = films
        }
        let films_length = filtered_on_stars.length
        let send_array = []
        for(let j = req.body.skip; j <req.body.skip+req.body.Limit;j++){
            if(filtered_on_stars[j])
                send_array.push(filtered_on_stars[j])
            else
                break
        }
      if (err) return res.status(400).json({ success: false, err });
      res.status(200).json({ success: true, films: send_array,films_length,LoadMore:req.body.LoadMore });
    });
});

filmRouter.post("/getfilm", (req, res) => {
  Film.find({ _id: { $in: req.body.filmId } })
    .populate("writer")
    .exec((err, film) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(film);
    });
});

filmRouter.delete("/delete/film/:filmId", auth, (req, res) => {
  Film.find({ _id: req.params.filmId })
    .remove()
    .exec((err, ok) => {
      if (err) res.status(400).send({ message: "Error", success: 0 });
      else res.status(200).send({ message: "Film deleted", success: 1 });
    });
});

userRouter.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
  });
});

userRouter.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

userRouter.post("/changePassword", (req, res) => {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, new_pass) {
      User.findOneAndUpdate(
        { _id: req.body.id },
        { password: new_pass },
        (err, doc) => {
          if (err) return res.json({ success: false, err });
          return res.status(200).send({
            success: true,
          });
        }
      );
    });
  });
});

userRouter.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

userRouter.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

userRouter.delete("/delete/acc", auth, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (!user)
      return res.json({
        success: false,
        message: "Auth failed, email not found",
      });
    Film.find({ writer: req.user._id })
      .remove()
      .exec((err, ok) => {
        if (err) res.status(400).send({ message: "Error", success: 0 });
        else
          User.find({ _id: req.user._id })
            .remove()
            .exec((err, ok) => {
              if (err)
                res.status(400).send({ message: "Films deleted", success: 0 });
              else res.status(200).send({ message: "All deleted", success: 1 });
            });
      });
  });
});
app.use("/api/users", userRouter);
app.use("/api/film", filmRouter);

app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
