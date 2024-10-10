import React, { useEffect, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import Chart from 'react-apexcharts';
import Chart2 from 'react-apexcharts';
import axios from 'axios'; 

// import images
import heroimg from "../images/crypto.jpg"

// import components
import Header from "../components/header"
import Footer from "../components/footer"

// import ENV.ts file
import API from '../../env';

// import fontawwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import { faThinkPeaks } from '@fortawesome/free-brands-svg-icons';


const CryptoTracker = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [showAll, setShowAll] = useState(false); // to show all crypto icons in the icons box
  const [oldPrice, setOldPrice] = useState(null); 
  const [lastPrice, setLastPrice] = useState(null);  
  const [icon, setIcon] = useState(null); 
  const [icons, setIcons] = useState(null);
  const [description, setDescription] = useState(null); 
  const [allTimeHigh, setAllTimeHigh] = useState(null); 
  const [cryptoName, setCryptoName] = useState(null); 
  const [cryptoUuid, setCryptoUuid] = useState("");

  const [chartColor, setChartColor] = useState('#000'); 

  const [timeSpan, setTimeSpan] = useState('3h'); 
  
  //24 hour
  const [dayPercentage, setDayPercentage] = useState(""); 

  //Sparkline data
  const [sparklineDayData, setSparklineDayData] = useState([]); 
  const [sparklineMonthData, setSparklineMonthData] = useState([]); 

  
  
  
  



  


  // fetching icons, name, change and stuff for the page
  useEffect(() => {
    const fetchInitialIcons = async () => {
      try {
        const response = await axios.get(`${API.API_URL_COINS}?timePeriod=24h`, {
          headers: {
            'x-access-token': API.API_KEY,
          },
        });
        console.log('response', response);
        // Set initial icons
        const initialIcons = response.data.data.coins.map(coin => ({
          uuid: coin.uuid,
          iconUrl: coin.iconUrl,
          name: coin.name,
          change: coin.change,
        }));
        setIcons(initialIcons);
        console.log("Icons initialized");
      } catch (error) {
        console.error('Error fetching initial icon data:', error);
      }
    };

    const updateIconChanges = async () => {
      try {
        const response = await axios.get(`${API.API_URL_COINS}?timePeriod=24h`, {
          headers: {
            'x-access-token': API.API_KEY,
          },
        });
        const updatedChanges = response.data.data.coins.map(coin => ({
          uuid: coin.uuid,
          change: coin.change,
        }));
        
        // Update only the change field for existing icons
        setIcons(prevIcons =>
          prevIcons.map(icon => ({
            ...icon,
            change: updatedChanges.find(updated => updated.uuid === icon.uuid)?.change || icon.change,
          }))
        );
      } catch (error) {
        console.error('Error updating icon changes:', error);
      }
    };
    fetchInitialIcons(); 
    const interval = setInterval(() => { updateIconChanges(); }, 15000);

    return () => clearInterval(interval);
  }, []); 




// Hook for fetching historical data only when cryptoUuid changes
useEffect(() => {
    const fetchHistory = async () => {
      console.log('cryptoUuid', cryptoUuid);
      try {
        const responseHistory = await axios.get(`${API.API_URL_COIN}/${cryptoUuid}/history?timePeriod=${timeSpan}`, {
          headers: {
            'x-access-token': API.API_KEY
          }
        });
        console.log('responseHistory', responseHistory.data.data.history);
        const sparkline = responseHistory.data.data.history;
        const filteredData = sparkline.filter(p => p.price !== null);
        const formattedData = filteredData.filter((item, index) => index % 1 === 0).map(item => ({
          x: new Date(item.timestamp * 1000),
          y: Math.floor(item.price).toString()
        }));
        setCryptoData(formattedData); 
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };
  
    fetchHistory(); 
  
  }, [cryptoUuid, timeSpan]); 
  
  // Hook for fetching new data every 5 seconds
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
          const newPoint = { x: new Date(response.data.data.coin.priceAt * 1000), y: Math.floor(price).toString() };
        //   setCryptoData((prevData) => [...prevData, newPoint]); 
          setCryptoData((prevData) => [newPoint, ...prevData]);
          setChartColor(price > lastPrice ? '#00ff00' : '#ff0000');  
          setOldPrice(lastPrice);
          setLastPrice(price); 
          setDescription(response.data.data.coin.description); 
          setDayPercentage(response.data.data.coin.change);  
          const ath = { timestamp: new Date(response.data.data.coin.allTimeHigh.timestamp * 1000), price: Math.floor(response.data.data.coin.allTimeHigh.price).toString() };
          setAllTimeHigh(ath);
          console.log('newPoint', newPoint);   
        } 
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };
  
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 15000); // Set interval for every 5 seconds
  
    return () => clearInterval(interval); // Cleanup interval on component unmount or cryptoUuid change
  
  }, [cryptoUuid, lastPrice]); // Dependencies: runs when either cryptoUuid or lastPrice changes
  


  
  

  useEffect(() => {
    const fetchHistoryData = async () => {
      console.log('cryptoUuid', cryptoUuid);
      try {
        const responseHistory = await axios.get(`${API.API_URL_COIN}/${cryptoUuid}/history?timePeriod=24h`, {
          headers: {
            'x-access-token': API.API_KEY
          }
        });
        console.log('responseHistory', responseHistory.data.data.history);
        const sparkline = responseHistory.data.data.history;
        const _sparkline = sparkline.filter((p) => p.price !== null);
        const formattedData = _sparkline.filter((item, index) => index % 6 === 0).map(item => ({
            x: new Date(item.timestamp * 1000),
            y: Math.floor(item.price).toString()
        }))
        setSparklineDayData(formattedData); 
        // setCryptoData(formattedData);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };
    fetchHistoryData(); 
  }, [cryptoUuid]); 
  
  useEffect(() => {
    const fetchHistoryData = async () => {
      console.log('cryptoUuid', cryptoUuid);
      try {
        const responseHistory = await axios.get(`${API.API_URL_COIN}/${cryptoUuid}/history?timePeriod=7d`, {
          headers: {
            'x-access-token': API.API_KEY
          }
        });
        console.log('responseHistory', responseHistory.data.data.history);
        const sparkline = responseHistory.data.data.history;
        const _sparkline = sparkline.filter((p) => p.price !== null);
        const formattedData = _sparkline.filter((item, index) => index % 3 === 0).map(item => ({
            x: new Date(item.timestamp * 1000),
            y: Math.floor(item.price).toString()
        }))
        console.log('formattedData', formattedData);
        setSparklineMonthData(formattedData); 
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };
    fetchHistoryData(); 
  }, [cryptoUuid]); 






  // when clikcing on a crypto currency
  const handleSelectCrypto = (crypto) => {
    console.log('uuid', crypto.uuid);
    setCryptoUuid(crypto.uuid);
    setCryptoData([]);
    setLastPrice(null);
    setIcon(crypto.iconUrl);
    setCryptoName(crypto.name);
  };





    // Function to format timestamp
    const formatTimestamp = (date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour12: false // Change to true if you want 12-hour format
        });
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
  useEffect(() => {
    console.log('allTimeHigh', allTimeHigh);
  }, [allTimeHigh]);



  // LINE cahrt options for APEXCHART
  const chartOptions = {
    chart: {
      type: 'line',
      zoom: {
        enabled: false,
        },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 100
        }
      },
      background: 'transparent',
      events: {
        mouseLeave: function () {
            this.zoomed = false; 
        },
      },
      toolbar: {
        show: false,
      },
    },
    colors: [chartColor],
    stroke: {
        width: 2,
        color: '#ffffff'
    },
    grid: {
        borderColor: '#ffffff', 
        strokeDashArray: 1, 
    },
    markers: {
        size: 0, 
    },
    xaxis: {
        type: 'datetime',
        labels: {
            style: {
                colors: '#ffffff', 
            },
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
            text: 'Price (USD)',
            style: {
              color: '#ffffff', 
            },
        },
        labels: {
            style: {
                colors: '#ffffff',
              },
            formatter: (value: number): string => {
            // Remove decimal digits
            return "$" + Math.floor(value).toString(); 
          }
        }
      },
      tooltip: {
        theme: 'dark', 
        style: {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
        },
        y: {
          formatter: function (value) {
            return "$" + Math.floor(value).toString(); 
          },
        },
        marker: {
          show: true,
        },
        background: '#000000', 
        borderColor: '#ffffff',
        borderWidth: 1,
        x: {
          show: true,
          format: 'dd MMM HH:mm', 
        },
      },
  };

  const series = [{
    name: 'Bitcoin Price',
    data: cryptoData,
  }];


  

  // ApexCharts configuration options
  const barOptions = {
    chart: {
      type: 'bar', 
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        // format: 'dd MMM',
        style: {
            colors: '#ffffff',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Price (USD)',
      },
      labels: {
        style: {
          colors: '#ffffff', 
        }
      },
      min: Math.min(...sparklineDayData.map(item => item.y)) - 100, 
      max: Math.max(...sparklineDayData.map(item => item.y)) + 100, 
    },
    colors: ['#00aeff'], 
    grid: {
      borderColor: '#e7e7e7', 
    },
    tooltip: {
        theme: 'dark', 
        style: {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
        },
        y: {
          formatter: function (value) {
            return "$" + Math.floor(value).toString(); 
          },
        },
        marker: {
          show: true,
        },
        background: '#000000', 
        borderColor: '#ffffff', 
        borderWidth: 1,
        x: {
          show: true,
          format: 'dd MMM HH:mm',
        },
      },
  };

  const series2 = [{
    name: 'Price',
    data: sparklineDayData, 
  }];



  // ApexCharts configuration options
  const barOptions2 = {
    chart: {
      type: 'bar', 
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        // format: 'dd MMM',
        style: {
            colors: '#ffffff',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Price (USD)',
      },
      labels: {
        style: {
          colors: '#ffffff', 
        }
      },
      min: Math.min(...sparklineMonthData.map(item => item.y)) - 100, 
      max: Math.max(...sparklineMonthData.map(item => item.y)) + 100, 
    },
    colors: ['#00aeff'], 
    grid: {
      borderColor: '#e7e7e7', 
    },
    tooltip: {
        theme: 'dark', 
        style: {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
        },
        y: {
          formatter: function (value) {
            return "$" + Math.floor(value).toString(); 
          },
        },
        marker: {
          show: true,
        },
        background: '#000000', 
        borderColor: '#ffffff',
        borderWidth: 1,
        x: {
          show: true,
          format: 'dd MMM HH:mm',
        },
      },
  };
  const series3 = [{
    name: 'Price',
    data: sparklineMonthData, 
  }];

  
  return (
    <div>
              
        <Header />

        <img src={heroimg} alt='hero img' className='hero-img'></img>

        <div className='wrapper'>

        <div className='crypto-box'>
            {icons && (icons.slice(0, 5)).map((i) => (
                <div 
                    className='crypto-row-box d-flex justify-content-between' 
                    key={i.uuid} 
                    title={i.name} 
                    onClick={() => handleSelectCrypto(i)}
                >
                    <img className='icon-row-box' key={i.uuid} src={i.iconUrl} alt={`Crypto icon ${i.uuid}`} title={i.name} onClick={() => handleSelectCrypto(i)} />
                    <h6 className='mx-5 mt-2' title='Crypto Name'>{i.name}</h6>
                    <h6 className={`mx-5 mt-2`} title='24 Hour Change'> <span  style={{ color: i.change > 0 ? "#00c200" : "#ff1a1a" }}> {i.change}% </span></h6>
                </div>

            ))}
        </div>  
        
        
        <div className='d-flex justify-content-between'>
            <div>
                <h2 className='mb-3'>Crypter is a plattform where you can keep track of crypto data</h2>
                <p>I hope you might find this useful, or just suimply interesting. I hope you might find this useful, or just suimply interesting! I hope you might find this useful, or just suimply interesting!</p>
            </div>
            <div className='icon-box'>
                <div>
                {icons && (showAll ? icons : icons.slice(0, 15)).map((i) => (
                    <img className='icon' key={i.uuid} src={i.iconUrl} alt={`Crypto icon ${i.uuid}`} title={i.name} onClick={() => handleSelectCrypto(i)} />
                ))}
                </div>
                <button className='mt-3 ml-3 button' onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show Less' : 'Show All'}
                </button>
            </div>
        </div>   

        {cryptoUuid && (
            <div>
                <div className='crypto-graph-box'>
                    <div className='d-flex'>
                        <h2 className='mr-5 mt-2'>{cryptoName}</h2>
                        <h1 title='Current Price' className={`current-price ${oldPrice > lastPrice ? "stock-down" : "stock-up"}`}>{oldPrice > lastPrice ? <FontAwesomeIcon icon={faArrowTrendDown} /> : <FontAwesomeIcon icon={faArrowTrendUp} />} ${Math.floor(lastPrice).toString()}</h1>
                        <h1 title='24 Hour Change' className={`ml-5 current-price ${dayPercentage < 0 ? "stock-down" : "stock-up"}`}> {dayPercentage > 0 ? "+"+dayPercentage : dayPercentage}%</h1>
                        <h1 title='All Time High' className={`ml-5 current-price stock-default`}><FontAwesomeIcon icon={faThinkPeaks} /> ${allTimeHigh && allTimeHigh.price} <span style={{ fontSize: "0.7em", fontWeight: "400" }}>{allTimeHigh && formatTimestamp(allTimeHigh.timestamp)}</span> </h1>
                    </div>
                    <div>
                        <p className='my-3'>{description}</p>
                    </div>
                    <div className='mt-3 crypto-graph'>
                        <ApexCharts options={chartOptions} series={series} type="line" height={350} />
                        <div className='mt-3 timespan-buttons d-flex justify-content-center'>
                            <button onClick={() => setTimeSpan("1h")} style={{ backgroundColor: timeSpan === "1h" ? "#fff" : "" }}>1h</button>
                            <button onClick={() => setTimeSpan("3h")} style={{ backgroundColor: timeSpan === "3h" ? "#fff" : "" }}>3h</button>
                            <button onClick={() => setTimeSpan("12h")} style={{ backgroundColor: timeSpan === "12h" ? "#fff" : "" }}>12h</button>
                            <button onClick={() => setTimeSpan("24h")} style={{ backgroundColor: timeSpan === "24h" ? "#fff" : "" }}>1d</button>
                            <button onClick={() => setTimeSpan("7d")} style={{ backgroundColor: timeSpan === "7d" ? "#fff" : "" }}>7d</button>
                            <button onClick={() => setTimeSpan("30d")} style={{ backgroundColor: timeSpan === "30d" ? "#fff" : "" }}>30d</button>
                            <button onClick={() => setTimeSpan("1y")} style={{ backgroundColor: timeSpan === "1y" ? "#fff" : "" }}>1y</button>
                            <button onClick={() => setTimeSpan("3y")} style={{ backgroundColor: timeSpan === "3y" ? "#fff" : "" }}>3y</button>
                            <button onClick={() => setTimeSpan("5y")} style={{ backgroundColor: timeSpan === "5y" ? "#fff" : "" }}>5y</button>
                        </div>
                    </div>
                </div>

                <div className='mt-5 sparkline-graph d-flex justify-content-around'>
                    <div>
                        <h1>24h:</h1>
                        <Chart options={barOptions} series={series2} type="bar" height={180} width={400} />
                    </div>
                    <div>
                        <h1>7d:</h1>
                        <Chart2 options={barOptions2} series={series3} type="bar" height={180} width={400} />
                    </div>
                </div>
            </div>
            
        )}

        

        </div>
        
    <Footer />

    </div>
  );
};

export default CryptoTracker;
