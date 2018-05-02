import React from 'react';
import { Observable } from 'rxjs';
import { render } from 'react-dom';
import { track } from 'react-track-observable';

const observable = new Observable(observer => {
    observer.next('hello');

    setTimeout(() => observer.next('world'), 1500);
});

const App = () => observable::track(value => (
    <span>value</span>
));

render(<App />, document.querySelector('body'));
