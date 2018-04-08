import React, { Component } from "react";
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

export default class ForecastContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forecast: [],
      hourlyFiveDay: [],
      location: {},
      located: false,
      displayHourly: false,
      hourlyForecastList: []
    };

    this.handleForecastSearch = this.handleForecastSearch.bind(this);
    this.handleGeoSearch = this.handleGeoSearch.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleHourlyForecast = this.handleHourlyForecast.bind(this);
  }

  componentWillMount() {
    if ("geolocation" in navigator) {
      this.setState({ located: true });
      /* geolocation is available */
      navigator.geolocation.getCurrentPosition(position => {
        this.setStateInterval = window.setInterval(() => {
          this.handleGeoSearch(position);
        });
      });
    } else {
      /* geolocation IS NOT available */
      this.setStateInterval = window.setInterval(() => {
        this.setState({ located: false });
      });
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.setStateInterval);
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
        break;
      case "low":
        let count2 = 0;
        const data2 = this.state.hourlyForecastList.map(time => {
          const low = Math.round(utils.kelvinToFahrenheit(time.main.temp_min));
          count2++;
          return { x: count2, y: low };
        });
        return data2;
        break;
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
        break;
      default:
    }
  };

  handleKeyPress = e => {
    if (e.key === "Enter") {
      this.handleForecastSearch();
    }
  };

  handleGeoSearch = pos => {
    const coords = pos.coords;
    const url = `//api.openweathermap.org/data/2.5/forecast?lat=${
      coords.latitude
    }&lon=${coords.longitude}&APPID=41208a14923fc26bae2f6ae307db826e`;
    axios
      .get(url)
      .then(res => {
        const data = res.data.list.filter(x => /12:00:00/.test(x.dt_txt));
        this.setState({
          forecast: data,
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
          console.log(newState);
          const data = newState.filter(x => /12:00:00/.test(x.dt_txt));
          this.setState({
            forecast: data,
            hourlyFiveDay: newState,
            location: res.data.city,
            displayHourly: false
          });
        })
        .catch(err => {
          console.log(err);
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
              {this.state.forecast.map(day => {
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
              })}
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
