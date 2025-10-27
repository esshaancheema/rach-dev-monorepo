import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { config } from '../config';

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: config.jwt.secret,
    verify: {
      algorithms: ['HS256'],
    },
  });

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}

export default fp(authPlugin, {
  name: 'auth-plugin',
});