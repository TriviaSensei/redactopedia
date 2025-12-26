const { v4: uuidV4 } = require('uuid');
const Game = require('./util/Game');

/**
 * {
 * 		name
 * 		socketId
 * 		userId
 * 		publicId
 * }
 */
const connectedUsers = [];
const activeGames = [];

const getGameBySocket = (socket) => {
	return activeGames.find((g) =>
		g.players.some((p) => p.socketId === socket.id)
	);
};

const getGameById = (id) => {
	return activeGames.find((g) => g.getId === id);
};

const socket = async (http, server) => {
	io = require('socket.io')(http, {
		cors: {
			origin: 'http://localhost:5173',
		},
	});

	const addNewUser = (data) => {
		const newId = uuidV4();
		const newPublicId = uuidV4();
		const { socketId, name } = data;
		const newUser = {
			socketId,
			id: newId,
			publicId: newPublicId,
			name: name || '',
		};
		connectedUsers.push(newUser);
		return { ...newUser };
	};

	io.on('connection', (socket) => {
		console.log(`A connection was made from ${socket.handshake.address}`);

		socket.on('request-new-user-id', (cb) => {
			const user = connectedUsers.find((u) => u.socketId === socket.id);
			if (!user) {
				const newUser = addNewUser({ socketId: socket.id, name: '' });
				cb({ id: newUser.id });
			} else {
				cb({ id: user.id });
			}
		});

		socket.on('rejoin-server', (data, cb) => {
			//the user must send their private ID - if not, generate a new user
			if (!data.id) {
				const newId = addNewUser({ socketId: socket.id, name: '' }).id;
				return cb({ id: newId });
			}
			//the id was sent here - see if it matches something in the array
			else {
				//update the socket id if it matches something
				let user = connectedUsers.find((u) => {
					if (u.id === data.id) {
						u.socketId = socket.id;
						return true;
					}
					return false;
				});
				//if not, make a new user for them
				if (!user) {
					user = addNewUser({ socketId: socket.id });
					const newId = user.id;
					return cb({ id: newId });
				}
				return cb({ name: user.name });
			}
		});

		socket.on('set-name', (data, cb) => {
			if (!data.name)
				return cb({ status: 'error', message: 'You must enter a name' });
			else {
				let user = connectedUsers.find((u) => {
					if (u.socketId === socket.id) {
						u.name = data.name;
						return true;
					}
					return false;
				});
				if (!user) user = addNewUser({ socketId: socket.id, name: data.name });
				cb({
					status: 'success',
					name: data.name,
				});
				socket.to('chat-room').emit('set-name', {
					publicId: user.publicId,
					name: data.name,
				});
			}
		});

		socket.on('send-message', (data, cb) => {
			const user = connectedUsers.find((u) => u.socketId === socket.id);
			if (!user) return cb({ status: 'fail', message: 'User not found' });
			cb({ status: 'success' });
			socket.to('chat-room').emit('new-message', {
				from: user.name,
				publicId: user.publicId,
				message: data.message,
			});
		});

		socket.on('disconnect', (reason) => {
			socket.leave('chat-room');
			console.log(
				`Client disconnected from ${socket.handshake.address} (${reason})`
			);
		});
	});

	io.listen(server);
};

module.exports = socket;
