"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useDataStore from "../useDataStore";

  useEffect(()=>{
      const data = useDataStore((state) => state.data);
      const flashcards = data ? data.flashcards : [];
  },[])
  
export default function FlashcardsPage() {
  const [flipped, setFlipped] = useState(Array(flashcards.length).fill(false));

  const toggleFlip = (index) => {
    setFlipped((prev) =>
      prev.map((f, i) => (i === index ? !f : f))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-100 flex flex-col items-center justify-center p-10">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-12 text-black comic-title drop-shadow-md text-center">
        💡 AI in Healthcare Flashcards
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {flashcards.map((card, index) => (
          <motion.div
            key={index}
            className="relative w-80 h-56 md:w-96 md:h-64 cursor-pointer"
            onClick={() => toggleFlip(index)}
            whileHover={{ scale: 1.07 }}
          >
            <motion.div
              className="absolute w-full h-full rounded-2xl border-[5px] border-black bg-white backface-hidden flex items-center justify-center text-center p-6 font-comic text-xl shadow-[8px_8px_0_#00000080]"
              animate={{ rotateY: flipped[index] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{
                transformStyle: "preserve-3d",
                perspective: 1000,
              }}
            >
              {!flipped[index] ? (
                <div className="text-gray-900 font-extrabold">
                  {card.question}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute inset-0 bg-yellow-200 rounded-2xl flex items-center justify-center text-gray-900 font-bold rotate-y-180 p-6 shadow-inner"
                >
                  {card.answer}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
