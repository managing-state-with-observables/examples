import React from 'react';
import { render } from 'react-dom';
import { BehaviorSubject } from "rxjs";
import { track } from 'react-track-observable';


function createState() {
    const todosObs = new BehaviorSubject([]);
    const filterObs = new BehaviorSubject('all');

    let lastId = 1;
    function addTodo() {
        const isDoneObs = new BehaviorSubject(false);
        const whatObs = new BehaviorSubject('');

        const todo = {
            id: lastId++,
            whatObs,
            isDoneObs,
        }

        // todosObs.next([...todosObs.getValue(), todo]);

        todosObs::mutate(todos => {
            todos.push(todo);
        })
    }

    return {
        filterObs,
        todosObs,
        addTodo,
    }
}

const App = ({ state }) =>{
    const { todosObs, addTodo, filterObs } = state;

    return (
        <div>
            <button onClick={addTodo}>Add todo</button>
            {filterObs::track(selectedFilter => (
                <div>
                    {['all', 'done', 'notDone'].map(filter => (
                        <label>
                            <input
                                type="radio"
                                value={filter}
                                checked={filter === selectedFilter}
                                onChange={(e) => { console.log(e.currentTarget.value); filterObs.next(filter)}}
                            />
                            {filter}
                        </label>
                    ))}
                </div>
            ))}
            <ul>
                {todosObs::track(todos => todos.map(todo => {
                    const { id, isDoneObs, whatObs } = todo;

                    return (
                        <li key={id}>
                            {isDoneObs::track(isDone => (
                                <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={isDoneObs::toggle}
                                />
                            ))}
                            {whatObs::track(what => (
                                <input
                                    autoFocus
                                    type="text"
                                    value={what}
                                    onChange={whatObs::handler}
                                />
                            ))}
                        </li>
                    );
                }))}
            </ul>
        </div>
    )
}

const state = createState();
render(<App state={state}/>, document.querySelector('body'));


// utility functions
function toggle() {
    this.next(!this.getValue());
}

function handler(e) {
    this.next(e.currentTarget.value);
}

function mutate(mutator) {
    const value = this.getValue();
    mutator(value);
    this.next(value);
}
