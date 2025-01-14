import { useState } from 'react';
import './App.css';
import 'animate.css';
import Floral from './FloralPlanner';
import Sunset from './SunsetPlanner'; 
import Leaves from './LeavesPlanner';
import floral from './backgrounds/floralopaque3.png';
import sunset from './backgrounds/sunsetopaque.png';
import leaf from './backgrounds/leaveopaque.png';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
    setOpen(false); 
  };

  const handleObjectChange = (objectNumber) => {
    setSelectedObject(objectNumber);
    setIsMenuOpen(false);
    setOpen(true); 
  };
  
  const renderSelectedObject = () => {
    switch (selectedObject) {
      case 1:
        return <Sunset />;
      case 2:
        return <Floral />;
      case 3:
        return <Leaves />;
      default:
        return null;
    }
  };

  return (
    <div>
      <button
        onClick={toggleMenu}
        className="rounded absolute text-stone-400 pb-1 bg-stone-50 hover:text-red-600 flex text-center px-1 text-5xl right-0 top-0 mt-2 mr-2"
      >
        &#x2699;
      </button>

      <div className={`${open ? 'hidden' : ''} h-screen bg-stone-50 w-full flex flex-col items-center text-start justify-center`}>
        <div className='flex flex-col items-center text-start justify-center shadow-black shadow-lg w-1/3 px-3 py-2'>
          <h1 className='text-2xl italic font-bold underline text-start'> Read Me </h1>
          <h1 className='text-lg w-full font-semibold'> This website is a planner for you to store your tasks in a visual format. To begin, select the gear and choose a planner template of interest. You can change the template upon selection, however, all data will be lost. </h1>
          <h1 className='text-base w-full font-semibold mt-3'> Usage Rights: </h1>
          <u className='w-full flex justify-start flex-col items-start'>
            <li> Data will not be stored in any form </li>
            <li> Data will be removed upon reloading </li>
            <li> No cookies are saved </li>
          </u>
          <h1 className='text-sm italics mt-7'> &#xA9; Shriya Biddala (2025)</h1>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute flex flex-row bg-white border rounded shadow-lg w-auto p-2 right-0 top-0 mt-2 mr-2">
          <button
            onClick={() => handleObjectChange(1)}
            className="bg-cyan-700 w-[2.5em] h-[2.5em] text-white p-2 rounded mx-2"
          >
            <img src={sunset} alt="Sunset" />
          </button>
          <button
            onClick={() => handleObjectChange(2)}
            className="bg-rose-500 w-[2.5em] h-[2.5em] text-white p-2 rounded mx-2"
          >
            <img src={floral} alt="Floral" />
          </button>
          <button
            onClick={() => handleObjectChange(3)}
            className="bg-lime-700 w-[2.5em] h-[2.5em] text-white p-2 mx-2 rounded"
          >
            <img src={leaf} alt="Leaves" />
          </button>
        </div>
      )}

      <div>
        {renderSelectedObject()}
      </div>
    </div>
  );
}

export default App;