const fs = require('fs');

//------------------------------------- First case----------------------------------//
/*
setTimeout(() => console.log('Timer 1 finished!'), 0); // a
setImmediate(() => console.log('Immediate 1 finished!')) // b

fs.readFile('test-file.txt', () => {
    console.log('I/O 1 finished!') // c 
});

console.log('Hello from the top level code!'); // d
*/

/*
OUTPUT-
Hello from the top level code!
Timer 1 finished!
Immediate 1 finished!
I/O 1 finished!
*/

/*
How it works?
When the script is run the top level code gets executed first. So we see 'd' printed to the console first.
Now event loop goes into each phase(in order) and checks if callback functions are there to be executed or not. If no callbacks are present in the current phase then it moves to the next phase and checks for callbacks to be executed. And so on...

In case of callback functions being present in any phase, the event loop will first execute all the callback functions and then only it will move to the next phase.

Order of phase: Timer phase > Poll phase > Check phase > Close phase

In our code: The event loop first enters the Timer phase and checks for any callback functions. Since the delay here is 0ms, the event loop finds a callback function in the callback queue of Timer phase. It executes the callack function and 'a'is printed to the console and then it moves to the next phase, which is the Poll phase.
The file reading here is offloaded to the system's OS kernel or threal poll. The file we are reading here is very large so it takes a some time to finish reading this file. When the event loop enters the Poll phase, it sees that there are no callback functions. Because I/O (file reading) task is not completed yet. So it will either wait or it will check if there any callback functions of setImmediate is present to be executed. If there is any, it moves to the Check phase and executes those.

In our case there is one callback function in Check phase so it is executed and 'c' is printed to the console. 
Then callback moves to Close phase. Since there is no event to close here, nothing happens.
This completes the first tick or event loop cycle.

Then it sees if there are any pending I/O tasks or timers. If there pending I/O or timers, it enters another tick or cycle. If there is not then it exits the execution.

In our case we still have the test-file.txt being read. So event loop enters another tick. It goes into the Timer phase, checks for any callback functions(there are none now), then to the Poll phase, where it sees that the file reading is done and the callback function associated with it waiting to be executed in the callback queue. It executes that callback function and prints 'c' to the console at last. Then it goes to the Check phase to see if any callback functions of setImmediate is present to be executed or not. There are not any now. Then it moves to the Close phase, nothing happens here as no event to close. The second tick is over.

It then sees that there are no more pending timersor I/O tasks, so it exits the execution.
*/

//-------------------------------------Second case-----------------------------------//
setTimeout(() => console.log('Timer 1 finished!'), 2000); // a
setImmediate(() => console.log('Immediate 1 finished!')) // b

fs.readFile('test-file.txt', () => {
    console.log('I/O 1 finished!') // c 
});

console.log('Hello from the top level code!'); // d

/*
OUTPUT-
Hello from the top level code!
Immediate 1 finished!
I/O 1 finished!
Timer 1 finished!
*/

/*
How it works?
When the script is run the top level code gets executed first. So we see 'd' printed to the console first.
Now event loop goes into each phase(in order) and checks if callback functions are there to be executed or not. If no callbacks are present in the current phase then it moves to the next phase and checks for callbacks to be executed. And so on...

In case of callback functions being present in any phase, the event loop will first execute all the callback functions and then only it will move to the next phase.

Order of phase: Timer phase > Poll phase > Check phase > Close phase

In our code: The event loop first enters the Timer phase and checks for any callback functions. Since the delay here is 2000ms, the event loop finds no callback function in the callback queue of Timer phase. It moves on to the next phase, which is the Poll phase.

The file reading here is offloaded to the system's OS kernel or threal poll. The file we are reading here is very large so it takes a some time to finish reading this file. When the event loop enters the Poll phase, it sees that there are no callback functions. Because I/O (file reading) task is not completed yet. So it will either wait or it will check if there any callback functions of setImmediate is present to be executed. If there is any, it moves to the Check phase and executes those.

In our case there is one callback function in Check phase so it is executed and 'c' is printed to the console. 
Then callback moves to Close phase. Since there is no event to close here, nothing happens.
This completes the first tick or event loop cycle.

Then it sees if there are any pending I/O tasks or timers. If there pending I/O or timers, it enters another tick or cycle. If there is not then it exits the execution.

In our case we still have the test-file.txt being read. So event loop enters another tick. It goes into the Timer phase, checks for any callback functions. The timer is not still not completed. So no callback function present.

Then it moves to the Poll phase, where it sees that the file reading is done and the callback function associated with it waiting to be executed in the callback queue. It executes that callback function and prints 'c' to the console at last. Then it goes to the Check phase to see if any callback functions of setImmediate is present to be executed or not. There are not any now. Then it moves to the Close phase, nothing happens here as no event to close. The second tick is over.

It then sees that there is still one pending timer there. So it starts a third tick. It enters te Timer phase. Now the time delay of 2000ms is finished and a callback function is present in the callback queue. So event loop executes the callback function and 'a' is printed on to the console.

Then it goes to the Poll phase(no callbacks here anymore), to the Check phase(no callbacks here also) and to the Close queue,  where nothing happens. The third tick is over.

It then sees that there are no more pending timers or I/O tasks, so it exits the execution.
*/