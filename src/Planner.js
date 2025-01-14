import { useState, useEffect } from 'react';
import './App.css';
import { addTask, completeTask, taskList } from './task';
import 'animate.css'

function Planner({ img, tme, primaryColor, secondaryColor, ternaryColor, quadaryColor, sixColor, clas, career, life, routine }) {
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
    if (!day || !cat || !time || !am || !task) {
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

  const url = `url(${img})`;

  return (
    <div
      className="h-screen w-screen flex flex-col justify-start items-center px-5 py-7"
      style={{
        backgroundImage: url,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className={`w-full flex justify-start align-center text-3xl font-bold text-${primaryColor} italic`}> WEEK OF {monday.toLocaleDateString()} - {sunday.toLocaleDateString()} </div>
      <div className="w-full mt-5 h-full flex-row flex items-center justify-center">
        <div className="w-3/4 h-full flex flex-col justify-start align-center">
          <div className="w-full h-1/2 flex flex-row">
            {['M', 'T', 'W'].map((dayOfWeek, idx) => (
              <div
                key={idx}
                className={`w-1/3 p-3 border-4 rounded-md bg-${secondaryColor} box border-${primaryColor}  m-4 overflow-y-scroll`}
              >
                <h1 className={`text-xl overline font-bold text-${ternaryColor} mb-2`}>
                  {dayOfWeek === 'M' ? 'Monday' : dayOfWeek === 'T' ? 'Tuesday' : 'Wednesday'}
                </h1>
                <div className="flex w-full flex-col font-semibold justify-start align-start text-base">
                  {taskList.filter(taskItem => taskItem.day === dayOfWeek).length > 0 ? (
                    taskList.filter(taskItem => taskItem.day === dayOfWeek).map((taskItem, index) => (
                      <div
                        key={index}
                        className={`flex w-full justify-center items-center flex-row mb-3 hover:bg-${quadaryColor}`}
                      >
                        <button
                          className={`w-[2.5em] py-2 bg-${sixColor}`}
                          onClick={() => handleCompleted(taskItem.day, taskItem.cat, taskItem.time, taskItem.am, taskItem.task)}
                        >
                          {taskItem.completed
                            ? String.fromCodePoint(0x2705)
                            : String.fromCodePoint(0x2b1c)}
                        </button>
                        <div
                          className={`w-full justify-center px-2 hover:text-red-800 leading-4 ${taskItem.cat === 'Cl'
                            ? `text-${clas}`
                            : taskItem.cat === 'P'
                              ? `text-${sixColor}`
                              : taskItem.cat === 'Ex'
                                ? `text-${ternaryColor}`
                                : taskItem.cat === 'Ca'
                                  ? `text-${career}`
                                  : taskItem.cat === 'L'
                                    ? `text-${life}`
                                    : `text-${routine}`
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

          <div className="w-full h-1/2 flex flex-row">
            {['Th', 'F', 'WK'].map((dayOfWeek, idx) => (
              <div
                key={idx}
                className={`w-1/3 p-3 border-4 rounded-md bg-${secondaryColor} box border-${primaryColor} m-4 overflow-y-scroll`}
              >
                <h1 className={`text-xl overline font-bold text-${ternaryColor} mb-2`}>
                  {dayOfWeek === 'Th' ? 'Thursday' : dayOfWeek === 'F' ? 'Friday' : 'Weekend'}
                </h1>
                <div className="flex w-full flex-col font-semibold justify-start align-start text-base">
                  {taskList.filter(taskItem => taskItem.day === dayOfWeek).length > 0 ? (
                    taskList.filter(taskItem => taskItem.day === dayOfWeek).map((taskItem, index) => (
                      <div
                        key={index}
                        className={`flex w-full justify-center items-center flex-row mb-3 hover:bg-${quadaryColor}`}
                      >
                        <button
                          className={`w-[2.5em] py-2 bg-${sixColor}`}
                          onClick={() => handleCompleted(taskItem.day, taskItem.cat, taskItem.time, taskItem.am, taskItem.task)}
                        >
                          {taskItem.completed
                            ? String.fromCodePoint(0x2705)
                            : String.fromCodePoint(0x2b1c)}
                        </button>
                        <div
                          className={`w-full justify-center px-2 hover:text-red-800 leading-4 ${taskItem.cat === 'Cl'
                              ? `text-${clas}`
                              : taskItem.cat === 'P'
                                ? `text-${sixColor}`
                                : taskItem.cat === 'Ex'
                                  ? `text-${ternaryColor}`
                                  : taskItem.cat === 'Ca'
                                    ? `text-${career}`
                                    : taskItem.cat === 'L'
                                      ? `text-${life}`
                                      : `text-${routine}`
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

        <div className="w-1/4 h-full flex flex-col items-center justify-center bg">
          <div className={`w-4/5 h-auto mb-7 flex items-center text-start justify-center flex-col border-${primaryColor} border-4 rounded-2xl box px-2 py-3 bg-${primaryColor}`}>
            <h1 className={`text-xl text-${ternaryColor} font-bold overline mb-3`}>Timer</h1>
            <h2
  className={`timer-display text-5xl font-extrabold ${shouldBlink ? 'animate__animated animate__flash animate_infinite text-red-500' : ''} text-${quadaryColor} mb-4`}
  style={{ color: shouldBlink ? 'red' : time }}
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
            <button onClick={startTimer} class={`rounded-xl hover:bg-${sixColor} hover:text-black text-base text-bold text-${secondaryColor} bg-${ternaryColor} px-3 py-1`}>Start</button>

          </div>
          <div className={`w-4/5 rounded-xl border-4 border-${primaryColor} bg-${primaryColor} text-${ternaryColor} justify-center align-center px-4 py-3 mt-2 h-1/2 box flex flex-col`}>
            <h1 className={`text-xl text-${secondaryColor} font-bold overline mb-3`}>Dashboard</h1>
            <form onSubmit={handleSubmit} className='flex flex-col justify-center align-center w-full'>
              <label className={`text-${quadaryColor} font-semibold`}>Day</label>
              <select value={day} onChange={handleChangeDay}>
                <option value="" disabled>Select Day</option>
                <option value="M">Monday</option>
                <option value="T">Tuesday</option>
                <option value="W">Wednesday</option>
                <option value="Th">Thursday</option>
                <option value="F">Friday</option>
                <option value="WK">Weekend</option>
              </select>

              <label className={`text-${quadaryColor} font-semibold`}>Category</label>
              <select value={cat} onChange={handleChangeCat}>
                <option value="" disabled>Select Category</option>
                <option value="Cl">Class</option>
                <option value="Ex">Exam</option>
                <option value="P">Personal</option>
                <option value="Ca">Career</option>
                <option value="L">Life</option>
                <option value="R">Routine</option>
              </select>

              <label className={`text-${quadaryColor} font-semibold`}> Time: </label>
              <form className='flex flex-row w-full'>
                <select value={tme} onChange={handleChangeTime} className="w-2/3">
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

              <label className={`text-${quadaryColor} font-semibold`}>Task</label>
              <textarea value={task} onChange={handleChangeTask} placeholder="Type one task here..." className="px-1 py-1 w-full text-sky-500" />

              <button type="submit" className={`w-full bg-${ternaryColor} rounded-md py-2 text-white mt-4`}>
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

export default Planner;
