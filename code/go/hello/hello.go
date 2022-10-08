package main 

import (
	"fmt"
	"log"
	"lfange.com/greetings"
)


func main() {
    // Set properties of the predefined Logger, including
    // the log entry prefix and a flag to disable printing
    // the time, source file, and line number.
    log.SetPrefix("greetings: ")
    log.SetFlags(0)


		names := []string{"GLadys", "Samantha", "Darrin"}


		// Get a greeting message and print it.
		// Request a greeting message.
		messages, err := greetings.Hellos(names)
		// message, err := greetings.Hello("Gladys")
		// message, err := greetings.Hello("")
		// If an error was returned, print it to the console and
		// exit the program.
		if err != nil {
			log.Fatal(err)
		}
 
		 // If no error was returned, print the returned message
		 // to the console.
		 fmt.Println("message:", messages)
}
