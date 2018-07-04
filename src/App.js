import React, { Component } from 'react';
import logo from './Thomas_Bayes.gif';
import './App.css';
import Slider from './Slider';
import SliderSet from './SliderSet';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <a href="https://en.wikipedia.org/wiki/Thomas_Bayes"><img src={logo} className="App-logo" alt="logo" /></a>
          <h1 className="App-title">Bayesiator</h1>
        </header>
        <section className="App-body">
        <p className="App-intro">
            The Bayesiator can be used to calculate probabilities and check your intuition of how conditional probability works. Each slider can be adjusted and will adjust the a less recently adjusted other sliders to show the results.
        </p>
        <div className="App-panel">
            <h2 className="">Basic Bayes</h2>
            <SliderSet rule="P(A|B) * P(B) = P(B|A) * P(A)" initialValues={{"P(A)": 0.1, "P(B)": 0.2, "P(B|A)": 0.3}}>
                <table>
                    <tbody>
                        <tr><td><Slider name="P(A)" /></td><td><Slider name="P(B)" /></td></tr>
                        <tr><td><Slider name="P(B|A)" /></td><td><Slider name="P(A|B)" /></td></tr>
                    </tbody>
                </table>
            </SliderSet>
        </div>
        <hr />
        <div className="App-panel">
            <h2 className="">Medical Bayes</h2>
            <SliderSet rule="P(X|A) * P(A) = P(A|X) * P(X|A) . P(A) + P(X|~A) - P(X|~A) . P(A)" initialValues={{"P(A)": 0.01, "P(X|A)": 0.9, "P(X|~A)": 0.096}}>
                <table>
                    <tbody>
                        <tr><td><Slider name="P(A)" description="Chance of faulty gene"/></td><td></td></tr>
                        <tr>
                            <td><Slider name="P(X|A)" description="Chance of (true) positive test given they have the gene"/></td>
                            <td><Slider name="P(X|~A)" description="Chance of (false) positive test given they don't have the gene"/></td>
                        </tr>
                        <tr><td><Slider name="P(A|X)" description="Chance they have the faulty gene, given a positive test" readonly={true}/></td><td>N.B. This slider cannot be moved, yet.</td></tr>
                    </tbody>
                </table>
            </SliderSet>
        </div>
        </section>
      </div>
    );
  }
}

export default App;
