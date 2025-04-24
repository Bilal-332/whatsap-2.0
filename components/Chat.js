import { useAuthState } from "react-firebase-hooks/auth"; // Import the useAuthState hook from react-firebase-hooks
import { Avatar } from "@mui/material";
import styled from "styled-components";
import { auth, db } from "../firebase"; // Import the auth and db from firebase.js
import { useCollection } from "react-firebase-hooks/firestore"; // Import useCollection hook
import { collection, query, where } from "firebase/firestore"; // Modular Firebase SDK imports
import getRecipientEmail from "@/utils/getRecipientEmail";
import { useRouter } from "next/router"; // Import useRouter from next/router

function Chat({ id, users , closeSidebar }) {
  const [user] = useAuthState(auth); // Get the current user from Firebase Auth
  const router = useRouter();
  
  // Correct Firestore query with modular SDK v9+
  const recipientEmail = getRecipientEmail(users, user);
  
  // Create the query to fetch recipient data
  const recipientQuery = query(
    collection(db, "users"),
    where("email", "==", recipientEmail)
  );

  // Using useCollection hook to fetch the data
  const [recipientSnapshot] = useCollection(recipientQuery);
  
  // If recipient data is available, extract it
  const recipient = recipientSnapshot?.docs?.[0]?.data();

  const enterChat = () => {
    // Navigate to the chat page with the chat ID
    router.push(`/chat/${id}`);
    if (closeSidebar) {
      closeSidebar(); // Close the sidebar if the function is provided
    }
  };


  return (
    <Container onClick={enterChat}>
      {recipient ? (
        // If recipient exists, show their avatar and photo URL (if available)
        <UserAvatar src={recipient?.photoURL} />
      ) : (
        // If no photoURL, fallback to displaying the first letter of the email
        <UserAvatar>{recipientEmail?.[0]}</UserAvatar>
      )}
      <p>{recipientEmail ? recipientEmail : "No Email"}</p>
    </Container>
  );
}

export default Chat;

// Styled Components
const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-word;
    &:hover {
        background-color: #f5f5f5;
    }
`;

const UserAvatar = styled(Avatar)`
  margin: 5px;
  margin-right: 15px;
`;
