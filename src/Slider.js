import React, { Component } from 'react';

import SliderContext from './SliderContext';

class SliderInner extends Component {
  render() {
    const p = parseFloat(this.props.sliderContext.values[this.props.name]);
    return (<div>
        <label style={this.props.sliderContext.highlight[this.props.name] && {color: "red"}}>{this.props.name} = {p.toFixed(2)}</label>
        <br />
        {this.props.description && <small>{this.props.description}<br /></small>}
        <input type="range" min="0" max="1" step="0.01" value={p} onChange={this.handleChange.bind(this)}/>
    </div>);
  }
  handleChange(e) {
    if (this.props.readonly) return;
    this.props.sliderContext.update(this.props.name, e.target.value);
  }
}

export default function Slider(props) {
  return (
    <SliderContext.Consumer>
      {sliderContext => (
        <SliderInner
          {...props}
          sliderContext={sliderContext}
        />
      )}
    </SliderContext.Consumer>
  );
}
