import axios from "axios";

export const uploadPic = async (media) => {
  try {
    const form = new FormData();
    form.append("file", media);
    form.append("upload_preset", "sfravu6b");
    form.append("cloud_name", "dijixbbt2");

    const res = await axios.post(process.env.CLOUDINARY_URL, form);
    return res.data.url;
  } catch (error) {
    return;
  }
};
