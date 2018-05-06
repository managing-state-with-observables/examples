import React from 'react';
import { Observable, BehaviorSubject, from, interval } from 'rxjs';
import { map, merge, takeUntil } from 'rxjs/operators';
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
        sendRequest() {
            const intervalObs = interval(100).pipe(
                map(howMuch => ({
                    howMuch,
                    isPending: true,
                }),
            ));

            const httpRequestObs = from(new Promise(resolve => {
                setTimeout(() => resolve(times++), 3000);
            })).pipe(
                map(counter => ({
                    counter,
                    isPending: false,
                })),
            );

            const obs = intervalObs.pipe(
                takeUntil(httpRequestObs),
                
                merge(httpRequestObs),
            );

            requestsObs.next([...requestsObs.getValue(), obs]);
        },
        requestsObs,
    }
}

const state = createState();

const App = (
    <div>
        <button onClick={state.sendRequest}>sendRequest</button>
        <ul>
            {state.requestsObs::track(requests => requests.map(requestObs => requestObs::track(request => {
                if (request.isPending) {
                    return (
                        <li>waiting for {request.howMuch / 10}</li>
                    );
                }

                return <li>finished: {request.counter}</li>
            })))}
        </ul>
    </div>
);

render(App, document.querySelector('body'));
