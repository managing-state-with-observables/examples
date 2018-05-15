import React from 'react';
import { render } from 'react-dom';
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { track } from 'react-track-observable';
import { tap, mergeMap, filter, map, concatAll, switchAll } from 'rxjs/operators';


function createState() {
    const todosObs = new BehaviorSubject([]);
    const filterObs = new BehaviorSubject('all');
    const todoInputTextObs = new BehaviorSubject('');

    const filteredTodosObs = combineLatest(todosObs, filterObs, (todos, filterValue) => {
        const obsByTodo = todos.map(todo => {
            return todo.isDoneObs.pipe(
                map(isDone => todo)
            );
        });

        return combineLatest(...obsByTodo).pipe(
            map(todos => todos.filter(todo => {
                if (filterValue === 'all') {
                    return true;
                }

                const shouldBeChecked = filterValue === 'done';
                return todo.isDoneObs.getValue() === shouldBeChecked;
            })),
        );
    }).pipe(
        switchAll(),
    );

    let lastId = 1;
    function addTodo(e) {
        e.preventDefault();

        const text = todoInputTextObs.getValue();
        todoInputTextObs.next(''); // clear input

        const isDoneObs = new BehaviorSubject(false);

        const todo = {
            id: lastId++,
            text,
            isDoneObs,
        };

        todosObs::mutate(todos => {
            todos.push(todo);
        })
    }

    return {
        filteredTodosObs,
        filterObs,
        todosObs,
        addTodo,
        todoInputTextObs,
    }
}

const App = ({ state }) =>{
    const { todosObs, addTodo, filterObs, filteredTodosObs, todoInputTextObs } = state;

    return (
        <div>
            <form onSubmit={addTodo}>
                { todoInputTextObs::track(todoInputText => (
                    <input
                        autoFocus
                        type="text"
                        value={todoInputText}
                        onChange={todoInputTextObs::handler}
                    />
                ))}
                <button>Add todo</button>
            </form>
            {filterObs::track(selectedFilter => (
                <div>
                    {['all', 'done', 'notDone'].map(filter => (
                        <label key={filter}>
                            <input
                                type="radio"
                                value={filter}
                                checked={filter === selectedFilter}
                                onChange={filterObs::handler}
                            />
                            {filter}
                        </label>
                    ))}
                </div>
            ))}
            <ul>
                {filteredTodosObs::track(todos => {
                    if (todos.length === 0) {
                        return (
                            <span>No todos added yet</span>
                        );
                    }

                    return todos.map(todo => {
                        const { id, isDoneObs, text } = todo;

                        return (
                            <li key={id}>
                                <label>
                                    {isDoneObs::track(isDone => (
                                        <input
                                            type="checkbox"
                                            checked={isDone}
                                            onChange={isDoneObs::toggle}
                                        />
                                    ))}
                                    {text}
                                </label>
                            </li>
                        );
                    })
                })}
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
