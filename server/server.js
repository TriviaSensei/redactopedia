const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const Game = require('./util/Game');
const axios = require('axios');

dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

const http = require('http').Server(app);

const getArticle = async (req, res, next) => {
	console.log(req.params.title);
	const result = await axios.get(
		`https://en.wikipedia.org/api/rest_v1/page/summary/${req.params.title
			.split(' ')
			.join('%20')}`,
		{
			headers: {
				'User-Agent': process.env.USER_EMAIL,
			},
		}
	);
	if (!result || !result.data?.extract) {
		return res.status(404).json({
			status: 'fail',
			resultCode: 404,
			message: 'Article not found',
		});
	}

	const { extract } = result.data;
	if (process.env.NODE_ENV === 'development')
		res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
	res.status(200).json({
		status: 'success',
		extract,
	});
};

const corsOptions = {
	origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '',
	optionsSuccessStatus: 200,
};

app.get('/api/v1/:title', cors(corsOptions), getArticle);
// const socketManager = require('./mvc/utils/socketManager')(http, server);
const socketManager = require('./socketManager')(http, server);
