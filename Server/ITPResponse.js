// You may need to add some delectation here
let fs = require("fs");
let singleton = require('./Singleton');

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
  init: function (seqNumber, fName, fExtension) {
    // feel free to add function parameters as needed
    //
    // enter your code here
    //

    //stored variables for packet
    v = 7;
    sequenceNumber = seqNumber;
    timestamp =  singleton.getTimestamp();
    fileName = fName;
    fileExtension = fExtension.toLowerCase()
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
        
          //Set response type to its found
        responseType = 1;
        packetData = [responseHeader,imageData];

    }
    catch(err) {
        //set response type to not found and dont add payload
        responseType = 2;
        packetData = [responseHeader];
    }
    finally {
        //store fields in reponse header
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
