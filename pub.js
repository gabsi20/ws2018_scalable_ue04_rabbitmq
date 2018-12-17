var amqp = require("amqplib/callback_api");

amqp.connect(
  "amqp://localhost",
  function(err, conn) {
    conn.createChannel(function(err, ch) {
      var q = "hello";
      var e = "fhs_exchange";
      var msg = "Hello World!";
      var msg2 = "Hello World!2";

      ch.assertExchange(e, "topic");
      ch.assertQueue(q, { durable: false });

      ch.bindQueue(q, e, "international");

      ch.publish(e, "international", Buffer.from(msg));
      ch.publish(e, "international", Buffer.from(msg2));
      console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
      conn.close();
      process.exit(0);
    }, 500);
  }
);
