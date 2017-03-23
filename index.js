var express = require('express')
var mongoose = require('mongoose')
var app = express()
var port = process.env.PORT || 3000

//connect to mongodb
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/urlShortener')
var db = mongoose.connection

//checking connection
db.on('error',console.error.bind(console,'connection error'))
db.once('open',function(){ console.log('connection success') })

//creating url collection scheme
var urlSchema = mongoose.Schema({
	original_url: String,
	short_url: Number
})
//create url collection model
var Url = mongoose.model('Url',urlSchema)



app.get('/',function(req, res){

	res.send('Hello world')
})

app.get('/:shortUrl',function(req, res){
	var shortUrl = req.params.shortUrl
	if(!isNaN(shortUrl)){
		getDocBySU(shortUrl).then(function(doc){
			doc ? 
				res.redirect(doc.original_url) :
				res.send('Url not found')
		})
	}else{
		res.send('invalid number')
	}
})

app.get('/new/*',function(req, res){
	var oriUrl = req.params[0]

	if(isValidUrl(oriUrl)){
		getDocByOU(oriUrl).then(function(doc){
			doc ? 
				res.json(doc) :
				getCreateDoc(oriUrl).then(function(doc){ res.json(doc) })
		})
	}else{
		res.send('the url not valid')
	}
})

app.listen(port,function(){ console.log('app listen on port'+port) })

//////////////////////////////////////////////////////////////////////////////////////
function isValidUrl(u){
	var uRegex = /^https?:\/\/(\S+\.)?(\S+\.)(\S+)\S*/
	return uRegex.test(u)
}

function getDocByOU(u){
	return Url.findOne({original_url:u}).then(function(doc){
		return doc
	})
}

function getDocBySU(u){
	return Url.findOne({short_url: u}).then(function(doc){
		return doc
	})
}

function getCreateDoc(u){
	return Url.find().sort({short_url:-1}).limit(1).select({_id:0,short_url:1}).then(function(lastU){
		var shortU = lastU[0] ? lastU[0].short_url+1 : 100;
		var newU = new Url({short_url: shortU,original_url:u})
		return newU.save()
	})
}