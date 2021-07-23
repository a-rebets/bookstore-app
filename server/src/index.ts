import { ApolloServer, gql } from 'apollo-server';
import { types } from './graphql/types';
import { resolvers } from './graphql/resolvers';

const server = new ApolloServer({
    typeDefs: gql`
        ${types}
    `,
    resolvers
});

const port = 8080;

server.listen({ port: port, }).then(_ => {
    console.log(`Server ready at ${port}`);
});
