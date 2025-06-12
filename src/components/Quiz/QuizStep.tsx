import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Question as QuestionType, Product } from '../../lib/types';
import { fetchProducts } from '../../lib/api';
import { ProductCard } from '../Product/ProductCard';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import Question from './Question';
import ProductCards from './ProductCards';

interface QuizStepProps {
  question: QuestionType;
  products: Product[];
  onSelectProduct: (product: Product | null) => void;
  selectedProduct: Product | null;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const QuizStep: React.FC<QuizStepProps> = ({
  question,
  products,
  onSelectProduct,
  selectedProduct,
  onNext,
  onPrev,
  isFirst,
  isLast,
}) => {
  const [hasSelected, setHasSelected] = useState(false);
  const [shimmerNext, setShimmerNext] = useState(false);
  const [shimmerPrev, setShimmerPrev] = useState(false);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  // Shimmer effect when a product is selected for the first time
  useEffect(() => {
    if (selectedProduct && !hasSelected) {
      setHasSelected(true);
      setShimmerNext(true);
      setTimeout(() => setShimmerNext(false), 500);
    }
  }, [selectedProduct, hasSelected]);

  // Static paragraph with category name
  const paragraph = `Here are our top three options for ${question.category} products.`;

  // Toggle product selection
  const handleProductClick = (product: Product) => {
    if (selectedProduct?.id === product.id) {
      onSelectProduct(null); // Deselect
    } else {
      onSelectProduct(product);
    }
  };

  const triggerShimmer = (button: 'next' | 'prev') => {
    if (button === 'next') {
      setShimmerNext(true);
      setTimeout(() => setShimmerNext(false), 500);
    } else {
      setShimmerPrev(true);
      setTimeout(() => setShimmerPrev(false), 500);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-8 min-h-[300px]">
      {/* Left: Static paragraph */}
      <div className="w-full md:w-2/5 flex flex-col justify-center items-start">
        <div className="mb-6 text-lg text-gray-800 font-body">{paragraph}</div>
        <div className="flex flex-row gap-4 mt-auto">
          <button
            className="px-6 py-2 rounded-lg font-heading text-base transition-colors relative overflow-hidden"
            style={{ background: '#5D7D5F', color: '#fff' }}
            onClick={onPrev}
            onMouseEnter={() => triggerShimmer('prev')}
            disabled={isFirst}
          >
            ← Previous
            {shimmerPrev && (
              <span className="absolute inset-0 pointer-events-none shimmer-overlay-ltr" />
            )}
          </button>
          <motion.button
            ref={nextBtnRef}
            className="px-6 py-2 rounded-lg font-heading text-base transition-colors relative overflow-hidden"
            style={{ background: '#5D7D5F', color: '#fff' }}
            onClick={onNext}
            onMouseEnter={() => triggerShimmer('next')}
            disabled={isLast}
          >
            <span>Next →</span>
            {shimmerNext && (
              <span className="absolute inset-0 pointer-events-none shimmer-overlay-rtl" />
            )}
          </motion.button>
        </div>
      </div>
      {/* Right: Product cards */}
      <div className="w-full md:w-3/5 flex flex-col justify-center">
        <ProductCards
          products={products}
          onSelectProduct={handleProductClick}
          selectedProduct={selectedProduct}
        />
      </div>
    </div>
  );
};

export default QuizStep;

// Add shimmer animation to global styles if not present
// .shimmer-gold { animation: gold-shimmer 1.2s linear; }
// @keyframes gold-shimmer { 0% { box-shadow: 0 0 0 0 #EEB15F; } 50% { box-shadow: 0 0 16px 4px #EEB15F; } 100% { box-shadow: 0 0 0 0 #EEB15F; } }
// .animate-gold-shimmer { animation: gold-shimmer 1.2s linear; } // for overlay shimmer
