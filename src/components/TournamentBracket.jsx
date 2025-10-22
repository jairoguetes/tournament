import React from 'react';
import { MatchCard } from './MatchCard'; 
import './components_styles/TournamentBacket.css'
import { simulateFight } from '../utils/tournamentLogic'; 

//check if the current device is mobile based on screen width
const isMobileDevice = () => {
    return window.innerWidth < 768; 
};

// Main component for the tournament bracket display
export const TournamentBracket = ({ bracket, setBracket, tournamentMode }) => {
    
    // State to track mobile status
    const [isMobile, setIsMobile] = React.useState(isMobileDevice());
    
    // Effect to handle screen resizing for responsiveness
    React.useEffect(() => {
        const handleResize = () => setIsMobile(isMobileDevice());
        // Attach event listener for window resize
        window.addEventListener('resize', handleResize);
        // Cleanup function to remove the listener when the component unmounts
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Function to calculate the winner and advance them to the next round
    const advanceWinner = (roundKey, matchId, fighterA, fighterB, nextMatchIndex, isFinalMatch) => {
        // Determine the winner of the current match
        const winner = simulateFight(fighterA, fighterB);
        
        // Update the bracket state immutably
        setBracket(prevBracket => {
            const newBracket = JSON.parse(JSON.stringify(prevBracket));
            const roundMatches = newBracket[roundKey];
            const matchIndex = roundMatches.findIndex(m => m && m.id === matchId);

            // Update the current match result
            roundMatches[matchIndex].winner = winner;
            roundMatches[matchIndex].isPlayed = true;

            if (isFinalMatch) {
                // If it's the final match, set the champion
                newBracket.champion = winner;
            } else {
                // Logic to determine the key of the next round
                let nextRoundKey;
                if (tournamentMode === 4) {
                    nextRoundKey = 'round_2';
                } else if (tournamentMode === 8) {
                    if (roundKey === 'round_1') {
                        nextRoundKey = 'round_2'; 
                    } else if (roundKey === 'round_2') {
                        nextRoundKey = 'round_3';
                    }
                }
                
                if (!nextRoundKey) return newBracket;

                // Find or create the next match object
                const nextRoundMatches = newBracket[nextRoundKey];
                let nextMatch = nextRoundMatches[nextMatchIndex];
                
                if (!nextMatch) {
                    // Initialize the next match if it doesn't exist
                    nextMatch = { id: `${nextRoundKey.toUpperCase()}-M${nextMatchIndex + 1}`, fighterA: null, fighterB: null, winner: null, isPlayed: false };
                    nextRoundMatches[nextMatchIndex] = nextMatch;
                }
                
                // Assign the winner to the next available fighter slot 
                if (!nextMatch.fighterA) {
                    nextMatch.fighterA = winner;
                } else if (!nextMatch.fighterB) {
                    nextMatch.fighterB = winner;
                }
            }
            return newBracket;
        });
    };

    // Renders an individual match using the MatchCard component
    const renderMatch = (match, roundKey, matchIndex, isFinal = false) => (
        <MatchCard
            key={match ? match.id : matchIndex}
            match={match}
            roundKey={roundKey}
            matchIndex={matchIndex}
            isFinal={isFinal}
            advanceWinner={advanceWinner} 
            tournamentMode={tournamentMode}
            className={isMobile ? 'match-card-vertical' : ''} 
        />
    );
    
    // Renders a full round column
    const renderRound = (roundKey, title, isFinalRound = false) => (
        <div className="round-column" key={roundKey}>
            <h3 className="round-title">{title}</h3>
            {/* Filter out null matches (if any) and map to renderMatch */}
            {bracket[roundKey] && bracket[roundKey].filter(m => m).map((match, index) => 
                renderMatch(match, roundKey, index, isFinalRound)
            )}
        </div>
    );
    
    // Renders the bracket in a vertical layout for mobile devices
    const renderMobileBracket = () => (
        <div className="mobile-bracket-vertical">
            
            {/* Round 1: Quarters, Semis, or Final depending on mode */}
            {renderRound(
                'round_1', 
                tournamentMode === 8 ? 'Quarter Finals' : (tournamentMode === 4 ? 'Semifinals' : 'Final'),
                tournamentMode === 2 
            )}
            
            {/* Round 2: Semis or Final - Conditional based on mode */}
            {(tournamentMode === 4 || tournamentMode === 8) && renderRound(
                'round_2', 
                tournamentMode === 8 ? 'Semifinals' : 'Final',
                tournamentMode === 4 
            )}

            {/* Round 3: Final - Only in 8-fighter mode */}
            {tournamentMode === 8 && renderRound(
                'round_3', 
                'Final',
                true 
            )}
            
            {/* Champion display column */}
            <div className={`round-column champion-column`}>
                <h3 className="round-title champion-title">CHAMPION</h3>
                <div className="champion-card">
                    {bracket.champion ? (
                        <div className='champion-info'>
                            <img src={bracket.champion.image} alt={bracket.champion.name} className='champion-image' />
                            <h2 className="champion-name">{bracket.champion.name}</h2>
                        </div>
                    ) : (
                        <p className="champion-placeholder">Waiting for the Winner...</p>
                    )}
                </div>
            </div>
        </div>
    );


  
    let gridClass = `bracket-grid-${tournamentMode}-mode`;
    const round2Class = tournamentMode === 8 ? 'round-2-offset-8' : '';
    const round3Class = tournamentMode === 8 ? 'round-3-offset-8' : (tournamentMode === 4 ? 'round-3-offset-4' : '');
    const championClass = tournamentMode === 8 ? 'champion-offset-8' : (tournamentMode === 4 ? 'champion-offset-4' : '');


    return (
        <div className="tournament-root-container">
            <h1 className="tournament-title">
                Tournament of {tournamentMode} Fighters
            </h1>
          
            {/* Conditional rendering for mobile/desktop layout */}
            {isMobile ? renderMobileBracket() : (
                <div className={`bracket-grid ${gridClass}`}>
                    
                    {/* Round 1 */}
                    <div className="round-column round-1-column">
                        <h3 className="round-title">
                            {tournamentMode === 8 ? 'Quarter Finals' : (tournamentMode === 4 ? 'Semifinals' : 'Final')}
                        </h3>
                        {bracket.round_1.map((match, index) => 
                            renderMatch(match, 'round_1', index, tournamentMode === 2) 
                        )}
                    </div>

                    {/* Round 2 */}
                    {(tournamentMode === 4 || tournamentMode === 8) && (
                        <div className={`round-column round-2-column ${round2Class}`}> 
                            <h3 className="round-title">
                                {tournamentMode === 8 ? 'Semifinals' : 'Final'}
                            </h3>
                            {bracket.round_2.filter(m => m).map((match, index) => 
                                renderMatch(match, 'round_2', index, tournamentMode === 4) 
                            )}
                        </div>
                    )}

                    {/* Round 3 */}
                    {tournamentMode === 8 && (
                        <div className={`round-column round-3-column ${round3Class}`}>
                            <h3 className="round-title">Final</h3>
                            {bracket.round_3.filter(m => m).map((match, index) => 
                                renderMatch(match, 'round_3', index, true)
                            )}
                        </div>
                    )}

                    {/* Champion Column */}
                    <div className={`round-column champion-column ${championClass}`}>
                        <h3 className="round-title champion-title">CHAMPION</h3>
                        <div className="champion-card">
                            {bracket.champion ? (
                                <div className='champion-info'>
                                    <img src={bracket.champion.image} alt={bracket.champion.name} className='champion-image' />
                                    <h2 className="champion-name">{bracket.champion.name}</h2>
                                </div>
                            ) : (
                                <p className="champion-placeholder">Waiting for the Winner...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};