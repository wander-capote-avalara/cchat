const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

var Message = mongoose.model('Message', {
	name: String,
	message: String,
	ll: String
})

var dbUrl = 'mongodb://capote:capote123@ds129454.mlab.com:29454/catolica-chat'

app.set("PORT", PORT);

app.get('/messages', (req, res) => {
	Message.find({}, (err, messages) => {
		res.send(messages);
	})
})

app.get('/messages/:user', (req, res) => {
	var user = req.params.user
	Message.find({ name: user }, (err, messages) => {
		res.send(messages);
	})
})

app.get('*', function (req, res) {

	res.sendFile('index.html', { root: __dirname + '/' })
})

app.post('/messages', async (req, res) => {
	try {

		const message = new Message(req.body);

		var savedMessage = await message.save()
		console.log('saved');

		io.emit('message', req.body);
		res.sendStatus(200);
	}
	catch (error) {
		res.sendStatus(500);
		return console.log('error', error);
	}
	finally {
		console.log('sended')
	}

})


io.on('connection', () => {
	console.log('connected')
})

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl, { useMongoClient: true });

var server = http.listen(PORT, () => {
	console.log('running on port:', server.address().port);
});
