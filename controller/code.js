const Code = require("../models/code");
const User = require("../models/user");
const { NodeVM } = require("vm2");
const path = require("path");
const fs = require("fs");

const codeSubmission = (req, res) => {
  const sub = new Code({
    title: req.body.title,
    code: req.body.code,
    userId: req.body.userId,
  });

  sub
    .save()
    .then((data) => {
      User.findById(req.body.userId)
        .then((user) => {
          res.json(data);
          user.addCodeItem(data._id);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

const fetchAllCode = (req, res) => {
  Code.find({ userID3: req.body.userID })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

const fetchById = (req, res) => {
  Code.findById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

function codeExecuter(req, res) {
  const restrictedPath = path.join(__dirname, "restricted-temp");
  const vm = new NodeVM({
    console: "inherit",
    sandbox: {
      res,
      cCode: req.body.code,
      process: "readonly",
      pathOf: path.join(__dirname, "restricted-temp"),
      fs: {
        ...fs,
        readFileSync: function (filePath, options) {
          const resolvedPath = path.resolve(restrictedDirectory, filePath);
          if (!resolvedPath.startsWith(restrictedDirectory)) {
            throw new Error("Access to file is restricted");
          }
          return fs.readFileSync(resolvedPath, options);
        },
      },
      path: path,
    },
    require: {
      external: true,
      builtin: ["child_process"],
      root: restrictedPath,
    },
  });

  const code = `
  const {spawn} = require("child_process");
  function executeWithFolderRestriction(
    command,
    folderPath,
    args,
    input,
    exefile,
    cfile
    ) {
      let stdoutData = '' ;
      return new Promise((resolve, reject) => {
          // const restrictedFolderTemp = path.join(folderPath, "restricted-temp");
          // fs.mkdirSync(restrictedFolderTemp, { recursive: true });
          
          const compileProcess = spawn(command, { timeout: 5000, shell: true });

          compileProcess.on('error', (error) => {
            reject('Error compiling C code: ' + error.message);
          });
          
          compileProcess.stdout.on('data', (data) => {
            stdoutData += data.toString()
            // Handle stdout data if needed
          });
          
          compileProcess.stderr.on('data', (data) => {
            stdoutData += data.toString()
            // Handle stderr data if needed
          });

          compileProcess.on('close', (code) => {
            if (code !== 0) {
              reject('Error compiling C code. Exit code: ' + code);
              return;
            }

            fs.unlink(cfile, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
                return;
              }
            });
            
            
            const executionProcess = spawn(exefile, { timeout: 5000, shell: true });

            executionProcess.on('error', (error) => {
              reject('Error executing C code: ' + error.message);
            });
            executionProcess.stdout.on('data', (data) => {
              // Handle stdout data if needed
              stdoutData += data.toString()
            });
            
            executionProcess.stderr.on('data', (data) => {
              // Handle stderr data if needed
              stdoutData += data.toString()
            });

            executionProcess.on('close', (code) => {
              if (code !== 0) {
                reject('Error executing C code. Exit code: ' + code);
                return;
              }
              fs.unlink(exefile+".exe", (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                  return;
                }
              });
              
              resolve({ std: stdoutData });
            });
          });
        });
    }
    
    const executeCCode = (cCode) => {
      return new Promise((resolve, reject) => {
        const cfile = path.join(pathOf, "program.c");
        const exefile = path.join(pathOf, "program")
        
        fs.writeFile(cfile, cCode, (error) => {
          if (error) {
          reject('Error writing C code file: '+error);
          return;
        }
        
        const compileCommand = 'gcc ' + cfile + ' -o '+ exefile;
        
        executeWithFolderRestriction(
          compileCommand,
          pathOf,
          [],
          "",
          exefile,
          cfile
        )
          .then((result) => {
            resolve({result});
          })
          .catch((err) => {
            reject(err);
          });

      });
    });
  };

  executeCCode(cCode)
    .then((output) => {
      res.json({ res: output });
      return {res:output}
    })
    .catch((error) => {
      res.status(500).send({ err: 'Execution error: ' + error });
      return {res:error}
    });

  `;
  vm.run(code);
}

module.exports = { codeSubmission, fetchAllCode, fetchById, codeExecuter };
