import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;;

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatTime(date) {
  if (!date) return "Unknown";
  const timestamp = new Date(date);
  const now = new Date();
  const isToday = timestamp.toDateString() === now.toDateString();

  return timestamp.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: isToday ? undefined : "numeric",
    month: isToday ? undefined : "numeric",
    day: isToday ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const encryptMessage = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (cipherText) => {
  if (!cipherText || typeof cipherText !== "string") return "";

  // Check if it's likely encrypted (CryptoJS AES ciphertexts contain 'U2FsdGVkX1')
  if (cipherText.startsWith("U2FsdGVkX1")) {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "🔐 Failed to decrypt";
    } catch (err) {
      return "🔐 Failed to decrypt";
    }
  }

  // If not encrypted, return as-is
  return cipherText;
};