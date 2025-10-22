import React from 'react';
import './components_styles/MatchCardStyles.css'


const FighterDisplay = ({ fighter, slot, isWinner }) => {
    // Render TBD if no fighter is assigned yet
    if (!fighter) {
        return <div className={`fighter-slot ${slot} empty`}>TBD</div>;
    }

    const winnerClass = isWinner ? 'is-winner' : '';
    // Set the background image style using the fighter's image URL
    const imageStyle = {
        backgroundImage: `url(${fighter.image})`,
    };
    
    return (
        <div className={`fighter-slot ${slot} ${winnerClass}`}>
            <div className="fighter-image" style={imageStyle} title={fighter.name}></div>
            <span className="fighter-name">{fighter.name}</span>
        </div>
    );
};


export const MatchCard = ({ match, roundKey, matchIndex, isFinal, advanceWinner }) => {
    
    // State 1: Empty Match 
    if (!match || (!match.fighterA && !match.fighterB)) {
        return (
            <div className={`match-card empty-match ${isFinal ? 'final-match' : ''}`}>
                <p>Waiting for opponents...</p>
            </div>
        );
    }
    
    // State 2: Played Match 
    if (match.isPlayed && match.winner) {
        const winnerName = match.winner.name;
        
        return (
            <div className={`match-card played-match ${isFinal ? 'final-match' : ''}`}>
                <p className="match-id">{match.id}</p>
                <FighterDisplay 
                    fighter={match.fighterA} 
                    slot="slot-a" 
                    isWinner={match.fighterA.name === winnerName} // Check if A is the winner
                />
                <div className="match-status">
                    <span className="status-text">Winner</span>
                    <span className="winner-name">{winnerName}</span>
                </div>
                <FighterDisplay 
                    fighter={match.fighterB} 
                    slot="slot-b" 
                    isWinner={match.fighterB.name === winnerName} // Check if B is the winner
                />
            </div>
        );
    }
    
    // State 3: Ready or Partially Ready Match (Awaiting simulation)
    const isReady = match.fighterA && match.fighterB;
    // Calculate the index of the match in the next round where the winner will go
    const nextMatchIndex = Math.floor(matchIndex / 2);
    
    return (
        <div className={`match-card ready-match ${isFinal ? 'final-match' : ''}`}>
             <p className="match-id">{match.id}</p>
            <div className="match-content">
                <FighterDisplay fighter={match.fighterA} slot="slot-a" isWinner={false} />
                
                <div className="match-controls">
                    {isReady ? (
                        // Button to trigger the fight simulation if both fighters are present
                        <button 
                            className="simulate-button"
                            onClick={() => advanceWinner(
                                roundKey, 
                                match.id, 
                                match.fighterA, 
                                match.fighterB, 
                                nextMatchIndex, 
                                isFinal
                            )}
                        >
                            Simulate
                        </button>
                    ) : (
                        // Display waiting message if the match is not ready
                        <span className="waiting-text">Waiting...</span>
                    )}
                </div>
                
                <FighterDisplay fighter={match.fighterB} slot="slot-b" isWinner={false} />
            </div>
        </div>
    );
};