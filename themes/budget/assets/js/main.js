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
          prefix: '$',
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
        // if (index === values.length - 1) {
        //   parts.prefix = '$'
        // }

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

    const rgbToRgba = (string, alpha) => {
      const rgb = string.replace(/[^\d,]/g, '').split(',')
      return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
    }

    const json = JSON.parse(el.dataset.chartData)
    const colors = new Map(Object.entries({
      'theme-color-1': extractColorFromDom('theme-color-1'),
      'theme-color-2': extractColorFromDom('theme-color-2'),
      'theme-color-3': extractColorFromDom('theme-color-3')
    }))

    json.plugins = defaults.plugins[json.type]
    Chart.defaults.color = window.getComputedStyle(document.body).color
    Chart.defaults.font.family = 'Montserrat'
    Chart.defaults.font.weight = window.getComputedStyle(document.body).fontWeight
    Chart.defaults.font.size = 11
    Chart.defaults.borderColor = rgbToRgba(window.getComputedStyle(document.body).color, 0.1)

    json.data.datasets.forEach(dataset => {
      dataset.backgroundColor = dataset.backgroundColor.map(color => colors.get(color))
      dataset.borderColor = dataset.borderColor.map(color => colors.get(color))
    })

    const datalabelsFormatter = getPropertyFromPath(json, ['options', 'plugins', 'datalabels', 'labels', 'default', 'formatter'])
    if (datalabelsFormatter) {
      json.options.plugins.datalabels.labels.default.formatter = callbacks[datalabelsFormatter]
    }

    const yAxisFormatter = getPropertyFromPath(json, ['options', 'scales', 'y', 'ticks', 'callback'])
    if (yAxisFormatter) {
      json.options.scales.y.ticks.callback = callbacks[yAxisFormatter]
    }

    document.fonts.ready.then(() => {
      new Chart(el, json)
    })
  })
})