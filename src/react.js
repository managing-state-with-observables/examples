import React from 'react';
import { Observable } from 'rxjs';
import { render } from 'react-dom';
import { track } from 'react-track-observable';

const observable = new Observable(observer => {
    observer.next('hello');

    setTimeout(() => observer.next('world'), 1500);
});

const App = () => observable::track(value => (
    <h1>{value}</h1>
));

render(<App />, document.querySelector('#app'));
