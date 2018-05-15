import React from 'react';
import { Observable, BehaviorSubject, from, interval } from 'rxjs';
import { map, merge, takeUntil, share } from 'rxjs/operators';
import { render } from 'react-dom';
import { track } from 'react-track-observable';

function mutate(mutator) {
    const value = this.getValue();
    // todo: ensure previousValue IS reference, not simple copy type
    mutator(value);
    this.next(value);
}

function createState() {
    let times = 1;
    const requestsObs = new BehaviorSubject([]);

    return {
        async sendRequest() {
            const promise = new Promise(resolve => {
                setTimeout(() => resolve(times++), 3000);
            });

            const howMuchObs = (new BehaviorSubject()).pipe(
                merge(interval(100).pipe(takeUntil(promise))),
            )

            const obs = new BehaviorSubject({
                isPending: true,
                howMuchObs,
            });

            requestsObs.next([...requestsObs.getValue(), obs]);

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
    <div>
        <button onClick={state.sendRequest}>sendRequest</button>
        <ul>
            {state.requestsObs::track(requests => requests.map((requestObs, index) => requestObs::track(request => {
                if (request.isPending) {
                    return (    
                        <li key={index}>waiting for {request.howMuchObs::track(howMuch => howMuch / 10)}</li>
                    );
                }

                return <li key={index}>finished: {request.counter}</li>
            })))}
        </ul>
    </div>
);

render(App, document.querySelector('#app'));
