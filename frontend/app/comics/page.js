"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const panels = [
  {
    panel_summary:
      "The paper “Evaluating Large Language Models for Use in Healthcare: A Framework for Translational Value Assessment” by Sandeep Reddy discusses the opportunities and challenges of applying Large Language Models (LLMs) such as ChatGPT in healthcare. It begins by explaining how healthcare systems face issues like inefficiency and high costs, which digital health interventions—especially AI and NLP—can help address. LLMs, built on neural network architectures like transformers, have shown strong capabilities in understanding and generating text. In healthcare, they can interpret medical records, generate discharge summaries, and support clinical decision-making. However, their use requires careful oversight due to the sensitivity of medical contexts.",
    img: "/Panel0.png",
  },
  {
    panel_summary:
      "The paper highlights that while LLMs can enhance healthcare delivery, they also pose serious ethical risks, including misinformation, plagiarism, data falsification, and bias. These risks are particularly concerning in clinical settings where incorrect information can lead to patient harm. Moreover, the lack of transparency in proprietary LLMs like ChatGPT and PaLM 2 makes it difficult to detect errors or biases. Hence, the author emphasizes the need for evaluation frameworks that not only measure model performance using standard NLP metrics (like BLEU, ROUGE, and F1 scores) but also assess functional, ethical, and governance aspects to ensure patient safety and trustworthiness.",
    img: "/Panel1.png",
  },
  {
    panel_summary:
      "To address this, Reddy proposes integrating two complementary frameworks: the TEHAI (Translational Evaluation of Healthcare AI) framework and the Governance Model for AI in Healthcare (GMAIH). TEHAI evaluates AI systems across three dimensions—capability, utility, and adoption—covering aspects such as data integrity, safety, transparency, privacy, and real-world usability. The governance model adds four key ethical pillars: fairness, transparency, trustworthiness, and accountability. Together, these ensure that AI systems are unbiased, explainable, ethically deployed, and properly regulated within healthcare institutions.",
    img: "/Panel2.png",
  },
  {
    panel_summary:
      "The paper concludes by stressing that as LLMs continue to evolve, their integration into healthcare must be accompanied by robust governance and translational evaluation. This ensures that their deployment enhances patient outcomes, supports clinicians responsibly, and maintains public confidence in AI-driven healthcare. The author argues that while LLMs are powerful tools ready to transform medicine, they must operate within a framework that enforces ethical standards, safety, and accountability—“a referee to ensure they play well.”",
    img: "/Panel3.png",
  },
];

export default function ComicPanels() {
  return (
    <div className="min-h-screen bg-yellow-50 bg-[url('/comic-bg.png')] bg-repeat p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-black comic-title drop-shadow-md">
        🩺 AI Meets Healthcare — A Comic Summary
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
        {panels.map((panel, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03, rotate: -1 + Math.random() * 2 }}
            className="bg-white border-4 border-black shadow-[6px_6px_0_#000] rounded-lg overflow-hidden comic-panel transition-all duration-300"
          >
            <div className="p-4 text-center bg-yellow-100 border-b-4 border-black font-comic text-lg text-gray-900">
              {panel.panel_summary}
            </div>
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={panel.img}
                alt={`Comic Panel ${idx + 1}`}
                fill
                className="object-fill border-t-4 border-black"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
