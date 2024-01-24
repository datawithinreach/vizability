import React from 'react';
// import { Vega } from 'react-vega';
import { createClassFromSpec } from "react-vega";



export const VegaGragh = (spec) => createClassFromSpec({
    spec: {spec}
  });