import React, { Component } from "react";
import axios from "axios";
import Moment from "react-moment";
import * as utils from "../utils/helpers";

import "./ForecastContainer.css";

export default class ForecastContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forecast: [],
      location: {}
    };

    this.handleForecastSearch = this.handleForecastSearch.bind(this);
  }

  handleForecastSearch = () => {
    const zip = this.zipCode.value;
    // construct url
    if (zip && zip.length === 5) {
      const url = `//api.openweathermap.org/data/2.5/forecast?zip=${zip},us&APPID=41208a14923fc26bae2f6ae307db826e`;
      axios
        .get(url)
        .then(res => {
          this.setState({ forecast: res.data.list, location: res.data.city });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      this.setState({ forecast: [], location: {} });
    }
  };

  render() {
    // inside list
    // main -> temp
    // main -> temp_min
    // main -> temp_max

    // need conversion from Kelvin to Fahrenheit

    // weather -> Array[0]
    // -> description
    // -> icon

    // inside location
    // -> name
    // -> country
    // -> coord -> lat
    //          -> long

    return (
      <div>
        <label htmlFor="zipcode">zipcode:</label>
        <input
          id="zipcode"
          ref={zipCode => (this.zipCode = zipCode)}
          type="text"
        />
        <button onClick={this.handleForecastSearch}>Search</button>
        <div>
          {this.state.location && <h2>{this.state.location.name}</h2>}
          {this.state.forecast.length ? (
            this.state.forecast.map(day => {
              return (
                <ul key={day.dt}>
                  <li>
                    <Moment format={"dddd, MMMM Do"}>{day.dt}</Moment>
                  </li>
                  <li>
                    temp: {Math.round(utils.kelvinToFahrenheit(day.main.temp))}{" "}
                    F<i className="degree-symbol" />
                  </li>
                  <li>
                    low:{" "}
                    {Math.round(utils.kelvinToFahrenheit(day.main.temp_min))} F<i className="degree-symbol" />
                  </li>
                  <li>
                    high:{" "}
                    {Math.round(utils.kelvinToFahrenheit(day.main.temp_max))} F<i className="degree-symbol" />
                  </li>
                  <li>
                    description: {utils.titleCase(day.weather[0].description)}
                  </li>
                  <li>
                    <i className={utils.buildIcon(day)} />
                  </li>
                </ul>
              );
            })
          ) : (
            <li>Get your 5-day forecast!</li>
          )}
        </div>
      </div>
    );
  }
}
