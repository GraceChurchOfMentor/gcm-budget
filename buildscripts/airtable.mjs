import {} from 'dotenv/config';
import fs from 'fs';
import airtable from 'airtable';
import { processFaqs } from './inc/faqs.mjs';
import { processCharts } from './inc/charts.mjs';

// set up Airtable SDK
const { configure, base } = airtable;
configure({ apiKey: process.env.AIRTABLE_API_TOKEN });
const budgetBase = base('appgNFXSoflimMSDM');

const config = {
  charts: {
    tableName: 'Charts',
    viewName: 'Current',
  },
  datasets: {
    tableName: 'Datasets',
    viewName: 'Current',
  },
  dataPoints: {
    tableName: 'Data Points',
    viewName: 'Current',
  },
  faqs: {
    tableName: 'FAQs',
    viewName: 'Published',
  }
}

const writeDataFile = (filename, string) => {
  fs.writeFile(filename, string, (err) => {
    if (err) {
      throw err;
    }

    console.debug(`File '${filename}' written successfully!`);
  });
}

const promises = [];

Object.entries(config).forEach(async ([key, value]) => {
  value.records = []
  promises.push(new Promise(async (resolve, reject) => {
    budgetBase(value.tableName)
      .select({ view: value.viewName })
      .eachPage((records, fetchNextPage) => {
        records.forEach(record => { value.records.push(record); });
        fetchNextPage();
      }, err => {
        if (err) throw err;
        console.debug(`Query for ${value.tableName} succeeded!`)
        resolve();
      });
  }));
});
await Promise.all(promises)

processFaqs(config.faqs.records, writeDataFile);
processCharts({
  charts: config.charts.records,
  datasets: config.datasets.records,
  dataPoints: config.dataPoints.records
}, writeDataFile);