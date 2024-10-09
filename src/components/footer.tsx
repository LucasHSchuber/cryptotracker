// header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// import fontawwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';;



const Footer: React.FC = () => {

    return (
            <div className='footer'>
                <h1>Crypter</h1>
                <p className='mt-4'>Your platform to keep track of crypto currencies</p>
            </div>
      );
}
export default Footer