/**
 * Author: Harsh KOthari
 * Version: 1.0.0
 */
//'use strict';
const fs = require("fs");
const express = require("express");
const app = express();
var bodyParser = require('body-parser');
var http = require("http").Server(app);
var mongoose = require('mongoose');
var mongo= require('mongoose');
var auth = require('./authenticate');
var passport = require('passport');
var session = require('express-session');
var socketController = require('./controllers/socketController.js');
const config = require('./appConfig.js');
var userRouter = require('./routes/userRouter');
var homeRouter = require('./routes/homeRouter');
const socketio = require('socket.io');



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views',__dirname+'/views');

// Setting up DB using mongoose
const url = config.DBURL;
//const connect = mongoose.connect(url,{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
const connect=mongo.connect('mongodb+srv://MindBenders:MindBenders123@cluster0.txfw7.mongodb.net/students?retryWrites=true&w=majority', { useNewUrlParser: true,useUnifiedTopology: true });  
var  qna;
var image;
var date =  new Date();
connect.then((db) => {
    console.log("Database connected correctly to server");
}, (err) => { console.log(err); });

//schema for QnA
var QuestionsSchema = new mongo.Schema({
    Question: String
});
QList = mongo.model('listq', QuestionsSchema); 

var QnAFormSchema =new mongo.Schema({
    name: String,
    Answer:String
});

//schema for notes
const schema = {
    name: {type: mongo.SchemaTypes.String},
    email: {type: mongo.SchemaTypes.String},
    dataUrl: {type: mongo.SchemaTypes.String, required:true}
};
const collectionName = "Notes";
const collabSchema = mongo.Schema(schema);
const collab = mongo.model(collectionName, collabSchema);
  

//passport athentication using local strategy
app.use(session({
    secret: "Littlesecret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//making public folder static to use resources
app.use('/public', express.static('public'));

// Mounting subapps
app.use('/user', userRouter);
app.use('/', homeRouter);

//setup sockets
var io = require('socket.io')(http);
socketController(io);

//download function for .txt files from dasboard
app.get(`/downloads`,function(req, res){
    console.log('found ittttttttttttttttt');
    res.download(`public/files/${qna}.txt`);
    
    // res.download(`${question}.txt`);
});

// download function for notes
app.get(`/downloads1`,function(req, res){
    console.log('found ittttttttttttttttt');
    res.download(`public/images/${date}.png`);
    
    // res.download(`${question}.txt`);
});

//conncecting and rendering data from db for QnA
io.on('connection',sock=>{
    sock.on('list',dat=>{
        console.log('hey i got the request 2c')
        
        QList.find().then(function(data){
            console.log(data);

            // for(element in data){
                sock.emit('qdata',data);
            // }knasdc
        });
    });

    sock.on('question needed',question=>{
        
        console.log(question);
        Answers = mongo.model(`${question}`, QnAFormSchema); 
        Answers.find().then(function(data){
            //console.log(data);
            fs.writeFileSync(`public/files/${question}.txt`,`\n Question: ${question}\n\n -------------------------------------------------------------------------------------`);
            for(element in data){
                fs.appendFileSync(`public/files/${question}.txt`,`\n ${data[element].name}: ${data[element].Answer}\n`); 
            }
            qna=question;
            sock.emit('downloadIt','fileLocation');
            
            //sock.emit('Adata',data);
        });
        
        
    });

});

//connecting and rendering notes for users
io.on('connection',sock=>{
    sock.on('note',dats=>{
        console.log('hey i got the request 3c')
        
        collab.find().then(function(data){
            console.log(data);

            // for(element in data){
                sock.emit('dataUrl',data);
            // }knasdc
        });
    });
    sock.on('images needed',notes=>{
        
        //console.log(notes);
        let base64String = notes;
        let base64Image = base64String.split(';base64,').pop();
        fs.writeFile(`public/images/${date}.png`, base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
        });
        sock.emit('downloadImage','fileLocation');
        
    });
})



//connection for opening board for users
io.on('connection',socket=>{
    socket.on('users',data=>{
        io.emit('board',data);
        console.log('data sent');
    });
});

//connection for opening QnA for users
io.on('connection',socket=>{
    socket.on('qna',data=>{
        io.emit('QnA',data);
        console.log('qna sent');
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err);
});

var port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log('listening on :' + port);
});