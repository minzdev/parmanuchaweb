import { useEffect } from "react";
import { useContent } from "../lib/content";
import Hero from "../components/Hero";
import MonthFilter from "../components/MonthFilter";
import TimeTogether from "../components/TimeTogether";
import Timeline from "../components/Timeline";
import Gallery from "../components/Gallery";
import Reasons from "../components/Reasons";
import LoveLetter from "../components/LoveLetter";
import Closing from "../components/Closing";

export default function Home() {
  const { content } = useContent();

  useEffect(() => {
    document.title = `Mansiv · ${content.hero.title}`;
  }, [content.hero.title]);

  return (
    <>
      <Hero />
      <MonthFilter />
      <TimeTogether />
      <Timeline />
      <Gallery />
      <Reasons />
      <LoveLetter />
      <Closing />
    </>
  );
}
