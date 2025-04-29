import { useState, useEffect } from 'react';
import { gapi } from "gapi-script";
import './App.css';
import 'animate.css';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [taskList, setTaskList] = useState(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  //const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskAmPm, setNewTaskAmPm] = useState('AM');
  const [taskColors, setTaskColors] = useState({});
  const [taskCategory, setTaskCategory] = useState({});
  const [showCategoryColorPicker, setShowCategoryColorPicker] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [timeInput, setTimeInput] = useState('00:00'); // editable input
  const [secondsLeft, setSecondsLeft] = useState(0);    // actual seconds to count down
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(true);


  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
    setOpen(false);
  };

  const openAddTask = () => {
    setIsAddTaskOpen(true);
  };

  const closeAddTask = () => {
    setIsAddTaskOpen(false);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskTime('');
    setNewTaskAmPm('AM');
  };

  const handleNewTaskTitleChange = (event) => {
    setNewTaskTitle(event.target.value);
  };

  const handleNewTaskDueDateChange = (event) => {
    setNewTaskDueDate(event.target.value);
  };

  const handleNewTaskTimeChange = (event) => {
    setNewTaskTime(event.target.value);
  };

  const handleNewTaskAmPmChange = (event) => {
    setNewTaskAmPm(event.target.value);
  };

  const handleSaveCategoryColor = (taskId) => {
    setShowCategoryColorPicker(false);
  };

  const handleCategoryChange = (e, taskId) => {
    const newCategory = e.target.value;
    setTaskCategory(prevState => ({
      ...prevState,
      [taskId]: newCategory,
    }));
  };

  const handleColorChange = (e, taskId) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    setTaskColors(prevState => ({
      ...prevState,
      [taskId]: { color: newColor },
    }));
  };

  const handleSaveColor = () => {
    if (selectedTaskId) {
      setTaskColors((prevColors) => ({
        ...prevColors,
        [selectedTaskId]: selectedColor,
      }));
      setShowCategoryColorPicker(false);
    }
  };

  const formatDateTimeForApi = () => {
    if (!newTaskDueDate) {
      return null;
    }
    if (!newTaskTime) {
      const year = newTaskDueDate.substring(0, 4);
      const month = parseInt(newTaskDueDate.substring(5, 7), 10) - 1;
      const day = parseInt(newTaskDueDate.substring(8, 10), 10);

      const dueDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      return dueDate.toISOString();
    }
    const [hoursStr, minutesStr] = newTaskTime.split(' ')[0].split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const ampm = newTaskTime.split(' ')[1];
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    const year = newTaskDueDate.substring(0, 4);
    const month = parseInt(newTaskDueDate.substring(5, 7), 10) - 1;
    const day = parseInt(newTaskDueDate.substring(8, 10), 10);
    const dueDateWithTime = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));
    return dueDateWithTime.toISOString();
  };

  const handleAddTaskSubmit = async (event) => {
    event.preventDefault();

    if (!isSignedIn) {
      alert('Please sign in to add tasks.');
      return;
    }

    try {
      const taskListsResponse = await gapi.client.tasks.tasklists.list();
      const taskLists = taskListsResponse.result.items;

      if (taskLists && taskLists.length > 0) {
        const dueDateTime = formatDateTimeForApi();
        const taskData = {
          title: newTaskTitle,
          ...(dueDateTime && { due: dueDateTime })
        };


        await gapi.client.tasks.tasks.insert({
          tasklist: taskLists[0].id,
          resource: taskData,
        });

        console.log('Task added to Google Tasks:', newTaskTitle, dueDateTime || 'No Due Date');
        closeAddTask();
        fetchTasks();
      } else {
        alert('No task list found in your Google Tasks.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task to Google Tasks.');
    }
  };



  async function markTaskAsComplete(tasklistId, taskId, currentDay) {
    const gapi = window.gapi;
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      console.error("User not signed in.");
      return;
    }

    try {
      const task = await gapi.client.tasks.tasks.get({
        tasklist: tasklistId,
        task: taskId,
      });

      const updatedTask = {
        ...task.result,
        status: 'completed',
        completed: new Date().toISOString(),
      };

      const response = await gapi.client.tasks.tasks.update({
        tasklist: tasklistId,
        task: taskId,
        resource: updatedTask,
      });

      console.log('Task marked as complete:', response);
      setTaskList(prevTaskList => { //yeet tasks
        const updatedTaskList = { ...prevTaskList };
        if (updatedTaskList[currentDay]) {
          updatedTaskList[currentDay] = updatedTaskList[currentDay].filter(task => task.id !== taskId);
          if (updatedTaskList[currentDay].length === 0) {
            delete updatedTaskList[currentDay];
          }
        }
        return updatedTaskList;
      });
    } catch (error) {
      console.error('Error marking task as complete:', error);
      alert('Failed to mark task as complete.');
    }
  }

  useEffect(() => {
    const start = () => {
      gapi.client.init({
        clientId: "288878727781-13bsq1sohkb98nspd8mqvrubmkf6spkm.apps.googleusercontent.com",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"],
        scope: "https://www.googleapis.com/auth/tasks",
      });
    };
    gapi.load("client:auth2", start);
  }, []);

  const signIn = async () => {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
      try {
        const googleUser = await auth2.signIn();
        const profile = googleUser.getBasicProfile();
        setUserProfile({
          name: profile.getName(),
          email: profile.getEmail(),
          imageUrl: profile.getImageUrl(),
        });
        setIsSignedIn(true);
        console.log("Signed in successfully:", profile.getName());
        fetchTasks();
      } catch (error) {
        console.error("Error signing in", error);
      }
    } else {
      console.error("gapi.auth2 not initialized");
    }
  };

  const signOut = () => {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
      auth2.signOut().then(() => {
        setIsSignedIn(false);
        setUserProfile(null);
        setTaskList(null);
        console.log("User signed out");
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const taskListsResponse = await gapi.client.tasks.tasklists.list();
      const taskLists = taskListsResponse.result.items;
      if (taskLists && taskLists.length > 0) {
        const tasksResponse = await gapi.client.tasks.tasks.list({
          tasklist: taskLists[0].id,
        });
        const tasks = tasksResponse.result.items || [];
        console.log("Fetched tasks:", tasks);

        const tasksByDay = {};

        tasks.forEach(task => {
          if (task.status !== 'completed') {
            let day = 'No Due Date';
            if (task.due) {
              const dueDateUTC = new Date(task.due);
              const offset = new Date().getTimezoneOffset();
              let dueDateLocal = new Date(dueDateUTC.getTime() - offset * 60 * 1000);
              dueDateLocal.setDate(dueDateLocal.getDate() + 1);
              const localDayName = dueDateLocal.toLocaleDateString('en-US', { weekday: 'long' });
              day = localDayName;
            }
            if (!tasksByDay[day]) {
              tasksByDay[day] = [];
            }
            tasksByDay[day].push({ id: task.id, title: task.title, discription: task.discription || '' });
          }
        });

        setTaskList(tasksByDay);
        console.log("TaskList (grouped by day):", tasksByDay);
      }
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };


  const getOrderedDays = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const orderedDays = [];
    for (let i = 0; i < 7; i++) {
      orderedDays.push(daysOfWeek[(todayIndex + i) % 7]);
    }
    orderedDays.push('No Due Date');
    return orderedDays;
  };

  //timer
  useEffect(() => {
    let interval = null;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      alert('Time is up! 🎉');
    }

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleInputChange = (e) => {
    setTimeInput(e.target.value);
  };

  const handleInputBlur = () => {
    const [minutes, seconds] = timeInput.split(':').map(str => parseInt(str, 10) || 0);
    setSecondsLeft(minutes * 60 + seconds);
    setIsEditing(false);
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsEditing(true);
    setTimeInput('00:00');
    setSecondsLeft(0);
  };

  return (
    <div className="flex px-5 flex-col relative w-screen h-screen items-center overflow-hidden justify-top dark:bg-neutral-900">
      <div className="App flex flex-col items-center mt-4 space-y-4">
        {!isSignedIn ? (
          <div className='flex flex-col w-screen h-screen items-center justify-center'>
            <h1 className="text-3xl font-bold dark:text-white"> Planner.io </h1>
            <h3 className="text-lg font-semibold italic dark:text-white mb-10"> Productivity Simplified </h3>
            <h3 className="text-base dark:text-white"> Get started: </h3>
            <button
              onClick={signIn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col mt-10 items-center">
            <img src={userProfile?.imageUrl} alt="Profile" className="rounded-full w-16 h-16 mb-2" />
            <h2 className="text-xl font-semibold dark:text-white">{userProfile?.name}</h2>
            <h3 className="text-sm text-gray-600 dark:text-slate-300">{userProfile?.email}</h3>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={signOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleMenu}
        className="rounded absolute text-stone-400 pb-1 bg-stone-50 hover:text-red-600 flex text-center px-1 text-5xl right-0 top-0 mt-2 mr-2"
      >
        &#x2699;
      </button>

      <div className="relative bottom-1 right-1 mt-4">
        {isSignedIn && (
          <button
            onClick={openAddTask}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-lg"
            aria-label="Add Task"
          >
            +
          </button>
        )}
      </div>

      <div className="flex flex-col items-center bg-green-100 mt-10 space-y-2 p-4 bg-gray-100 rounded-md shadow-md w-1/4">
      {isEditing ? (
        <input
          type="text"
          value={timeInput}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="00:00"
          className="text-5xl w-4/5 font-mono text-center rounded px-2 py-1"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="text-5xl font-semibold font-mono cursor-pointer"
        >
          {formatTime(secondsLeft)}
        </div>
      )}
      <div className="flex space-x-2">
        <button
          onClick={() => setIsRunning(true)}
          disabled={secondsLeft <= 0}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-full text-xs"
        >
          Start
        </button>
        <button
          onClick={() => setIsRunning(false)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full text-xs"
        >
          Pause
        </button>
        <button
          onClick={resetTimer}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-xs"
        >
          Reset
        </button>
      </div>
    </div>


      {isAddTaskOpen && (
        <div className="fixed top-0 left-0 w-1/3 h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleAddTaskSubmit} className="flex flex-col space-y-2">
              <label htmlFor="newTaskTitle" className="block text-gray-700 text-sm font-bold mb-1">
                Task: <span className='text-red-500'> *</span>
              </label>
              <input
                type="text"
                id="newTaskTitle"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700  hover:border hover:border-sm hover:border-red-500 leading-tight focus:outline-none focus:shadow-outline"
                value={newTaskTitle}
                onChange={handleNewTaskTitleChange}
              />


              <label htmlFor="newTaskDueDate" className="block text-gray-700 text-sm font-bold mb-1">
                Due Date (Optional):
              </label>
              <input
                type="date"
                id="newTaskDueDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newTaskDueDate}
                onChange={handleNewTaskDueDateChange}
              />

              <label htmlFor="newTaskTime" className="block text-gray-700 text-sm font-bold mb-1">
                Time (Optional):
              </label>
              <select
                id="newTaskTime"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newTaskTime}
                onChange={handleNewTaskTimeChange}
              >
                <option value="">Select Time</option>
                {Array.from({ length: 12 }, (_, index) => {
                  const hour = index + 1;
                  return (
                    <>
                      <option key={`hour-${hour}-AM`} value={`${hour}:00 AM`}>
                        {`${hour}:00 AM`}
                      </option>
                      <option key={`hour-${hour}-PM`} value={`${hour}:00 PM`}>
                        {`${hour}:00 PM`}
                      </option>
                    </>
                  );
                })}
              </select>


              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeAddTask}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 mt-4">
        {taskList && Object.keys(taskList).length > 0 ? (
          getOrderedDays().map(day => (
            taskList[day] && (
              <div key={day} className="bg-slate-200 rounded-md p-4 shadow-md">
                <h3 className="text-lg font-semibold mb-2">{day}</h3>
                {taskList[day].map((task, index) => (
                  <div key={index} style={{ backgroundColor: taskColors[task.id]?.color || '#ffffff' }} className="hover:bg-slate-100 p-2 rounded-lg shadow shadow-lg shadow-slate-500 my-2 mb-1 flex items-center justify-between flex-row">
                    <div className="flex flex-row">
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setShowCategoryColorPicker(true);
                        }}
                        className="bg-black flex justify-center items-center p-3 font-bold h-[1em] w-[1em] hover:bg-gray-400 text-white rounded-full text-lg focus:outline-none focus:shadow-outline"
                      >
                        +
                      </button>
                      {showCategoryColorPicker && selectedTaskId === task.id ? (
                        <div className="flex h-full w-full flex-col ml-3">
                          <label className="text-sm mb-1">
                            Category:
                            <input
                              type="text"
                              value={taskCategory[task.id] || ''}
                              onChange={(e) => handleCategoryChange(e, task.id)}
                              placeholder="Enter category"
                              className="mt-1 p-1 border rounded w-full"
                            />
                          </label>

                          <label className="text-sm mb-1 mt-2">
                            Color:
                            <input
                              type="color"
                              value={taskColors[task.id]?.color || '#ffffff'}
                              onChange={(e) => handleColorChange(e, task.id)}
                              className="mt-1 w-8 h-8 border rounded"
                            />
                          </label>

                          <button
                            onClick={() => handleSaveCategoryColor(task.id)}
                            className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-full text-xs"
                          >
                            Save Category/Color
                          </button>
                        </div>
                      ) : (
                        <div className="flex ml-3 flex-col w-full">
                          <p className="font-semibold">{task.title}</p>
                          {taskCategory[task.id] && (
                            <p className="italic text-black-500 text-sm">{taskCategory[task.id]}</p>
                          )}
                          
                        </div>
                      )}




                    </div>
                    {showCategoryColorPicker && selectedTaskId === task.id ? (
                        null
                    ) : (
                    <button
                      onClick={() => {
                        const taskListsResponse = gapi.client.tasks.tasklists.list();
                        taskListsResponse.then(response => {
                          const taskLists = response.result.items;
                          if (taskLists && taskLists.length > 0) {
                            markTaskAsComplete(taskLists[0].id, task.id, day);
                          } else {
                            alert('No task list found.');
                          }
                        });
                      }}
                      className="bg-green-400 hover:bg-green-600 text-black hover:text-white font-bold py-1 px-2 rounded-full text-xs focus:outline-none focus:shadow-outline"
                    >
                      Completed
                    </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ))
        ) : (
          <p className="text-center font-red-400" style={{display: 'none'}}> Congrats! You have completed your tasks! Go watch Bernese mountain dogs!</p>
        )}
      </div>



    </div>

  );
}

export default App;