import { useEffect, useState, useRef  } from 'react';
import { io } from 'socket.io-client';
import sound from "../assets/alarm.mp3";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:3000'); // Node.js backend URL

function NewData(){
    var date = new Date();

    return(
        <p>{date.toLocaleTimeString()}</p>
    );
}



function NewSosAlert(){
    return(
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-center opacity-80 my-1" role="alert">
            <strong className="font-bold">SOS ALERT! </strong>
            <span> There is a new alert</span>
        </div>
    );
}
function DataSave({info, setInfo}){
    var date = new Date();
    return(
        <div className={`grid grid-cols-6 bg-white
                transition-all duration-500 ease-in-out 
                w-full h-full ${(info.isEnter) ? "scale-[1.01] text-lg  rounded-md bottom-5 shadow-lg" : "scale-[1]  p-3 text-black"}`}>
        <p>{date.toLocaleTimeString()}</p>
        <div>
            <h1 className='font-semibold'>🌡️{info.Temp} °C</h1>
            <p>Temperature</p>
        </div>
        <div>
            <h1 className='font-semibold'>💧{info.Hum}%</h1>
            <p>Humidity</p>
        </div>
        <div>
            <h1 className='font-semibold'>😮‍💨{info.Co2} ppm</h1>
            <p>CO2</p>
        </div>
        <div>
            <h1 className='font-semibold'>🪨{info.pm} μg/m3</h1>
            <p>PM</p>
        </div>
        <div className='text-[12px]'>
            <p><strong>Lat:</strong> <span>{info.GPS?.split(",")[2] === "" ? "No Signal" : info.GPS?.split(",")[2]}</span> <span>{info.GPS.split(",")[3]}</span></p>
            <p><strong>Long:</strong> <span>{info.GPS?.split(",")[4] === "" ? "No Signal" : info.GPS?.split(",")[4]}</span> <span>{info.GPS.split(",")[5]}</span></p>
            <p><strong>Alt:</strong> <span>{info.GPS?.split(",")[9] === "" ? "No Signal" : info.GPS?.split(",")[9]}</span></p>
        </div>

      </div>
    );

}

function SosSave({info, setInfo}){
    var date = new Date();

    return(
    <div className='bg-red-500 rounded-md py-[12px] my-3 shadow-md opacity-90 text-white'>
        <div className='p-4'>
            <p className='text-[20px]'><strong>SOS ALERT! ⚠️</strong></p>
            <div className='text-[15px]'>
                <p>{date.toLocaleTimeString()}</p>
                <p>Latitude: <span>{info[2] === "" ? "No Signal" : info[2]}</span> <span>{info[3]}</span></p>
                <p>Longitude: <span>{info[4] === "" ? "No Signal" : info[4]}</span> <span>{info[5]}</span></p>
                <p>Altitude: <span>{info[9] === "" ? "No Signal" : info[9]} m</span> </p>
            </div>
        </div>
    </div>
    )
}


// function newAlert({info, setInfo}){

// }

export default function LiveData() {
  const [data, setData] = useState('Waiting for CanSat data...');
  const [whatever, setWhatever] = useState({Temp:"0", Hum:"0", Co2:"0", pm:"0", GPS:"$GPGGA,152358.00,,,,,0,00,99.99,,,,,,*6E"})

  const [sosGPS, setSosGPS] = useState({Long:"", DLong:"", Lat:"", DLat:"", Alt: ""});
  const [dataList, setDataList] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [dataChart, setDataChart] = useState([]);

  const [sosList, setSosList] = useState([]);

  const [newShit, setNewShit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hide, setHide] = useState(false);
  const showModalRef = useRef(showModal);

  const [currentGPS, setCurrentGPS] = useState({lon:14.64958, lat:121.06836});

  const [alertList, setAlertList] = useState([]);
//   const newAudio = new Audio(sound);

  const play = () =>{
    new Audio(sound).play();
  }
  


  const changeHide = () => {
    setHide(false);
    setTimeout(() =>{
        setShowModal(false);
    }, 400);
  }


  useEffect(() => {
    showModalRef.current = showModal;
  }, [showModal]);

  useEffect(() => {
    socket.on('serialData', (incomingData) => {
        setData(incomingData);
        

        

    
        if (incomingData.includes("[SOS ALERT]")){
            const newId = Date.now();
            // setShowModal(false);
            const newArray = incomingData.split(/\r\n| /)[6].split(',');
            console.log(newArray);

            // const newDataElement = <div className='bg-red-500 rounded-md py-[12px] my-3 shadow-md opacity-90 text-white'>
            //     <div className='p-4'>
            //         <p className='text-[20px]'><strong>SOS ALERT! ⚠️</strong></p>
            //         <div className='text-[15px]'>
            //             <p>Latitude: <span>{newArray[2] === "" ? "No Signal" : newArray[2]}</span> <span>{newArray[3]}</span></p>
            //             <p>Longitude: <span>{newArray[4] === "" ? "No Signal" : newArray[4]}</span> <span>{newArray[5]}</span></p>
            //             <p>Altitude: <span>{newArray[9] === "" ? "No Signal" : newArray[9]} m</span> </p>
            //         </div>
            //     </div>
            //     </div>

            

            play();

            setSosList((prevList) => {
                const newDataElement = <SosSave key={newId} info={newArray}></SosSave>
                return[...prevList, newDataElement].sort((a,b) => b.key - a.key);});
            

            if (!(showModalRef.current)){
                setHide(true);
                setSosGPS({Lat: newArray[2], DLat: newArray[3], Long: newArray[4], DLong: newArray[5], Alt: newArray[9]});
                setShowModal(true);
            } else{
                const newDataElem = <NewSosAlert></NewSosAlert>;
                setAlertList((prevList) => [...prevList, newDataElem]);

                setTimeout(() => {
                    setAlertList((prevList)=>{
                        return prevList.filter(item => item !== newDataElem);
                    });
                }, 5000);

            }
            
            
            
            
        } else{

            
            const newArray = incomingData.split(/\r\n| /);
            console.log(newArray);
            const newInfo = {
                Temp: newArray[3].match(/[\d.]+/)[0],
                Hum: newArray[5].match(/[\d.]+/)[0],
                Co2: newArray[7].match(/[\d.]+/)[0],
                pm: newArray[10].match(/[\d.]+/)[0],
                GPS: newArray[13],
                isEnter: true
            };

            var splittedGps = newInfo.GPS.split(",");
            if (splittedGps[2].trim() !== "" && splittedGps[4].trim() !== ""){
                console.log("yis!");
                var longitude = splittedGps[2].trim().replace(".", "");
                longitude = Number(longitude.substring(0, 2)) + (Number(longitude.substring(2)) / 60);
                console.log(longitude);

                var latitude = splittedGps[4].trim().replace(".", "");
                latitude = Number(latitude.substring(0,3)) + (Number(latitude.substring(3)) / 60);
                console.log(latitude);

                setCurrentGPS({lon:longitude, lat:latitude});
            } 
            

            setDataChart((prevList) => [...prevList, newInfo]);
            console.log(newArray);
            console.log(dataList.length);
            setWhatever(newInfo);

            const newId = Date.now(); // or use a counter
            
            
            setDataList((prevList) => 
                {const newDataElement = <DataSave key={newId} info={newInfo} setInfo={setWhatever}></DataSave>;
                return[...prevList, newDataElement].sort((a,b) => b.key - a.key);
            });

            setNewShit(true);                          

            setTimeout(() => {
                setDataList((prevList) => 
                    prevList.map(item => 
                        { 
                            if (item.key == newId){
                                console.log("found");
                                return  { ...item, props: { ...item.props, info: { ...item.props.info, isEnter: false } } } ;
                            } else {
                                
                                return item;
                            }
                        })
                );
            }, 100);

            setTimeout(() => {
                
                setNewShit(false);
            }, 1000);
            
        }
        
        // const newDataElement = <p className="text-lg">{incomingData}</p>;
        
       
    });

    return () => {
      socket.off('serialData');
    };
  }, []);

  return (
    <>
    <div className='fixed z-50 w-full'>
        {alertList}
    </div>


    {showModal && (
        <div className='modal-container'>
                <div class='fixed bg-gradient-to-r from-red-500 to rounded-lg shadow-lg w-[400px] h-[320px] pt-3 z-10 animate-ping'></div>
            
                <div class={`relative bg-white rounded-lg shadow-lg w-[400px] h-[320px] border-double border-2 z-30 ${(hide) ? 'animate-popup' : 'animate-notpop'}`}>
                    <div class="p-4 md:p-5 text-center">
                        <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        <h1 className="mb-5 text-[25px] font-bold text-gray-500 ">NEW SOS ALERT</h1>
                        <div className='m-5'>
                            <p>New Alert located at:</p>
                            <p>Latitude: {sosGPS.Lat} {sosGPS.DLat}</p>
                            <p>Longitude: {sosGPS.Long} {sosGPS.DLong}</p>
                            <p>Altitude: {sosGPS.Alt}</p>
                        </div>
                        <button data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center " onClick={changeHide}>
                            Okay
                        </button>
                    
                </div>
            </div>
        </div>
    )}
    
    <div className="flex flex-col items-center justify-center bg-slate-100">
        <div className='grid grid-flow-col grid-rows-4 gap-4 w-[90%] h-screen mt-5'>
            
            <div className='grid col-span-4 row-span-2 rounded-xl'>
                <div className={(newShit) ? 'card-wrapper' : '@apply relative rounded-2xl'}>
                <div className={`transition-all duration-1000 ease-in-out card-content ${newShit ? 'bg-custom-blue' : 'bg-custom-blue1'}  grid grid-cols-5 grid-rows-3 gap-5 h-full py-7 px-8 rounded-xl shadow-md`}>
                    <div className='col-span-5 row-span-1 relative'>
                        <h1 className='text-[30px]'>
                            <strong>CanSat Live Data</strong></h1>
                            <p>Is server live? <span className={(isReading) ? "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full shadow-mt" : "bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full"}>{(isReading) ? "Yes" : "No"}</span></p>
                            <button onClick={() => {
                                if (!isReading){
                                    socket.emit('startReading');
                                } else {
                                    socket.emit('stopReading')
                                }
                                setIsReading(!isReading);
                            }}  className="absolute top-0 right-0 py-[8px] px-[40px] me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 block">{(isReading) ? "Stop" : "Start"}
                            </button>
                    </div>
                    <div className='row-span-2 bg-white rounded-xl shadow-md opacity-75'>
                        <div className='px-[30px] py-[50px]'>
                            <h1 className=' text-[40px] font-semibold'>{whatever.Temp} °C</h1>
                            <p className='text-[20px]'>Temperature</p>
                        </div>
                    </div>
                    <div className='row-span-2 bg-white rounded-xl shadow-md opacity-75'>
                        <div className='px-[30px] py-[50px]'>
                            <h1 className=' text-[40px] font-semibold'>{whatever.Hum}%</h1>
                            <p className='text-[20px]'>Humidity</p>
                        </div>
                    </div>
                    <div className='row-span-2 bg-white rounded-xl shadow-md opacity-75'>
                        <div className='px-[30px] py-[50px]'>
                            <h1 className=' text-[40px] font-semibold'>{whatever.Co2} ppm</h1>
                            <p className='text-[20px]'>CO2</p>
                        </div>
                    </div>
                    <div className='row-span-2 bg-white rounded-xl shadow-md opacity-75'>
                        <div className='px-[30px] py-[50px]'>
                            <h1 className=' text-[40px] font-semibold'>{whatever.pm} </h1>
                            <p className='text-[20px]'>PM <span className='italic'> [μg/m3]</span></p>
                        </div>
                    </div>
                    <div className='row-span-2'>
                        <div className='grid grid-cols-1 grid-rows-3 gap-3 h-full'>
                            <div className='row-span-1 bg-white rounded-xl shadow-md opacity-75'>
                                <div className='px-[20px] py-[12px]'>
                                    <h1 className=' text-[15px] font-semibold'><span>{whatever.GPS?.split(",")[2] === "" ? "No Signal" : whatever.GPS?.split(",")[2]}</span> <span>{whatever.GPS.split(",")[3]}</span></h1>
                                    <p className='text-[10px] -mt-1'>Latitude</p>
                                </div>
                            </div>
                            <div className='row-span-1 bg-white rounded-xl shadow-md opacity-75'>
                            <div className='px-[20px] py-[12px]'>
                                    <h1 className=' text-[15px] font-semibold'><span>{whatever.GPS?.split(",")[4] === "" ? "No Signal" : whatever.GPS?.split(",")[4]}</span> <span>{whatever.GPS.split(",")[5]}</span></h1>
                                    <p className='text-[10px] -mt-1'>Longitude</p>
                                </div>
                            </div>
                            <div className='row-span-1 bg-white rounded-xl shadow-md opacity-75'>
                            <div className='px-[20px] py-[12px]'>
                                    <h1 className=' text-[15px] font-semibold'><span>{whatever.GPS?.split(",")[9] === "" ? "No Signal" : whatever.GPS?.split(",")[9]} m</span></h1>
                                    <p className='text-[10px] -mt-1'>Altitude</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            
            </div>
            <div className='col-span-3 row-span-2 bg-white rounded-xl shadow-md p-5'>
                <div className='w-full max-h-[300px] flex flex-col overflow-auto rounded-lg p-2 divide-y-2 divide-gray-200'>
                    
                    {dataList}
                    
                    
                </div>
            </div>
            <div className='row-span-2 rounded-xl bg-white  shadow-md p-5'>
                <div className='overflow-auto w-full max-h-[300px]'>
                    {sosList}
                </div>
            </div>
        </div>
    </div>

    <div className="flex flex-col items-center justify-center bg-slate-100">
        
        <div className='grid grid-cols-4 grid-rows-4 gap-4 w-[90%] h-screen mt-5'>
            <div className='grid col-span-3 row-span-3 rounded-xl grid-cols-2 grid-rows-2 gap-4'>
                <div className='grid col-span-1 row-span-1 rounded-xl bg-white shadow-md py-6'>
                    <div className="mx-7">
                        <p className="font-semibold text-[20px]">Temperature (°C)</p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" margin="15px">
                        <AreaChart width={500} height={400} data={dataChart} margin={{top: 10, right: 30, left: 0, bottom: 0,}}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tick={{ fontSize: 10 }}/>
                        <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tickFormatter={(value) => value.toFixed(1)} tick={{ fontSize: 10 }}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="Temp" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="mx-7">
                        <p className="text-[15px]"><span className='font-semibold'>Ave. Temperature:</span> {dataChart.length !== 0 ? (((dataChart.map(data => Number(data.Temp))).reduce((acc, curr) => acc + curr, 0)) / dataChart.length).toFixed(2) : "N/A"}°C</p>
                    </div>
                </div>
                <div className='grid col-span-1 row-span-1 rounded-xl bg-white shadow-md py-6'>
                    <div className="mx-7">
                        <p className="font-semibold text-[20px]">Humidity (%)</p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" margin="15px">
                        <AreaChart width={500} height={400} data={dataChart} margin={{top: 10, right: 30, left: 0, bottom: 0,}}>
                        <defs>
                            <linearGradient id="colorUz" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7fdb88" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#7fdb88" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tick={{ fontSize: 10 }}/>
                        <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tickFormatter={(value) => value.toFixed(1)} tick={{ fontSize: 10 }}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="Hum" stroke="#7fdb88" fillOpacity={1} fill="url(#colorUz)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="mx-7">
                        <p className="text-[15px]"><span className='font-semibold'>Ave. Humidity:</span> {dataChart.length !== 0 ? (((dataChart.map(data => Number(data.Hum))).reduce((acc, curr) => acc + curr, 0)) / dataChart.length).toFixed(2) : "N/A"} %</p>
                    </div>
                </div>
                <div className='grid col-span-1 row-span-1 rounded-xl bg-white shadow-md py-6'>
                    <div className="mx-7">
                        <p className="font-semibold text-[20px]">CO2 (ppm)</p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" margin="15px">
                        <AreaChart width={500} height={400} data={dataChart} margin={{top: 10, right: 30, left: 0, bottom: 0,}}>
                        <defs>
                            <linearGradient id="colorUl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f0a8da" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f0a8da" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tick={{ fontSize: 10 }}/>
                        <YAxis tickFormatter={(value) => value.toFixed(1)} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Co2" stroke="#f0a8da" fillOpacity={1} fill="url(#colorUl)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="mx-7">
                        <p className="text-[15px]"><span className='font-semibold'>Ave. CO2:</span> {dataChart.length !== 0 ? (((dataChart.map(data => Number(data.Co2))).reduce((acc, curr) => acc + curr, 0)) / dataChart.length).toFixed(2) : "N/A"}ppm</p>
                    </div>
                </div>
                <div className='grid col-span-1 row-span-1 rounded-xl bg-white shadow-md py-6'>
                    <div className="mx-7">
                        <p className="font-semibold text-[20px]">PM (ug/m3)</p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" margin="15px">
                        <AreaChart width={500} height={400} data={dataChart} margin={{top: 10, right: 30, left: 0, bottom: 0,}}>
                        <defs>
                            <linearGradient id="colorUf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff776b" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ff776b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tick={{ fontSize: 10 }}/>
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="pm" stroke="#ff776b" fillOpacity={1} fill="url(#colorUf)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="mx-7">
                        <p className="text-[15px]"><span className='font-semibold'>Ave. PM:</span> {dataChart.length !== 0 ? (((dataChart.map(data => Number(data.pm))).reduce((acc, curr) => acc + curr, 0)) / dataChart.length).toFixed(2) : "N/A"} ug/m3</p>
                    </div>
                </div>
            </div>
            <div className='grid col-span-1 row-span-3 rounded-xl bg-red-100 shadow-md'>
                <MapContainer center={[currentGPS.lon, currentGPS.lat]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '16px'}}>
  <TileLayer
    url="https://api.maptiler.com/maps/ch-swisstopo-lbm/{z}/{x}/{y}.png?key=NAyAk7KrE0vqii68Ebv4" // <-- Default OSM tile
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  />
  <Marker position={[currentGPS.lon, currentGPS.lat]}>
    <Popup>Hello world!</Popup>
  </Marker>
</MapContainer>
            </div>
        </div>
    </div>
    </>
  );
}