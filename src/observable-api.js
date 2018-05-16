import { Observable } from 'rxjs';

const observable = new Observable(observer => {
    observer.next('hello');

    setTimeout(() => observer.next('world'), 1500);
})

const el = document.querySelector('#app');
observable.subscribe(next => {
    el.innerHTML = `<h1>${next}</h1>`;
});
