import React from "react";
import "./components_styles/SearchResultList.css";

export const SearchResultList = ({ results, onSelectCharacter }) => {
    
    return(
        // Grid container for the search result cards
        <div className="results-grid-container"> 
            {
                 results.map((result) => {
                     const imageUrl = result.images && result.images.length > 0 
                                          ? result.images[0] 
                                          : 'https://via.placeholder.com/150/FF4500/FFFFFF?text=No+Image'; 

                     return (
                           <div 
                                className="search-card selectable-card" 
                                key={result.id}
                                onClick={() => onSelectCharacter(result)} 
                           >
                                <div className="card-image-wrapper">
                                    <img src={imageUrl} alt={result.name || "Character"} className="card-image" />
                                </div>
                                
                                <div className="card-name">
                                    {result.name}
                                </div>
                           </div>
                     );
                 })
            }
        </div>
    );
}