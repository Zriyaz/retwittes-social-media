import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import { Grid } from "semantic-ui-react";
import { NoProfilePosts, NoProfile } from "../components/Layout/NoData";
import CardPost from "../components/post/CardPost";
import cookie from "js-cookie";
import { PlaceHolderPosts } from "../components/Layout/PlaceHolderGroup";
import ProfileMenuTabs from "../components/profile/ProfileMenuTabs";
import ProfileHeader from "../components/profile/ProfileHeader";
import Followers from "../components/profile/Followers";
import Following from "../components/profile/Following";
import UpdateProfile from "../components/profile/UpdateProfile";
import Settings from "../components/profile/Settings";
import { PostDeleteToastr } from "../components/Layout/Toastr";

const ProfilePage = ({
  errorLoading,
  profile,
  followersLength,
  followingLength,
  user,
  userFollowStatus,
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToastr, setShowToastr] = useState(false);

  const [activeItem, setActiveItem] = useState("profile");
  const handleItemClick = (clickedTab) => setActiveItem(clickedTab);
  const socket = useRef();
  const [loggedUserFollowStats, setUserFollowStats] =
    useState(userFollowStatus);
  const ownAccount = profile.user._id === user._id;
  const router = useRouter();
  if (errorLoading) return <div>Profile Not Found</div>;

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        const { username } = router.query;
        const token = cookie.get("token");
        const res = await axios.get(
          `${baseUrl}/api/profile/posts/${username}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setPosts(res.data);
      } catch (err) {
        alert("Error Loading Post");
      }
      setLoading(false);
    };
    getPosts();
  }, [router.query.username]);

  useEffect(() => {
    showToastr &&
      setTimeout(() => {
        setShowToastr(false);
      }, 3000);
  }, [showToastr]);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit("join", { userId: user._id });
    }

    return () => {
      if (socket.current) {
        socket.current.emit("disconnect");
        socket.current.off();
      }
    };
  }, []);

  return (
    <>
      {showToastr && <PostDeleteToastr />}
      <Grid stackable>
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs
              activeItem={activeItem}
              handleItemClick={handleItemClick}
              followingLength={followingLength}
              followersLength={followersLength}
              loggedUserFollowStats={loggedUserFollowStats}
              ownAccount={ownAccount}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {activeItem === "profile" && (
              <>
                <ProfileHeader
                  profile={profile}
                  ownAccount={ownAccount}
                  loggedUserFollowStats={loggedUserFollowStats}
                  setUserFollowStats={setUserFollowStats}
                />
                {loading ? (
                  <PlaceHolderPosts />
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <CardPost
                      key={post._id}
                      socket={socket}
                      post={post}
                      user={user}
                      setPosts={setPosts}
                      setShowToastr={setShowToastr}
                    />
                  ))
                ) : (
                  <NoProfilePosts />
                )}
              </>
            )}
            {activeItem === "followers" && (
              <Followers
                user={user}
                loggedUserFollowStats={loggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}
            {activeItem === "following" && (
              <Following
                user={user}
                loggedUserFollowStats={loggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}
            {activeItem === "updateProfile" && (
              <UpdateProfile Profile={profile} />
            )}
            {activeItem === "settings" && (
              <Settings newMessagePopup={user.newMessagePopup} />
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

ProfilePage.getInitialProps = async (ctx) => {
  try {
    const { username } = ctx.query;
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: { Authorization: token },
    });

    const { profile, followersLength, followingLength } = res.data;

    return { profile, followersLength, followingLength };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default ProfilePage;
