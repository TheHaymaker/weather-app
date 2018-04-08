import React, { Component } from "react";
import axios from "axios";
import ForecastRow from "./ForecastRow";
import ForecastCard from "./ForecastCard";

export default class ForecastContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forecast: [],
      hourlyFiveDay: [],
      location: {}
    };

    this.handleForecastSearch = this.handleForecastSearch.bind(this);
  }

  handleForecastSearch = () => {
    const zip = this.zipCode.value;
    if (zip && zip.length === 5) {
      const url = `//api.openweathermap.org/data/2.5/forecast?zip=${zip},us&APPID=41208a14923fc26bae2f6ae307db826e`;
      axios
        .get(url)
        .then(res => {
          const data = res.data.list.filter(x => /12:00:00/.test(x.dt_txt));
          this.setState({
            forecast: data,
            hourlyFiveDay: res.data.list,
            location: res.data.city
          });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      this.setState({ forecast: [], location: {} });
    }
  };

  render() {
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
            <ForecastRow>
              {this.state.forecast.map(day => {
                return <ForecastCard day={day} />;
              })}
            </ForecastRow>
          ) : (
            <p>Get your 5-day forecast!</p>
          )}
        </div>
      </div>
    );
  }

  // build component for search / input

  // Get user's location and automatically fire api based on lat long values
  // if geolocation is not available/denied/shut - off, do nothing or display sample data

  // Validation for input to dynamically search the API depending on the query
  // e.g. zipcode vs. city name vs lat/long
}
