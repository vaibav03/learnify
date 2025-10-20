"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [comicData, setComicData] = useState({ summary: [], panels: [] });
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);

  const toggleFlip = (index) => {
    setFlipped((prev) => prev.map((f, i) => (i === index ? !f : f)));
  };

  const handleUpload = async () => {
    if (!file && !inputText.trim()) {
      alert("Please choose a PDF file or enter some text!");
      return;
    }

    setLoading(true);
    setExtractedText("");

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("text", inputText);

    try {
      const res = await fetch("http://127.0.0.1:5000/generate-comic", {
        method: "POST",
        body: formData,
      });

      if (res.status === 500 ) {
        toast.error("AWS Client Error: This request has been blocked by our content filters. Please adjust your text prompt to submit a new request.");
        setLoading(false);
        return;
      }

      const data = await res.json();

        const paragraphs = Array.from(
  data.summary.matchAll(/<Paragraph\s+\d+>\s*([\s\S]*?)<\/Paragraph\s+\d+>/g)
).map(match => match[1].trim());

      data.summary = paragraphs;

      setExtractedText(data.extracted_data || "No data received from server.");
      setComicData({ summary: data.summary, panels: data.panels });
      setFlashcards(data.flashcards || []);
      setFlipped(Array(data.flashcards?.length || 0).fill(false));
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Error processing request. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 p-10 relative overflow-hidden font-sans">
      {/* Comic Dots Background */}

      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-10 z-10 text-black "
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        💥 Learnify Genie 💥
      </motion.h1>

      <motion.div
        className="z-10 w-full max-w-7xl bg-white border-[5px] border-black rounded-3xl p-10 "
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/*Input */}
        <div className="flex flex-col space-y-8">

          <div className="text-center font-bold text-3xl text-gray-700 caret-black">
           — HEY BUDDY! HOW CAN I HELP YOU TODAY ? —
          </div>


          <div className="bg-pink-200 p-8 rounded-2xl border-[3px] border-black">
<label className="block text-2xl font-comic mb-2 text-red-500">
  ✏️ ENTER YOUR TEXT HERE:
</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="Type your text here..."
              className="w-full border-2 border-black rounded-lg text-2xl p-7 bg-white text-black focus:ring-4 focus:ring-yellow-400 focus:outline-none"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUpload}
            disabled={loading || (!file && !inputText.trim())}
            className="bg-orange-300 text-black py-3 rounded-xl font-comic text-2xl border-[4px] border-black shadow-[6px_6px_0_#000] hover:bg-orange-500 transition-all duration-150 disabled:opacity-60"
          >
            {loading ? "ZAP! Processing..." : "⚡ Generate ⚡"}
          </motion.button>
        </div>
      </motion.div>

      {/* Loading Animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl text-yellow-400 font-extrabold comic-burst"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              💥 BAM! 💥
            </motion.div>
            <Loader2 className="animate-spin text-black w-10 h-10 mt-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comic Panels */}
<div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 z-10">
  {comicData.panels.length > 0 &&
    comicData.panels.map((panel, idx) => {
      const colors = [
        "from-yellow-300 to-orange-400",
        "from-pink-300 to-red-400",
        "from-green-300 to-lime-400",
        "from-sky-300 to-blue-400",
        "from-purple-300 to-violet-400",
      ];
      const bg = colors[idx % colors.length];

      return (
        <motion.div
          key={idx}
          whileHover={{ rotate: [-1, 1, 0], scale: 1.04 }}
          transition={{ duration: 0.4 }}
          className="bg-white border-[5px] border-black rounded-3xl  overflow-hidden relative"
        >
          {/* Comic-style caption box */}
          <motion.div
              className={`bg-gradient-to-r ${bg} border-b-[5px] border-black p-4 text-center font-comic-caption text-xl text-black font-extrabold`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
          >
            {comicData.summary[idx]}
          </motion.div>

          {/* Image */}
          <div className="relative w-full aspect-[4/3] border-t-[3px] border-black">
  <Image
    src={`data:image/jpeg;base64,${panel.image}`}
    alt={`Panel ${idx + 1}`}
    fill
    className="object-contain rounded-b-3xl bg-white"
    unoptimized
  />
</div>

        </motion.div>
      );
    })}
</div>

{/* Flashcards */}
{/* Flashcards */}
{flashcards.length > 0 && (
  <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
    {flashcards.map((card, index) => {
      const flashColors = [
        "bg-yellow-200",
        "bg-pink-200",
        "bg-lime-200",
        "bg-sky-200",
        "bg-violet-200",
      ];
      const color = flashColors[index % flashColors.length];

      return (
        <motion.div
          key={index}
          onClick={() => toggleFlip(index)}
          whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
          transition={{ duration: 0.5 }}
          className="relative w-[22rem] h-[16rem] md:w-[26rem] md:h-[18rem] cursor-pointer"
        >
          <motion.div
            animate={{ rotateY: flipped[index] ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-full h-full rounded-3xl border-[5px] border-black bg-white text-center flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              perspective: 1000,
              fontFamily: "'Comic Neue'",
            }}
          >
            {/* FRONT */}
            {!flipped[index] ? (
              <div
                className={`p-6 text-gray-900 font-extrabold text-xl leading-snug overflow-y-auto ${color}`}
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}
              >
                {card.question}
              </div>
            ) : (
              /* BACK */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 ${color} rounded-3xl flex items-center justify-center text-gray-900 font-bold rotate-y-180 p-6 overflow-y-auto text-lg`}
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}
              >
                {card.answer}
              </motion.div>
            )}
          </motion.div>

          {/* Comic hover border */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-[5px] border-transparent"
            whileHover={{
              borderColor: "#ff00ff",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      );
    })}
  </div>
)}

    </main>
  );
}
