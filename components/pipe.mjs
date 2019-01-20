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
      await this.channel.assertExchange(this.name, "direct", { passive: false });
    } catch (e) {
      console.log(e);
    }
    await this.createQueues();
    await this.createFilters();
  }

  createFilters() {
    this.filterFunctions.forEach((filterFunction, idx) => {
      const filter = new Filter({
        input: `${this.name}-filter${idx}`,
        toCall: filterFunction,
        output:
          idx + 1 === this.filterFunctions.length
            ? `${this.name}-final`
            : `${this.name}-filter${idx + 1}`,
        exchange: this.name
      });
      filter.run();
    });
  }

  createQueues(){
    const promises = [];
    promises.push(this.channel.assertQueue(`${this.name}-final`, { durable: true }));
    promises.push(this.channel.bindQueue(`${this.name}-final`, this.name, `${this.name}-final`));
      this.filterFunctions.forEach((_filterFunction, idx) => {
        promises.push(this.channel.assertQueue(`${this.name}-filter${idx}`, { durable: true }));
        promises.push(this.channel.bindQueue(`${this.name}-filter${idx}`, this.name, `${this.name}-filter${idx}`));
    });
    return Promise.all(promises);
  }

  receive() {
    this.channel.consume(
      `${this.name}-final`,
      message => {
        if (message) {
          console.log(`\n${this.name} returned: \n${message.content.toString()}\n\n`);

          setTimeout(() => {
            this.connection.close()
          }, 2000)
        }
      },
      { noAck: true }
    );
  }

  async start(input) {
    await this.setup();

    this.channel.publish(this.name, `${this.name}-filter0`, Buffer.from(input));
    this.receive();
  }
}
