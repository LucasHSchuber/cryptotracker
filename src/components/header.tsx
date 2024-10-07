// header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars, faTimes, faCircle } from '@fortawesome/free-solid-svg-icons';



interface HeaderProps {
    colorfy: boolean; 
}

const Header: React.FC<HeaderProps> = ({ colorfy }) => {
    //define states
    const [link, setLink] = useState("");
    const [menuOpen, setMenuOpen] = useState(false); // State for menu toggle

    const navigate = useNavigate(); 


    // const isMobile = () => {
    //     return window.matchMedia('(max-width: 768px)').matches;
    //   }

    // const handleNavigation = (path: string, label: string) => {
    //     setLink(label);
    //     navigate(path);
    //     // Close menu only if it's on mobile devices
    // if (isMobile()) {
    //     setMenuOpen(false);
    //   }
    // }
    

    return (
        // <div className='header'>

            <div className='header'>
                <h1>Crypto Tracker</h1>
                {/* <p>Lucas H. Schuber</p> */}
            </div>

        // </div>
      );
}
export default Header
