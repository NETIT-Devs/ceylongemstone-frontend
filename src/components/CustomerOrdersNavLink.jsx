import { useEffect, useState } from "react";

export const isUserSignedIn = () => {
  try {
    const customer = JSON.parse(window.localStorage.getItem("ceylon-user") || "null");
    if (customer?.loggedIn === true) return true;
    const admin = JSON.parse(window.localStorage.getItem("ceylon-admin-session") || "null");
    if (admin?.accountId) return true;
    return false;
  } catch {
    return false;
  }
};

export default function CustomerOrdersNavLink() {
  const [signedIn, setSignedIn] = useState(isUserSignedIn);

  useEffect(() => {
    const syncStatus = () => setSignedIn(isUserSignedIn());

    window.addEventListener("storage", syncStatus);
    window.addEventListener("ceylon-user-auth-change", syncStatus);
    return () => {
      window.removeEventListener("storage", syncStatus);
      window.removeEventListener("ceylon-user-auth-change", syncStatus);
    };
  }, []);

  return signedIn ? <a href="/my-orders">My Orders</a> : null;
}
