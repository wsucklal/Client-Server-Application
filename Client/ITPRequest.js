//Defining response packet header size in bytes
var H_SIZE = 12;

//Defining variables that make up the header
var v, requestType, timestamp, imageType, fileName;

module.exports = {
  //ITP payload size
  payloadSize: 0,
  //Ihe bit content of the payload
  payload: '',
  //The bit content of the ITP header
  reqHeader: '',

  init: function (type, name) {
    //Given version feild is 7
    v = 7;

    //Set variables
    requestType = 0;
    timestamp = 0;
    imageType = type;
    fileName = name;

    //Set the size of the image file name size accordingly
    let stringName = stringToBytes(fileName);
    this.payloadSize = stringName.length;

    //Logic for image type;
    let bitImageType;
    if (imageType == "bmp"){ bitImageType = 1; }
    else if (imageType == "jpeg"){ bitImageType = 2; }
    else if (imageType == "gif"){ bitImageType = 3; }
    else if (imageType == "png"){  bitImageType = 4; }
    else if (imageType == "tiff"){ bitImageType = 5; }
    else if(imageType == "raw"){bitImageType = 15; }

    //Filling the header with the necessary fields
    this.reqHeader = new Buffer.alloc(H_SIZE);
    storeBitPacket(this.reqHeader, v, 0, 4);
    storeBitPacket(this.reqHeader, requestType, 24, 8);
    storeBitPacket(this.reqHeader, timestamp, 32, 32);
    storeBitPacket(this.reqHeader, bitImageType, 64, 4);
    storeBitPacket(this.reqHeader, this.payloadSize, 68, 28);
    
    //Create payload 
    this.payload = new Buffer.alloc(stringName.length);

    for (var i = 0 ; i < stringName.length ; i++) {
      this.payload[i] = stringName[i];
    }

    //console.log(stringName);
    //console.log(this.payloadSize);
    //console.log(this.payload);
    
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    //Creat buffer to hold packet
    let packet = new Buffer.alloc(this.payloadSize + H_SIZE);

    //Concatonate the header with the payload
    for(var x = 0 ; x < H_SIZE ; x++){ //Header part
      packet[x] = this.reqHeader[x];
    }
    for(var y = 0 ; y < this.payloadSize ; y++){ //Payload part
        packet[y + H_SIZE] = this.payload[y];
    }
    return packet;
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