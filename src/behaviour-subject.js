import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { render } from 'react-dom';
import { track } from 'react-track-observable';

const isShownObs = new BehaviorSubject(true);

const App = () => (
    <div>
        <button onClick={() => isShownObs.next(!isShownObs.getValue())}>toggle</button>
        {isShownObs::track(isShown => isShown && (
            <p>hide me</p>
        ))}
    </div>
);

render(<App />, document.querySelector('body'));


function toggle() {
    const previousValue = this.getValue();
    this.next(!previousValue);
}