let socket;

function initializeWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;
  const socketUrl = `${protocol}://${host}/message`;

  socket = new WebSocket(socketUrl);

  socket.onopen = function () {
    console.log('✅ WebSocket connection established.');
  };

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const msgClass = data.isMe ? 'user-message' : 'other-message';
    const sender = data.isMe ? 'You' : data.username;
    const message = data.data;

    const messageElement = $('<li>').addClass('clearfix');
    messageElement.append(
      $('<div>').addClass(msgClass).text(`${sender}: ${message}`)
    );

    $('#messages').append(messageElement);
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
  };

  socket.onerror = function () {
    console.error('❌ WebSocket error. Please rejoin the chat.');
    showJoinModal();
  };

  socket.onclose = function (event) {
    if (event.code === 1000) {
      console.log('✅ WebSocket closed normally.');
    } else {
      console.error(`❌ WebSocket closed with code: ${event.code}. Please rejoin.`);
      showJoinModal();
    }
  };
}

function showJoinModal() {
  $('#username-form').show();
  $('#chat').hide();
  $('#message-input').hide();
  $('#usernameModal').modal('show');
}

function joinChat() {
  $('#username-form').hide();
  $('#chat').show();
  $('#message-input').show();
  $('#usernameModal').modal('hide');
}

function sendMessage() {
  const message = $('#message').val();
  const username = $('#usernameInput').val();

  if (message && username && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      message: message,
      username: username
    }));
    $('#message').val('');
  }
}

// ✅ Event Listeners
$('#open-modal').click(() => showJoinModal());

$('#join').click(() => {
  initializeWebSocket();
  joinChat();
});

$('#send').click(() => sendMessage());

$('#message').keydown(event => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});


// let $ = jQuery;
// let socket;

// function initializeWebSocket() {
//   socket = new WebSocket('ws://localhost:8000/message');

//   socket.onopen = function () {
//     console.log('✅ WebSocket connection established.');
//   };

//   socket.onmessage = function (event) {
//     const data = JSON.parse(event.data);
//     const msgClass = data.isMe ? 'user-message' : 'other-message';
//     const sender = data.isMe ? 'You' : data.username;
//     const message = data.data;

//     const messageElement = $('<li>').addClass('clearfix');
//     messageElement.append(
//       $('<div>').addClass(msgClass).text(`${sender}: ${message}`)
//     );

//     $('#messages').append(messageElement);
//     $('#chat').scrollTop($('#chat')[0].scrollHeight);
//   };

//   socket.onerror = function () {
//     console.error('❌ WebSocket error. Please rejoin the chat.');
//     showJoinModal();
//   };

//   socket.onclose = function (event) {
//     if (event.code === 1000) {
//       console.log('✅ WebSocket closed normally.');
//     } else {
//       console.error(`❌ WebSocket closed with code: ${event.code}. Please rejoin.`);
//       showJoinModal();
//     }
//   };
// }

// function showJoinModal() {
//   $('#username-form').show();
//   $('#chat').hide();
//   $('#message-input').hide();
//   $('#usernameModal').modal('show');
// }

// function joinChat() {
//   $('#username-form').hide();
//   $('#chat').show();
//   $('#message-input').show();
//   $('#usernameModal').modal('hide');
// }

// function sendMessage() {
//   const message = $('#message').val();
//   const username = $('#usernameInput').val();

//   if (message && username && socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify({
//       message: message,
//       username: username
//     }));
//     $('#message').val('');
//   }
// }

// // Event Listeners
// $('#open-modal').click(() => showJoinModal());

// $('#join').click(() => {
//   initializeWebSocket();
//   joinChat();
// });

// $('#send').click(() => sendMessage());

// $('#message').keydown(event => {
//   if (event.key === 'Enter') {
//     sendMessage();
//   }
// });