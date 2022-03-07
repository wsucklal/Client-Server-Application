let net = require("net");
let fs = require("fs");
let open = require("open");
let ITPpacket = require('./ITPRequest');

// Enter your code for the client functionality here
// Process is built into node referring to the GetImage -s <serverIP>:<port> -q <image name> -v <version>
// argv determines which section of the call we are on

let connectInfo = process.argv[3].split(":");
let HOST = connectInfo[0];
let PORT = connectInfo[1];
let commandLineArray = process.argv;
let packageData = [];

//Creating nnew a socket connection
let client = new net.Socket();
client.connect(PORT, HOST, function() {
  console.log("Connected to ImageDB server on: " + HOST + ":" + PORT + "\n");

//If creating the packet works form commmand line write packet back
  if (handleCommandLine(commandLineArray)){
    client.write(ITPpacket.getBytePacket());
  }
  else{
    client.end();
  }
});

client.on("data", data => {

  //Handle packets from server
  console.log("ITP packet header received: \n");
  packageData.push(data);
  handleServerPackets(packageData);

});

client.on("end", () => {
  client.end();
});

function handleServerPackets(data){
      
//Collect pacekt fields
  let reponsePacket = Buffer.concat(data);
  let image = reponsePacket.slice(12);
  let responseHeader = reponsePacket.slice(0,12);
  let v = parseBitPacket(reponsePacket, 0, 4);
  let resTypeInteger = parseBitPacket(reponsePacket, 4, 8);
  let responseType;
  let seqNumber = parseBitPacket(reponsePacket, 12, 20)
  let timestamp = parseBitPacket(reponsePacket, 32, 32);
  
  //Open file if response type is found
  if(resTypeInteger == 1){
    try{
      fs.writeFile(process.argv[5], image, 'binary', function(){open(process.argv[5])});
    }
    catch(err){
      console.log(err);
    }
  }  
 
  //convert request type int to request type string
  switch(resTypeInteger){
    case 0 : responseType = "Query"; break;
    case 1 : responseType = "Found"; break;
    case 2 : responseType = "Not found"; break;
    case 3 : responseType = "Busy"; break;      
  }

  console.log(

    printPacketBit(responseHeader) + "\n"+

    "Server sent: \n" +

    "--ITP version = " + v + "\n" +

    "--Response Type = " + responseType + "\n" +

    "--Sequence Number =  " + seqNumber + "\n" +
    
    "--Timestamp = " + timestamp
  );
}

client.on("close", function(){
  console.log("Connection closed");
})

client.on("end", () => {
  console.log("\nDisconnected from the server")
})

//Take command line input and prepare packet
function handleCommandLine(argv){

  let image = argv[5].split(".");
  
  let imageName = image[0];
  let imageType = image[1];
  let v = argv[7];
  
      //convert image type int to request type string
    switch(imageType){
      case "bmp" : imageExtensionInteger = 1; break;
      case "jpeg" : imageExtensionInteger = 2; break;
      case "gif" : imageExtensionInteger = 3; break;
      case "png" : imageExtensionInteger = 4; break;
      case "tiff" : imageExtensionInteger = 5;  break;
      case "raw" : imageExtensionInteger = 15; break;
      default : console.log("Wrong file type"); return false;   
    }
        
    //check for version
    if(v==7){
      ITPpacket.init(imageName,v,imageExtensionInteger);
      ITPpacket.getBytePacket();
      return true;
    }
    else{
      console.log("\nYou has an unsupported version!");
      return false;
    }
  }


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


  