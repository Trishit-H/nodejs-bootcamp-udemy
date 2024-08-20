const EventEmitter = require('events');

const myEmitter = new EventEmitter();

/*
myEmitter.on('newSale', () => {
    console.log('There was a new sale!')
});

myEmitter.on('newSale', () => {
    console.log('Customer name: John Doe')
});

myEmitter.emit('newSale');
*/

/*
How it works?
1. First we import the EventEmitter module from nodejs.
2. Then we create an instance of the EventEmitter class.
3. Now, we set up an emitter that will emit named events.
4. To do that we use the emit() present on the instance we just created.
5. We can name our event as anything we like, in this case it is 'newSale.
6. And now we need to set up listeners, that will listen for the 'newSale' event. and if the event is emitted,  then the associated callback functions will run
7. And we can set up multiple listeners for one event.
8. So here we set up two event listeners for the 'newSale' event, where the callback functions simply logs something to the console.
9. So when we run the code and our execution goes to line number 13, an event named 'mySale' is emitted. And the event listeners pick it up and fires up the callback functions attached to them.
*/ 