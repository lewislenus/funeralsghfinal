"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut, Maximize, Share2, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FlipbookViewerProps {
  pdfUrl: string
  onClose: () => void
}

export function FlipbookViewer({ pdfUrl, onClose }: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const totalPages = 8 // This would come from PDF analysis

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25)
  }

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevPage()
    if (e.key === "ArrowRight") handleNextPage()
    if (e.key === "Escape") onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col shadow-2xl ${
            isFullscreen ? "max-w-full max-h-full rounded-none" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Funeral Brochure</h3>
              <p className="text-sm text-slate-600">Interactive PDF Viewer</p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border border-slate-200">
                <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm px-3 py-1 min-w-[60px] text-center font-medium">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="rounded-lg">
                <Maximize className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg bg-transparent">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Flipbook Content */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            <div className="relative">
              <motion.div
                key={currentPage}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center",
                }}
              >
                {/* Simulated PDF pages */}
                <div className="w-96 h-[500px] bg-white border flex flex-col">
                  {/* Page Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6 text-center">
                    <h2 className="text-2xl font-bold mb-2">In Loving Memory</h2>
                    <p className="text-slate-300">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>

                  {/* Page Content */}
                  <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full mb-6 flex items-center justify-center">
                      <span className="text-2xl">📖</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                      {currentPage === 1 && "Cover Page"}
                      {currentPage === 2 && "Life Story"}
                      {currentPage === 3 && "Family & Friends"}
                      {currentPage === 4 && "Achievements"}
                      {currentPage === 5 && "Photo Gallery"}
                      {currentPage === 6 && "Tributes"}
                      {currentPage === 7 && "Service Details"}
                      {currentPage === 8 && "Thank You"}
                    </h3>

                    <div className="space-y-4 text-slate-600">
                      <p className="text-sm leading-relaxed">
                        This interactive flipbook would display the actual PDF content using PDF.js or a similar
                        library.
                      </p>

                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Real Implementation Features:</p>
                        <ul className="text-xs text-slate-600 space-y-1 text-left">
                          <li>• PDF.js for high-quality rendering</li>
                          <li>• Turn.js for realistic page flipping</li>
                          <li>• Touch gestures for mobile devices</li>
                          <li>• Search functionality within pages</li>
                          <li>• Bookmark and annotation support</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Arrows */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-full bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 translate-x-full bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="rounded-lg bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="rounded-lg bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Page Indicators */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <span>Use arrow keys to navigate</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
