"use client"

import Link from 'next/link'

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Resume — Yogeshwara</h1>
          <div className="flex items-center gap-2">
            <a
              href="/Yogeshwara.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-2 rounded-md bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors text-sm sm:text-base"
            >
              Download PDF
            </a>
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-gray-200 hover:bg-zinc-800 transition-colors text-sm sm:text-base"
            >
              Back Home
            </Link>
          </div>
        </div>

        <div className="aspect-[1/1.414] w-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
          {/* Embed the PDF. Place Yogeshwara.pdf under public/ */}
          <object data="/Yogeshwara.pdf#view=FitH" type="application/pdf" className="w-full h-full">
            <iframe src="/Yogeshwara.pdf#view=FitH" className="w-full h-full" />
          </object>
        </div>

        <p className="text-xs sm:text-sm text-gray-400 text-center">
          If the document doesn't display, your browser might block inline PDFs. Use the Download button above.
        </p>
      </div>
    </div>
  )
}


