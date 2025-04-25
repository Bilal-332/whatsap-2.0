import {
  Email,
  MoreVertOutlined,
  SearchOutlined,
  ChatOutlined,
} from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Button, IconButton } from "@mui/material";
import styled from "styled-components";
import * as EmailValidator from "email-validator";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";
import { useState, useEffect, useMemo } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";

function Sidebar() {
  const [user] = useAuthState(auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <-- for search input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // <-- for debounced value

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on load
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.toLowerCase());
    }, 300); // <-- 300ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );
  const [chatsSnapshot] = useCollection(userChatRef);

  const createChat = async () => {
    const input = prompt("Please enter an email address for the user you wish to chat with");
    if (!input) return null;

    if (EmailValidator.validate(input) && input !== user.email && !chatAlreadyExists(input)) {
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
    !!chatsSnapshot?.docs.find((chat) =>
      chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  // Filtering chats based on debounced search
  const filteredChats = useMemo(() => {
    if (!chatsSnapshot) return [];

    return chatsSnapshot.docs.filter(chat => 
      chat.data().users
        .filter(u => u !== user.email)
        .some(u => u.toLowerCase().includes(debouncedSearchTerm))
    );
  }, [chatsSnapshot, debouncedSearchTerm, user.email]);

  return (
    <>
      {!isSidebarOpen && (
        <OpenMenuButton onClick={() => setIsSidebarOpen(true)}>
          <MenuIcon />
        </OpenMenuButton>
      )}

      <SidebarContainer isOpen={isSidebarOpen}>
        <MobileOverlay isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
        <SidebarContent isOpen={isSidebarOpen}>
          <BackArrow>
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </BackArrow>

          <Header>
            <UserAvatar
              src={user.photoURL}
              onClick={() => setShowUserPopup(true)}
            />
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
            <SearchInput 
              placeholder="Search in Chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Search>

          <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

          {filteredChats.map((chat) => (
            <Chat
              key={chat.id}
              id={chat.id}
              users={chat.data().users}
              closeSidebar={() => {
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
            />
          ))}
        </SidebarContent>
      </SidebarContainer>

      {showUserPopup && (
        <UserPopup>
          <PopupContent>
            <CloseWrapper>
              <IconButton onClick={() => setShowUserPopup(false)}>
                <CloseIcon />
              </IconButton>
            </CloseWrapper>
            <StyledAvatar src={user?.photoURL} />
            <PopupTitle>{user?.displayName}</PopupTitle>
            <PopupEmail>{user?.email}</PopupEmail>
            <LogoutButton onClick={() => auth.signOut()}>
              <LogoutIcon />
              Logout
            </LogoutButton>
          </PopupContent>
        </UserPopup>
      )}
    </>
  );
}

export default Sidebar;


// Styled Components
const SidebarContainer = styled.div`
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${({ isOpen }) => (isOpen ? "0" : "-100%")};
    width: 70%;
    max-width: 270px;
    height: 100%;
    background-color: white;
    z-index: 1100;
    transition: all 0.3s ease-in-out;
    box-shadow: ${({ isOpen }) => (isOpen ? "2px 0px 10px rgba(0, 0, 0, 0.3)" : "none")};
  }
  @media (min-width: 768px) {
    position: relative;
    flex: 0.45;
    height: 100vh;
    border-right: 1px solid whitesmoke;
    min-width: 300px;
    max-width: 350px;
    background-color: white;
  }
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const MobileOverlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);

  @media (min-width: 768px) {
    display: none;
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
  width: 50px;
  height: 50px;

  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;

const Search = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
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
  z-index: 1200;
  background-color: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: #f1f1f1;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const UserPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1500;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupContent = styled.div`
  background: #fff;
  padding: 40px 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
`;

const CloseWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  margin: 20px auto 15px;
`;

const PopupTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin: 15px 0;
`;

const PopupEmail = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
`;

const LogoutButton = styled(Button)`
  background-color: #f44336 !important;
  color: white !important;
  padding: 12px 25px;
  border-radius: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    background-color: #d32f2f !important;
  }
`;
