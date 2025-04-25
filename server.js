import { SerialPort } from 'serialport';
import ReadlinePkg from '@serialport/parser-readline';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const { ReadlineParser } = ReadlinePkg;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"]
  },
});


let port = null;
let parser = null;
let parserCallBack;


io.on('connection', (socket) =>{
    console.log("The client connected");


    socket.on('startReading', ()=>{
        if (!port) {
            port = new SerialPort({
                path: 'COM6', // Adjust to your port
                baudRate: 9600,});

            parser = port.pipe(new ReadlineParser({ delimiter: 'END\n' }));

            parserCallBack = (data) => {
                console.log('Received:', data);
                io.emit('serialData', data);
              };

            parser.on('data', parserCallBack);
        }
    });

    socket.on('stopReading', () => {
        if (parser) {
          parser.off('data', parserCallBack);
          console.log('Stopped reading data');
        }
    
        if (port && port.isOpen) {
          port.close((err) => {
            if (err) {
              console.error('Error closing port:', err.message);
            } else {
              console.log('Serial port closed');
            }
            port = null;
            parser = null;
            parserCallBack = null;
          });
        }
    });
}); 


server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});