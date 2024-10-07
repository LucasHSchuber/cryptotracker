import React, { useEffect, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import axios from 'axios'; 

import Header from "../components/header"

import API from '../../env'; 

const CryptoTracker = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [oldPrice, setOldPrice] = useState(null); 
  const [lastPrice, setLastPrice] = useState(null);  
  const [icon, setIcon] = useState(null); 
  const [icons, setIcons] = useState(null); 

  const [showAll, setShowAll] = useState(false);
  
  const [cryptoUuid, setCryptoUuid] = useState("");



  console.log('API', API);

  useEffect(() => {
    const fetchIcons = async () => {
        try {
            const response = await axios.get(API.API_URL_COINS, {
              headers: {
                'x-access-token': API.API_KEY
              }
            });

            const icons = response.data.data.coins.map(coin => ({
                uuid: coin.uuid,
                iconUrl: coin.iconUrl,
                name: coin.name
            }));
            // if (!icons) {
              setIcons(icons);
              console.log("icon updated");
            // }
          } catch (error) {
            console.error('Error fetching icon data:', error);
          }
    }
    fetchIcons();
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      console.log('cryptoUuid', cryptoUuid);
      try {
        const response = await axios.get(`${API.API_URL_COIN}/${cryptoUuid}`, {
          headers: {
            'x-access-token': API.API_KEY
          }
        });
        console.log('response', response);
  
          const price = parseFloat(response.data.data.coin.price);
  
        // Only update if the price has changed
        if (lastPrice !== price) {
          const newPoint = { x: new Date(), y: price };
          setCryptoData((prevData) => [...prevData, newPoint]);
          setLastPrice(price);
        } else {
            setOldPrice(price);
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };
  
    // Call fetchData immediately and then every 5 seconds
    fetchData(); 
    const interval = setInterval(fetchData, 5000); 

    return () => clearInterval(interval);
  }, [cryptoUuid, lastPrice]); 


  const handleSelectCrypto = (crypto) => {
    console.log('uuid', crypto.uuid);
    setCryptoUuid(crypto.uuid);
    setCryptoData([]);
    setLastPrice(null);
    setIcon(crypto.iconUrl);
  };












  useEffect(() => {
    console.log('cryptoData', cryptoData);
  }, [cryptoData]);
  useEffect(() => {
    console.log('icons', icons);
  }, [icons]);
  useEffect(() => {
    console.log('lastPrice', lastPrice);
  }, [lastPrice]);
  useEffect(() => {
    console.log('oldPrice', oldPrice);
  }, [oldPrice]);




  const chartOptions = {
    chart: {
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 100
        }
      },
      background: '#f9f9f9',
    },
    colors: ['#000'],
    xaxis: {
        type: 'datetime',
        labels: {
            formatter: (value: number): string => {
                // Create a new Date object from the value
                const date = new Date(value);
                // Format the time as HH:mm:ss
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`; 
              },
        },
      },
      yaxis: {
        title: {
          text: 'Price (USD)'
        },
        labels: {
            formatter: (value: number): string => {
            // Remove decimal digits
            return Math.floor(value).toString(); 
          }
        }
      }
  };

  const series = [{
    name: 'Bitcoin Price',
    data: cryptoData
  }];

  return (
    <div className='wrapper'>
    <Header />
       
    <div className='d-flex justify-content-between'>
        <div>

        </div>
        <div className='icon-box'>
            <div>
            {icons && (showAll ? icons : icons.slice(0, 10)).map((i) => (
                <img className='icon' key={i.uuid} src={i.iconUrl} alt={`Crypto icon ${i.uuid}`} title={i.name} onClick={() => handleSelectCrypto(i)} />
            ))}
            </div>
            <button className='button' onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less' : 'Show All'}
            </button>
        </div>

    </div>   
      

    {cryptoUuid && (
        <div>
            <div className='crypto-graph'>
                <ApexCharts options={chartOptions} series={series} type="line" height={350} />
            </div>
            <p>
                Current Price: {Math.floor(lastPrice).toString()} $
            </p>
        </div>
    )}
    

    </div>
  );
};

export default CryptoTracker;
