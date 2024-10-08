import React, { useEffect, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import axios from 'axios'; 


// import components
import Header from "../components/header"

// import ENV.ts file
import API from '../../env';

// import fontawwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
// import {  } from '@fortawesome/free-brands-svg-icons';


const CryptoTracker = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [oldPrice, setOldPrice] = useState(null); 
  const [lastPrice, setLastPrice] = useState(null);  
  const [icon, setIcon] = useState(null); 
  const [icons, setIcons] = useState(null); 

  const [chartColor, setChartColor] = useState('#000'); 

  const [timeSpan, setTimeSpan] = useState('24h'); 
  
  //24 hour
  const [dayPercentage, setDayPercentage] = useState(""); 


  const [showAll, setShowAll] = useState(false);
  
  const [cryptoUuid, setCryptoUuid] = useState("");



  

  useEffect(() => {
    const fetchIcons = async () => {
        try {
            const response = await axios.get(API.API_URL_COINS, {
              headers: {
                'x-access-token': API.API_KEY
              }
            });
            console.log('response', response);
            const icons = response.data.data.coins.map(coin => ({
                uuid: coin.uuid,
                iconUrl: coin.iconUrl,
                name: coin.name
            }));
              setIcons(icons);
              console.log("icon updated");

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
  
        if (lastPrice !== price) {
          const newPoint = { x: new Date(), y: price };
          setCryptoData((prevData) => [...prevData, newPoint]);
          setChartColor(price > lastPrice ? '#00ff00' : '#ff0000');  
          setOldPrice(lastPrice);
          setLastPrice(price);      
        } 
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    const fetchHistoryData = async () => {
        console.log('cryptoUuid', cryptoUuid);
        try {
          const historyresponse = await axios.get(`${API.API_URL_COIN}/${cryptoUuid}/history?timePeriod=${timeSpan}`, {
            headers: {
              'x-access-token': API.API_KEY
            }
          });
          console.log('historyresponse', historyresponse);
          console.log('historyresponse.data.data.change', historyresponse.data.data.change);
          // set24HourHistory()
          setDayPercentage(historyresponse.data.data.change);

        } catch (error) {
          console.error('Error fetching history data:', error);
        }
      };
  
    fetchHistoryData()
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
    console.log('oldPrice', oldPrice);
  }, [lastPrice, oldPrice]);




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
    colors: [chartColor],
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


    <div className=''>
        {icons && (icons.slice(0, 5)).map((i) => (
            <div 
                className='crypto-row-box d-flex' 
                key={i.uuid} 
                title={i.name} 
                onClick={() => handleSelectCrypto(i)}
            >
                <img className='icon-row-box' key={i.uuid} src={i.iconUrl} alt={`Crypto icon ${i.uuid}`} title={i.name} onClick={() => handleSelectCrypto(i)} />
                <h6 className='mx-5 mt-2'>{i.name}</h6>
            </div>

        ))}
    </div>  
      
       
    <div className='mt-5 d-flex justify-content-between'>
        <div>
            <h4>Your plattform to keep track of crypto data</h4>
            <p>I hope you might find this useful, or just suimply interesting!</p>
        </div>
        <div className='icon-box'>
            <div>
            {icons && (showAll ? icons : icons.slice(0, 20)).map((i) => (
                <img className='icon' key={i.uuid} src={i.iconUrl} alt={`Crypto icon ${i.uuid}`} title={i.name} onClick={() => handleSelectCrypto(i)} />
            ))}
            </div>
            <button className='mt-3 ml-3 button' onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less' : 'Show All'}
            </button>
        </div>
    </div>   

    {cryptoUuid && (
        <div className='crypto-graph-box'>
            <div className='d-flex'>
                <h1 className={`current-price ${oldPrice > lastPrice ? "stock-down" : "stock-up"}`}>{oldPrice > lastPrice ? <FontAwesomeIcon icon={faArrowTrendDown} /> : <FontAwesomeIcon icon={faArrowTrendUp} />} ${Math.floor(lastPrice).toString()}</h1>
                <h1 className={`ml-5 current-price ${dayPercentage < 0 ? "stock-down" : "stock-up"}`}>{timeSpan}: {dayPercentage > 0 ? "+"+dayPercentage : dayPercentage}%</h1>
            </div>
            <div className='crypto-graph'>
                <ApexCharts options={chartOptions} series={series} type="line" height={350} />
            </div>
        </div>
    )}
    

    </div>
  );
};

export default CryptoTracker;
