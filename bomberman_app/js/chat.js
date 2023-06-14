var socket = new WebSocket('ws://localhost:8080/ws'); // replace with your server's address and port

socket.onopen = function() {
    console.log('Connected!');
};

socket.onerror = function(error) {
    console.log('WebSocket error: ' + error);
};

socket.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    var node = document.createElement('div');
    var textnode = document.createTextNode(msg.username + ': ' + msg.message);
    node.appendChild(textnode);
    document.getElementById('chat').appendChild(node);
};

document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();

    var input = document.getElementById('input');
    var message = input.value;
    input.value = '';

    var msg = {
        Type: 'message',
        Message: message
    };

    socket.send(JSON.stringify(msg));
});
