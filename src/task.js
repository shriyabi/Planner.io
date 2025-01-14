export const taskList = [];

export class Task {
  constructor(day, cat, time, am, task) {
    this.day = day;
    this.cat = cat;
    this.time = time;
    this.am = am;
    this.task = task;
    this.completed = false;
  }
}

function taskFind(day, cat, time, am, task) {
  for (const currTask of taskList) {
    if (
      currTask.day === day &&
      currTask.cat === cat &&
      currTask.time === time &&
      currTask.am === am &&
      currTask.task === task
    ) {
      return currTask;
    }
  }
  return null;
}

export function addTask(day, cat, time, am, task) {
  if (!taskFind(day, cat, time, am, task)) {
    const newTask = new Task(day, cat, time, am, task);
    taskList.push(newTask);
    console.log("Task Added:", newTask);
    return true;
  }
  console.log("Task Already Exists");
  return false;
}

export function completeTask(day, cat, time, am, task) {
  const taskToComplete = taskFind(day, cat, time, am, task);
  if (taskToComplete) {
    taskToComplete.completed = true;
    console.log("Task Completed:", taskToComplete);
    return true;
  }
  console.log("Task Not Found");
  return false;
}


/*const addTask = (day, cat, time, am, task, completed) => {
    if (!day || !cat || !time || !am || !task) {
      setError("All fields are required.");
      return;
    }

    const combinedTime = `${time} ${am}`;
    const newTask = {
      task,
      category: cat,
      time: combinedTime,
      completed: false,
    };
    setTaskList((prev) => ( if(task.find({
      ...prev,
      [day]: prev[day] ? [...prev[day], newTask] : [newTask],
    }));

    setError(""); // Clear error if task is successfully added
    console.log("you dont luv me");
  }; */