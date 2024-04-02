document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.chartjs').forEach(el => {
    const defaults = {
      plugins: {
        bar: [ ChartDeferred ],
        doughnut: [ ChartDeferred, ChartDataLabels ]
      }
    }

    const callbacks = {
      doughnutLabelFormatter: (value, context) => {
        const label = context.chart.data.labels[context.dataIndex]
        return `${label}\n${value}%`
      },
      barYAxisFormatter: (value, index, values) => {
        if (index === values.length - 1) {
          return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        }
        return value.toLocaleString("en-US")
      }
    }

    const getPropertyFromPath = (obj, path, context = ['obj']) => {
      while (path.length) {
        if (typeof obj[path[0]] === 'undefined') return undefined
        if (path.length === 1) return obj[path[0]]

        context.push(path[0])
        return getPropertyFromPath(obj[path[0]], path.slice(1), context)
      }
    }

    const data = JSON.parse(el.dataset.chartData)
    data.plugins = defaults.plugins[data.type]

    const datalabelsFormatter = getPropertyFromPath(data, ['options', 'plugins', 'datalabels', 'labels', 'default', 'formatter'])
    if (datalabelsFormatter) {
      data.options.plugins.datalabels.labels.default.formatter = callbacks[datalabelsFormatter]
    }

    const yAxisFormatter = getPropertyFromPath(data, ['options', 'scales', 'y', 'ticks', 'callback'])
    if (yAxisFormatter) {
      data.options.scales.y.ticks.callback = callbacks[yAxisFormatter]
    }

    new Chart(el, data)
  })
})