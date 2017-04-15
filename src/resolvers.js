'use strict'
// const conf = require('./conf').conf
const config = require('../config/config').config // eslint-disable-line node/no-unpublished-require
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore')

// Your Google Cloud Platform project ID
const projectId = config.get('GCLOUD_PROJECT')

// Instantiates a client
const datastore = Datastore({projectId: projectId})

// Kind in Datastore is like collection or table
const kind = 'quizEntry'

module.exports.resolvers = {
  Query: {
    quizEntries () {
      const quizEntriesQuery = datastore.createQuery(kind)
      return datastore
                .runQuery(quizEntriesQuery)
                .then((results) => {
                  const entries = results[0]
                  entries.map((e) => {
                        // Fixes object structure
                    e.id = e[datastore.KEY].id
                  })
                  return entries
                })
    }
  },
  Mutation: {
    createQuizEntry: (root, {firstname, lastname}) => {
      const quizEntryKey = datastore.key([kind])
      const quizEntry = {
        key: quizEntryKey,
        data: {
          firstname,
          lastname
        }
      }
      return datastore
                .save(quizEntry)
                .then(() => {
                    // console.info('createEntry success', quizEntryKey.path, quizEntry.data);
                    // The key (quizEntryKey) you pass within the entity (quizEntry) gets modified
                    // by save and receives a path property with the auto generated ID.
                  const id = quizEntryKey.path[1]
                  return {id, firstname, lastname}
                })
    }
  }
}
