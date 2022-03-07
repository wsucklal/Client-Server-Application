//Defining response packet header size in bytes
var HEADER_SIZE = 12;

//Defining variables that make up the header
let v,imageExtensionInteger ,reqTypeInteger, timestamp, imageName;

module.exports = {
 
  init: function (iName,vrsn,iExtensionInteger) {
    //Given version feild is 7
    //v = vrsn;
    v = 7;

    //Set variables
    reqTypeInteger = 0;
    timestamp = 0;
    imageName = iName;
    imageExtensionInteger = iExtensionInteger;  
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    //Creat buffer to hold packet
    let requestHeader = new Buffer.alloc(HEADER_SIZE);
    let payload = [];
    let packetData = [];
    let imageNameBytes;

    //Set the size of the image file name size accordingly
    imageNameBytes = stringToBytes(imageName);
        
    //Create payload 
        payload = new Buffer.alloc(imageNameBytes.length);
        for (var i = 0 ; i < imageNameBytes.length ; i++) {
          payload[i] = imageNameBytes[i];
        }
    
    
    //store fields in request header   
    storeBitPacket(requestHeader, v, 0, 4);
    storeBitPacket(requestHeader, reqTypeInteger, 24, 8);
    storeBitPacket(requestHeader, timestamp, 32, 32);
    storeBitPacket(requestHeader, imageExtensionInteger, 64, 4);
    storeBitPacket(requestHeader, imageNameBytes.length, 68, 28);

    packetData = [requestHeader,payload];

    return Buffer.concat(packetData);
  },
};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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
