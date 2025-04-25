import { Avatar, IconButton } from "@mui/material";
import React, { useRef, useState } from "react"; // Import React and useState
import styled from "styled-components";
import { auth } from "../firebase"; // Import the auth from firebase.js
import { useAuthState } from "react-firebase-hooks/auth"; // Import the useAuthState hook from react-firebase-hooks
import { useRouter } from "next/router";
import { useEffect } from "react"; // Import useEffect for side effects
import {
  AttachFile,
  MoreVertOutlined,
  InsertEmoticon,
  MicOutlined,
} from "@mui/icons-material";
import { Timestamp } from "firebase/firestore";
import {
  doc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { useCollection } from "react-firebase-hooks/firestore"; // Import useCollection hook
import { collection, query, where, getDocs , orderBy} from "firebase/firestore"; // Modular Firebase SDK imports
import Message from "./Message"; // Import the Message component
import { db } from "../firebase"; // Import the db from firebase.js
import getRecipientEmail from "@/utils/getRecipientEmail";
import TimeAgo from "timeago-react"; // Import TimeAgo for displaying time since last seen

function ChatScreen({ chat, messages , chatId }) {
  const [user] = useAuthState(auth); // Get the current user from Firebase Auth
  const [input, setInput] = useState(""); // State for the input field
  const endOfMessageRef = useRef(null); // Ref for the end of messages
  const router = useRouter(); // Get the router object from Next.js
  

  const [messagesSnapshot] = useCollection(
    query(
      collection(db, "chats", router.query.id, "messages"),
      orderBy("timestamp", "asc")
    )
  );
  const [recipientSnapshot] = useCollection(
    query(
      collection(db, "users"),
      where("email", "==", getRecipientEmail(chat.users, user))
    )
  );

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={message.data().message}
          photoURL={message.data().photoURL}
          timestamp={
            message.data().timestamp
              ? message.data().timestamp.toDate().getTime()
              : null
          }
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message
          key={message.id}
          user={message.user}
          message={message.message}
          photoURL={message.photoURL}
          timestamp={message.timestamp}
        />
      ));
    }
  };

  const scrollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    }); }

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input) return;

    // Update user's last seen
    await setDoc(
      doc(db, "users", user.uid),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    // Add message to Firestore
    await addDoc(collection(db, "chats", router.query.id, "messages"), {
      timestamp: serverTimestamp(),
      message: input,
      user: user.email,
      photoURL: user.photoURL,
      //seen: false, // Set seen to false when sending a new message
    });

    setInput("");
    scrollToBottom(); // Scroll to the bottom of the chat
  };

  const recipientEmail = getRecipientEmail(chat.users, user);
  const recipient = recipientSnapshot?.docs?.[0]?.data(); // Get recipient data from Firestore    

  // useEffect(() => {
  //   const markMessagesAsSeen = async () => {
  //     const messagesRef = collection(db, "chats", chatId, "messages");
  //     const unseenMessagesQuery = query(messagesRef, where("seen", "==", false), where("sender", "!=", user.email));
  //     const querySnapshot = await getDocs(unseenMessagesQuery);
  
  //     querySnapshot.forEach((docSnap) => {
  //       const msgDoc = doc(db, "chats", chatId, "messages", docSnap.id);
  //       updateDoc(msgDoc, { seen: true });
  //     });
  //   };
  
  //   markMessagesAsSeen();
  // }, [chatId, user.email]);

  return (
    <Container>
      <Header>
        <Avatar src={recipient?.photoURL} /> {/* Display the user's avatar */}
        <HeaderInformation>
          <h3>{recipientEmail}</h3> {/* Display the user's name */}
          {messagesSnapshot ? (
            <p>
              Last Active:{" "}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient.lastSeen.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p>Loading Last Active...</p>
          )}
        </HeaderInformation>
        <HeaderIcons>
          <IconButton>
            {" "}
            {/* Icon button for settings */}
            <AttachFile />
          </IconButton>
          <IconButton>
            {" "}
            {/* Icon button for more options */}
            <MoreVertOutlined />
          </IconButton>
        </HeaderIcons>
      </Header>
      <MessageContainer>
        {showMessages()}
        <EndOfMessage ref={endOfMessageRef} /> {/* Placeholder for the end of messages */}
      </MessageContainer>

      <InputContainer>
        <InsertEmoticon />
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send Message
        </button>{" "}
        {/* Send button */}
        <MicOutlined /> {/* Microphone icon for sending voice messages */}
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;
const Header = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  padding: 11px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
`;
const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;
  > h3 {
    margin-bottom: 3px;
     @media (max-width: 768px) {
    font-size: 12px;
  }
  }
  > p {
    font-size: 14px;
    color: gray;
    @media (max-width: 768px) {
    font-size: 10px;
  }
  }
`;
const HeaderIcons = styled.div``;
const EndOfMessage = styled.div``; // Placeholder for the end of messages
const MessageContainer = styled.div`
  padding: 30px;
  min-height: 90vh;
  background-color: #e5ded8;
`;
const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;
const Input = styled.input`
  flex: 1;
  outline: 0;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 20px;
  margin-left: 15px;
  margin-right: 15px;
`; // Input field for sending messages
