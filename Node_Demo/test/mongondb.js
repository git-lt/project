// var mongodb = require('mongodb');
// var util = require('util');

// var server = new mongodb.Server('localhost',27017,{auto_reconnect:true});

// var db = new mongodb.Db('testdb',server,{safe:true});

// db.open(function(err,db){
// 	if(!err){
// 		console.log('connect db');

// 		db.createCollection('testdb',{safe:true},function(err,coll){
// 			if(err){
// 				console.log(err);
// 			}else{
// 				// console.log(util.inspect(coll));
// 				coll.find().toArray(function(err,docs){
// 					console.log(err);
// 					console.log(docs);
// 				});

// 				// coll.findOne(function(err,docs){
// 				// 	console.log(findOne);
// 				// 	console.log(docs);
// 				// });
// 			}
// 		});
// 	}
// 		else{
// 			console.log(err);
// 		}
// })




var mongoose = require('mongoose');
var db  = mongoose.createCollection('mongodb://127.0.0.1:27017/testdb');

db.on('error',function(err){console.log(err)});

var userSchema=new mongoose.Schema({
	uName:string,
	uPwd:string
});

var userModel = db.model('mongoose',userSchema);





