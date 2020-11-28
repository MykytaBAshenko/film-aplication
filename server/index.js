const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const async = require('async');
const multer = require('multer');
const filmRouter = express.Router();
const userRouter = express.Router();
const Schema = mongoose.Schema;
 
const config = require("./config/key");
const secret = require("./config/key").SECRET;
const userSchema = mongoose.Schema({
  name: {
      type: String,
      maxlength: 50
  },
  email: {
      type: String,
      trim: true,
      unique: 1
  },
  password: {
      type: String,
      minglength: 5
  },

  token: {
      type: String,
  },
  tokenExp: {
      type: Number
  }
})

userSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
          if (err) return next(err);

          bcrypt.hash(user.password, salt, function (err, hash) {
              if (err) return next(err);
              user.password = hash
              next()
          })
      })
  } else {
      next()
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch)
  })
}

userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), secret)
  var oneHour = moment().add(1, 'hour').valueOf();

  user.tokenExp = oneHour;
  user.token = token;
  user.save(function (err, user) {
      if (err) return cb(err)
      cb(null, user);
  })
}

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, secret, function (err, decode) {
      user.findOne({ "_id": decode, "token": token }, function (err, user) {
          if (err) return cb(err);
          cb(null, user);
      })
  })
}

const User = mongoose.model('User', userSchema);


let auth = (req, res, next) => {
  let token = req.cookies.w_auth;

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true
      });

    req.token = token;
    req.user = user;
    next();
  });
};



// const paymentSchema = mongoose.Schema({
//   user: {
//       type: Array,
//       default: []
//   },
//   data: {
//       type: Array,
//       default: []
//   },
//   product: {
//       type: Array,
//       default: []
//   }


// }, { timestamps: true })




// const Payment = mongoose.model('Payment', paymentSchema);



const filmSchema = mongoose.Schema({
  writer: {
      type: String,
      ref: 'User'
  },
  title: {
      type: String
  },
  year: {
      type: Number
  },
  format: {
      type: String,
      default: ""
  },
  stars: {
      type: Array,
      default: []
  }
}, { timestamps: true })



const Film = mongoose.model('film', filmSchema);

    
 
const connect = mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

  if (process.env.NODE_ENV === "production") {

app.use(cors())
  
  }else
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       cb(null, 'uploads/')
//   },
//   filename: (req, file, cb) => {
//       cb(null, `${Date.now()}_${file.originalname}`)
//   },
//   fileFilter: (req, file, cb) => {
//       const ext = path.extname(file.originalname)
//       if (ext !== '.jpg' || ext !== '.png') {
//           return cb(res.status(400).end('only jpg, png are allowed'), false);
//       }
//       cb(null, true)
//   }
// })

// var upload = multer({ storage: storage }).single("file")


filmRouter.post("/upload/films",auth,   (req, res) => {
    for(let j = 0; j < req.body.length;j++){
        req.body[j].writer = mongoose.Types.ObjectId(req.body[j].writer)
    }
    Film.collection.insert(req.body,function (err,docs){
        if (err) {
          console.log(err);
          res.json(err)
        } else {
          res.json('films added!')
          console.log('film added!');
        }
      });
    
//     const product = new Product(req.body)
  
//     product.save((err) => {
//         if (err) return res.status(400).json({ success: false, err })
//         return res.status(200).json({ success: true })
//     })
  
  });
  
  filmRouter.post("/upload/film",auth,   (req, res) => {

    
        req.body.writer = mongoose.Types.ObjectId(req.body.writer)
        
    const film = new Film(req.body)
    console.log(req.body)
    film.save((err) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).json({ success: true })
    })
  
  });

filmRouter.post("/uploadImage", auth, (req, res) => {

  upload(req, res, err => {
      if (err) {
          return res.json({ success: false, err })
      }
      return res.json({ success: true, image: res.req.file.path, fileName: res.req.file.filename })
  })

});




// filmRouter.post("/uploadWeapon/:id", async (req, res) => {

//     const projectId = req.body._id;
//     const project = await Product.findById(projectId);
//     if (project) {
//       project._id = req.body._id;
//       project.title = req.body.title;
//       project.writer = req.body.writer;
//       project.price = req.body.price;
//       project.images = req.body.images;
//       project.weapon = req.body.weapon;
//       project.description = req.body.description;
//       project.coments = req.body.coments;
//       const updatedProject = await project.save();
//       if (updatedProject) {
//         return res.status(200).send({ message: 'Project Updated', data: updatedProject });
//       }
//     }
//     return res.status(500).send({ message: ' Error in Updating Project.' });
  
//   });



filmRouter.post("/films", (req, res) => {
    Film.find().populate("writer").exec((err, films) => {
                        if (err) return res.status(400).json({ success: false, err })
                        res.status(200).json({ success: true, films})
                    })
    // let sortBy = "_id";
    // let order =  "desc";
    // if(req.body.SortBy == 'From cheap to expensive') {
    //     sortBy = 'price'
    //     order = "asc"
    // } else if(req.body.SortBy == "From expensive to cheap"){
    //     sortBy = 'price'
    //     order = "desc"
    // } 
    // let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    // let skip = parseInt(req.body.skip);

    // let findArgs = {};
    // let term = req.body.searchTerm;
    // let low = req.body.min_price || 0;
    // let max = req.body.max_price || Infinity;
    // let find_weapon = []
    // let weapons_was = 0;
    // if(req.body.weapon)
    // for(var x = 0; x < req.body.weapon.length; x++){
    //     if(req.body.weapon[x]){
    //         find_weapon.push(x)
    //         weapons_was = 1;
    //     }
    // }
    // let weapon = [];
    // if(weapons_was) {
    //     weapon = find_weapon
    //     findArgs = {
    //         price: {
    //             $gte: low,
    //             $lte: max
    //         },
    //         weapon: weapon
    //     }
    // }
    // if(!weapons_was) {
    //     weapon = find_weapon
    //     findArgs = {
    //         price: {
    //             $gte: low,
    //             $lte: max
    //         }
    //     }
    // }


    // let maxPrice;
    // var vsegoTovara;
    // const send_on_client = async () => {
    //     if(term)
    //         maxPrice = await Product.find(findArgs).find({ "title": { "$regex": term, "$options": "i" }}).sort({ price: -1 }).limit(1);
    //     else
    //         maxPrice = await Product.find(findArgs).sort({ price: -1 }).limit(1);
    //     if(term)
    //     vsegoTovara = (await Product.find(findArgs).find({ "title": { "$regex": term, "$options": "i" }})).length;
    //     else
    //     vsegoTovara =  (await Product.find(findArgs)).length;

    //     if (term) {
    //         Product.find(findArgs)
    //             .find({ "title": { "$regex": term, "$options": "i" }})
    //             .populate("writer")
    //             .sort([[sortBy, order]])
    //             .skip(skip)
    //             .limit(limit)
    //             .exec((err, products) => {
    //                 if (err){ return res.status(400).json({ success: false, err })}
    //                 res.status(200).json({ success: true, products, postSize: vsegoTovara, maxPrice:maxPrice})
    //             })
    //     } else {
            
    //         Product.find(findArgs)
    //             .populate("writer")
    //             .sort([[sortBy, order]])
    //             .skip(skip)
    //             .limit(limit)
    //             .exec((err, products) => {
    //                 if (err) return res.status(400).json({ success: false, err })
    //                 res.status(200).json({ success: true, products, postSize: vsegoTovara, maxPrice:maxPrice })
    //             })
    //     }

    // }
    // send_on_client()

    

      
});


filmRouter.get("/film_by_id", (req, res) => {
  let type = req.query.type
  let productIds = req.query.id


  if (type === "array") {
      let ids = req.query.id.split(',');
      productIds = [];
      productIds = ids.map(item => {
          return item
      })
  }

  //we need to find the product information that belong to product Id 
  Product.find({ '_id': { $in: productIds } })
      .populate('writer')
      .exec((err, product) => {
          if (err) return res.status(400).send(err)
          return res.status(200).send(product)
      })
});

filmRouter.get("/getUserProducts", (req, res) => {
    let userId = req.query.userId
    let term = req.query.term
    
    if(term)
    Product.find({writer: userId}).find({ "title": { "$regex": term, "$options": "i" }}).exec((err, products) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(products)
    })
    else{
        Product.find({writer: userId}).exec((err, products) => {
            if(err) return res.status(400).send(err)
            res.status(200).send(products)
        })
    }
 
  });  


  filmRouter.get("/rmrfProduct", (req, res) => {
    let userId = req.query.userId
    let productId = req.query.productId
  
    Product.find({ _id:productId }).remove().exec();
    Product.find({writer: userId}).exec((err, products) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(products)
    })
 
  });  



userRouter.get("/auth", auth, (req, res) => {
  res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
      cart: req.user.cart,
      history: req.user.history
  });
});

userRouter.post("/register", (req, res) => {

  const user = new User(req.body);

  user.save((err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
          success: true
      });
  });
});

userRouter.post("/changePassword", (req, res) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, new_pass) {
        User.findOneAndUpdate({ _id: req.body.id }, { password: new_pass }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
    })
})
  });
  

userRouter.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
      if (!user)
          return res.json({
              loginSuccess: false,
              message: "Auth failed, email not found"
          });

      user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
              return res.json({ loginSuccess: false, message: "Wrong password" });

          user.generateToken((err, user) => {
              if (err) return res.status(400).send(err);
              res.cookie("w_authExp", user.tokenExp);
              res
                  .cookie("w_auth", user.token)
                  .status(200)
                  .json({
                      loginSuccess: true, userId: user._id
                  });
          });
      });
  });
});

userRouter.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
          success: true
      });
  });
});

app.use('/api/users', userRouter);
app.use('/api/film', filmRouter);

app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === "production") {

  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Running at ${port}`)
});
