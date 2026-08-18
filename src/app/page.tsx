import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center"
    >
      <Hero />
    </main>
  );
}
