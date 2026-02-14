import { useEffect, useState } from "react";
import { getTest } from "../services/testService";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTest()
      .then((res) => setMessage(res.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Landing Page</h1>
      <p>{message}</p>
    </div>
  );
}
