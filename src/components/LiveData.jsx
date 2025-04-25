import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Node.js backend URL

function NewData(){
    var date = new Date();

    return(
        <p>{date.toLocaleTimeString()}</p>
    );
}


function DataSave({info, setInfo}){
    var date = new Date();

    return(
        <div className="bg-white p-3 text-black grid grid-cols-6">
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
            <h1 className='font-semibold'>🪨{info.pm} u/g</h1>
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


// function newAlert({info, setInfo}){

// }

export default function LiveData() {
  const [data, setData] = useState('Waiting for CanSat data...');
  const [whatever, setWhatever] = useState({Temp:"0", Hum:"0", Co2:"0", pm:"0", GPS:"$GPGGA,152358.00,,,,,0,00,99.99,,,,,,*6E"})
  const [dataList, setDataList] = useState([]);
  const [isReading, setIsReading] = useState(false);

  const [sosList, setSosList] = useState([]);


  useEffect(() => {
    socket.on('serialData', (incomingData) => {
        setData(incomingData);
        console.log(incomingData);
    
        if (incomingData.includes("[SOS ALERT]")){
            const newArray = incomingData.split(/\r\n| /)[6].split(',');
            console.log(newArray);

            const newDataElement = <div className='bg-red-500 rounded-md py-[12px] my-3 shadow-md opacity-90 text-white'>
                <div className='p-4'>
                    <p className='text-[20px]'><strong>SOS ALERT! ⚠️</strong></p>
                    <div classname='text-[15px]'>
                        <p>Latitude: <span>{newArray[2] === "" ? "No Signal" : newArray[2]}</span> <span>{newArray[3]}</span></p>
                        <p>Longitude: <span>{newArray[4] === "" ? "No Signal" : newArray[4]}</span> <span>{newArray[5]}</span></p>
                        <p>Altitude: <span>{whatever.GPS?.split(",")[9] === "" ? "No Signal" : whatever.GPS?.split(",")[9]} m</span> </p>
                    </div>
                </div>
                </div>
            
            setSosList((prevList) => [...prevList, newDataElement]);
        } else{
            console.log(incomingData);
            const newArray = incomingData.split(/\r\n| /);
            console.log(newArray);
            const newInfo = {
                Temp: newArray[3].match(/[\d.]+/)[0],
                Hum: newArray[5].match(/[\d.]+/)[0],
                Co2: newArray[7].match(/[\d.]+/)[0],
                pm: newArray[10].match(/[\d.]+/)[0],
                GPS: newArray[13]
            };
            console.log(newArray);
            setWhatever(newInfo);
            const newDataElement = <DataSave info={newInfo} setInfo={setWhatever}></DataSave>;
            setDataList((prevList) => [...prevList, newDataElement]);
        }
        
        // const newDataElement = <p className="text-lg">{incomingData}</p>;
        
        console.log(dataList);
    });

    return () => {
      socket.off('serialData');
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-slate-50">
        <div className='grid grid-flow-col grid-rows-4 gap-4 w-[90%] h-screen mt-20'>
            <div className='col-span-4 row-span-2 rounded-xl'>
                <div className='grid grid-cols-5 grid-rows-3 gap-5 h-full py-7 px-8 rounded-xl shadow-md bg-gradient-to-r from-blue-200 to-cyan-200'>
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
        }}  className="absolute top-0 right-0 py-[8px] px-[40px] me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 block">{(isReading) ? "Stop" : "Start"}</button>
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
                            <p className='text-[20px]'>PM <span className='italic'> [u/g]</span></p>
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
{/*         
      <h1>📡 CanSat Live Data</h1>
      <div>
        {data}
      </div>
      <div className="h-72 overflow-auto">
        <h2>Compiled Data</h2>
        <div>{dataList}</div> 
      </div> */}


    </div>
  );
}