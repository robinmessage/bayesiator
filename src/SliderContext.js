import React from 'react';

const SliderContext = React.createContext({
  update: () => {},
  values: {},
  highlight: []
});

export default SliderContext;
