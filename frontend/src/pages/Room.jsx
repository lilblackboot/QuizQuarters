import { useParams, useSearchParams } from "react-router-dom";

function Room() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  const isHost = searchParams.get("host") === "true";

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Room ID: {id}</h1>
      <h2>User: {username}</h2>
      <h3>{isHost ? "You are the host" : "You are a participant"}</h3>
    </div>
  );
}

export default Room;
