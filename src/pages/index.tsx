import React, { useEffect, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import Chart from 'react-apexcharts';
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

interface Coin {
    uuid: string;
    timestamp: number;
    iconUrl: string;
    name: string;
    change: number;
    price: number;
  }

  interface CryptoPoint {
    x: Date;
    y: string;
  }

  interface AllTimeHigh {
    timestamp: Date;
    price: string;
}
interface SparklineData {
    x: Date; // or another type depending on your use case
    y: number;
}
interface Stats {
    price: number;
    dayVolume: number;
    marketCap: number;
    numberOfExchanges: number;
    numberOfMarkets: number;
    supplyTotal: number;
    supplyCirculating: number;
    supplyMax: number;
  }
  interface Link {
    url: string;
    name: string;
}


const CryptoTracker = () => {
  const [cryptoData, setCryptoData] = useState<CryptoPoint[]>([]);
  const [showAll, setShowAll] = useState(false); // to show all crypto icons in the icons box
  const [oldPrice, setOldPrice] = useState(null); 
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [links, setLinks] = useState([]); 
  const [stats, setStats] = useState<Stats | null>(null); 
  const [icons, setIcons] = useState<Coin[]>([]);
  const [description, setDescription] = useState(null); 
  const [allTimeHigh, setAllTimeHigh] = useState<AllTimeHigh | null>(null); 
  const [cryptoName, setCryptoName] = useState<string | null>(null);
  const [cryptoUuid, setCryptoUuid] = useState("");

  const [chartColor, setChartColor] = useState('#000'); 

  const [timeSpan, setTimeSpan] = useState('3h'); 
  
  //24 hour
  const [dayPercentage, setDayPercentage] = useState(""); 

  //Sparkline data
  const [sparklineDayData, setSparklineDayData] = useState<SparklineData[]>([]);
  const [sparklineWeekhData, setSparklineWeekhData] = useState<SparklineData[]>([]); 
  const [sparklineMonthData, setSparklineMonthData] = useState<SparklineData[]>([]); 

  const [isUserActive, setIsUserActive] = useState(true);


  
  // check user inactivity
  useEffect(() => {
    let idleTime = 0;

    // Function to reset idle time
    const resetIdleTime = () => {
      setIsUserActive(true);
      idleTime = 0;
    };

    // Set up event listeners for user activity
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetIdleTime));

    // Check for idle state every seconds
    const interval = setInterval(() => {
      idleTime++;
      if (idleTime > 3) { 
        setIsUserActive(false);
      }
    }, 1000); 

    return () => {
      events.forEach(event => document.removeEventListener(event, resetIdleTime));
      clearInterval(interval);
    };
  }, []);




  


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
    const initialIcons: Coin[] = response.data.data.coins.map((coin: Coin) => ({
         uuid: coin.uuid,
          iconUrl: coin.iconUrl,
          name: coin.name,
          change: coin.change,
          price: coin.price,
        }));
        setIcons(initialIcons);
        console.log("Icons initialized");
      } catch (error) {
        console.error('Error fetching initial icon data:', error);
      }
    };

    const updateIconChanges = async () => {
      if (isUserActive) {  
      try {
        const response = await axios.get(`${API.API_URL_COINS}?timePeriod=24h`, {
          headers: {
            'x-access-token': API.API_KEY,
          },
        });
        const updatedChanges = response.data.data.coins.map((coin: Coin) => ({
          uuid: coin.uuid,
          change: coin.change,
          price: coin.price,
        }));
        
        // Update only the change field for existing icons
        setIcons(prevIcons =>
          prevIcons.map(icon => ({
            ...icon,
            change: updatedChanges.find((updated: Coin) => updated.uuid === icon.uuid)?.change || icon.change,
            price: updatedChanges.find((updated: Coin) => updated.uuid === icon.uuid)?.price || icon.price,
          }))
        );
      } catch (error) {
        console.error('Error updating icon changes:', error);
      }
    } else {
        console.log("User not active - updateIconChanges inactive ")
    }
    };
    fetchInitialIcons(); 
    
    const interval = setInterval(() => { 
        if (isUserActive) {
            updateIconChanges();
        } 
    }, 15000);
    return () => clearInterval(interval);

  }, [isUserActive]); 




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
        const filteredData = sparkline.filter((p: Coin) => p.price !== null);
        const formattedData = filteredData.filter((item: Coin, index: number) => index % 1 === 0).map((item: Coin) => ({
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
      if (isUserActive) {
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
          setIcon(response.data.data.coin.iconUrl); 
          setLinks(response.data.data.coin.links); 
          setStats({
            price: response.data.data.coin.price,
            dayVolume: response.data.data.coin['24hVolume'],
            marketCap: response.data.data.coin.marketCap,
            numberOfExchanges: response.data.data.coin.numberOfExchanges,
            numberOfMarkets: response.data.data.coin.numberOfMarkets,
            supplyTotal: response.data.data.coin.supply.total,
            supplyCirculating: response.data.data.coin.supply.circulating,
            supplyMax: response.data.data.coin.supply.max,
          }); 
          setDescription(response.data.data.coin.description); 
          setDayPercentage(response.data.data.coin.change);  
          const ath = { timestamp: new Date(response.data.data.coin.allTimeHigh.timestamp * 1000), price: Math.floor(response.data.data.coin.allTimeHigh.price).toString() };
          setAllTimeHigh(ath);
          console.log('newPoint', newPoint);   
        } 
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    } else {
        console.log("User not active - updateIconChanges inactive ")
    }
    };
  
    fetchData(); 

    const interval = setInterval(() => { 
        if (isUserActive) {
            fetchData();
        } 
    }, 15000);
    return () => clearInterval(interval);
  
  }, [cryptoUuid, lastPrice, isUserActive]); 
  


  
  

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
        const _sparkline = sparkline.filter((p: Coin) => p.price !== null);
        const formattedData = _sparkline.filter((item: Coin, index: number) => index % 6 === 0).map((item: Coin) => ({
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
        const _sparkline = sparkline.filter((p: Coin) => p.price !== null);
        const formattedData = _sparkline.filter((item: Coin, index: number) => index % 3 === 0).map((item: Coin) => ({
            x: new Date(item.timestamp * 1000),
            y: Math.floor(item.price).toString()
        }))
        console.log('formattedData', formattedData);
        setSparklineWeekhData(formattedData); 
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
        const responseHistory = await axios.get(`${API.API_URL_COIN}/${cryptoUuid}/history?timePeriod=30d`, {
          headers: {
            'x-access-token': API.API_KEY
          }
        });
        console.log('responseHistory', responseHistory.data.data.history);
        const sparkline = responseHistory.data.data.history;
        const _sparkline = sparkline.filter((p: Coin) => p.price !== null);
        const formattedData = _sparkline.filter((item: Coin, index: number) => index % 10 === 0).map((item: Coin) => ({
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
  const handleSelectCrypto = (crypto: Coin) => {
    console.log('uuid', crypto.uuid);
    setCryptoUuid(crypto.uuid);
    setCryptoData([]);
    setLastPrice(null);
    setIcon(crypto.iconUrl);
    setCryptoName(crypto.name);
  };





    // Function to format timestamp
    const formatTimestamp = (date: Date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour12: false 
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
  useEffect(() => {
    console.log('isUserActive', isUserActive);
  }, [isUserActive]);
  useEffect(() => {
    console.log('stats', stats);
  }, [stats]);



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
    dataLabels: {
        enabled: false // This will hide the numbers at the bottom of the bars
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
    dataLabels: {
        enabled: false // This will hide the numbers at the bottom of the bars
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
      min: Math.min(...sparklineWeekhData.map(item => item.y)) - 100, 
      max: Math.max(...sparklineWeekhData.map(item => item.y)) + 100, 
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
    data: sparklineWeekhData, 
  }];


  
  // ApexCharts configuration options
  const barOptions3 = {
    chart: {
      type: 'bar', 
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
        enabled: false // This will hide the numbers at the bottom of the bars
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
  const series4 = [{
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
                    <h6 className={`mx-5 mt-2`} title='Current Price'> <span > ${Math.floor(i.price).toString()} </span></h6>
                    <h6 className={`mx-5 mt-2`} title='24 Hour Change'> <span  style={{ color: i.change > 0 ? "#00c200" : "#ff1a1a" }}> {i.change}% </span></h6>
                </div>

            ))}
        </div>  
        
        <div className='d-flex justify-content-between'>
            <div>
                <h2 className='mb-3'>With Crypter you can keep track of all your favorite crypto currencies!</h2>
                <p>Select a crypto currency and view data in graphs, see metric data, and keep yourself updated with provided links </p>
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
                        {icon && (
                        <img className='mt-2 mr-3 icon-row-box' src={icon} alt={cryptoName ? cryptoName : "Logo"} title={cryptoName + "Logo"}  />
                        )}
                        <h2 className='mr-5 mt-2'>{cryptoName}</h2>
                        <h1 title='Current Price' className={`current-price ${oldPrice > lastPrice ? "stock-down" : "stock-up"}`}>{oldPrice > lastPrice ? <FontAwesomeIcon icon={faArrowTrendDown} /> : <FontAwesomeIcon icon={faArrowTrendUp} />} ${Math.floor(lastPrice).toString()}</h1>
                        <h1 title='24 Hour Change' className={`ml-5 current-price ${dayPercentage < 0 ? "stock-down" : "stock-up"}`}> {dayPercentage > 0 ? "+"+dayPercentage : dayPercentage}%</h1>
                        <h1 title='All Time High' className={`ml-5 current-price stock-default`}><FontAwesomeIcon icon={faThinkPeaks} /> ${allTimeHigh && allTimeHigh.price} <span style={{ fontSize: "0.7em", fontWeight: "400" }}>{allTimeHigh && formatTimestamp(allTimeHigh.timestamp)}</span> </h1>
                        {/* <button onClick={() => setShowLinks(!showLinks)}>{cryptoName} Link</button> */}
                    </div>
                    <div>
                        <p className='my-3'>{description}</p>
                    </div>
                    <div className='mt-3 crypto-graph'>
                        <ApexCharts options={chartOptions} series={series} type="line" height={320} />
                        <div className='mt-3 timespan-buttons d-flex justify-content-around'>
                            <button onClick={() => setTimeSpan("1h")} style={{ backgroundColor: timeSpan === "1h" ? "#383838" : "" }}>1h</button>
                            <button onClick={() => setTimeSpan("3h")} style={{ backgroundColor: timeSpan === "3h" ? "#383838" : "" }}>3h</button>
                            <button onClick={() => setTimeSpan("12h")} style={{ backgroundColor: timeSpan === "12h" ? "#383838" : "" }}>12h</button>
                            <button onClick={() => setTimeSpan("24h")} style={{ backgroundColor: timeSpan === "24h" ? "#383838" : "" }}>1d</button>
                            <button onClick={() => setTimeSpan("7d")} style={{ backgroundColor: timeSpan === "7d" ? "#383838" : "" }}>7d</button>
                            <button onClick={() => setTimeSpan("30d")} style={{ backgroundColor: timeSpan === "30d" ? "#383838" : "" }}>30d</button>
                            <button onClick={() => setTimeSpan("1y")} style={{ backgroundColor: timeSpan === "1y" ? "#383838" : "" }}>1y</button>
                            <button onClick={() => setTimeSpan("3y")} style={{ backgroundColor: timeSpan === "3y" ? "#383838" : "" }}>3y</button>
                            <button onClick={() => setTimeSpan("5y")} style={{ backgroundColor: timeSpan === "5y" ? "#383838" : "" }}>5y</button>
                        </div>
                    </div>
                </div>

                <div className='mt-4 sparkline-graph-box '>
                    <div className='sparkline-graph'>
                        <h1>1d:</h1>
                        <Chart options={barOptions} series={series2} type="bar" height={180} />
                    </div>
                    <div className='sparkline-graph'>
                        <h1>7d:</h1>
                        <Chart options={barOptions2} series={series3} type="bar" height={180} />
                    </div>
                    <div className='sparkline-graph'>
                        <h1>30d:</h1>
                        <Chart options={barOptions3} series={series4} type="bar" height={180} />
                    </div>
                </div>

                <div className='mt-5 d-flex justify-content-around'>
                    <div className='stats-box'>
                    <h1 className='mb-4' style={{ fontSize: "1.4em", color: "white" }}>Financial Metrics for {cryptoName}</h1>
                        <div className='stats d-flex'>
                            <h1 className='mr-2'>Current Price:</h1>
                            <h2>${stats && stats.price}</h2>
                        </div>
                        <div className='stats d-flex'>
                            <h1 className='mr-2'>Current  Market Cap:</h1>
                            <h2>${stats && stats.marketCap}</h2>
                        </div>
                        <div className='stats d-flex'>
                            <h1 className='mr-2'>Current  Supply Circulating:</h1>
                            <h2>{stats && stats.supplyCirculating}</h2>
                        </div>
                        <div className='stats d-flex'>
                            <h1 className='mr-2'>Current Supply Total:</h1>
                            <h2>{stats && stats.supplyTotal}</h2>
                        </div>
                        <div className='stats d-flex'>
                            <h1 className='mr-2'>{cryptoName} Supply Max:</h1>
                            <h2>{stats && stats.supplyMax}</h2>
                        </div>
                    </div>
                    <div className='links-box'>
                        <h1 className='mb-3'>Read more about {cryptoName}</h1>
                        {links.map((item: Link) => (
                            <div>
                                <a href={item && item.url} target='_blank' >{item && item.name}</a>
                            </div>
                        ))}
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
