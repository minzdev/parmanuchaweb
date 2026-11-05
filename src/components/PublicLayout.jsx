import { Outlet } from "react-router-dom";
import { useContent } from "../lib/content";
import Background from "./Background";
import FloatingHearts from "./FloatingHearts";
import MusicPlayer from "./MusicPlayer";

export default function PublicLayout() {
  const { ready } = useContent();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />
      <FloatingHearts />
      {ready ? <MusicPlayer /> : null}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
