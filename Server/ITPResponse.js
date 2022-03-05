
// You may need to add some delectation here
let singleton =  require ("./Singleton");
let fs = require("fs");

//Variables for packets
var HEADER_SIZE =12; //packet header size
let v =7;
let responseType, sequenceNumber, timestamp, imageByteSize;

module.exports = {

    init: function () { // feel free to add function parameters as needed
        //
        // enter your code here
        //
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (data) {
        // enter your code here

        let reponseHeader;
        let payLoad
        
        let packetData =  packetData.concat([reponseHeader,payLoad])
        let packet = new Buffer(packetData);



        return packet ;
    }
};




//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}