import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Đây là "Chìa khóa" mới tinh của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAT7K3pFWOc7Z-J8v-bd1kg_TtQdoy2pMY",
  authDomain: "bwd2026-500510.firebaseapp.com",
  projectId: "bwd2026-500510",
  storageBucket: "bwd2026-500510.firebasestorage.app",
  messagingSenderId: "956244087480",
  appId: "1:956244087480:web:0b55220b86244716a19a4d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Đã gỡ bỏ tham số databaseId rườm rà của AI Studio
export const googleProvider = new GoogleAuthProvider();

// Hàm test kết nối Firebase
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
