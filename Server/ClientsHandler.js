let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');

// You may need to add some delectation here
let v, timestamp, fileName,fileExtensionInteger, c, reqTypeInteger, reqType ;

module.exports = {

    handleClientJoining: function (sock) {
        //
        // Enter your code here
        //
        // you may need to develop some helper functions
        // that are defined outside this export block

        let clientNo = singleton.getTimestamp();
        console.log("Client-" + clientNo + " is connected at timestamp" + singleton.getTimestamp());
       
        sock.on ("data", data =>{
            console.log("ITP Packet received:");
            console,log();
            handleClientPackets(data);
        });

        sock.on("close",data =>{
            handleClientLeaving();
        });
    }
};

//Handling Client Packets
function handleClientPackets(data){

    v = parseBitPacket(data, 0, 4);
    timestamp = parseBitPacket(data, 32, 32);
    fileExtensionInteger = parseBitPacket(data, 64, 4);
    reqTypeInteger = parseBitPacket(data, 24, 8);
    fileName = bytesToString(data.slice(12));

    //convert request type int to request type string
    switch(reqTypeInteger){
        case 0 : reqType = "Query"; break;
        case 1 : reqType = "Found"; break;
        case 2 : reqType = "Not found"; break;
        case 3 : reqType = "Busy"; break;      
    }

    //convert request type int to request type string
    switch(fileExtensionInteger){
      
        case 1 : fileExtension = "BMP"; break;
        case 2 : fileExtension = "JPEG"; break;
        case 3 : fileExtension = "GIF"; break;
        case 4 : fileExtension = "PNG"; break;
        case 5 : fileExtension = "TIFF"; break;
        case 15 : fileExtension = "RAW"; break;      
    }

    console.log(
        "Client-" + clientNo + "requests :\n" + 
        
        "-- ITP version: " +  v + "\n " + 

        "-- Timestamp: " +  timestamp +  "\n " + 

        "-- Request Type: " +  reqType +  "\n " + 

        "-- Image file extension(s):" +  fileExtension + "\n" +
        
        "-- Image file name: " + fileName
        );

    ITPpacket.getPacket(data);
    sock.write(ITPpacket.getPacket(data));
}

function handleClientLeaving(){
    console.log ( "Client-" +  clientNo + "closed the connection")
}
//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

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

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}