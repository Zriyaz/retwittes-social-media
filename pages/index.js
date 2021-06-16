import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import CreatePost from "../components/post/CreatePost";
import baseUrl from "../utils/baseUrl";
import CardPost from "../components/post/CardPost";
import { Segment } from "semantic-ui-react";
import { parseCookies } from "nookies";
import { NoPosts } from "../components/Layout/NoData";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import InfiniteScroll from "react-infinite-scroll-component";
import getUserInfo from "../utils/getUserInfo";
import newMessageSound from "../utils/newMsgSound";
import MessageNotificationModal from "../components/Home/MessageNotificationModal";
import NotificationPortal from "../components/Home/NotificationPortal";
import cookie from "js-cookie";

import {
  PlaceHolderPosts,
  EndMessage,
} from "../components/Layout/PlaceHolderGroup";
const Index = ({ user, postsData, errorLoading }) => {
  const [posts, setPosts] = useState(postsData);
  const [showToaster, setShowToaster] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);

  const [newMessageReceived, setMewMessageReceived] = useState(null);
  const [newMessageModel, setNewMessageModel] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [notificationPopup, showNotificationPopup] = useState(false);

  const socket = useRef();

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit("join", { userId: user._id });
      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
        if (user.newMessagePopup) {
          setMewMessageReceived({
            ...newMsg,
            senderName: name,
            senderProfilePic: profilePicUrl,
          });
          setNewMessageModel(true);
        }
        newMessageSound(name);
      });
    }

    document.title = `Welcome, ${user.name.split(" ")[0]}`;
    return () => {
      if (socket.current) {
        socket.current.emit("disconnect");
        socket.current.off();
      }
    };
  }, []);

  useEffect(() => {
    showToaster &&
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
  }, [showToaster]);

  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: cookie.get("token") },
        params: { pageNumber },
      });

      if (res.data.length === 0) setHasMore(false);

      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      console.log("Error in Infinite Scroll", error);
      alert("Error fetching Posts", error);
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on(
        "newNotificationReceived",
        ({ name, profilePicUrl, username, postId }) => {
          setNewNotification({ name, profilePicUrl, username, postId });
          showNotificationPopup(true);
        }
      );
    }
  }, []);
  return (
    <>
      {notificationPopup && newNotification !== null && (
        <NotificationPortal
          newNotification={newNotification}
          notificationPopup={notificationPopup}
          showNotificationPopup={showNotificationPopup}
        />
      )}
      {showToaster && <PostDeleteToastr />}
      {newMessageModel && newMessageReceived !== null && (
        <MessageNotificationModal
          socket={socket}
          showNewMessageModal={setNewMessageModel}
          newMessageModal={newMessageModel}
          newMessageReceived={newMessageReceived}
          user={user}
        />
      )}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length === 0 || errorLoading ? (
          <NoPosts />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDataOnScroll}
            loader={<PlaceHolderPosts />}
            endMessage={<EndMessage />}
            dataLength={posts.length}
          >
            {posts.map((post) => (
              <CardPost
                socket={socket}
                key={post._id}
                post={post}
                user={user}
                setPosts={setPosts}
                setShowToaster={setShowToaster}
              />
            ))}
          </InfiniteScroll>
        )}
      </Segment>
    </>
  );
};

Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: {
        Authorization: token,
      },
      params: { pageNumber: 1 },
    });
    return { postsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Index;
