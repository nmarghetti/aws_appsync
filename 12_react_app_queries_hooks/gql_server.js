// https://www.apollographql.com/docs/apollo-server/monitoring/metrics/
import { ApolloServer, gql } from 'apollo-server';
import { DataSource } from 'apollo-datasource';
import { Sequelize } from 'sequelize';

// eslint-disable-next-line no-console
const log = console.log;

// Local SQLite database
function createStore() {
  const db = new Sequelize({
    dialect: 'sqlite',
    storage: './store.sqlite',
  });

  const data = db.define('data', {
    content: Sequelize.STRING,
  });

  data.findOrCreate({ where: { content: 'Some test' } });
  data.findOrCreate({ where: { content: 'Another test' } });
  data.sync();

  return { db, data };
}
const store = createStore();
console.log(store);

// API to connect to local SQLite database
class DataAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }
  initialize(config) {
    this.context = config.context;
  }

  async listData() {
    console.log('eheh ');
    return (await this.store.data.findAll()).map((data) => data.dataValues);
  }

  async addData({ content }) {
    console.log('add data ');
    let data = await this.store.data.findOrCreate({ where: { content } });
    if (data) {
      return data[0].dataValues;
    }
    return null;
  }

  async delData({ content }) {
    console.log('del data ');
    let data = await this.store.data.destroy({ where: { content } });
    if (data) return true;
    console.log(data);
    return false;
  }
}

const schema = gql`
  type Data {
    id: ID!
    content: String!
  }

  type DataConnection {
    items: [Data]!
  }

  type Query {
    getData(id: ID!): Data
    listData: DataConnection!
  }

  type Mutation {
    addData(content: String!): Data!
    delData(content: String!): Boolean!
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    listData: async (_, __, { dataSources }) => {
      console.log('Coming here');
      console.log(dataSources);
      const allData = await dataSources.data.listData();
      console.log(allData);
      return { items: allData };
    },
  },
  Mutation: {
    addData: async (_, { content }, { dataSources }) => {
      const data = await dataSources.data.addData({ content });
      console.log(data);
      return data;
    },
    delData: async (_, { content }, { dataSources }) => {
      const data = await dataSources.data.delData({ content });
      console.log(data);
      return data;
    },
  },
};

const dataSources = () => ({
  data: new DataAPI({ store }),
});

const serverMocks = {
  DataConnection: () => ({ items: [{ content: 'mocked data' }] }),
};

const debugPlugin = {
  serverWillStart() {
    console.log('Server starting up');
  },
  requestDidStart(requestContext) {
    try {
      let query = requestContext.request.operationName;
      if (!query) query = requestContext.request.query.operationName;
      // I have not found a better solution then regexp yet to find the name of the query
      if (!query) {
        query = requestContext.request.query.match(new RegExp('^ *result: *([a-zA-Z0-9]+) *(\\(|\\{)', 'm'));
        if (query) query = query[1];
        log(`Better check ${query}`);
      }
      if (!query) {
        query = requestContext.request.query.match(new RegExp('^ *([a-zA-Z0-9_]+) *(\\(|\\{)', 'mg'));
        if (query) {
          query = query[1].indexOf('mutation') === -1 ? query[1] : query[2];
          query = query.replace('(', '').replace('{', '').trim();
        }
        log(`Better check ${query}`);
      }
      if (query) {
        log(`Request started: ${query} ${JSON.stringify(requestContext.request.variables)}`);
        const queryType =
          requestContext.schema._mutationType &&
          requestContext.schema._mutationType._fields &&
          requestContext.schema._mutationType._fields[query]
            ? requestContext.schema._mutationType._fields[query].type.name
            : null;
        if (queryType) {
          if (!serverMocks[queryType]) {
            log(`You should better add the following type in serverMocks: ${queryType}`);
          }
        } else {
          log(`Weird request started: ${query} ${JSON.stringify(requestContext.request.variables)}`);
        }
      } else {
        log(`Null request started: ${query} ${JSON.stringify(requestContext.request.variables)}`);
        log(requestContext.request.query);
      }
      // query: requestContext.query.substring(0, 50),
      return {
        parsingDidStart() {
          return (err) => {
            if (err) {
              console.error('Parsing error', err);
            }
          };
        },

        validationDidStart() {
          return (errs) => {
            if (errs) {
              console.error('Validation errors:');
              errs.forEach((err) => console.error(err));
            }
          };
        },

        didEncounterErrors() {
          console.log('Error received !!!');
        },

        executionDidStart() {
          return (err) => {
            if (err) {
              console.error('Execution error', err);
            }
          };
        },

        willSendResponse() {
          console.log('Replying');
        },
      };
    } catch (error) {
      log(error);
    }
  },
};

const server = new ApolloServer({
  typeDefs: schema,
  // Mock types can all be taken from the schema
  // mocks: Object.assign(
  //   {},
  //   ...schema.definitions.filter((e) => e.kind === 'ObjectTypeDefinition').map((e) => ({ [e.name.value]: serverFindMock })),
  // ),
  mocks: serverMocks,
  dataSources,
  mockEntireSchema: false,
  resolvers,
  plugins: [debugPlugin],
  context: async () => {
    return {
      req_context: true,
    };
  },
  debug: true,
  schemaDirectives: {
    // https://www.apollographql.com/docs/apollo-server/schema/directives/#using-custom-schema-directives
    // aws_iam: (e) => e,
  },
  // Uncomment the following to see all the response in the console
  formatResponse: (e) => {
    const data = JSON.stringify(e, 2);
    if (data.indexOf('Hello World') !== -1) {
      log(JSON.stringify(e, 2));
    }
    return e;
  },
});

server.listen({ port: 8090 }).then(({ url }) => {
  log(`🚀 Graphql server ready at ${url}`);
});
