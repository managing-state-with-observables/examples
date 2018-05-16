import { BehaviorSubject } from 'rxjs';

const obs = new BehaviorSubject('hello');
setTimeout(() => obs.next('world'), 1500);

const el = document.querySelector('#app');
obs.subscribe(next => {
    el.innerHTML = `<h1>${next}</h1>`;
});
