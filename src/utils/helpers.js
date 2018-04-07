import { weatherIcons } from "../icons";

export const buildIcon = day => {
  let dayOrNight;
  let prefix = "wi wi-";

  const today = new Date();
  const hour = today.getHours();

  if (hour > 6 && hour < 20) {
    //Day time
    dayOrNight = "day-";
  } else {
    //Night time
    dayOrNight = "night-";
  }
  //   console.log(dayOrNight);
  const code = day.weather[0].id;
  let iconDesc = weatherIcons.filter(x => {
    if (x[code]) {
      return x;
    }
  });
  iconDesc = iconDesc[0][code].icon;
  prefix = `${prefix}${iconDesc}`;

  console.log(prefix);

  return `${prefix} wi-owm-${dayOrNight}${code}`;
};

export const titleCase = str => {
  return str
    .toLowerCase()
    .split(" ")
    .map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    })
    .join(" ");
};
