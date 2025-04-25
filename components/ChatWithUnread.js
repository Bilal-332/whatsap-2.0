// import { useEffect, useState } from "react";
// import { collection, query, where, onSnapshot } from "firebase/firestore";
// import { db } from "../firebase";
// import Chat from "./Chat";

// function ChatWithUnread({ chat, user, closeSidebar }) {
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     const messagesRef = collection(db, "chats", chat.id, "messages");
//     const q = query(messagesRef, where("seen", "==", false), where("sender", "!=", user.email));
    
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       setUnreadCount(snapshot.size);
//     });

//     return unsubscribe;
//   }, [chat.id, user.email]);

//   return (
//     <Chat
//       id={chat.id}
//       users={chat.data().users}
//       closeSidebar={closeSidebar}
//       unreadCount={unreadCount} // Pass the unread count
//     />
//   );
// }

// export default ChatWithUnread;
