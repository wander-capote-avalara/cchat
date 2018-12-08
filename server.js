const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const expressip = require('express-ip');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

var Message = mongoose.model('Message', {
	name: String,
	message: String
})

var dbUrl = 'mongodb://capote:capote123@ds129454.mlab.com:29454/catolica-chat'

app.use(expressip().getIpInfoMiddleware);
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

	const ipInfo = req.ipInfo;
	var message = `${ipInfo.city}, ${ipInfo.country}`;

	console.log(message);
	console.log(ipInfo);
	res.sendFile('index.html', { root: __dirname + '/' })
})

app.post('/messages', async (req, res) => {
	try {
		var message = new Message(req.body);

		var savedMessage = await message.save()
		console.log('saved');

		var censored = await Message.findOne({ message: 'oopsie' });
		if (censored)
			await Message.remove({ _id: censored.id })
		else
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
