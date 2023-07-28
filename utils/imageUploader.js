const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); //here 2nd arguement is decides whether to store it not if its true then it allows to store in destination file or else not //first arguement is error
  } else {
    cb(new Error("unsupported file"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, //10mb limit
  },
  fileFilter: fileFilter,
});

module.exports = {
  upload: upload,
};
