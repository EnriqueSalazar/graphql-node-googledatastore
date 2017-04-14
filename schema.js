'use strict';

// mutation{
//   createQuizEntry(firstname:"Enrique", lastname:"Salazar"){
//     id
//   }
// }

// query{quizEntries{
//   id,
//   firstname,
//   lastname
// }}

const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const resolvers = require('./resolvers').resolvers;

const typeDefs = `
type QuizEntry {
    id:ID
    firstname: String
    lastname: String
}

type Query {
    quizEntries: [QuizEntry]
}

type Mutation {
    createQuizEntry(firstname:String, lastname: String):QuizEntry
}
`;
const schema = makeExecutableSchema({typeDefs, resolvers});

module.exports.schema = schema;
