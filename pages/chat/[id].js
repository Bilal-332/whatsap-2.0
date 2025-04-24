// pages/chat/[id].js
import styled from "styled-components";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import ChatScreen from "@/components/ChatScreen";
import { db , auth} from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import getRecipientEmail from "@/utils/getRecipientEmail";

function Chat({ chat, messages }) {

    const [user] = useAuthState(auth);
  return (
    <Container>
      <Head>
        <title>Chat with {getRecipientEmail(chat.users , user)}</title>
      </Head>
      <Sidebar />
      <ChatContainer>
        <ChatScreen chat={chat} messages={messages} />
      </ChatContainer>
    </Container>
  );
}

export default Chat;

export async function getServerSideProps(context) {
  const chatId = context.query.id;
  const chatRef = doc(db, "chats", chatId);

  const messagesQuery = query(
    collection(chatRef, "messages"),
    orderBy("timestamp", "asc")
  );

  const messagesRes = await getDocs(messagesQuery);

  const messages = messagesRes.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate().getTime() || null,
  }));

  const chatSnap = await getDoc(chatRef);
  const chat = {
    id: chatSnap.id,
    ...chatSnap.data(),
  };

  return {
    props: {
      messages: JSON.stringify(messages),
      chat: chat,
    },
  };
}

const Container = styled.div`
  display: flex;
`;

const ChatContainer = styled.div`
  flex: 1;
  height: 100vh;
  overflow: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
