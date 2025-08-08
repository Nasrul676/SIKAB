"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Pastikan Anda sudah menginstal lucide-react

/**
 * Komponen untuk menampilkan thumbnail gambar yang bisa diklik
 * untuk membuka modal dengan gambar ukuran penuh.
 *
 * @param {object} props - Props untuk komponen.
 * @param {string} props.fileId - ID file dari Google Drive yang akan ditampilkan.
 * @param {string} [props.alt="Gambar"] - Teks alternatif untuk gambar.
 * @param {string} [props.className="w-24 h-24"] - Kelas Tailwind CSS untuk ukuran thumbnail.
 */
interface ImageThumbnailProps {
  fileId: string;
  alt?: string;
  className?: string;
}

export default function ImageThumbnail({ fileId, alt = "Gambar", className = "w-24 h-24" }: ImageThumbnailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL gambar yang akan diambil dari API Route Anda
  const imageUrl = `/api/images/${fileId}`;

  // Efek untuk mencegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function untuk mengembalikan scroll saat komponen unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  if (!fileId) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <p className="text-xs text-gray-500">No ID</p>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail Gambar */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`${className} relative cursor-pointer group overflow-hidden rounded-lg shadow-md border border-gray-200`}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://placehold.co/150x150/e2e8f0/4a5568?text=Error";
          }}
        />
      </div>

      {/* Modal untuk Gambar Ukuran Penuh */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)} // Menutup modal saat backdrop diklik
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            aria-label="Tutup"
          >
            <X size={32} />
          </button>
          
          {/* Mencegah penutupan modal saat gambar diklik */}
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageUrl}
              alt={alt}
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
      
      {/* CSS untuk animasi fade-in (bisa diletakkan di file CSS global Anda) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}