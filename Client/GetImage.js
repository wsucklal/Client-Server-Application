let net = require("net");
let fs = require("fs");
let open = require("open");
let ITPpacket = require('./ITPRequest');

// Enter your code for the client functionality here
// Process is built into node referring to the GetImage -s <serverIP>:<port> -q <image name> -v <version>
// argv determines which section of the call we are on

let connectionInfo = process.argv[3].split(":");
let fileName = process.argv[5].split(".");
let HOST = connectionInfo[0];
let PORT = connectionInfo[1];
let name = fileName[0];
let fileType = fileName[1];
let v = process.argv[7];

ITPpacket.init(fileType, name,v);

//Creating a socket connection
let client = new net.Socket();
client.connect(PORT, HOST, function() {
  console.log("Connected to ImageDB server on: " + HOST + ":" + PORT);
  client.write(ITPpacket.getBytePacket());
});

const filePartitions = [];

client.on("data", partition => filePartitions.push(partition));

// client.on("data", data => {

//   let bufferSize = data.byteLength;


// });

client.on("end", () => {
  const resPacket = Buffer.concat(filePartitions);
  let file = resPacket.slice(12);
  let header = resPacket.slice(0,12);

  fs.writeFile(process.argv[5], file, 'binary', function(error, wrote){
    if(error) {
      console.log(error);
    } else {
      open(process.argv[5]);
    }
  });

  let v = parseBitPacket(resPacket, 0, 4);
  let resTypeInteger = parseBitPacket(resPacket, 4, 8);
  let seqNum = parseBitPacket(resPacket, 12, 20)
  let timestamp = parseBitPacket(resPacket, 32, 32);
  
  let resType;

  switch(resTypeInteger){
    case 0 : resType = "Query"; break;
    case 1 : resType = "Found"; break;
    case 2 : resType = "Not found"; break;
    case 3 : resType = "Busy"; break;      
  }
  console.log(printPacketBit(header) +
    "Server sent: \n" +
    "\n    --ITP version = " + v +
    "\n    --Response Type = " + resType +
    "\n    --Sequence Number =  " + seqNum +
    "\n    --Timestamp = " + timestamp
  );

  client.end();
});

client.on("close", function(){
  console.log("Connection closed");
})

client.on("end", () => {
  console.log("Disconnected from the server")
})


// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
      // let us get the actual byte position of the offset
      let bytePosition = Math.floor((offset + i) / 8);
      let bitPosition = 7 - ((offset + i) % 8);
      let bit = (packet[bytePosition] >> bitPosition) % 2;
      number = (number << 1) | bit;
    }
    return number;
  }
  
  // Prints the entire packet in bits format
  function printPacketBit(packet) {
    var bitString = "";
  
    for (var i = 0; i < packet.length; i++) {
      // To add leading zeros
      var b = "00000000" + packet[i].toString(2);
      // To print 4 bytes per line
      if (i > 0 && i % 4 == 0) bitString += "\n";
      bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
  }


  