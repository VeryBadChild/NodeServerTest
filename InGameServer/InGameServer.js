const net = require('net');
const { ByteReader } = require('../Network');
const Protocol = require('./Protocol');
const sockets = new Set();

const server = net.createServer((socket) =>
{
    console.log('새로운 클라이언트 접속 : ', socket.remoteAddress,socket.remotePort);
    sockets.add(socket);

    socket.on('data',(data)=> 
    {
        const byteReader = new ByteReader(data);
        const protocol = byteReader.readByte();
        console.log('클라이언트 메시지 : ', data.toString());

        switch(protocol){
            case Protocol.PlayerConnect:
                socket.write(sockets);
                broadcast("newPlayer", socket);
            case Protocol.PlayerMove:
                broadcast(data, socket);
        }

    });

    socket.on('end',() =>
    {
        console.log('클라이언트 접속 종료 : ', socket.remoteAddress,socket.remotePort);
        sockets.delete(socket);
    });


    socket.on('error',(err)=>
    {
        console.error('소켓 에러 : ', err);
        sockets.delete(socket);
    });
});

function broadcast(message, sender) {
    sockets.forEach((socket) => {
        if (socket == sender) return;

        socket.write(message);
    });
}

server.listen(30303,() => 
{
    console.log('TCP 서버가 30303번 포트에서 실행 중입니다.')
});

module.exports = {
    broadcast
};