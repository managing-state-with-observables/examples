import React from 'react';
import { Observable, BehaviorSubject, from, interval } from 'rxjs';
import { map, merge, takeUntil, share, concat } from 'rxjs/operators';
import { render } from 'react-dom';
import { track } from 'react-track-observable';

function mutate(mutator) {
    const value = this.getValue();
    // todo: ensure previousValue IS reference, not simple copy type
    mutator(value);
    this.next(value);
}

function createState() {
    let lastId = 1;
    const requestsObs = new BehaviorSubject([]);

    return {
        async sendRequest() {
            const id = lastId++;
            const promise = fetchDataFromBackend();

            const howMuchObs = interval(100).pipe(
                takeUntil(promise),
                share(),
            );

            const obs = new BehaviorSubject({
                isPending: true,
                howMuchObs,
            });

            requestsObs.next([...requestsObs.getValue(), { id, obs }]);

            const counter = await promise;
            obs.next({
                isPending: false,
                counter,
            })
        },
        requestsObs,
    }
}

const state = createState();

const App = (
    <article>
        <button onClick={state.sendRequest}>sendRequest</button>
        <ul>
            {state.requestsObs::track(requests => requests.map(({id, obs }) => (
                <li key={id}>
                    {obs::track(request => {
                        if (request.isPending) {
                            return (
                                <span>waiting for {request.howMuchObs::track(howMuch => howMuch / 10)}</span>
                            );
                        }

                        return <span>finished: {request.counter}</span>
                    })}
                </li>
            )))}
            
        </ul>
    </article>
);

render(App, document.querySelector('#app'));


const startTime = (new Date().getTime());
function fetchDataFromBackend() {
    return new Promise(resolve => {
        setTimeout(
            () => {
                const currentTime = (new Date()).getTime();
                const elapsed = (currentTime - startTime) / 1000;

                resolve(elapsed);
            },
            3000,
        );
    })
}