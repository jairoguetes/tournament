import React, { useState, useEffect } from "react";
import NarutoLogo from "../assets/images/naruto_village_logo.png";
import "./components_styles/SearchBar.css"; 



export const SearchBar = ({ setResults }) => { 
    // State to hold the current value of the search input field
    const [input, setInput] = useState("");

    // Function to fetch data from the Dattebayo API based on the search value
    const fetchData = (value) => {
        fetch(`https://dattebayo-api.onrender.com/characters?name=${value}`)
            .then((response) => {
                if (!response.ok) {
                    setResults([]);
                    // Throw an error if the HTTP status is not OK
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((json) => {
                // Update the parent component's state with the character list
                setResults(json.characters || []);
            })
            .catch((error) => {
                console.error("Error fetching data from Dattebayo API:", error);
                setResults([]); // Clear results on error
            });
    };

    // Handler for changes in the input field
    const handleChange = (value) => {
        setInput(value);
    };

    // Effect hook to handle API calling logic with debouncing
    useEffect(() => {
        // Clear results immediately if the input is empty
        if (input.trim() === "") {
            setResults([]);
            return;
        }

        // Set a timer to delay the API call
        const timerId = setTimeout(() => {
            fetchData(input);
        }, 300);

        // Cleanup function: clears the timer if 'input' changes before the delay finishes
        // This is the core of debouncing
        return () => {
            clearTimeout(timerId);
        };

    }, [input, setResults]); // Dependency array: runs when 'input' changes

    return (
        <div className="input-wrapper">
           {/*Logo */}
           <img 
                src={NarutoLogo}
                alt="Naruto Village Logo"
                className="search-logo"
            />
            {/* The actual search input field */}
            <input
                placeholder="Type to Search"
                value={input}
                onChange={(e) => handleChange(e.target.value)} // Update local state on change
            />
        </div>
    );
};