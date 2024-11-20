import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box, Chip } from '@mui/material';
import { Delete, Edit, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const customTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#6e06f2',
            },
            '&:hover fieldset': {
              borderColor: '#9c27b0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6e06f2',
              boxShadow: '0 0 8px #6e06f2',
            },
          },
          '& .MuiInputBase-input': {
            color: '#333',
          },
          '& .Mui-disabled .MuiInputBase-input': {
            color: '#aaa',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: '16px',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#6e06f2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

const InputTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInput-underline:before': { borderBottomColor: '#6e06f2', },
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#6e06f2', },
          '& .MuiInput-underline:after': { borderBottomColor: '#6e06f2', },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: 'black',
          fontWeight: '800',
          '&::placeholder': {
            color: 'balck',
          },
        },
      },
    },
  },
});

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "low" });
  const [errors, setErrors] = useState({ title: false, description: false });
  const [searchTerm, setSearchTerm] = useState("");
  const handleDateChange = (newDate) => { setSelectedDate(newDate); };
  const handleSearch = (event) => { setSearchTerm(event.target.value.toLowerCase()); };
  const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchTerm));

  const validateField = (field, value) => {
    if (value.trim().length < 5) { return `${field} must be min 5 characters`; }
    return "";
  };

  const validateForm = () => {
    const titleError = validateField("Title", newTask.title);
    const descriptionError = validateField("Description", newTask.description);

    setErrors({
      title: titleError,
      description: descriptionError,
    });

    return !titleError && !descriptionError;
  };

  const handleInputChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) { setErrors((prev) => ({ ...prev, [field]: validateField(field, value) })); }
  };

  const fetchTasks = async () => {
    try {
      const selectedDateString = selectedDate.toISOString().split("T")[0];
      const response = await fetch(`http://localhost:8000/getData.php?date=${selectedDateString}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error', error);
    }
  };
  useEffect(() => { fetchTasks(); }, [selectedDate]);

  const handleAddTask = (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    const taskWithId = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      id: Date.now(),
      completed: false,
      date: selectedDate.toISOString().split("T")[0],
    };

    fetch("http://localhost:8000/addTask.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskWithId),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setNewTask({ title: "", description: "", priority: "low" });
          setModalOpen(false);
          fetchTasks();
        } else {
          console.error("Error adding", data.message);
        }
      })
      .catch((error) => {
        console.error("Error adding", error);
      });
  };


  const handleDelete = async (taskId) => {
    try {
      const response = await fetch('http://localhost:8000/deleteTask.php', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: taskId }),
      });

      const data = await response.json();

      if (data.success) {
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        console.error("Failed to delete", data.message);
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };
  const handleComplete = async (id) => {
    try {
      const response = await fetch("http://localhost:8000/markComplete.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });


      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const result = await response.json();
      if (result.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
          )
        );
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };


  const getPriorityColor = (priority, isCompleted) => {
    if (isCompleted) {
      return 'default';
    }

    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRowColor = (isCompleted) => { return isCompleted ? '#f0f0f0' : 'transparent'; };
  const getStatusChipColor = (isCompleted) => { return isCompleted ? 'success' : 'error'; };
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const handleEdit = (task) => {
    setCurrentTask(task);
    setEditModalOpen(true);
  };

  const handleUpdateTask = async () => {
    try {
      const response = await fetch("http://localhost:8000/updateTask.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTask),
      });

      const data = await response.json();

      if (data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === currentTask.id ? currentTask : task
          )
        );
        setEditModalOpen(false);
        setCurrentTask(null);
      } else {
        console.error("Failed to update task:", data.message);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const exportCSV = () => {
    const tasksData = tasks.map((task) => ({
      Title: task.title,
      Description: task.description,
      Priority: task.priority,
      Status: task.isCompleted ? 'Completed' : 'Not Completed',
      Date: selectedDate.toDateString(),
    }));

    const csvFileformat = [
      Object.keys(tasksData[0]).join(','),
      ...tasksData.map((task) => Object.values(task).join(','))
    ];

    const csvString = csvFileformat.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${selectedDate.toISOString().split('T')[0]}.csv`;
    link.click();
  };




  return (
    <>
      <ThemeProvider theme={customTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',  
            justifyContent: 'space-between',
            gap: 2,  
            '@media (max-width: 600px)': {
              flexDirection: 'column',   
            },
          }}>
            <ThemeProvider theme={InputTheme}>
              <TextField
                placeholder="Search Tasks by title .."
                className="mb-4"
                type="search"
                variant="standard"
                value={searchTerm}
                onChange={handleSearch}
              />
            </ThemeProvider>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MobileDatePicker
                  displayStaticWrapperAs="mobile"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{ textField: { size: 'small' } }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </motion.div>
              <IconButton aria-label="add" sx={{ color: '#6e06f2' }} onClick={() => setModalOpen(true)}>
                <AddCircleIcon sx={{ fontSize: 29 }} />
              </IconButton>
              <IconButton aria-label="download" sx={{ color: '#6e06f2' }} onClick={() => exportCSV()}>
                <FileDownloadIcon sx={{ fontSize: 29 }} />

              </IconButton>
            </Box>
          </Box>
          <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
            <form onSubmit={handleAddTask}>
              <DialogTitle>Add Task</DialogTitle>
              <DialogContent>
                <Typography>Date: {selectedDate.toDateString()}</Typography>
                <TextField
                  margin="dense"
                  label="Title"
                  fullWidth
                  value={newTask.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                />
                <TextField
                  margin="dense"
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                />
                <TextField
                  margin="dense"
                  label="Priority"
                  fullWidth
                  select
                  value={newTask.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setModalOpen(false)} color="secondary">
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Add
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </LocalizationProvider>
      </ThemeProvider>
      <TableContainer component={Paper} sx={{ marginTop: 10 }}>
        <Table sx={{ minWidth: 650 }} aria-label="task table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#FAFAF9' }}>
              <TableCell sx={{ color: '#6e06f2', fontWeight: 'bold' }}>Task Title</TableCell>
              <TableCell sx={{ color: '#6e06f2', fontWeight: 'bold' }}>Task Description</TableCell>
              <TableCell sx={{ color: '#6e06f2', fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ color: '#6e06f2', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#6e06f2', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks && tasks.length > 0 ? (
              filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ backgroundColor: getRowColor(task.isCompleted) }}
                  >
                    <TableCell component="th" scope="row">{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Chip label={task.priority} color={getPriorityColor(task.priority, task.isCompleted)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={task.isCompleted ? 'Completed' : 'Not Completed'} color={getStatusChipColor(task.isCompleted)} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: '#6e06f2' }} onClick={() => handleEdit(task)}>
                            <Edit />
                          </IconButton>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: '#6e06f2' }} onClick={() => handleDelete(task.id)}>
                            <Delete />
                          </IconButton>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: task.isCompleted ? 'gray' : '#6e06f2' }} onClick={() => handleComplete(task.id)}>
                            <CheckCircle />
                          </IconButton>
                        </motion.div>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                tasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ backgroundColor: getRowColor(task.isCompleted) }}
                  >
                    <TableCell component="th" scope="row">{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Chip label={task.priority} color={getPriorityColor(task.priority, task.isCompleted)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={task.isCompleted ? 'Completed' : 'Not Completed'} color={getStatusChipColor(task.isCompleted)} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: '#6e06f2' }} onClick={() => handleEdit(task)}>
                            <Edit />
                          </IconButton>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: '#6e06f2' }} onClick={() => handleDelete(task.id)}>
                            <Delete />
                          </IconButton>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: task.isCompleted ? 'gray' : '#6e06f2' }} onClick={() => handleComplete(task.id)}>
                            <CheckCircle />
                          </IconButton>
                        </motion.div>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={5}>No tasks available</td>
              </tr>
            )}
          </TableBody>


        </Table>
      </TableContainer>
      <ThemeProvider theme={customTheme}>
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              value={currentTask?.title || ""}
              onChange={(e) =>
                setCurrentTask((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={currentTask?.description || ""}
              onChange={(e) =>
                setCurrentTask((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Priority"
              fullWidth
              select
              value={currentTask?.priority || "low"}
              onChange={(e) =>
                setCurrentTask((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>

    </>
  );
};

export default TaskList;
