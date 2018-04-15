import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import axios from "axios";
import * as utils from "../../utils/helpers";

import {
  VictoryGroup,
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme
} from "victory";

import ForecastRow from "./ForecastRow";
import ForecastCard from "./ForecastCard";
import ForecastRowHourly from "./ForecastRowHourly";
import ForecastCardHourly from "./ForecastCardHourly";

import "./ForecastContainer.css";

export default class ForecastContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forecast: [],
      hourlyFiveDay: [],
      location: {},
      located: true,
      displayHourly: false,
      hourlyForecastList: []
    };

    this.handleForecastSearch = this.handleForecastSearch.bind(this);
    this.handleGeoSearch = this.handleGeoSearch.bind(this);
    this.handleGeoSearchCurrentWeather = this.handleGeoSearchCurrentWeather.bind(
      this
    );
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleHourlyForecast = this.handleHourlyForecast.bind(this);
    this.getHighsAndLows = this.getHighsAndLows.bind(this);
    this.geolocationError = this.geolocationError.bind(this);
    this.mostFrequent = this.mostFrequent.bind(this);
    this.determineForecastAverage = this.determineForecastAverage.bind(this);
  }

  geolocationError = err => {
    this.setState({
      forecast: [],
      location: {},
      displayHourly: false,
      located: false
    });

    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  componentDidMount() {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    if ("geolocation" in navigator) {
      /* geolocation is available */
      navigator.geolocation.getCurrentPosition(
        position => {
          this.handleGeoSearch(position);
        },
        this.geolocationError,
        options
      );
    } else {
      /* geolocation IS NOT available */
      this.setState({ located: false });
    }
  }

  handleDailyTempChart = temp => {
    switch (temp) {
      case "high":
        let count = 0;
        const data = this.state.hourlyForecastList.map(time => {
          const high = Math.round(utils.kelvinToFahrenheit(time.main.temp_max));
          count++;
          return { x: count, y: high };
        });
        return data;

      case "low":
        let count2 = 0;
        const data2 = this.state.hourlyForecastList.map(time => {
          const low = Math.round(utils.kelvinToFahrenheit(time.main.temp_min));
          count2++;
          return { x: count2, y: low };
        });
        return data2;

      case "avg":
        let count3 = 0;
        const data3 = this.state.hourlyForecastList.map(time => {
          const high = Math.round(utils.kelvinToFahrenheit(time.main.temp_max));
          const low = Math.round(utils.kelvinToFahrenheit(time.main.temp_min));
          const avg = (high + low) / 2;
          // console.log(high, low, avg);
          count3++;
          return { x: count3, y: avg };
        });
        return data3;

      default:
        let count4 = 0;
        const data4 = this.state.hourlyForecastList.map(time => {
          const high = Math.round(utils.kelvinToFahrenheit(time.main.temp_max));
          const low = Math.round(utils.kelvinToFahrenheit(time.main.temp_min));
          const avg = (high + low) / 2;
          // console.log(high, low, avg);
          count4++;
          return { x: count4, y: avg };
        });
        return data4;
    }
  };

  handleKeyPress = e => {
    if (e.key === "Enter") {
      this.handleForecastSearch();
    }
  };

  handleGeoSearchCurrentWeather = (coords, zip) => {
    const latLon = coords;
    const url = `//api.openweathermap.org/data/2.5/weather?lat=${
      latLon.latitude
    }&lon=${latLon.longitude}&APPID=41208a14923fc26bae2f6ae307db826e`;

    axios
      .get(url)
      .then(res => {
        console.log(res);
        // const data = res.data.list.filter(x => /12:00:00/.test(x.dt_txt));
        // const highsAndLows = this.getHighsAndLows(res.data.list);
        // // console.log(highsAndLows);
        // const newData = data.map((d, i) => {
        //   d.main.high = highsAndLows[i].high;
        //   d.main.low = highsAndLows[i].low;
        //   return d;
        // });

        // const newData2 = newData.map(day => day.dt_txt.split(" ").shift());
        // const newData3 = newData2.map(date => {
        //   const testDate = RegExp(date);
        //   const hourlyArray = res.data.list.filter(x =>
        //     testDate.test(x.dt_txt)
        //   );
        //   return hourlyArray;
        // });

        // const avgData = newData3.map(arr => this.determineForecastAverage(arr));

        // const newDataFinal = newData.map((d, i) => {
        //   d.main.avgCondition = avgData[i];
        //   return d;
        // });
        // console.log(newData);
        // this.setState({
        //   forecast: newDataFinal,
        //   hourlyFiveDay: res.data.list,
        //   location: res.data.city,
        //   located: false,
        //   displayHourly: false
        // });
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleGeoSearch = pos => {
    const coords = pos.coords;

    // this.handleGeoSearchCurrentWeather(coords);

    const url = `//api.openweathermap.org/data/2.5/forecast?lat=${
      coords.latitude
    }&lon=${coords.longitude}&APPID=41208a14923fc26bae2f6ae307db826e`;

    axios
      .get(url)
      .then(res => {
        const data = res.data.list.filter(x => /12:00:00/.test(x.dt_txt));
        const highsAndLows = this.getHighsAndLows(res.data.list);
        // console.log(highsAndLows);
        const newData = data.map((d, i) => {
          d.main.high = highsAndLows[i].high;
          d.main.low = highsAndLows[i].low;
          return d;
        });

        const newData2 = newData.map(day => day.dt_txt.split(" ").shift());
        const newData3 = newData2.map(date => {
          const testDate = RegExp(date);
          const hourlyArray = res.data.list.filter(x =>
            testDate.test(x.dt_txt)
          );
          return hourlyArray;
        });

        const avgData = newData3.map(arr => this.determineForecastAverage(arr));

        const newDataFinal = newData.map((d, i) => {
          d.main.avgCondition = avgData[i];
          return d;
        });
        // console.log(newData);
        this.setState({
          forecast: newDataFinal,
          hourlyFiveDay: res.data.list,
          location: res.data.city,
          located: false,
          displayHourly: false
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  // get array of dates

  // use that array of dates to map over the available list of hourly forecasts
  // to generate an array of forecasts only for that day

  // then, use that array for that specific day and evaluate the min/max temps
  // and grab highest and lowest total values to sort of get the highs and lows for each day

  mostFrequent = array => {
    let result = array[0].weather[0].id;
    let tmp = 0;
    for (let i = 0; i < array.length; i++) {
      let count = 0;
      for (let j = 0; j < array.length; j++) {
        if (array[i].weather[0].id === array[j].weather[0].id) {
          count++;
        }
      }
      if (count > tmp) {
        tmp = count;
        result = array[i].weather[0].id;
      }
    }
    return result;
  };

  filterDates = (date, list) => {
    const testDate = RegExp(date);
    const hourlyForecastList = list.filter(x => testDate.test(x.dt_txt));
    let high = 0;
    let low = 100000;
    hourlyForecastList.map(day => {
      // console.log("day max: ", day.main.temp_max, "high: ", high);
      // console.log("day min: ", day.main.temp_min, "low: ", low);
      high = day.main.temp_max > high ? day.main.temp_max : high;
      low = day.main.temp_min < low ? day.main.temp_min : low;
      // console.log("Each: ", { high, low });
      return { high, low };
    });
    // console.log("High and low: ", { high, low });
    return { high, low };
  };

  getHighsAndLows = data => {
    const wholeList = data ? data : this.state.hourlyFiveDay;
    const allTheDates = wholeList.map(x => {
      const date = x.dt_txt.split(" ").shift();
      return date;
    });
    const unique = allTheDates.filter(utils.onlyUnique);

    const hsnls = unique.map(date => {
      return this.filterDates(date, wholeList);
    });
    // console.log("hsnls: ", hsnls);
    if (hsnls.length >= 6) {
      hsnls.shift();
    }
    return hsnls;
  };

  // pass a unique date
  determineForecastAverage = array => this.mostFrequent(array);

  handleHourlyForecast = day => {
    const id = day.dt;
    const newHourly = this.state.hourlyFiveDay.map(x => {
      if (x.dt === id) {
        x.active = true;
      }
      return x;
    });
    const newForecast = this.state.forecast.map(x => {
      if (x.dt === id) {
        x.active = true;
      } else {
        x.active = false;
      }
      return x;
    });
    const date = day.dt_txt.split(" ").shift();
    // console.log(date);
    const testDate = RegExp(date);
    const hourlyForecast = newHourly.filter(x => testDate.test(x.dt_txt));
    this.setState({
      displayHourly: true,
      hourlyForecastList: hourlyForecast,
      forecast: newForecast
    });
  };

  handleForecastSearch = () => {
    const zip = this.zipCode.value;
    if (zip && zip.length === 5) {
      const url = `//api.openweathermap.org/data/2.5/forecast?zip=${zip},us&APPID=41208a14923fc26bae2f6ae307db826e`;
      axios
        .get(url)
        .then(res => {
          const newState = res.data.list.map(x => {
            x.active = false;
            return x;
          });
          // console.log(newState);
          const data = newState.filter(x => /12:00:00/.test(x.dt_txt));
          const highsAndLows = this.getHighsAndLows(res.data.list);
          const newData = data.map((d, i) => {
            d.main.high = highsAndLows[i].high;
            d.main.low = highsAndLows[i].low;
            return d;
          });

          const newData2 = newData.map(day => day.dt_txt.split(" ").shift());
          const newData3 = newData2.map(date => {
            const testDate = RegExp(date);
            const hourlyArray = newState.filter(x => testDate.test(x.dt_txt));
            return hourlyArray;
          });

          const avgData = newData3.map(arr =>
            this.determineForecastAverage(arr)
          );

          const newDataFinal = newData.map((d, i) => {
            d.main.avgCondition = avgData[i];
            return d;
          });

          this.setState({
            forecast: newDataFinal,
            hourlyFiveDay: newState,
            location: res.data.city,
            displayHourly: false
          });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            forecast: [],
            location: {},
            displayHourly: false
          });
        });
    } else {
      this.setState({
        forecast: [],
        location: {},
        displayHourly: false
      });
    }
  };

  render() {
    const style = {
      maxWidth: "70%",
      margin: "0 auto"
    };

    const cards = this.state.forecast.length ? (
      this.state.forecast.map(day => {
        return (
          <ForecastCard
            key={day.dt}
            day={day}
            active={day.active}
            handleOnClick={d => {
              this.handleHourlyForecast(d);
            }}
          />
        );
      })
    ) : (
      <div>{this.state.located ? null : <p>Get your 5-day forecast!</p>}</div>
    );
    return (
      <div>
        {this.state.located ? (
          <p>Generating your forecast...</p>
        ) : (
          <div>
            <label htmlFor="zipcode">zipcode:</label>
            <input
              id="zipcode"
              ref={zipCode => (this.zipCode = zipCode)}
              type="text"
              placeholder="e.g. 60618"
              onKeyPress={this.handleKeyPress}
            />
            <button onClick={this.handleForecastSearch}>Search</button>
          </div>
        )}
        <div>
          {this.state.location && <h2>{this.state.location.name}</h2>}
          {this.state.forecast.length ? (
            <ForecastRow>
              <ReactCSSTransitionGroup
                transitionName="forecast-card"
                transitionAppear={true}
                transitionAppearTimeout={500}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}
              >
                {cards}
              </ReactCSSTransitionGroup>
            </ForecastRow>
          ) : (
            <div>
              {this.state.located ? null : <p>Get your 5-day forecast!</p>}
            </div>
          )}
        </div>
        {this.state.hourlyForecastList.length && this.state.displayHourly ? (
          <div>
            <ForecastRowHourly>
              {this.state.hourlyForecastList.map(day => {
                return <ForecastCardHourly key={day.dt} day={day} />;
              })}
            </ForecastRowHourly>
            <div style={style}>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
                height={200}
                style={{
                  data: { opacity: 0.7 },
                  text: {
                    fontFamily: "'Open Sans', Arial, sans-serif !important",
                    fontSize: "8px !important"
                  }
                }}
              >
                <VictoryAxis
                  crossAxis
                  theme={VictoryTheme.material}
                  standalone={false}
                  label="Time"
                  style={{
                    axis: { stroke: "#f5f5f5" },
                    axisLabel: { fontSize: 8, padding: 30 },
                    tickLabels: { fontSize: 6, padding: 5 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  crossAxis
                  theme={VictoryTheme.material}
                  standalone={false}
                  label="Temp (Fahrenheit)"
                  style={{
                    axis: { stroke: "#f5f5f5" },
                    axisLabel: { fontSize: 8, padding: 30 },
                    tickLabels: { fontSize: 6, padding: 5 }
                  }}
                />
                <VictoryGroup
                  animate={{
                    duration: 250,
                    onLoad: { duration: 250 }
                  }}
                  offset={7}
                  colorScale={[
                    "rgb(24, 100, 156)",
                    "rgb(68, 176, 227)",
                    "rgb(144, 209, 240)"
                  ]}
                >
                  <VictoryBar
                    alignment="start"
                    barRatio={0.2}
                    data={this.handleDailyTempChart("high")}
                  />
                  <VictoryBar
                    alignment="start"
                    barRatio={0.2}
                    data={this.handleDailyTempChart("avg")}
                  />
                  <VictoryBar
                    alignment="start"
                    barRatio={0.2}
                    data={this.handleDailyTempChart("low")}
                  />
                </VictoryGroup>
              </VictoryChart>
              <p>Daily Temperatures</p>
            </div>
          </div>
        ) : (
          <div>
            {this.state.hourlyForecastList.length === 0 ? (
              <p>Click on a day to see the hourly forecast.</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // build component for search / input

  // Validation for input to dynamically search the API depending on the query
  // e.g. zipcode vs. city name vs lat/long

  // For added practice, here are a few ways you could expand on the app:

  // Add the ability to click on a day, and see its hourly forecast.
  // You can just maintain the current view in the top-level App state.

  // Add React Router to the project (npm install react-router) and
  // follow the quick start guide here to add routes, such
  // that / shows the 5-day forecast, and /[name-of-day] shows the hourly
  // forecast for a particular day.

  // Want to get really fancy? Add a graphics library like vx
  // and follow the examples here to add a graph of the temperature
  // over the course of a week or day.
}
