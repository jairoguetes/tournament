import React from 'react';
import narutoNavbarImage from '../assets/images/narutoNavBar.png'; 
import "./components_styles/NavBar.css";

const navbarStyle = {
    height: '150px',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${narutoNavbarImage})`,
    
   
};

export const NavBar = () => {
    return (
        <section className="navbar-background" style={navbarStyle}>
            <p className='navBarTitle'>Naruto</p>
            <br />
            <p className='navBarTitle'>Tournament</p>
        </section>
    )
}