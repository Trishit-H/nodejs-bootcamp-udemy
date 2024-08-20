const EventEmitter = require('events');

// const myEmitter = new EventEmitter();

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

//------------------------------------------------------------------------------------------------------------//

/*
We can pass parameters to the event listeners by passing them as additional arguments to the event emitters
*/

/*
myEmitter.on('newSale', () => {
    console.log('There was a new sale!')
});

myEmitter.on('newSale', () => {
    console.log('Customer name: John Doe')
});

// the stock parameter in this listener callback will pick up the agrument when the emit method emits newSale event with the argument(9)
myEmitter.on('newSale', stock => {
    console.log(`There are now ${stock} items left in the stock!`)
})

myEmitter.emit('newSale', 9);
*/

//------------------------------------------------------------------------------------------------------------//

/*
I real life scenarios, if we were use this pattern in real life then it's best practice to create a new class that will actually inherit from the node EventEmitter
*/

// Here the Sales class inherits everything from the EventEmitter class that we imported
class Sales extends EventEmitter {
    // Each class gets a constructor, which is a function that runs as soon as we create a new object from a class
    constructor() {
        // We have to class super everytime we extend from a super class. Sales is the parent class and EventEmitter is the super class
        // And by running super we get access to all the methods in the super class
        super();
    }
}

// now we create an instance of the Sales class that has all the methods of EventEmitter class
const myEmitter = new Sales();

myEmitter.on('newSale', () => {
    console.log('There was a new sale!')
});

myEmitter.on('newSale', () => {
    console.log('Customer name: John Doe')
});

myEmitter.on('newSale', stock => {
    console.log(`There are now ${stock} items left in the stock!`)
})

myEmitter.emit('newSale', 9);