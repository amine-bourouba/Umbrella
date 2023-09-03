import { useEffect } from 'react'
import Highcharts from 'highcharts';
import Windbarb from "highcharts/modules/windbarb";
import { dictionary } from "../../assets/weather-icons-dictionary.json";
import './WeatherChart.css';

export default function WeatherChart() {
  let symbols = [];
  let precipitations = [];
  let precipitationsError = [];
  let winds = [];
  let temperatures = [];
  let pressures = [];

  /**
   * Adds visual elements to certain graphs.
   */
  const onChartLoad = (chart) => {
    drawWeatherSymbols(chart);
    drawBlocksForWindArrows(chart);
  };

  /**
 * Draw the weather symbols on top of the temperature series. The symbols are
 * fetched from yr.no's MIT licensed weather symbol collection.
 * https://github.com/YR/weather-symbols
 */
  const drawWeatherSymbols = (chart) => {
    chart.series[0].data.forEach((point, i) => {
        if (i % 2 === 0) {

            const [symbol, specifier] = symbols[i].split('_'),
                icon = dictionary[symbol].symbol +
                    ({ day: 'd', night: 'n' }[specifier] || '');

            if (dictionary[symbol]) {
                chart.renderer
                    .image(
                        'https://cdn.jsdelivr.net/gh/nrkno/yr-weather-symbols' +
                            `@8.0.1/dist/svg/${icon}.svg`,
                        point.plotX + chart.plotLeft - 8,
                        point.plotY + chart.plotTop - 30,
                        30,
                        30
                    )
                    .attr({
                        zIndex: 5
                    })
                    .add();
            } else {
                console.log(symbol);
            }
        }
    });
  };

  /**
  * Draw blocks around wind arrows, below the plot area
  */
  const drawBlocksForWindArrows = (chart) => {
    const xAxis = chart.xAxis[0];

    for (
        let pos = xAxis.min, max = xAxis.max, i = 0;
        pos <= max + 36e5; pos += 36e5,
        i += 1
    ) {

        // Get the X position
        const isLast = pos === max + 36e5,
            x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

        // Draw the vertical dividers and ticks
        const isLong = i % 2 === 0;

        chart.renderer
            .path([
                'M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
                'L', x, chart.plotTop + chart.plotHeight + 32,
                'Z'
            ])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }

    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + 8
    });
  };

  /**
  * Create the chart. This function is called async when the data file is loaded
  * and parsed.
  */
  const createChart = async () => {
    Windbarb(Highcharts);
    await new Highcharts.Chart(getChartOptions(), chart => {
        onChartLoad(chart);
    });
  };

  const onError = () => {
    document.getElementById('loading').innerHTML =
        '<i class="fa fa-frown-o"></i> Failed loading data, please try again later';
  };

  /**
  * Handle the data. This part of the code is not Highcharts specific, but deals
  * with yr.no's specific data format
  */
  const parseYrData = (json) => {

    let pointStart;

    if (!json) {
        return onError();
    }
    
    // Initialize
    symbols = [];
    precipitations = [];
    precipitationsError = []; // Only for some data sets
    winds = [];
    temperatures = [];
    pressures = [];

    // Loop over hourly (or 6-hourly) forecasts
    json.properties.timeseries.forEach((node, i) => {

        const x = Date.parse(node.time),
            nextHours = node.data.next_1_hours || node.data.next_6_hours,
            symbolCode = nextHours && nextHours.summary.symbol_code,
            to = node.data.next_1_hours ? x + 36e5 : x + 6 * 36e5;

        if (to > pointStart + 48 * 36e5) {
            return;
        }

        // Populate the parallel arrays
        symbols.push(nextHours.summary.symbol_code);
        temperatures.push({
            x,
            y: node.data.instant.details.air_temperature,
            // custom options used in the tooltip formatter
            to,
            symbolName: dictionary[
                symbolCode.replace(/_(day|night)$/, '')
            ].text
        });

        precipitations.push({
            x,
            y: nextHours.details.precipitation_amount
        });

        if (i % 2 === 0) {
            winds.push({
                x,
                value: node.data.instant.details.wind_speed,
                direction: node.data.instant.details.wind_from_direction
            });
        }

        pressures.push({
            x,
            y: node.data.instant.details.air_pressure_at_sea_level
        });

        if (i === 0) {
            pointStart = (x + to) / 2;
        }
    });

    // Create the chart when the data is loaded
    createChart();
  };

  // Initialize chart configuration here
  const getChartOptions = () => {
    return {
      chart: {
        renderTo: 'container',
        marginBottom: 70,
        marginRight: 40,
        marginTop: 50,
        plotBorderWidth: 1,
        height: 310,
        alignTicks: false,
        scrollablePlotArea: {
            minWidth: 720
        }
      },

      defs: {
          patterns: [{
              id: 'precipitation-error',
              path: {
                  d: [
                      'M', 3.3, 0, 'L', -6.7, 10,
                      'M', 6.7, 0, 'L', -3.3, 10,
                      'M', 10, 0, 'L', 0, 10,
                      'M', 13.3, 0, 'L', 3.3, 10,
                      'M', 16.7, 0, 'L', 6.7, 10
                  ].join(' '),
                  stroke: '#68CFE8',
                  strokeWidth: 1
              }
          }]
      },

      title: {
          text: 'MAYBE: ADD CHART TITLE',
          align: 'left',
          style: {
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
          }
      },

      tooltip: {
          shared: true,
          useHTML: true,
          headerFormat:
              '<small>{point.x:%A, %b %e, %H:%M} - {point.point.to:%H:%M}</small><br>' +
              '<b>{point.point.symbolName}</b><br>'

      },

      xAxis: [{
          type: 'datetime',
          tickInterval: 2 * 36e5,
          minorTickInterval: 36e5,
          tickLength: 0,
          gridLineWidth: 1,
          gridLineColor: 'rgba(128, 128, 128, 0.1)',
          startOnTick: false,
          endOnTick: false,
          minPadding: 0,
          maxPadding: 0,
          offset: 30,
          showLastLabel: true,
          labels: {
              format: '{value:%H}'
          },
          crosshair: true
      }, {
          linkedTo: 0,
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          labels: {
              format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
              align: 'left',
              x: 3,
              y: 8
          },
          opposite: true,
          tickLength: 20,
          gridLineWidth: 1
      }],

      yAxis: [{ // temperature axis
          title: {
              text: null
          },
          labels: {
              format: '{value}°',
              style: {
                  fontSize: '10px'
              },
              x: -3
          },
          plotLines: [{
              value: 0,
              color: '#BBBBBB',
              width: 1,
              zIndex: 2
          }],
          maxPadding: 0.3,
          minRange: 8,
          tickInterval: 1,
          gridLineColor: 'rgba(128, 128, 128, 0.1)'

      }, { // precipitation axis
          title: {
              text: null
          },
          labels: {
              enabled: false
          },
          gridLineWidth: 0,
          tickLength: 0,
          minRange: 10,
          min: 0

      }, { // Air pressure
          allowDecimals: false,
          title: {
              text: 'hPa',
              offset: 0,
              align: 'high',
              rotation: 0,
              style: {
                  fontSize: '10px',
                  color: Highcharts.getOptions().colors[2]
              },
              textAlign: 'left',
              x: 3
          },
          labels: {
              style: {
                  fontSize: '8px',
                  color: Highcharts.getOptions().colors[2]
              },
              y: 2,
              x: 3
          },
          gridLineWidth: 0,
          opposite: true,
          showLastLabel: false
      }],

      legend: {
          enabled: false
      },

      plotOptions: {
          series: {
              pointPlacement: 'between'
          }
      },


      series: [{
          name: 'Temperature',
          data: temperatures,
          type: 'spline',
          marker: {
              enabled: false,
              states: {
                  hover: {
                      enabled: true
                  }
              }
          },
          tooltip: {
              pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                  '{series.name}: <b>{point.y}°C</b><br/>'
          },
          zIndex: 1,
          color: '#FF3333',
          negativeColor: '#48AFE8'
      }, {
          name: 'Precipitation',
          data: precipitationsError,
          type: 'column',
          color: 'url(#precipitation-error)',
          yAxis: 1,
          groupPadding: 0,
          pointPadding: 0,
          tooltip: {
              valueSuffix: ' mm',
              pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                  '{series.name}: <b>{point.minvalue} mm - {point.maxvalue} mm</b><br/>'
          },
          grouping: false,
          dataLabels: {
              enabled: false,
              filter: {
                  operator: '>',
                  property: 'maxValue',
                  value: 0
              },
              style: {
                  fontSize: '8px',
                  color: 'gray'
              }
          }
      }, {
          name: 'Precipitation',
          data: precipitations,
          type: 'column',
          color: '#68CFE8',
          yAxis: 1,
          groupPadding: 0,
          pointPadding: 0,
          grouping: false,
          dataLabels: {
              enabled: true,
              filter: {
                  operator: '>',
                  property: 'y',
                  value: 0
              },
              style: {
                  fontSize: '8px',
                  color: '#666'
              }
          },
          tooltip: {
              valueSuffix: ' mm'
          }
      }, {
          name: 'Air pressure',
          color: Highcharts.getOptions().colors[2],
          data: pressures,
          marker: {
              enabled: false
          },
          shadow: false,
          tooltip: {
              valueSuffix: ' hPa'
          },
          dashStyle: 'shortdot',
          yAxis: 2
      }, {
          name: 'Wind',
          type: 'windbarb',
          id: 'windbarbs',
          color: Highcharts.getOptions().colors[1],
          lineWidth: 1.5,
          data: winds,
          vectorLength: 18,
          yOffset: -15,
          tooltip: {
              valueSuffix: ' m/s'
          }
      }]
    }
  };

  useEffect(() => {
    const url = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=51.50853&lon=-0.12574&altitude=25';
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(json => {
        parseYrData(json);
        createChart();
      })
      .catch(error => {
        console.log("🚀 ~ file: WeatherChart.jsx:392 ~ WeatherChart ~ componentDidMount ~ error:", error)
        onError();
      });
  },[])
  
    return (
      <figure className="highcharts-figure">
        <div id="container">
            <div id="loading">
                <i className="fa fa-spinner fa-spin"></i> Loading data from external source
            </div>
        </div>
      </figure>
    );
}
