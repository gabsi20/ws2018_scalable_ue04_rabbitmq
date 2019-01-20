import amqp from 'amqplib';

export default class Filter {
  constructor({input, toCall, output, exchange}){
    this.input = input;
    this.toCall = toCall;
    this.output = output;
    this.exchange = exchange;
  }

  async run(){
    await this.connect();
    this.receive()
  }

  async connect(){
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
  }

  async receive(){
    await this.channel.consume(this.input, message => {
      if (message) {
        const processed = this.toCall(message.content.toString());
        this.emit(processed);
        setTimeout(() => {
          this.connection.close()
        }, 2000)
      }
    }, { noAck: true })
  }

  emit(message){
    this.channel.publish(this.exchange, this.output, Buffer.from(message), { persistent: true });
  }
}
