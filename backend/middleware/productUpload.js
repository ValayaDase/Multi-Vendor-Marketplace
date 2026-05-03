import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "./uploads/productImages",
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image uploads are allowed"));
};

export const productUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
  },
});
