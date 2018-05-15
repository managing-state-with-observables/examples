import React from 'react';
import { render } from 'react-dom';
import { track } from 'react-track-observable';
import { BehaviorSubject } from 'rxjs';


const obs = createSearchState();
render(obs::track(renderValue), document.querySelector('#app'));


function createSearchState() {
    const observer = new BehaviorSubject();
    idle();
    return observer;
    
    function idle(results = []) {
        const whatObs = new BehaviorSubject('something');

        observer.next({
            isIdle: true,
            results,
            whatObs,
            search,
        });
    }

    async function search(what) {
        const dataPromise = fetchSearchResults(what);
        
        const isCancelled = {}; // just any reference
        const cancelPromise = new Promise(resolve => {
            observer.next({
                isSearching: true,
                what,
                cancel() {
                    resolve(isCancelled);
                },
            })
        });

        const results = await Promise.race([dataPromise, cancelPromise]);

        if (results === isCancelled) {
            idle();
            return;
        }

        idle(results);
    }
}

function fetchSearchResults(what) {
    return new Promise(resolve => {
        setTimeout(() => resolve(['one', 'two', 'three']), 2500);
    });
}


function renderValue(obs) {
    if (obs.isIdle) {
        return (
            <div>
                {obs.whatObs::track(what => (
                    <input
                        type="text"
                        onChange={obs.whatObs::handler}
                        value={what}
                    />
                ))}
                <button onClick={() => obs.search(obs.whatObs.getValue())}>search</button>
                <ul>
                    {obs.results.map(result => (
                        <li key={result}>{result}</li>
                    ))}
                </ul>
            </div>
        )
    }

    if (obs.isSearching) {
        return (
            <div>
                Searching for {obs.what}&nbsp;
                <button onClick={obs.cancel}>Cancel</button>
            </div>
        );
    }

    return null; // should never happen
}

function handler(e) {
    this.next(e.currentTarget.value);
}
