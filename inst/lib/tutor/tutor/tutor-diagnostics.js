define("rstudio/mode/r_worker", ["require", "exports", "module"], function(require, exports, module) {
   var oop = require("ace/lib/oop");
   var Mirror = require("ace/worker/mirror").Mirror;
   var WorkerClient = require("ace/worker/worker_client").WorkerClient;

   var RMode = require("ace/mode/r").Mode;
   
   // monkey-patch the R mode with our worker
   RMode.prototype.createWorker = function(session) {
      var worker = new WorkerClient(["rstudio"], "rstudio/mode/r_worker", "RWorker");
      worker.attachToDocument(session.getDocument());
      
      worker.on("annotate", function(results) {
         session.setAnnotations(results.data);
      });
      
      worker.on("terminate", function() {
         session.clearAnnotations();
      });
      
      return worker;
   };

   // define our diagnostics worker
   var Worker = function(sender) {
      Mirror.call(this, sender);
      // TODO: other initialization?
   };
   oop.inherits(Worker, Mirror);
   
   (function() {

      this.onUpdate = function() {
         var errors = [];

         // TODO: populate errors with diagnostics

         this.sender.emit("annotate", errors);
      };
      
   }).call(Worker.prototype);
   
   exports.Worker = Worker;

});
