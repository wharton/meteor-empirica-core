import {
  isClassComponent,
  isFunctionComponent,
  isReactComponent,
  isElement
} from "./componentChecker";

export const weightedRandom = values => {
  const samples = [];

  for (var i = 0; i < values.length; i += 1) {
    if (
      !values[i] ||
      !values[i].hasOwnProperty("value") ||
      !values[i].hasOwnProperty("weight")
    ) {
      throw "all values passed to weightedRandom must have a value and weight field";
    }
    for (var j = 0; j < values[i].weight; j += 1) {
      samples.push(values[i].value);
    }
  }

  return () => samples[Math.floor(Math.random() * samples.length)];
};

export const isReactComponents = components => {
  let isValid = true;

  if (components && _.isArray(components)) {
    for (let i = 0; i < components.length; i++) {
      if (
        !isClassComponent(components[i]) &&
        !isFunctionComponent(components[i]) &&
        !isReactComponent(components[i]) &&
        !isElement(components[i])
      ) {
        console.error("component is not a React Component!", components[i]);
        isValid = false;
        break;
      }
    }
  } else {
    console.error("components is not Valid!");
    isValid = false;
  }

  return isValid;
};

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
var ARGUMENT_NAMES = /(?:^|,)\s*([^\s,=]+)/g;

export const getFunctionParameters = func => {
  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
  var argsList = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"));
  var result = argsList.match(ARGUMENT_NAMES);

  if (result === null) {
    return [];
  } else {
    var stripped = [];
    for (var i = 0; i < result.length; i++) {
      stripped.push(result[i].replace(/[\s,]/g, ""));
    }
    return stripped;
  }
};
