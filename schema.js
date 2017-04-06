const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const resolvers = require('./resolvers').resolvers;

const typeDefs = `
type QuizEntry {
    id:ID
    firstName: String
    lastName: String
}

type Query {
    quizEntries: [QuizEntry]    
}

type Mutation {
    createQuizEntry(firstName:String, lastName: String):QuizEntry
}
`;
const schema = makeExecutableSchema({typeDefs, resolvers});

exports.schema = schema;