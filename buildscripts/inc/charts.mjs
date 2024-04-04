import { join } from 'path'
import { graphql } from 'graphql'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { Config } from './config.mjs'
import util from 'util'

const __dirname = import.meta.dirname

const typeDefs = loadSchemaSync(join(__dirname, 'charts.graphql'), {
  loaders: [new GraphQLFileLoader()]
})

const maps = {
  chartTypes: {
    'Doughnut': 'doughnut',
    'Bar': 'bar'
  },
  chartColors: {
    'Color 1': 'theme-color-1',
    'Color 2': 'theme-color-2',
    'Color 3': 'theme-color-3'
  },
  formatters: {
    'Percent (%)': 'percent',
    'Dollars ($)': 'dollars'
  }
}

const getDatasetsByChart = (chart, records) => {
  const result = []
  chart.fields['Datasets'].forEach(id => {
    const dataset = records.datasets.find(record => record.id === id)
    result.push(dataset)
  })
  return result
}

const getDataPointsByDataset = (dataset, records) => {
  const result = []
  try {
    if (dataset.fields) {
      const dataPoints = dataset.fields['Data Points']
      dataPoints.forEach(id => {
        const dataPoint = records.dataPoints.find(record => record.id === id)
        if (dataPoint) {
          result.push(dataPoint)
        }
      })
    } else {
      console.debug('no fields found for Dataset:', dataset)
    }
  } catch (err) {
    console.error('Error:', err)
  }
  return result
}

const getDataPointsByChart = (chart, records) => {
  const result = []
  const datasets = getDatasetsByChart(chart, records)
  datasets.forEach(dataset => {
    try {
      const dataPoints = getDataPointsByDataset(dataset, records)
      dataPoints.forEach(dataPoint => {
        result.push(dataPoint)
      })
    } catch (err) {
      // console.debug(`Error parsing Dataset ${dataset.fields['Name']}: `, err)
      throw err
    }
  })
  return result
}

const aggregateFields = (dataPoints, fieldName, callback) => {
  const result = []
  dataPoints.forEach(dataPoint => {
    if (typeof callback === 'function') {
      result.push(callback(dataPoint.fields[fieldName]))
    } else {
      result.push(dataPoint.fields[fieldName])
    }
  })

  return result
}

const processCharts = (records, writeCallback) => {
  const resolvers = {
    Query: {
      charts: () => records.charts,
      datasets: () => records.datasets,
      dataPoints: () => records.dataPoints,
      chart: (_, args) => {
        if (args.id) {
          return records.charts.find(record => record.id === args.id)
        }
        if (args.name) {
          return records.charts.find(record => record.fields['Name'] === args.name)
        }
      },
      dataset: (_, args) => records.datasets.find(record => record.id === args.id),
      dataPoint: (_, args) => records.dataPoints.find(record => record.id === args.id),
    },
    Chart: {
      type: chart => maps.chartTypes[chart.fields['Type']],
      data: chart => chart
    },
    ChartData: {
      labels: chart => {
        const dataPoints = getDataPointsByChart(chart, records)
        const labels = [...new Set(dataPoints.map(dataPoint => dataPoint.fields['Label'][0]))]
        return labels
      },
      datasets: chart => getDatasetsByChart(chart, records)
    },
    Dataset: {
      label: dataset => dataset.fields['Label'],
      type: dataset => maps.chartTypes[dataset.fields['Type']],
      backgroundColor: dataset => {
        if (dataset.fields['Color']) {
          return [maps.chartColors[dataset.fields['Color']]]
        }
        return aggregateFields(getDataPointsByDataset(dataset, records), 'Color', color => maps.chartColors[color])
      },
      borderColor: dataset => {
        if (dataset.fields['Color']) {
          return [maps.chartColors[dataset.fields['Color']]]
        }
        return aggregateFields(getDataPointsByDataset(dataset, records), 'Color', color => maps.chartColors[color])
      },
      axis: dataset => dataset.fields['Axis'],
      data: dataset => aggregateFields(getDataPointsByDataset(dataset, records), 'Value')
    },
    DataPoint: {
      label: () => {},
      value: () => {},
      color: () => {}
    }
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  Config.charts.forEach(chart => {
    graphql({
      schema,
      source: chart.query
    }).then(response => {
      const result = response.data.chart
      result.options = chart.options
      writeCallback(`./data/chart--${chart.name}.json`, JSON.stringify(result, null, 2))
    })
  })
}

export { processCharts };