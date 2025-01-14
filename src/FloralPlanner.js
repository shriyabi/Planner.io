import { useState, useEffect } from 'react';
import './App.css';
import { addTask, completeTask, taskList } from './task'; 
import 'animate.css'
import floral from './backgrounds/floralopaque3.png';

function Floral() {
  const [task, setTask] = useState('');
  const [day, setDay] = useState('');
  const [cat, setCat] = useState('');
  const [time, setTime] = useState('');
  const [am, setAm] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const handleChangeTask = (e) => setTask(e.target.value);
  const handleChangeDay = (e) => setDay(e.target.value);
  const handleChangeCat = (e) => setCat(e.target.value);
  const handleChangeTime = (e) => setTime(e.target.value);
  const handleChangeAmPm = (e) => setAm(e.target.value);

  const adding = (day, cat, time, am, task) => {
    if (!day || !cat || !task) {
      setError('All fields are required.');
      return;
    }

    if (addTask(day, cat, time, am, task)) {
      setError('Task added.');
    } else {
      setError('Task already exists.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTask('');
    setDay('');
    setCat('');
    setTime('');
    setAm('');
    adding(day, cat, time, am, task);
  };

  const handleCompleted = (day, cat, time, am, task) => {
    if (completeTask(day, cat, time, am, task)) {
      setCompleted(true);
    }
  };

  //Day
  const today = new Date(); 
  const todayDay = today.getDay(); 
  const monday = new Date(today); 
  const sunday = new Date(monday); 
  const mondayDiff = (todayDay === 0 ? -6 : 1) - todayDay; 
  monday.setDate(today.getDate() + mondayDiff); 
  sunday.setDate(monday.getDate() + 6); 

  //Time
  const [inputMinutes, setInputMinutes] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer); // Cleanup
    }
  }, [timeLeft]);
  const startTimer = () => {
    const minutes = parseInt(inputMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setTimeLeft(minutes * 60);
    } else {
      alert('Please enter a positive number.');
    }
  };
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const shouldBlink = timeLeft <= 10 && timeLeft > 0;

  const floralUrl = `url(${floral})`; 

  return (
    <div
      className="md:h-screen w-screen flex flex-col justify-start items-center px-5 py-7"
      style={{
        backgroundImage: floralUrl,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full flex justify-start align-center text-3xl font-bold text-stone-700 italic"> WEEK OF {monday.toLocaleDateString()} - {sunday.toLocaleDateString()} </div>
      <div className="w-full mt-5 h-full flex flex-row  items-center justify-center">
        <div className="w-1/2 md:w-3/4 h-full flex flex-col justify-start align-center">
          <div className="w-full md:h-1/2 flex flex-col md:flex-row">
            {['M', 'T', 'W'].map((dayOfWeek, idx) => (
              <div
                key={idx}
                className="w-full md:w-1/3 p-3 border-4 rounded-md bg-rose-50 box border-stone-600 my-4 md:m-4 overflow-y-scroll"
              >
                <h1 className="text-xl overline font-bold text-rose-500 mb-2">
                  {dayOfWeek === 'M' ? 'Monday' : dayOfWeek === 'T' ? 'Tuesday' : 'Wednesday'}
                </h1>
                <div className="flex w-full flex-col font-semibold justify-start align-start text-base">
                  {taskList.filter(taskItem => taskItem.day === dayOfWeek).length > 0 ? (
                    taskList.filter(taskItem => taskItem.day === dayOfWeek).map((taskItem, index) => (
                      <div
                        key={index}
                        className={`flex w-full justify-center items-center flex-row mb-3 hover:bg-rose-200`}
                      >
                        <button
                          className="w-[2.5em] py-1 rounded-lg bg-rose-400"
                          onClick={() => handleCompleted(taskItem.day, taskItem.cat, taskItem.time, taskItem.am, taskItem.task)}
                        >
                          {taskItem.completed
                            ? String.fromCodePoint(0x2705)
                            : String.fromCodePoint(0x2b1c)}
                        </button>
                       <div
                          className={`w-full justify-center px-2 hover:text-pink-800 leading-4 ${
                            taskItem.cat === 'Cl'
                              ? 'text-rose-600'
                              : taskItem.cat === 'P'
                              ? 'text-rose-400'
                              : taskItem.cat === 'Ex'
                              ? 'text-rose-500'
                              : taskItem.cat === 'Ca'
                              ? 'text-stone-400'
                              : taskItem.cat === "L"
                              ? 'text-stone-500'
                              : 'text-stone-700'
                          } ${taskItem.completed ? 'line-through text-gray-200' : ''}`}
                        >
                          {taskItem.task} - {taskItem.time} {taskItem.am} ({taskItem.cat})
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-700 italic">No tasks for this day.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:h-1/2 flex flex-col md:flex-row">
            {['Th', 'F', 'WK'].map((dayOfWeek, idx) => (
                <div
                key={idx}
                className="w-full md:w-1/3 p-3 border-4 rounded-md bg-rose-50 box border-stone-600 my-4 md:m-4 overflow-y-scroll"
              >
                <h1 className="text-xl overline font-bold text-rose-500 mb-2">
                  {dayOfWeek === 'Th' ? 'Thursday' : dayOfWeek === 'F' ? 'Friday' : 'Weekend'}
                </h1>
                <div className="flex w-full flex-col font-semibold justify-start align-start text-base">
                  {taskList.filter(taskItem => taskItem.day === dayOfWeek).length > 0 ? (
                    taskList.filter(taskItem => taskItem.day === dayOfWeek).map((taskItem, index) => (
                      <div
                        key={index}
                        className="flex w-full justify-center items-center flex-row mb-3 hover:bg-rose-200"
                      >
                        <button
                          className="w-[2.5em] py-1 rounded-lg bg-rose-400"
                          onClick={() => handleCompleted(taskItem.day, taskItem.cat, taskItem.time, taskItem.am, taskItem.task)}
                        >
                          {taskItem.completed
                            ? String.fromCodePoint(0x2705)
                            : String.fromCodePoint(0x2b1c)}
                        </button>
                        <div
                          className={`w-full justify-center px-2 hover:text-pink-800 leading-4 ${
                            taskItem.cat === 'Cl'
                              ? 'text-rose-600'
                              : taskItem.cat === 'P'
                              ? 'text-rose-400'
                              : taskItem.cat === 'Ex'
                              ? 'text-rose-500'
                              : taskItem.cat === 'Ca'
                              ? 'text-stone-400'
                              : taskItem.cat === "L"
                              ? 'text-stone-500'
                              : 'text-stone-700'
                          } ${taskItem.completed ? 'line-through text-gray-200' : ''}`}
                        >
                          {taskItem.task} - {taskItem.time} {taskItem.am} ({taskItem.cat})
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-700 italic">No tasks for this day.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>

        <div className="w-1/2 md:w-1/4 h-full flex flex-col items-center justify-center pl-5">
          <div className='w-full md:w-4/5 h-auto mb-7 flex items-center text-start justify-center flex-col border-stone-600 border-4 rounded-2xl box px-2 py-3 bg-stone-600'>
          <h1 className="text-xl text-rose-50 font-bold overline mb-3">Timer</h1>
          <h2
        className={`timer-display text-5xl font-extrabold ${
          shouldBlink ? 'animate__animated animate__flash animate_infinite text-red-500': ''
        }` }
        class="text-5xl font-extrabold text-rose-500 mb-4"
        style={{ color: shouldBlink ? 'red' : 'pink' }}
      >
        {timeLeft > 0 ? formatTime() : '00:00'}
      </h2>
          <input
        type="number"
        value={inputMinutes}
        onChange={(e) => setInputMinutes(e.target.value)}
        placeholder="Enter minutes"
        class="rounded-xl w-full px-2 py-1 text-lg mb-3"
      />
      <button onClick={startTimer} class="rounded-xl hover:bg-rose-300 hover:text-black text-base text-bold text-rose-50 bg-rose-500 px-3 py-1">Start</button>
      
          </div>
          <div className="w-full md:w-4/5 rounded-xl border-4 border-stone-600 bg-stone-600 text-rose-500 justify-center align-center px-4 py-3 mt-2 h-1/2 box flex flex-col">
            <h1 className="text-xl text-rose-50 font-bold overline mb-3">Dashboard</h1>
            <form onSubmit={handleSubmit} className='flex flex-col justify-center align-center w-full'>
              <label className='text-rose-200 font-semibold'>Day</label>
              <select value={day} onChange={handleChangeDay}>
                <option value="" disabled>Select Day</option>
                <option value="M">Monday</option>
                <option value="T">Tuesday</option>
                <option value="W">Wednesday</option>
                <option value="Th">Thursday</option>
                <option value="F">Friday</option>
                <option value="WK">Weekend</option>
              </select>

              <label className='text-rose-200 font-semibold'>Category</label>
              <select value={cat} onChange={handleChangeCat}>
                <option value="" disabled>Select Category</option>
                <option value="Cl">Class</option>
                <option value="Ex">Exam</option>
                <option value="P">Personal</option>
                <option value="Ca">Career</option>
                <option value="L">Life</option>
                <option value="R">Routine</option>
              </select>

              <label className='text-rose-200 font-semibold'> Time: </label>
            <form className='flex flex-row w-full'>
              <select value={time} onChange={handleChangeTime} className="w-2/3">
                <option value="" disabled>
                  Select Hour
                </option>
                <option value="12"> 12:00 </option>
                <option value="1"> 1:00 </option>
                <option value="2"> 2:00 </option>
                <option value="3"> 3:00 </option>
                <option value="4"> 4:00 </option>
                <option value="5"> 5:00 </option>
                <option value="6"> 6:00 </option>
                <option value="7"> 7:00 </option>
                <option value="8"> 8:00 </option>
                <option value="9"> 9:00 </option>
                <option value="10"> 10:00 </option>
                <option value="11"> 11:00 </option>
              </select>
              <select value={am} onChange={handleChangeAmPm} className="w-1/3">
                <option value="" disabled> -</option>
                <option value="AM"> AM </option>
                <option value="PM"> PM </option>
              </select>
            </form>

              <label className='text-rose-200 font-semibold'>Task</label>
              <textarea value={task} onChange={handleChangeTask} placeholder="Type one task here..." className="px-1 py-1 w-full text-sky-500" />
            
              <button type="submit" className="w-full bg-rose-500 rounded-md py-2 text-white mt-4">
                Add Task
              </button>
            </form>
            <div className="mt-3">
              <p className="text-center text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Floral;
