"use client";

export default function FraseOrgullo() {
  return (
    <section className="w-full py-10">
      <div className="w-full">
        <div
          className="
            w-full
            h-[380px]
            md:h-[480px]
            lg:h-[520px]
            rounded-2xl
            bg-cover
            bg-center
            overflow-hidden
          "
          style={{
            backgroundImage: "url('/imagenes/frase-port.webp')",
          }}
        />
      </div>
    </section>
  );
}
