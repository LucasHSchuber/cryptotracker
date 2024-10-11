// header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// import fontawwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';;

// import images
import c from "../images/c.png";

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
                <div className='d-flex'>
                    <img src={c} alt='Crypter Logo' style={{ width: "37px", height: "31px", marginRight: "-0.2em",  }}></img>
                    <h1>rypter</h1>
                </div>
                <div onClick={() => setMenuOpen(!menuOpen)}>
                    <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size='2x' />
                </div>
            </div>

     

       
            
        </div>
      );
}
export default Header
