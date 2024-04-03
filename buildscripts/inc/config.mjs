const Config = {
  charts: [
    {
      name: 'budget-breakdown',
      query: `
        {
          chart(name: "Budget Breakdown") {
            type,
            data {
              labels,
              datasets {
                label,
                type,
                backgroundColor,
                borderColor,
                axis,
                data
              }
            }
          }
        }
      `,
      options: {
        hover: { mode: null },
        rotation: -1,
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          // deferred: { yOffset: 300 },
          datalabels: {
            labels: {
              default: {
                color: 'white',
                font: {
                  size: 18,
                  weight: 400
                },
                align: 'center',
                formatter: 'doughnutLabelFormatter'
              }
            }
          }
        }
      }
    },
    {
      name: 'avb-ytd',
      query: `
        {
          chart(name: "AvB Year-to-Date") {
            type,
            data {
              labels,
              datasets {
                label,
                type,
                backgroundColor,
                borderColor,
                axis,
                data
              }
            }
          }
        }
      `,
      options: {
        hover: { mode: null },
        plugins: {
          tooltip: { enabled: false },
          // deferred: { yOffset: 300 },
        },
        scales: {
          y: {
            ticks: {
              callback: 'barYAxisFormatter'
            }
          }
        }
      }
    },
    {
      name: 'avb-prior-month',
      query: `
        {
          chart(name: "AvB Prior Month") {
            type,
            data {
              labels,
              datasets {
                label,
                type,
                backgroundColor,
                borderColor,
                axis,
                data
              }
            }
          }
        }
      `,
      options: {
        hover: { mode: null },
        plugins: {
          tooltip: { enabled: false },
          // deferred: { yOffset: 300 },
        },
        scales: {
          y: {
            ticks: {
              callback: 'barYAxisFormatter'
            }
          }
        }
      }
    }
  ]
}

export { Config }
