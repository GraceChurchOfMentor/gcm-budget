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
        const parts = {
          prefix: '',
          value: value,
          suffix: ''
        }

        if (value >= 1000000) {
          parts.value = value / 1000000
          parts.suffix = 'M'
        }
        else if (value >= 1000) {
          parts.value = value / 1000
          parts.suffix = 'K'
        }
        if (index === values.length - 1) {
          parts.prefix = '$'
        }

        return `${parts.prefix}${parts.value}${parts.suffix}`
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

    const extractColorFromDom = (color) => {
      const el = document.createElement('div')
      el.classList.add(`background-color--${color}`)
      document.body.appendChild(el)
      const computedColor = window.getComputedStyle(el).backgroundColor
      el.remove()
      return computedColor
    }

    const mapColors = (array) => {
      return array.map(item => {
        return extractColorFromDom(item)
      })
    }

    const data = JSON.parse(el.dataset.chartData)
    data.plugins = defaults.plugins[data.type]

    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? true : false
    Chart.defaults.color = window.getComputedStyle(document.body).color
    Chart.defaults.font.family = 'Montserrat'
    Chart.defaults.font.weight = window.getComputedStyle(document.body).fontWeight
    Chart.defaults.font.size = 11

    data.data.datasets.forEach(dataset => {
      dataset.backgroundColor = mapColors(dataset.backgroundColor)
      dataset.borderColor = mapColors(dataset.borderColor)
    })

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