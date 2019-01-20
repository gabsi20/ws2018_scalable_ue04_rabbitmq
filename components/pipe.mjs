import amqp from 'amqplib';
import Filter from './filter'

export default class Pipe {
  constructor({ name, filters }) {
    this.name = name;
    this.filterFunctions = filters;
    this.filters = [];
  }

  async setup() {
    try {
      this.connection = await amqp.connect("amqp://localhost");
      this.channel = await this.connection.createChannel();
      this.channel.assertExchange(this.name, "direct", { passive: false });
    } catch (e) {
      console.log(e);
    }
    this.channel.assertQueue("final", { durable: true });
    this.channel.bindQueue("final", this.name, "final");
    this.filterFunctions.forEach((filterFunction, idx) => {
      this.channel.assertQueue(`filter${idx}`, { durable: true });
      this.channel.bindQueue(`filter${idx}`, this.name, `filter${idx}`);
      const filter = new Filter({
        input: `filter${idx}`,
        toCall: filterFunction,
        output:
          idx + 1 === this.filterFunctions.length
            ? "final"
            : `filter${idx + 1}`,
        exchange: this.name
      });
      filter.run();
    });
  }

  receive() {
    this.channel.consume(
      "final",
      message => {
        if (message) {
          console.log(message.content.toString());
        }
      },
      { noAck: true }
    );
  }

  async start(input) {
    await this.setup();
    this.channel.publish(this.name, "filter0", Buffer.from(input));
    this.receive();
  }
}
