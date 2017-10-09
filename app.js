const express = require("express");
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require("connect-flash");
const session = require("express-session");

const port = 3000;
const app = express();

//Map Gobal Promise (To get rid of the mongose deprication warning)

mongoose.Promise = global.Promise;

//Connect to mongoose

mongoose.connect("mongodb://localhost/vidjot-dev",{
    useMongoClient : true
})
.then(()=>{
    console.log("MongoDb connected");
})
.catch(err => console.log(err));

//Load Idea Model
require("./models/Idea.js");
const Idea = mongoose.model('ideas');

//Handle Bars miidleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Body Parser MiddleWare
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Method-Override Middleware
app.use(methodOverride('_method'));

//Express-session MiddleWare
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

 //Flash MiddleWare
 app.use(flash());
 
 //Global Variables
 app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
 })

//Index Route
app.get("/",(req,res)=>{
    const title = "welcome to VidJot";
    res.render("index",{
        title : title
    });
});

//Idea Index Page
app.get("/ideas",(req,res)=>{
    Idea.find({})
    .sort({date : "desc"})
    .then(ideas => {
        res.render("./ideas/index",{
            ideas : ideas
        });
    });
   
})

//About Route
app.get("/about",(req,res)=>{
    res.render("about");
})

//Add Idea Route
app.get("/ideas/add", (req,res)=>{
    res.render("ideas/add");
});
//Edit Idea Route 
app.get("/ideas/edit/:id", (req,res)=>{
    Idea.findOne({
        _id : req.params.id
    })
    .then( idea => {
        res.render("ideas/edit",{
            idea : idea
        });
    }) 
});
//Add Idea Post Request
app.post("/ideas",(req,res)=>{
    let errors = [];
    if(!req.body.title){
        errors.push({text : "Please add a title"})
    }
    if(!req.body.details){
        errors.push({text : "Please enter some details"})
    }

    if(errors.length > 0){
        res.render("ideas/add",{
            errors : errors,
            title : req.body.title,
            details : req.body.details
        });
    } else {
        const newUser = {
            title : req.body.title,
            details : req.body.details
        }
        new Idea(newUser)
        .save()
        .then( idea => {
            req.flash("success_msg" , "Video Idea Added");
            res.redirect("/ideas");
        });
    }
});

//Edit form process
app.put('/ideas/:id',(req,res)=>{
    Idea.findOne({
        _id : req.params.id
    })
    .then(idea => {
        idea.title = req.body.title;
        idea.details = req.body.details;
        idea.save()
        .then(idea =>{
            req.flash("success_msg" , "Video Idea Updated");
            res.redirect("/ideas");
        });
    })
})

//Delete Idea
app.delete("/ideas/:id",(req,res)=>{
    Idea.remove({
        _id : req.params.id
    })
    .then(()=>{
        req.flash("success_msg" , "Video Idea Removed");
        res.redirect("/ideas");
    })
});

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
});