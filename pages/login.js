import { Button } from "@mui/material";
import Head from "next/head"
import styled from "styled-components";
import { auth, provider } from "../firebase"; // Import the auth and provider from firebase.js
import { signInWithPopup } from "firebase/auth";

function Login() {
  const signIn = () => {
    signInWithPopup(auth, provider)
    .then((result) => {
      // Successful sign-in
      console.log(result.user);
    })
    .catch((error) => {
      alert(error.message);
    });
    };
  return (
    <Container>
      <Head>
        <title>Login</title>
      </Head> 
      <LoginContainer> 
        <Logo src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"/>
        <Button variant="outlined " onClick={signIn}>
          Sign in with Google
        </Button>
      </LoginContainer>      
    </Container>
  )
}

export default Login;

const Container = styled.div`
  display: grid;
  place-items: center;
  height: 100vh;
  background-color: whitesmoke;` ;
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);`;
const Logo = styled.img`
  height: 200px;
  padding: 20px;
  margin-bottom: 50px;
`;
