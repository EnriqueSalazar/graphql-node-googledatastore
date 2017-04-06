const conf = require('./conf').conf

// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = conf.projectId;

// Instantiates a client
const datastore = Datastore({projectId: projectId});

const quizEntriesQuery = datastore.createQuery('quizEntry');

exports.resolvers = {
    Query: {
        quizEntries() {
            return datastore
                .runQuery(quizEntriesQuery)
                .then((results) => {
                    const entries = results[0];
                    entries.map((e) => {
                        // Fixes object structure
                        e.id = e[datastore.KEY].id;
                    })
                    return entries;
                })
        }
    },
    Mutation: {
        createQuizEntry: (root, {firstName, lastName}) => {
            const kind = 'quizEntry';
            const quizEntryKey = datastore.key([kind]);
            const quizEntry = {
                key: quizEntryKey,
                data: {
                    firstName,
                    lastName
                }
            }
            return datastore
                .save(quizEntry)
                .then((result) => {
                    console.info('createEntry success', quizEntryKey.path, quizEntry.data);
                    // The key (quizEntryKey) you pass within the entity (quizEntry) gets modified
                    // by save and receives a path property with the auto generated ID.
                    const id = quizEntryKey.path[1];
                    return {id, firstName, lastName}
                })
        }
    }
};