import { useState, useEffect, useRef } from "react";
import {
  Form,
  Message,
  Button,
  Segment,
  TextArea,
  Divider,
} from "semantic-ui-react";
import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { registerUser } from "../utils/authUser";
import { uploadPic } from "../utils/uploadPicToCloudinary";

import {
  HeaderMessage,
  FooterMessage,
} from "../components/common/WelcomeMessage";
import CommonInputs from "../components/common/CommonInputs";
import ImageDropDiv from "../components/common/ImageDropDiv";
const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

let cancel;

const signup = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    facebook: "",
    youtube: "",
    instagram: "",
    twitter: "",
  });

  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [higlited, setHighlited] = useState(false);
  const inputRef = useRef();

  const [username, setUsername] = useState("");
  const [userNameLoading, setUserNameLoading] = useState(false);
  const [userNameAvailable, setUserNameAvailable] = useState(false);

  const { name, email, password, bio } = user;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const isUser = Object.values({ name, email, password, bio }).every((item) =>
      Boolean(item)
    );
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  const checkUserName = async () => {
    setUserNameLoading(true);
    try {
      cancel && cancel();

      const CancelToken = axios.CancelToken;
      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });
      if (errorMessage !== null) setErrorMessage(null);
      if (res.data === "Available") {
        setUserNameAvailable(true);
        setUser((prev) => ({ ...prev, username }));
        console.log("Append User", user);
      }
    } catch (error) {
      setErrorMessage("Username Not Available!");
      setUserNameAvailable(false);
    }
    setUserNameLoading(false);
  };

  useEffect(() => {
    username === "" ? setUserNameAvailable(false) : checkUserName();
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    let profilePicUrl;
    if (media !== null) {
      profilePicUrl = await uploadPic(media);
    }
    if (media !== null && !profilePicUrl) {
      formLoading(false);
      return setErrorMessage("Error Uploading Image");
    }

    await registerUser(user, profilePicUrl, setErrorMessage, setFormLoading);
  };

  console.log("Username", username);
  console.log("User", user);
  return (
    <>
      <HeaderMessage />
      <Form
        loading={formLoading}
        error={errorMessage != null}
        onSubmit={handleSubmit}
      >
        <Message
          error
          header="Oops!"
          content={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
        <Segment>
          <ImageDropDiv
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
            setMedia={setMedia}
            inputRef={inputRef}
            higlited={higlited}
            setHighlited={setHighlited}
            handleChange={handleChange}
          />
          <Form.Input
            label="Name"
            placeholder="Name"
            name="name"
            value={name}
            onChange={handleChange}
            required
            fluid
            icon="user"
            iconPosition="left"
          />
          <Form.Input
            label="Email"
            placeholder="Email"
            name="email"
            value={email}
            autoComplete="off"
            onChange={handleChange}
            fluid
            icon="envelope"
            iconPosition="left"
            type="email"
          />
          <Form.Input
            label="Password"
            placeholder="Password"
            name="password"
            value={password}
            autoComplete="off"
            onChange={handleChange}
            required
            fluid
            icon={{
              name: "eye",
              circular: true,
              link: true,
              onClick: () => setShowPassword(!showPassword),
            }}
            required
            iconPosition="left"
            type={showPassword ? "text" : "password"}
          />
          <Form.Input
            loading={userNameLoading}
            error={!userNameAvailable}
            label="User Name"
            placeholder="User Name"
            name="userName"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (regexUserName.test(e.target.value)) {
                setUserNameAvailable(true);
              } else {
                setUserNameAvailable(false);
              }
            }}
            fluid
            icon={userNameAvailable ? "check" : "close"}
            iconPosition="left"
          />
          <CommonInputs
            user={user}
            showSocialLinks={showSocialLinks}
            setShowSocialLinks={setShowSocialLinks}
            handleChange={handleChange}
          />
          <Divider hidden />
          <Button
            icon="signup"
            content="Signup"
            type="submit"
            color="orange"
            disabled={submitDisabled || !userNameAvailable}
          />
        </Segment>
      </Form>
      <FooterMessage />
    </>
  );
};

export default signup;
