import EtheralShadow from "./EtheralShadow";

export default function ShadowDemo() {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-zinc-950">
      <EtheralShadow
        color="rgba(16, 185, 129, 0.4)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      >
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="md:text-7xl text-6xl lg:text-8xl font-black text-center text-white tracking-tighter mix-blend-overlay opacity-80 uppercase">
                Etheral Shadow
            </h1>
            <p className="text-zinc-400 font-bold tracking-[0.3em] uppercase mt-4 text-xs">Premium Visual Layer</p>
          </div>
      </EtheralShadow>
    </div>
  );
}
