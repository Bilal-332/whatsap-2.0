import styled from "styled-components"
import {useAuthState} from "react-firebase-hooks/auth"; // Import the useAuthState hook from react-firebase-hooks
import { auth } from "../firebase"; // Import the auth from firebase.js
import moment from "moment";
function Message({user, message }) {
  const [userLoggedIn] = useAuthState(auth); // Get the current user from Firebase Auth

  const TypeOfMessage = user === userLoggedIn.email ? Sender : Receiver; // Determine the type of message based on the user
  return (
    <Container>
      <TypeOfMessage> {message}
       <TimeStamp>{moment().format("LT")}</TimeStamp>
      </TypeOfMessage>
    </Container>
  )
}

export default Message


const Container = styled.div`
   
`;

const MessageElement = styled.p`
    width: fit-content; 
    padding: 15px;      
    margin: 10px;
    border-radius: 8px;
    min-width: 60px;
    position: relative;
    text-align: right;
    padding-bottom: 26px;
`;

const Sender = styled(MessageElement)`
    margin-left: auto;
    background-color: #dcf8c6;
`;

const Receiver = styled(MessageElement)`
    text-align: left;
    background-color: whitesmoke;
`;

const TimeStamp = styled.span`
    color: gray;
    padding: 10px;
    font-size: 9px;
    position: absolute;
    bottom: 0;
    text-align: right;
    right: 0;
`;   