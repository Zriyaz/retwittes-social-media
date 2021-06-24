import baseUrl from "./baseUrl";
import cookie from "js-cookie";
import axios from "axios";
import CatchError from "./catchErrors";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  // headers: { Authorization: cookie.get("token") },
});

Axios.interceptors.request.use((config) => {
  const token = cookie.get("token");
  config.headers.Authorization = token;

  return config;
});

export const submitNewPost = async (
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const res = await Axios.post("/", { text, location, picUrl });

    setPosts((prev) => [res.data, ...prev]);
    setNewPost({ text: "", location: "" });
    console.log("After Network Call", res);
  } catch (error) {
    const errorMsg = CatchError(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToaster) => {
  try {
    // here I've added /${postId}
    await Axios.delete(`/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowToaster(true);
  } catch (error) {
    alert(CatchError(error));
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
    } else if (!like) {
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (error) {
    alert(CatchError(error));
  }
};

export const postComment = async (postId, user, text, setComments, setText) => {
  try {
    const res = await Axios.post(`/comment/${postId}`, { text });
    const newComment = {
      _id: res.data,
      user,
      text,
      date: Date.now(),
    };

    setComments((prev) => [newComment, ...prev]);
    setText("");
  } catch (error) {
    alert(CatchError(error));
  }
};

export const deleteComment = async (postId, commentId, setComments) => {
  try {
    const res = await Axios.delete(`/${postId}/${commentId}`);

    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
  } catch (error) {
    alert(CatchError(error));
  }
};
