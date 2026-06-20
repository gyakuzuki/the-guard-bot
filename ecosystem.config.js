module.exports = {
     apps : [{
       name   : "zuki-bot",
       script : "./index.js", // Actual main file
       env: {
         NODE_OPTIONS: "--dns-result-order=ipv4first"
       }
     }]
   }
