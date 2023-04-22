const mysql = require('mysql')
const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const cors = require('cors')
const csvtojson = require('csvtojson')
const port =  process.env.PORT || 3002
const md5 = require('md5')
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// const upload = multer({ dest: 'uploads/' });
// const upload = multer({ dest: 'uploads/', limits: { fileSize: 1000000 }, fileFilter: fileFilter }).single('file');



app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const conn = mysql.createConnection({
    host : 'localhost',
    user: 'root', 
    password : '', 
    database : 'test_app'
})

//EVERYTHING ABOUT SUPERADMIN : START
// GET : http://localhost:3002/SuperAdmin
app.get('/SuperAdmin', (req, res) => {
    conn.query('SELECT * FROM super_admin', (err, result) => {
        if(err){
            throw err;
        }else{
            res.send(result)
        }
    })
})

app.post('/SuperAdminCreation', (req, res) => {

    // POST : http://localhost:3002/SuperAdminCreation
    // {
    //     "fullname":"Gerald Mico Facistol", 
    //     "email":"tricore012@gmail.com", 
    //     "password": "micotothemoon"
    // }

    const fullname = req.body.fullname 
    const email = req.body.email 
    const password = req.body.password
    const rpass = crypto.createHash('md5').update(password).digest('hex');
    // getting date
    const today = new Date();
    const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
    const date_created = today.toLocaleDateString('en-US', options).split('/').reverse().join('-');
    console.log(date_created)

    // Check if email already exists
    conn.query("SELECT * FROM super_admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length > 0) {
            res.send('Email already exists in the database');
        } else {
            // Email does not exist, insert new record
            conn.query("INSERT INTO super_admin (fullname, email, password, date_created) VALUES (?,?,?,?)", [fullname, email, rpass, date_created], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Super admin has been inserted successfully in the database ' + fullname);
                }
            });
        }
    });
});


app.delete('/SuperAdminDeletion', (req, res) => {

    // DELETE : http://localhost:3002/SuperAdminDeletion
    // {
    //     "email":"tricore012@gmail.com"
    // }     

    const email = req.body.email 
    conn.query("SELECT * FROM super_admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, delete record
            conn.query("DELETE FROM super_admin WHERE email = ?", [email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Super admin has been deleted successfully from the database');
                }
            });
        }
    });
});

app.put('/SuperAdminUpdate', (req, res) => {
    
    // PUT : http://localhost:3002/SuperAdminUpdate
    // {
    //     "fullname":"Gerald Mico", 
    //     "email":"tricore012@gmail.com", 
    //     "password": "micotothemooonandback"
    // }


    const fullname = req.body.fullname 
    const email = req.body.email 
    const password = req.body.password
    const rpass = crypto.createHash('md5').update(password).digest('hex');

    conn.query("SELECT * FROM super_admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE super_admin SET fullname = ?, password = ?  WHERE email = ?", [fullname, rpass, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Super admin has been updated successfully in the database');
                }
            });
        }
    });
});

//EVERYTHING ABOUT SUPERADMIN : END

//EVERYTHING ABOUT SIDEADMIN : START 

app.get('/SideAdmin', (req, res) => {
    // GET : http://localhost:3002/SideAdmin

    conn.query('SELECT * FROM admin', (err, result) => {
        if(err){
            throw err; 
        }else{
            res.send(result);
        }
    })
})

app.post('/SideAdminCreation', (req, res) => {

    // POST : http://localhost:3002/SideAdminCreation
    // {
    //     "fullname":"Gerald Mico Facistol", 
    //     "email":"tricore012@gmail.com",
    //     "contact": "09166513189",  
    //     "password": "micotothemoon",
    //     "department":"I.T DEPARTMENT"    
    // }

    const fullname = req.body.fullname;
    const email = req.body.email;
    const contact = req.body.contact;  
    const password = req.body.password;
    const rpass = crypto.createHash('md5').update(password).digest('hex');
    const department = req.body.department;
    const status = 'UN-APPROVED';

    // getting date
    const today = new Date();
    const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
    const date_created = today.toLocaleDateString('en-US', options).split('/').reverse().join('-');

    try {
        // Check if email already exists
        conn.query("SELECT * FROM admin WHERE email = ?", [email], (err, rows) => {
            if (err) {
                throw err;
            } else if (rows.length > 0) {
                res.send('Email already exists in the database');
            } else {
                // Email does not exist, insert new record
                conn.query("INSERT INTO admin (fullname, email, contact, password, department, status, date_created) VALUES (?,?,?,?,?,?,?)", [fullname, email, contact, rpass, department, status, date_created], (err, result) => {
                    if (err) {
                        throw err;
                    } else {
                        res.send('Admin has been inserted successfully in the database ' + fullname);
                    }
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('An error occurred while processing your request.');
    }
});


app.delete('/SideAdminDelete', (req, res) => {

     // DELETE : http://localhost:3002/SideAdminDelete
    // {
    //     "email":"tricore012@gmail.com"
    // }     

    const email = req.body.email 
    conn.query("SELECT * FROM admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, delete record
            conn.query("DELETE FROM admin WHERE email = ?", [email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Admin has been deleted successfully from the database');
                }
            });
        }
    });
})

app.put('/SideAdminUpdate', (req, res) => {
    
    // PUT : http://localhost:3002/SideAdminUpdate
    // {
    //     "fullname":"Gerald Mico Facistol", 
    //     "email":"tricore012@gmail.com",
    //     "contact": "09166513189",  
    //     "password": "micotothemoon",
    //     "department":"I.T DEPARTMENT"    
    // }

    const fullname = req.body.fullname;
    const email = req.body.email;
    const contact = req.body.contact;  
    const password = req.body.password;
    const rpass = crypto.createHash('md5').update(password).digest('hex');
    const department = req.body.department;

    conn.query("SELECT * FROM admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE admin SET fullname = ?, contact = ?, password = ?, department = ?  WHERE email = ?", [fullname, contact, rpass, department, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Admin has been updated successfully in the database');
                }
            });
        }
    });
});


app.put('/SideAdminApproval', (req, res) => {

    // PUT : http://localhost:3002/SideAdminApproval
    // {
    //     "email":"tricore012@gmail.com"    
    // }
     
    const email = req.body.email;
    const status = 'APPROVED'

    conn.query("SELECT * FROM admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE admin SET status = ?  WHERE email = ?", [status, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Admin has been Approved successfully in the database');
                }
            });
        }
    });
})

app.put('/SideAdminDisApproved', (req, res) => {

    // PUT : http://localhost:3002/SideAdminDisApproved
    // {
    //     "email":"tricore012@gmail.com"    
    // }
     
    const email = req.body.email;
    const status = 'UN-APPROVED'

    conn.query("SELECT * FROM admin WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE admin SET status = ?  WHERE email = ?", [status, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Admin has been UN-Approved successfully in the database');
                }
            });
        }
    });

})
//EVERYTHING ABOUT SIDEADMIN : END

//EVERYTHING ABOUT FACULTY : START 

app.get('/Faculty', (req, res) => {
    // GET : http://localhost:3002/SideAdmin

    conn.query('SELECT * FROM faculty', (err, result) => {
        if(err){
            throw err; 
        }else{
            res.send(result);
        }
    })
})

app.post('/FacultyCreation', (req, res) => {

    // POST : http://localhost:3002/FacultyCreation
    // {
    //     "fullname":"Gerald Mico Facistol", 
    //     "email":"tricore012@gmail.com",
    //     "contact": "09166513189",  
    //     "password": "micotothemoon",
    //     "department":"I.T DEPARTMENT"    
    // }

    const fullname = req.body.fullname;
    const email = req.body.email;
    const contact = req.body.contact;  
    const password = req.body.password;
    const rpass = crypto.createHash('md5').update(password).digest('hex');
    const department = req.body.department;
    const status = 'UN-APPROVED';

    // getting date
    const today = new Date();
    const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
    const date_created = today.toLocaleDateString('en-US', options).split('/').reverse().join('-');

    try {
        // Check if email already exists
        conn.query("SELECT * FROM faculty WHERE email = ?", [email], (err, rows) => {
            if (err) {
                throw err;
            } else if (rows.length > 0) {
                res.send('Email already exists in the database');
            } else {
                // Email does not exist, insert new record
                conn.query("INSERT INTO faculty (fullname, email, contact, password, department, status, date_created) VALUES (?,?,?,?,?,?,?)", [fullname, email, contact, rpass, department, status, date_created], (err, result) => {
                    if (err) {
                        throw err;
                    } else {
                        res.send('faculty has been inserted successfully in the database ' + fullname);
                    }
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('An error occurred while processing your request.');
    }
});


app.delete('/FacultyDelete', (req, res) => {

     // DELETE : http://localhost:3002/FacultyDelete
    // {
    //     "email":"tricore012@gmail.com"
    // }     

    const email = req.body.email 
    conn.query("SELECT * FROM faculty WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, delete record
            conn.query("DELETE FROM admin WHERE email = ?", [email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Admin has been deleted successfully from the database');
                }
            });
        }
    });
})

app.put('/FacultyUpdate', (req, res) => {
    
    // PUT : http://localhost:3002/FacultyUpdate
    // {
    //     "fullname":"Gerald Mico Facistol", 
    //     "email":"tricore012@gmail.com",
    //     "contact": "09166513189",  
    //     "password": "micotothemoon",
    //     "department":"I.T DEPARTMENT"    
    // }

    const fullname = req.body.fullname;
    const email = req.body.email;
    const contact = req.body.contact;  
    const password = req.body.password;
    const rpass = crypto.createHash('md5').update(password).digest('hex');
    const department = req.body.department;

    conn.query("SELECT * FROM faculty WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE faculty SET fullname = ?, contact = ?, password = ?, department = ?  WHERE email = ?", [fullname, contact, rpass, department, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Faculty has been updated successfully in the database');
                }
            });
        }
    });
});


app.put('/FacultyApproval', (req, res) => {

    // PUT : http://localhost:3002/FacultyApproval
    // {
    //     "email":"tricore012@gmail.com"    
    // }
     
    const email = req.body.email;
    const status = 'APPROVED'

    conn.query("SELECT * FROM faculty WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE faculty SET status = ?  WHERE email = ?", [status, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Faculty has been Approved successfully in the database');
                }
            });
        }
    });
})

app.put('/FacultyDisApproved', (req, res) => {

    // PUT : http://localhost:3002/FacultyDisApproved
    // {
    //     "email":"tricore012@gmail.com"    
    // }
     
    const email = req.body.email;
    const status = 'UN-APPROVED'

    conn.query("SELECT * FROM faculty WHERE email = ?", [email], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length === 0) {
            res.send('Email does not exist in the database');
        } else {
            // Email exists, update record
            conn.query("UPDATE faculty SET status = ?  WHERE email = ?", [status, email], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Faculty has been UN-Approved successfully in the database');
                }
            });
        }
    });

})
//EVERYTHING ABOUT FACULTY : END


//EVERYTHING ABOUT PROGRAM : START

app.get('/Program', (req, res) => {

    // GET :  http://localhost:3002/Program

    conn.query('SELECT * FROM program_management', (err, result) => {
        if(err){
            throw err;
        }else{
            res.send(result)
        }
    })
})

app.post('/UploadProgram', (req, res) => {

    // POST : http://localhost:3002/UploadProgram
    // {
    //     "program_title":"WHAT DOESNT KILL YOU MAKES YOU STRONGER",
    //     "start":"2023-04-22 14:30:00",
    //     "end":"2023-04-22 14:30:00",
    //     "place":"BULACAN",
    //     "program_details":"program_details",
    //     "program_lead":"program_lead",
    //     "program_member":"program_member"   
    // }

    const program_title = req.body.program_title; 
    const start = req.body.start; 
    const end = req.body.start; 
    const place = req.body.place; 
    const program_details = req.body.program_details; 
    const program_lead = req.body.program_lead; 
    const program_member = req.body.program_member; 
    
    conn.query("INSERT INTO program_management (program_title, start, end, place, program_details, program_lead, program_member) VALUES (?,?,?,?,?,?,?)", [program_title, start, end, place, program_details, program_lead, program_member], (err, result) => {
        if(err){
            throw err
        }else{
            res.send('Added Program Succesfully ' + program_title);
        }
    })
})

app.put('/UpdateProgram', (req, res) => {

    // PUT : http://localhost:3002/UpdateProgram
    // {
    //     "pid":1,
    //     "program_title":"WHAT DOESNT KILL YOU MAKES YOU STRONGER PART 2",
    //     "start":"2023-04-22 14:30:11",
    //     "end":"2023-04-22 14:30:12",
    //     "place":"BULACAN PH",
    //     "program_details":"program_details 1",
    //     "program_lead":"program_lead 1",
    //     "program_member":"program_member 1"   
    // }

    const pid = req.body.pid; 
    const program_title = req.body.program_title; 
    const start = req.body.start; 
    const end = req.body.start; 
    const place = req.body.place; 
    const program_details = req.body.program_details; 
    const program_lead = req.body.program_lead; 
    const program_member = req.body.program_member; 
    const status = 'IN-PROGRESS'

    conn.query("SELECT * FROM program_management WHERE pid = ?", [pid], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length > 0) {
            // pid exists, update record
            conn.query("UPDATE program_management SET program_title = ?, start = ?, end = ?, place = ?, program_details = ?, program_lead = ?, program_member = ? WHERE pid = ?", [program_title, start, end, place, program_details, program_lead, program_member, pid], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.send('Updated Program Successfully ' + program_title);
                }
            });
        } else {
            // pid does not exist, insert new record
            conn.query("INSERT INTO program_management (program_title, start, end, place, program_details, program_lead, program_member, status) VALUES (?,?,?,?,?,?,?,?)", [program_title, start, end, place, program_details, program_lead, program_member, status], (err, result) => {
                if(err){
                    throw err;
                }else{
                    res.send('Added Program Successfully ' + program_title);
                }
            });
        }
    });
})

app.delete('/DeleteProgram', (req, res) => {

    // DELETE : http://localhost:3002/DeleteProgram
   // {
   //     "pid": 1
   // }     

   const pid = req.body.pid;
   conn.query("SELECT * FROM program_management WHERE pid = ?", [pid], (err, rows) => {
       if (err) {
           throw err;
       } else if (rows.length > 0) {
            
        conn.query("DELETE FROM program_management WHERE pid = ?", [pid], (err, result) => {
            if (err) {
                throw err;
            } else {
                res.send('Program has been deleted successfully from the database');
            }
        });
        
       } else {
           // Email exists, delete record
           res.send('Program does not exist in the database');   
       }
   });
})


app.put('/CompleteProgram', (req, res) => {

    // POST : http://localhost:3002/CompleteProgram
   // {
   //     "pid": 1
   // }     

   const pid = req.body.pid;
   conn.query("SELECT * FROM program_management WHERE pid = ?", [pid], (err, rows) => {
       if (err) {
           throw err;
       } else if (rows.length > 0) {
        const status = 'COMPLETE'
        conn.query("UPDATE program_management SET status = ? WHERE pid = ?", [status,pid], (err, result) => {
            if (err) {
                throw err;
            } else {
                res.send('Program has been completed successfully from the database');
            }
        });
        
       } else {
           // Email exists, delete record
           res.send('Program does not exist in the database');   
       }
   });
})

app.put('/InCompleteProgram', (req, res) => {

    // POST : http://localhost:3002/InCompleteProgram
   // {
   //     "pid": 1
   // }     

   const pid = req.body.pid;
   conn.query("SELECT * FROM program_management WHERE pid = ?", [pid], (err, rows) => {
       if (err) {
           throw err;
       } else if (rows.length > 0) {
        const status = 'IN-PROGRESS'
        conn.query("UPDATE program_management SET status = ? WHERE pid = ?", [status,pid], (err, result) => {
            if (err) {
                throw err;
            } else {
                res.send('Program has been set to IN-PROGRESS successfully from the database');
            }
        });
        
       } else {
           // Email exists, delete record
           res.send('Program does not exist in the database');   
       }
   });
})


app.post('/AssignProgramFaculty', (req, res) => {

    // POST : http://localhost:3002/AssignProgramFaculty
    // {
    //     "fid" : 2, 
    //     "pid" : 3
    // }

    const fid = req.body.fid; 
    const pid = req.body.pid; 

    conn.query("SELECT * FROM program_management WHERE pid = ?", [pid], (err, rows) => {
        if (err) {
            throw err;
        } else if (rows.length > 0) {
            conn.query("SELECT * FROM faculty WHERE fid = ?", [fid], (err, frows) => {
                if (err) {
                    throw err;
                } else if (frows.length > 0) {
                    conn.query("SELECT * FROM assign_program_faculty WHERE pid = ?", [pid], (err, arows) => {
                        if (err) {
                            throw err;
                        } else if (arows.length > 0) {
                            // pid already exists in assign_program_faculty table
                            const existingFid = arows[0].fid;
                            if (existingFid !== fid) {
                                // pid already exists with different fid, do not insert new record
                                res.send('pid already exists with different fid in assign_program_faculty table');
                            } else {
                                // pid and fid already exist in assign_program_faculty table, no need to insert new record
                                res.send('pid and fid already exist in assign_program_faculty table');
                            }
                        } else {
                            // insert new record in assign_program_faculty table
                            conn.query("INSERT INTO assign_program_faculty (fid, pid) VALUES (?, ?)", [fid, pid], (err, result) => {
                                if (err) {
                                    throw err;
                                } else {
                                    res.send(result);
                                }
                            });
                        }
                    });
                } else {
                    res.send('faculty does not exist in the database');
                }
            });
        } else {
            res.send('Program does not exist in the database');
        }
    });
});

app.post('/UploadProgramParticipants', (req, res) => {
    const uploading_participants = req.body.uploading_participants
    const csvFilePath = 'booking.csv';
    csv()
        .fromFile(csvFilePath)
        .then((data) => {
            // loop through the data
            data.forEach((row) => {
                const pid = row.pid;
                const fullname = row.fullname;
                const email = row.email;
                const contact = row.contact;

                // check if the pid already exists in the program_management table
                conn.query("SELECT * FROM program_management WHERE pid = ?", [pid], (err, rows) => {
                    if (err) {
                        throw err;
                    } else if (rows.length > 0) {
                        console.log(`pid ${pid} already exists in program_management table, skipping...`);
                    } else {
                        // insert new record into the program_management table
                        conn.query("INSERT INTO program_participant (pid, fullname, email, contact) VALUES (?, ?, ?, ?)", [pid, fullname, email, contact], (err, result) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log(`Inserted new record with pid ${pid} into program_management table`);
                            }
                        });
                    }
                });
            });
        })
        .catch((err) => {
            console.log(err);
        });
});


//EVERYTHING ABOUT PROGRAM : START

// UPLOADING CERTIFICATE : START


// UPLOADING CERTIFICATE : START


app.listen(port, ()=> {
    console.log('App is currently listening to the PORT ' + port)
})