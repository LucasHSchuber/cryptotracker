// header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// import fontawwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';;



const Header: React.FC = () => {
    //define states
    const [link, setLink] = useState("");
    const [menuOpen, setMenuOpen] = useState(false); 

    const navigate = useNavigate(); 

    

    return (
        <div>
     
            <div className={`hamburger-menu ${menuOpen ? "menu-open" : "menu-close"}`}>
                <ul>
                    <li>test</li>
                    <li>test2</li>
                </ul>
            </div>

            <div className='header d-flex justify-content-between'>
                <h1>Crypter</h1>
                <div onClick={() => setMenuOpen(!menuOpen)}>
                    <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size='2x' />
                </div>
            </div>

     

       
            
        </div>
      );
}
export default Header
