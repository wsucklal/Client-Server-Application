
// Some code need to be added here, that are common for the module

//VARIABLES
let timeStamp, sequenceNumber;
let timerTick = 10;
module.exports = {
    init: function() {
       // init function needs to be implemented here //
       timeStamp = Math.floor(Math.random() * (999-1) +1);
       sequenceNumber = Math.floor(Math.random() * 100);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
      // Enter your code here //
        return sequenceNumber++;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {

        setInterval( () => {
            
            //Reset timer back to 0
            if (timeStamp >= Math.pow(2,32)){
                timeStamp = 0;
            }
            //Increment timer
            timeStamp++;

            //every 10 milliseconds
        } , timerTick);

        return timeStamp;
    }
};