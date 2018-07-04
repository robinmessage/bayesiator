import React, { Component } from 'react';
import _ from 'lodash';

import SliderContext from './SliderContext';

function contains(exp, node) {
  if (_.isEqual(exp, node)) return true;
  if (exp.children) {
    return exp.children.some(child => contains(child, node));
  }
  return false;
}

function rearrange(key, left, right) {
  if (left.node === '*') {
    const outs = left.children.filter(exp => !contains(exp, {node: 'var', name: key}));
    outs.forEach(out => right = {node: '/', children: [right, out]});
    return right;
  }
  if (left.node === '/') {
    const outs = left.children.filter(exp => !contains(exp, {node: 'var', name: key}));
    if (contains(_.first(left.children), {node: 'var', name: key})) {
      outs.forEach(out => right = {node: '*', children: [right, out]});
      return right;
    } else {
      outs.forEach(out => right = {node: '/', children: [out, right]});
      return right;
    }
  }
  if (left.node === '+') {
    const outs = left.children.filter(exp => !contains(exp, {node: 'var', name: key}));
    outs.forEach(out => right = {node: '-', children: [right, out]});
    return right;
  }
  if (left.node === '-') {
    const outs = left.children.filter(exp => !contains(exp, {node: 'var', name: key}));
    if (contains(_.first(left.children), {node: 'var', name: key})) {
      outs.forEach(out => right = {node: '+', children: [right, out]});
      return right;
    } else {
      outs.forEach(out => right = {node: '-', children: [out, right]});
      return right;
    }
  }
  throw new Error("I don't know how to rearrange");
}

function evaluate(exp, values) {
  switch(exp.node) {
    case '+':
      return exp.children.map(e => evaluate(e, values)).reduce((acc, v) => acc + v);
    case '-':
      return exp.children.map(e => evaluate(e, values)).reduce((acc, v) => acc - v);
    case '*':
      return exp.children.map(e => evaluate(e, values)).reduce((acc, v) => acc * v);
    case '/':
      return exp.children.map(e => evaluate(e, values)).reduce((acc, v) => acc / v);
    case 'var':
      return parseFloat(values[exp.name]);
    default:
      throw new Error("I don't know how to evaluate: " + JSON.stringify(exp, null, 4));
  }
}

function parseRule(rule) {
  const keys = [];

  function parseNode(node) {
    node = node.trim();
    keys.push(node);
    return {node: 'var', name: node};
  }

  function parseExp(exp) {
    var nodes = exp.split('*');
    if (nodes.length > 1)
      return {node: '*', children: nodes.map(parseExp)};
    nodes = exp.split('+');
    if (nodes.length > 1)
      return {node: '+', children: nodes.map(parseExp)};
    nodes = exp.split('-');
    if (nodes.length > 1)
      return {node: '-', children: nodes.map(parseExp)};
    nodes = exp.split('.');
    if (nodes.length > 1)
      return {node: '*', children: nodes.map(parseExp)};
    return parseNode(exp);
  }

  function parseTL(rule) {
    const nodes = rule.split('=');
    return {node: '=', children: nodes.map(parseExp)};
  }

  const toplevel = parseTL(rule);

  function calculate(values, key) {
    // Find equals containing key
    if (toplevel.node !== '=') throw new Error("That's no equals.");
    const [lefts, rights] = _.partition(toplevel.children, exp => contains(exp, {node: 'var', name: key}));

    // Rearrange so key alone on LHS
    for (var left of lefts) {
      for (var right of rights) {
        const rearranged = rearrange(key, left, right);
        if (rearrange) {
          const newValue = evaluate(rearranged, values);
          if (key.startsWith('P(')) {
            if (newValue < 0 || newValue > 1) return false;
          }
          return {...values, [key]: newValue};
        }
      }
    }
    throw new Error("Couldn't find a usable rearrangement");
  }
  return {keys, calculate};
}

export default class SliderSet extends Component {
  constructor(props) {
    super(props);
    this.editList = [];
    this.rule = parseRule(this.props.rule);
    this.state = {
      context: {
        update: this.updateSlider.bind(this),
        values: this.updateValues(this.props.initialValues, {}),
        highlight: {}
      }
    };
  }
  render() {
    return <SliderContext.Provider value={this.state.context}>
      <p><b>{this.state.error || <br />}</b></p>
      {this.props.children}
    </SliderContext.Provider>;
  }
  updateSlider(name, value) {
    const values = this.updateValues({[name]: value}, this.state.context.values);
    if (values.error) {
      this.setState({error: values.error, context: {...this.state.context, highlight: values.highlight}});
    } else {
      this.setState({error: undefined, context: {...this.state.context, values, highlight: {}}});
    }
  }
  updateValues(newValues, oldValues) {
    // Update list of edits
    this.updateEditList(Object.keys(newValues));
    // Assume one value to update
    /// Select longest value not edited, or least recently edited if all edited
    var calcKey;
    if (this.rule.keys.length === this.editList.length) {
      calcKey = _.last(this.editList);
    } else {
      var possibleKeys = _.difference(this.rule.keys, this.editList);
      possibleKeys.sort((a, b) => {
        if (a.length > b.length) return -1;
        if (a.length < b.length) return 1;
        return a.localeCompare(b);
      });
      calcKey = _.first(possibleKeys);
    }

    const values = {...oldValues, ...newValues};

    const result = this.rule.calculate(values, calcKey);
    if (!result) {
      return {error: "That would put " + calcKey + " out of bounds", highlight: {[calcKey]: true}};
    }
    return result;
  }
  updateEditList(keys) {
    keys.forEach(key => {
      _.pull(this.editList, key);
      this.editList.unshift(key);
    });
  }
}
