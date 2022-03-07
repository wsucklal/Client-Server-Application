// You may need to add some delectation here
let singleton = require("./Singleton");
let fs = require("fs");

//Variables for packets
var HEADER_SIZE = 12; //packet header size
let v,
  responseType,
  sequenceNumber,
  timestamp,
  fileName = "",
  fileExtension= "";

module.exports = {

    reponseHeader:"",
  init: function (seqNumber,tstamp, fName, fExtension) {
    // feel free to add function parameters as needed
    //
    // enter your code here
    //
    v = 7;
    sequenceNumber = seqNumber;
    timestamp =  tstamp;
    fileName = fName;
    fileExtension = fExtension.toLowerCase()
     responseHeader = new Buffer.alloc(HEADER_SIZE);
  },
  //--------------------------
  //getpacket: returns the entire packet
  //--------------------------
  getPacket: function () {
    // enter your code here
    let responseHeader =  new Buffer.alloc(HEADER_SIZE);
    let packetData;
    let imageData;
    let imageByteSize = 0;

    //getImage Data and image size
    try{

        const stats = fs.statSync(
            require("path").dirname(require.main.filename) + "/images/" + fileName +"."+ fileExtension
          );
      
           imageByteSize = stats.size;
      
          imageData = fs.readFileSync(
            require("path").dirname(require.main.filename) + "/images/" + fileName +"."+ fileExtension
          );
        
        responseType = 1;
        packetData = [responseHeader,imageData];

    }
    catch(err) {

        responseType = 2;
        packetData = [responseHeader];
    }
    finally {

        storeBitPacket(responseHeader, v, 0, 4);
        storeBitPacket(responseHeader, responseType, 4, 8);
        storeBitPacket(responseHeader, sequenceNumber, 12, 20);
        storeBitPacket(responseHeader, timestamp, 32, 32);
        storeBitPacket(responseHeader, imageByteSize, 64, 32);
    }

    return Buffer.concat(packetData);
  }
};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Store integer value into specific bit position the packet
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
