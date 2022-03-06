
// You may need to add some delectation here
let singleton =  require ("./Singleton");
let fs = require("fs");

//Variables for packets
var HEADER_SIZE =12; //packet header size
let v, responseType, sequenceNumber, timestamp, imageByteSize, responseHeader, imageData, packetData, fileName;

module.exports = {

    init: function (data) { 

        // feel free to add function parameters as needed
        //
        // enter your code here
        //

        reponseHeader = new Buffer.alloc(HEADER_SIZE);

        v = 7 ;
        (imageData) ? responseType = 1 :  responseType = 2; //set response type to  either 1 or 2
        sequenceNumber = singleton.getSequenceNumber();
        timestamp =  singleton.getTimestamp();


        fileName = data.slice(4, 16).toString().replace(/\0/g, "");

        const stats = fs.statSync(
            require("path").dirname(require.main.filename) + "/images/" + fileName
        );

        const imageByteSize = stats.size / 1000;

        imageData =  fs.readFileSync(
            require("path").dirname(require.main.filename) + "/images/" + fileName
        );


        storeBitPacket(this.reponseHeader, v, 0, 4);
        storeBitPacket(this.responseHeader, responseType, 4, 8);
        storeBitPacket(this.responseHeader, sequenceNumber, 12, 20);
        storeBitPacket(this.responseHeader, timestamp, 32, 32);
        storeBitPacket(this.responseHeader, imageByteSize, 64, 32);

    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (data) {
        // enter your code here
                
        let packet = new Buffer(packetData.concat([this.reponseHeader,imageData]));

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