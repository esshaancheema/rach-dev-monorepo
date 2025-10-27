import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const websocketPlugin = fp(async (fastify: FastifyInstance) => {
  // Register WebSocket support
  await fastify.register(require('@fastify/websocket'));

  // WebSocket route for real-time project updates
  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, request) => {
      // Handle WebSocket connection
      connection.socket.on('message', message => {
        // Handle incoming WebSocket messages
        const data = JSON.parse(message.toString());
        
        fastify.log.debug({ data }, 'WebSocket message received');

        // Echo back for now - implement real logic later
        connection.socket.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString(),
        }));
      });

      connection.socket.on('close', () => {
        fastify.log.debug('WebSocket connection closed');
      });

      // Send welcome message
      connection.socket.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Zoptal Project Service',
        timestamp: new Date().toISOString(),
      }));
    });
  });

  fastify.log.info('WebSocket support enabled');
});

export default websocketPlugin;