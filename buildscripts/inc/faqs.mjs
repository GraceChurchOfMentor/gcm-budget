import { join } from 'path'
import { graphql } from 'graphql'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { makeExecutableSchema } from '@graphql-tools/schema'

const __dirname = import.meta.dirname

const typeDefs = loadSchemaSync(join(__dirname, 'faqs.graphql'), {
  loaders: [new GraphQLFileLoader()]
})

const processFaqs = (records, writeCallback) => {
  const resolvers = {
    Query: {
      faqs: () => [...new Set(records.map(question => question.fields.Category))]
    },
    Category: {
      name: category => category,
      questions: category => records.filter(record => record.fields.Category === category)
    },
    Question: {
      slug: q => q.fields.Slug,
      category: q => q.fields.Category,
      question: q => q.fields.Question,
      answer: q => q.fields.Answer
    }
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  graphql({
    schema,
    source: "{ faqs { name, questions { slug, question, answer } } }",
  }).then(response => {
    writeCallback('./data/faqs.json', JSON.stringify(response.data.faqs))
  })
}

export { processFaqs }