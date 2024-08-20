import amqp from "amqplib";
import env from "dotenv";
env.config("../.env");
const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message));
    setTimeout(() => {
      connection.close();
    }, 500);
  },
}

export default ProducerService