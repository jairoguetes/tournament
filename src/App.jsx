import React, { useState, useEffect } from 'react';
import './styles/NarutoTournament.css';
import { NavBar } from './components/NavBar';
import { SearchBar } from './components/SearchBar';
import { SearchResultList } from './components/SearchResultList';
import { TournamentBracket } from './components/TournamentBracket';
import { TOURNAMENT_MODES } from './utils/constants';
import { createFighterObject } from './utils/tournamentLogic';
import { ThemeToggle } from './components/ThemeToggle';

const BRACKET_STORAGE_KEY = 'narutoTournamentBracket';
const FIGHTERS_STORAGE_KEY = 'narutoSelectedFighters';
const MODE_STORAGE_KEY = 'narutoTournamentMode';

function App() {
  
  // 1. Reading from localStorage
  
  const [results, setResults] = useState([]);

  // Initialize selectedFighters from localStorage
  const [selectedFighters, setSelectedFighters] = useState(() => {
    try {
      const storedFighters = localStorage.getItem(FIGHTERS_STORAGE_KEY);
      return storedFighters ? JSON.parse(storedFighters) : [];
    } catch (error) {
      console.error("Error loading selected fighters from localStorage", error);
      return [];
    }
  });

  // Initialize bracket from localStorage
  const [bracket, setBracket] = useState(() => {
    try {
      const storedBracket = localStorage.getItem(BRACKET_STORAGE_KEY);
      return storedBracket ? JSON.parse(storedBracket) : null;
    } catch (error) {
      console.error("Error loading bracket from localStorage", error);
      return null;
    }
  });

  // Initialize tournamentMode from localStorage
  const [tournamentMode, setTournamentMode] = useState(() => {
    try {
      const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
      // Use stored value, otherwise default to 8
      return storedMode ? JSON.parse(storedMode) : 8;
    } catch (error) {
      console.error("Error loading tournament mode from localStorage", error);
      return 8;
    }
  });

  // Max number of fighters allowed based on the selected mode
  const maxFighters = tournamentMode;


  // 2. useEffect for SAVING to localStorage

  // Effect to save the BRACKET whenever it changes
  useEffect(() => {
    if (bracket) {
      localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(bracket));
    } else {
      // Clear bracket data on reset
      localStorage.removeItem(BRACKET_STORAGE_KEY);
    }
  }, [bracket]);

  // Effect to save the SELECTED FIGHTERS whenever they change
  useEffect(() => {
    localStorage.setItem(FIGHTERS_STORAGE_KEY, JSON.stringify(selectedFighters));
  }, [selectedFighters]);

  // Effect to save the TOURNAMENT MODE whenever it changes
  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(tournamentMode));
  }, [tournamentMode]);
    

    // Handles the selection of a character from the search results
    const handleCharacterSelect = (characterData) => {
        const fighterObject = createFighterObject(characterData); 
        
        setSelectedFighters(prev => {
            if (prev.some(f => f.name === fighterObject.name)) {
                console.warn('This character is already selected!');
                return prev;
            }
            
            if (prev.length >= maxFighters) {
                console.warn(`You have already selected all ${maxFighters} fighters.`);
                return prev;
            }

            return [...prev, fighterObject];
        });
        setResults([]);
    };
    
    // Handles removing a character from the selected fighters list
    const handleCharacterRemove = (fighterName) => {
        setSelectedFighters(prev => prev.filter(f => f.name !== fighterName));
    };
    
    // Initializes the tournament bracket once enough fighters are selected
    const startTournament = () => {
        if (selectedFighters.length !== maxFighters) {
            console.error(`You need exactly ${maxFighters} characters to start.`);
            return;
        }

        const shuffledFighters = [...selectedFighters].sort(() => 0.5 - Math.random());
        
        const round1Matches = [];
        for (let i = 0; i < maxFighters; i += 2) {
            round1Matches.push({
                id: `R1-M${i/2 + 1}`,
                fighterA: shuffledFighters[i],
                fighterB: shuffledFighters[i + 1],
                winner: null,
                isPlayed: false,
            });
        }
        
        let initialBracket;
        if (maxFighters === 8) {
             initialBracket = {
                 round_1: round1Matches, round_2: [null, null], round_3: [null], champion: null };
        } else if (maxFighters === 4) {
             initialBracket = {
                 round_1: round1Matches, round_2: [null], round_3: [], champion: null 
            };
        } else {
             initialBracket = {
                 round_1: round1Matches, round_2: [], round_3: [], champion: null 
            };
        }
        
        setBracket(initialBracket);
        setSelectedFighters([]); 
        setResults([]); 
    };
    
    // Resets the application back to the selection phase
    const resetApp = () => {
        setBracket(null); // This will trigger the bracket useEffect to clear localStorage
        setSelectedFighters([]); // This will trigger the fighters useEffect to save an empty array
        setResults([]);
    }

    // Determines if the app is currently in the character selection phase
    const isSelectionPhase = bracket === null;

  return (
    <div className="App-root">

        <NavBar/> 
        <ThemeToggle/>
        
        <main className="App-main">
            {isSelectionPhase ? (
                // Character Selection Phase
                <div className="selection-phase-container"> 
                    
                    {/* 1. Mode Selector */}
                    <div className="mode-selector-container">
                        <h3 className="mode-selector-title">Select the Tournament Mode:</h3>
                        <div className="mode-buttons-wrapper">
                            {TOURNAMENT_MODES.map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setTournamentMode(mode);
                                        setSelectedFighters([]); // Clear fighters when mode changes
                                    }}
                                    className={`mode-button ${tournamentMode === mode ? 'mode-button-active' : 'mode-button-inactive'}`}
                                >
                                    {mode} Fighters
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Search Bar and Results List */}
                    <div className="search-results-area">
                        <SearchBar setResults={setResults} />
                        <SearchResultList 
                            results={results} 
                            onSelectCharacter={handleCharacterSelect} 
                        />
                    </div>
                    
                    {/* 3. Selection Area and Start Button */}
                    <div className="selection-area-container">
                        <h2 className="selection-area-title">
                            Selected Fighters ({selectedFighters.length}/{maxFighters})
                        </h2>
                        <div className="selected-fighters-wrapper">
                            {selectedFighters.map(f => (
                                <div key={f.name} className="fighter-badge-container">
                                    <img 
                                        src={f.image} 
                                        alt={f.name} 
                                        title={f.name}
                                        className="fighter-image-badge" 
                                    />
                                    <button 
                                        onClick={() => handleCharacterRemove(f.name)}
                                        className="fighter-remove-button"
                                        title="Remove"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={startTournament} 
                            disabled={selectedFighters.length < maxFighters}
                            className={`start-tournament-button ${selectedFighters.length === maxFighters ? 'start-tournament-active' : 'start-tournament-inactive'}`}
                        >
                            {selectedFighters.length === maxFighters 
                                ? 'START!' 
                                : `Missing ${maxFighters - selectedFighters.length} fighters to start`
                            }
                        </button>
                    </div>
                </div>
            ) : (
                // Tournament Bracket Phase
                <div className='tournament-phase-container'>
                    {/* Render the bracket and pass necessary state/handlers */}
                    <TournamentBracket bracket={bracket} setBracket={setBracket} tournamentMode={tournamentMode} />
                    <div className="reset-button-wrapper">
                        <button 
                            onClick={resetApp} 
                            className="reset-button"
                        >
                            Restart
                        </button>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
}

export default App;