const baseUrl =
  process.env.NODE_DEV !== "production"
    ? "http://localhost:3000"
    : "https://retwittes.herokuapp.com";

module.exports = baseUrl;
