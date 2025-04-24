import {  Email, More, MoreVertOutlined, SearchOutlined , ChatOutlined } from "@mui/icons-material";
import { Avatar, Button, Icon, IconButton } from "@mui/material";
import styled from "styled-components"; 
import * as EmailValidator from "email-validator";
import { useAuthState } from "react-firebase-hooks/auth"; // Import the useAuthState hook from react-firebase-hooks
import { auth , db } from "../firebase"; 
import { collection, addDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { query, where } from "firebase/firestore"; // Import query and where from firebase/firestore
import Chat from "./Chat";
// Import the auth from firebase.js
function Sidebar() {
  const [user] = useAuthState(auth); // Get the current user from Firebase Auth

  const userChatRef = query(
    collection(db, "chats"),
    where('users', 'array-contains', user.email)
  );
  
  const [chatsSnapshot] = useCollection(userChatRef); 
    const createChat = async () => {
        const input = prompt("Please enter an email address for the user you wish to chat with");
        if (!input) return null;
        if (EmailValidator.validate(input) && input !== user.email && !chatAlreadyExists(input) ) {
          try {
            await addDoc(collection(db, "chats"), {
              users: [user.email, input],
            });
          } catch (error) {
            console.error("Error adding document: ", error);
          }
        }
    }
    const chatAlreadyExists = (recipientEmail) => 
      !!chatsSnapshot?.docs.find(
        (chat) => chat.data().users.find((user) => user === recipientEmail)?.length > 0
      );
    


  return (
    <Container>
     <Header>   
        <UserAvatar src={user.photoURL} onClick={()=> auth.signOut()} />
        <IconsContainer> 
           <IconButton>
             <ChatOutlined/>
           </IconButton>
            <IconButton>
            <MoreVertOutlined/>
            </IconButton>
        </IconsContainer>
     </Header>
     <Search>
        <SearchOutlined/>
        <SearchInput placeholder="Search in Chats"/> 
     </Search>
    <SidebarButton onClick={createChat}> Start a new chat</SidebarButton>

    {chatsSnapshot?.docs.map((chat) => (
      <Chat key={chat.id} id={chat.id} users={chat.data().users}  />
    ))}
    </Container>
  )
}

export default Sidebar;

const Container = styled.div`
  flex: 0.45;
  border-right: 1px solid whitesmoke;
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;
const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;`;
const UserAvatar = styled(Avatar) `
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }`;
const IconsContainer = styled.div``;
const Search = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 2px;`;
const SearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
  background-color: transparent;
  padding-left: 10px;
  margin-left: 10px;
`;
const SidebarButton = styled(Button)`
  width: 100%;
    &&& {
        border-top: 1px solid whitesmoke;
        border-bottom: 1px solid whitesmoke;
    }
  `; 
