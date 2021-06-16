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
import { loginUser } from "../utils/authUser";
import cookie from "js-cookie";
import axios from "axios";
import {
  HeaderMessage,
  FooterMessage,
} from "../components/common/WelcomeMessage";

const login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { email, password } = user;

  useEffect(() => {
    const isUser = Object.values({ email, password }).every((item) =>
      Boolean(item)
    );
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await loginUser(user, setErrorMessage, setFormLoading);
  };

  useEffect(() => {
    document.title = "Welcome Back";
    const userEmail = cookie.get("userEmail");
    if (userEmail) setUser((prev) => ({ ...prev, email: userEmail }));
  }, []);

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
          <Form.Input
            label="Email"
            placeholder="Email"
            name="email"
            value={email}
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
          <Divider hidden />
          <Button
            icon="signup"
            content="Login"
            type="submit"
            color="orange"
            disabled={submitDisabled}
          />
        </Segment>
      </Form>

      <FooterMessage />
    </>
  );
};

export default login;
