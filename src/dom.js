import { Observable } from 'rxjs';

const observable = new Observable(observer => {
    observer.next('hello');

    setTimeout(() => observer.next('world'), 1500);
})

observable.subscribe(next => {
    const body = document.querySelector('body');
    body.innerHTML = `<h1>${next}</h1>`;
});
