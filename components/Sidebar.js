import { Email, MoreVertOutlined, SearchOutlined, ChatOutlined } from "@mui/icons-material";
import { Avatar, Button, IconButton } from "@mui/material";
import styled from "styled-components";
import * as EmailValidator from "email-validator";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

function Sidebar() {
  const [user] = useAuthState(auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );

  const [chatsSnapshot] = useCollection(userChatRef);

  const createChat = async () => {
    const input = prompt("Please enter an email address for the user you wish to chat with");
    if (!input) return null;

    if (
      EmailValidator.validate(input) &&
      input !== user.email &&
      !chatAlreadyExists(input)
    ) {
      try {
        await addDoc(collection(db, "chats"), {
          users: [user.email, input],
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const chatAlreadyExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) => chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  return (
    <>
      {!isSidebarOpen && (
        <OpenMenuButton onClick={() => setIsSidebarOpen(true)}>
          <MenuIcon />
        </OpenMenuButton>
      )}

      {isSidebarOpen && (
        <SidebarContainer>
          <BackArrow>
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </BackArrow>

          <Header>
            <UserAvatar src={user.photoURL} onClick={() => auth.signOut()} />
            <IconsContainer>
              <IconButton>
                <ChatOutlined />
              </IconButton>
              <IconButton>
                <MoreVertOutlined />
              </IconButton>
            </IconsContainer>
          </Header>

          <Search>
            <SearchOutlined />
            <SearchInput placeholder="Search in Chats" />
          </Search>

          <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

          {chatsSnapshot?.docs.map((chat) => (
            <Chat key={chat.id} id={chat.id} users={chat.data().users} />
          ))}
        </SidebarContainer>
      )}
    </>
  );
}

export default Sidebar;

// Styled Components
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

const SidebarContainer = styled(Container)`
  position: fixed;
  left: 0;
  top: 0;
  background-color: white;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
  width: 80%;
  max-width: 300px;

  @media (min-width: 768px) {
    position: relative;
    width: auto;
    max-width: 350px;
  }
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
  border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;

const Search = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 2px;
`;

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

const BackArrow = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 10px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const OpenMenuButton = styled(IconButton)`
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1001;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  width: 48px;
  height: 48px;

  @media (min-width: 768px) {
    display: none;
  }
`;

