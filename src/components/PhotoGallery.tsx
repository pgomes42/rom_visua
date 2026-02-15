import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

interface PhotoGalleryProps {
    photos: string[];
    apartmentName: string;
    onClose?: () => void;
}

export const PhotoGallery = ({ photos, apartmentName, onClose }: PhotoGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
        setIsZoomed(false);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
        setIsZoomed(false);
    };

    const goToIndex = (index: number) => {
        setCurrentIndex(index);
        setIsZoomed(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setIsZoomed(false);
    };

    if (photos.length === 0) {
        return (
            <div className="bg-muted rounded-sm p-12 text-center">
                <p className="text-muted-foreground">Nenhuma foto disponível</p>
            </div>
        );
    }

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`flex items-center justify-between p-4 ${isFullscreen ? 'bg-black/50 backdrop-blur-sm' : ''}`}>
                    <h3 className="font-display text-lg font-bold text-foreground">
                        {apartmentName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="text-foreground hover:bg-background/10"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </Button>
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-foreground hover:bg-background/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Image */}
                <div className={`relative flex-grow flex items-center justify-center ${isFullscreen ? 'bg-black' : 'bg-muted/50'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={`relative ${isFullscreen ? 'max-h-[80vh]' : 'max-h-[500px]'} ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <img
                                src={photos[currentIndex]}
                                alt={`${apartmentName} - Foto ${currentIndex + 1}`}
                                className="object-contain w-full h-full max-w-full max-h-full"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                                aria-label="Foto anterior"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                                aria-label="Próxima foto"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Zoom Control */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                            aria-label={isZoomed ? "Diminuir zoom" : "Aumentar zoom"}
                        >
                            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Photo Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                        {currentIndex + 1} / {photos.length}
                    </div>
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                    <div className={`p-4 overflow-x-auto ${isFullscreen ? 'bg-black/50 backdrop-blur-sm' : 'bg-card border-t border-border'}`}>
                        <div className="flex gap-2 justify-center min-w-max">
                            {photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToIndex(index)}
                                    className={`relative w-20 h-20 rounded-sm overflow-hidden transition-all ${
                                        index === currentIndex
                                            ? 'ring-2 ring-primary scale-110'
                                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={photo}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PhotoGalleryModalProps {
    photos: string[];
    apartmentName: string;
    initialIndex?: number;
    onClose: () => void;
}

export const PhotoGalleryModal = ({ photos, apartmentName, initialIndex = 0, onClose }: PhotoGalleryModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full"
            >
                <PhotoGallery photos={photos} apartmentName={apartmentName} onClose={onClose} />
            </motion.div>
        </div>
    );
};

export default PhotoGallery;
