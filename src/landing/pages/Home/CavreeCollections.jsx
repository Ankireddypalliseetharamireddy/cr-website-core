import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, X, ArrowUpRight, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

import img1 from '../../assets/images/img-1.jpeg';
import img2 from '../../assets/images/img-2.jpeg';
import img3 from '../../assets/images/img-3.jpeg';
import img4 from '../../assets/images/img-4.jpeg';
import img5 from '../../assets/images/img-5.jpeg';
import img6 from '../../assets/images/img-6.jpeg';
import img7 from '../../assets/images/img-7.jpeg';
import img8 from '../../assets/images/img-8.jpeg';
import img10 from '../../assets/images/img-10.jpeg';
import img11 from '../../assets/images/img-11.jpeg';
import img12 from '../../assets/images/img-12.jpeg';
import img13 from '../../assets/images/img-13.jpeg';

const COLLECTION_LOOKS = [
  {
    id: 1,
    lookNo: '01',
    title: 'Royal Noir',
    subtitle: 'Zari Embroidered Suit',
    category: 'Occasion Wear',
    fabric: 'Raw Silk & Fine Chanderi',
    silhouette: 'Straight Cut Kurta & Striped Dupatta',
    craft: 'Handloom Gold Zari Yoke Work',
    care: 'Dry Clean Only',
    image: img1,
    description: 'Intricate golden yoke embroidery on obsidian black silk paired with a signature handloom striped dupatta.',
    tag: 'Signature',
    colorHex: '#D4AF37',
  },
  {
    id: 2,
    lookNo: '02',
    title: 'Midnight Stripe',
    subtitle: 'Artisanal Drape Set',
    category: 'Heritage Craft',
    fabric: 'Metallic Thread Silk',
    silhouette: 'Handloom Drape & Cigarette Pants',
    craft: 'Bespoke Metallic Weave & Tassels',
    care: 'Dry Clean Only',
    image: img2,
    description: 'Striking metallic woven gold and noir drape with handcrafted tassel details and tailored silk trousers.',
    tag: 'Artisanal',
    colorHex: '#DEC29D',
  },
  {
    id: 3,
    lookNo: '03',
    title: 'Crimson Empress',
    subtitle: 'Kalidar & Floral Shrug',
    category: 'Festive Luxury',
    fabric: 'Pure Georgette & Organza',
    silhouette: 'Flared Anarkali Gown with Jacket',
    craft: 'Botanical Needle Embroidery',
    care: 'Dry Clean Only',
    image: img3,
    description: 'Floor-length scarlet anarkali silhouette elevated by a delicate pastel botanical embroidered shrug jacket.',
    tag: 'Couture',
    colorHex: '#E63946',
  },
  {
    id: 4,
    lookNo: '04',
    title: 'Sunlit Ochre',
    subtitle: 'Embroidered Kurta Set',
    category: 'Day Luxury',
    fabric: 'Tussar Silk Blend',
    silhouette: 'Tailored Kurta & Tapered Pants',
    craft: 'Kashmiri Neckline Needlework',
    care: 'Dry Clean Only',
    image: img4,
    description: 'Luminous sunshine gold tone featuring delicate Kashmiri needlework embroidery on the neckline and border.',
    tag: 'Runway',
    colorHex: '#E9C46A',
  },
  {
    id: 5,
    lookNo: '05',
    title: 'Terracotta Bloom',
    subtitle: 'Gathered Kalidar Suit',
    category: 'Festive Luxury',
    fabric: 'Chanderi Silk & Zari',
    silhouette: 'High-Waist Gathered Kurta & Stole',
    craft: 'Micro-Pleated Flare & Zari Borders',
    care: 'Dry Clean Only',
    image: img5,
    description: 'Rich rust-crimson flared ensemble with micro-pleats, delicate gold yoke embroidery, and matching stole.',
    tag: 'Bestseller',
    colorHex: '#C85A32',
  },
  {
    id: 6,
    lookNo: '06',
    title: 'Sage Serenity',
    subtitle: 'Pleated Gown Ensemble',
    category: 'Contemporary Grace',
    fabric: 'Mulberry Silk Chiffon',
    silhouette: 'Gathered Gown & Palazzo Pants',
    craft: 'Metallic Foil Trim & Fine Pleating',
    care: 'Dry Clean Only',
    image: img6,
    description: 'Refreshing pistachio sage green pleated gown highlighted by shimmering metallic gold accents and border trims.',
    tag: 'New Season',
    colorHex: '#7FA084',
  },
  {
    id: 7,
    lookNo: '07',
    title: 'Noir Allure',
    subtitle: 'Striding Silk Ensemble',
    category: 'Occasion Wear',
    fabric: 'Brocade Silk & Gold Foil',
    silhouette: 'Classic Fit Kurta & Dupatta',
    craft: 'Brocade Weave & Lustrous Sheen',
    care: 'Dry Clean Only',
    image: img7,
    description: 'Side profile silhouette with flowing drape showcasing the interplay of gold luster and deep noir silk.',
    tag: 'Occasion',
    colorHex: '#D4AF37',
  },
  {
    id: 8,
    lookNo: '08',
    title: 'Scarlet Dynasty',
    subtitle: 'Flowing Festive Kalidar',
    category: 'Festive Luxury',
    fabric: 'Pure Silk Georgette',
    silhouette: 'Full Flare Anarkali with Stole',
    craft: 'Voluminous Flared Kalis & Gold Zari',
    care: 'Dry Clean Only',
    image: img8,
    description: 'Regal scarlet festive silhouette in full dynamic flow, capturing effortless grandeur and luxury craftsmanship.',
    tag: 'Festive',
    colorHex: '#D90429',
  },
  {
    id: 9,
    lookNo: '09',
    title: 'Amber Majesty',
    subtitle: 'Draped Festive Kurta Set',
    category: 'Day Luxury',
    fabric: 'Mulberry Chanderi',
    silhouette: 'Straight Kurta with Gathered Stole',
    craft: 'Traditional Mirror Motif & Gold Hem',
    care: 'Dry Clean Only',
    image: img12,
    description: 'Turmeric gold festive suit adorned with traditional mirror embroidery and hand-woven border accents.',
    tag: 'Day Luxury',
    colorHex: '#F4A261',
  },
  {
    id: 10,
    lookNo: '10',
    title: 'Regal Obsidian',
    subtitle: 'Embellished Border Suit',
    category: 'Occasion Wear',
    fabric: 'Raw Silk & Fine Zari',
    silhouette: 'Straight Cut Suit Set',
    craft: 'Intricate Neck & Border Zari Work',
    care: 'Dry Clean Only',
    image: img10,
    description: 'Classic occasion wear ensemble highlighted by intricate neckline and hemline gold zari embroidery.',
    tag: 'Signature',
    colorHex: '#D4AF37',
  },
  {
    id: 11,
    lookNo: '11',
    title: 'Zari Symphony',
    subtitle: 'Handcrafted Heritage Set',
    category: 'Heritage Craft',
    fabric: 'Woven Brocade & Tissue',
    silhouette: 'Tailored Kurta Set',
    craft: 'Textured Brocade & Hand-Stitched Yoke',
    care: 'Dry Clean Only',
    image: img11,
    description: 'Finely detailed gold neck yoke work paired with rich textured handloom fabrics for traditional majesty.',
    tag: 'Heritage',
    colorHex: '#DEC29D',
  },
  {
    id: 12,
    lookNo: '12',
    title: 'Heritage Elegance',
    subtitle: 'Bespoke Silk Couture',
    category: 'Heritage Craft',
    fabric: 'Pure Banarasi Weave Silk',
    silhouette: 'Modern Straight Cut Ensemble',
    craft: 'Banarasi Loom Weaving & Gold Threading',
    care: 'Dry Clean Only',
    image: img13,
    description: 'An enduring tribute to Indian luxury textiles, combining classical craftsmanship with contemporary grace.',
    tag: 'Limited',
    colorHex: '#E5C365',
  },
];

const CATEGORIES = ['All Looks', 'Occasion Wear', 'Festive Luxury', 'Heritage Craft', 'Day Luxury'];

export const CavreeCollections = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Looks');
  const [galleryCategory, setGalleryCategory] = useState('All Looks');
  const [selectedLook, setSelectedLook] = useState(null);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const sliderRef = useRef(null);
  const galleryScrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredLooks = activeCategory === 'All Looks'
    ? COLLECTION_LOOKS
    : COLLECTION_LOOKS.filter((look) => look.category === activeCategory);

  const galleryFilteredLooks = galleryCategory === 'All Looks'
    ? COLLECTION_LOOKS
    : COLLECTION_LOOKS.filter((look) => look.category === galleryCategory);

  const totalCards = filteredLooks.length;

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setShowFullGallery(false);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setCurrentIndex(0);

    const filterBarEl = document.querySelector('.collections-filter-bar') || document.querySelector('.cavree-collections-section');
    if (filterBarEl) {
      if (window.__lenis) {
        window.__lenis.scrollTo(filterBarEl, { offset: -85, duration: 0.9 });
      } else {
        const topOffset = filterBarEl.getBoundingClientRect().top + window.pageYOffset - 85;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    }
  };

  const handleGalleryCategorySelect = (cat) => {
    setGalleryCategory(cat);
    if (galleryScrollRef.current) {
      galleryScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector('.fashion-slider-card');
      const cardWidth = card ? card.offsetWidth + 20 : 380;
      const newScrollLeft = direction === 'left'
        ? sliderRef.current.scrollLeft - cardWidth
        : sliderRef.current.scrollLeft + cardWidth;

      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const updateIndexFromScroll = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector('.fashion-slider-card');
      const cardWidth = card ? card.offsetWidth + 20 : 380;
      const idx = Math.round(sliderRef.current.scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(0, idx), totalCards - 1));
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      setCurrentIndex(0);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (galleryScrollRef.current) {
      galleryScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [galleryCategory, showFullGallery]);

  useEffect(() => {
    if (showFullGallery || selectedLook) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) {
        window.__lenis.stop();
      }
    } else {
      document.body.style.overflow = 'unset';
      if (window.__lenis) {
        window.__lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [showFullGallery, selectedLook]);

  return (
    <section id="collections" className="cavree-collections-section w-full max-w-[100vw] bg-[#FAF6EE] text-[#1C1D21] py-[clamp(2.5rem,5vw,5.5rem)] px-[clamp(1rem,4vw,5rem)] box-border relative overflow-hidden">
      <div className="max-w-[1480px] mx-auto relative">

        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">

          <ScrollReveal variant="fade-down" delay={40} duration={850} className="inline-flex items-center gap-2 bg-[#B58C36]/10 border border-[#B58C36]/25 py-1.5 px-4 rounded-full mb-3">
            <Sparkles size={13} color="#9E7E38" />
            <span className="font-sans text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#9E7E38]">
              Curated Haute Couture Lookbook
            </span>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={90} duration={900}>
            <h2 className="font-serif text-[clamp(1.8rem,3.8vw,3.8rem)] font-extrabold tracking-[0.01em] uppercase text-[#1C1D21] leading-[1.08] m-0 mb-2.5">
              Fashion That <span className="text-[#B58C36] italic">Defines</span> You
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={150} duration={950}>
            <p className="font-sans text-[clamp(0.88rem,1vw,1.05rem)] text-[#65676E] max-w-[620px] leading-[1.6] m-0 mb-7 font-normal">
              Handcrafted silhouettes weaving classical Indian textiles, intricate embroidery, and modern tailored luxury.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={210} duration={950} className="collections-filter-bar flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3.5 mb-1">

            <div className="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 shrink min-w-0">
              <div className="inline-flex items-center gap-1 p-1 bg-white/90 border border-[#1C1D21]/15 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat && !showFullGallery;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`font-sans text-[clamp(0.68rem,0.76vw,0.75rem)] font-bold tracking-[0.05em] uppercase py-1.5 px-3.5 rounded-full transition-all duration-300 inline-flex items-center justify-center cursor-pointer shrink-0 whitespace-nowrap ${isActive
                          ? 'bg-[#1C1D21] text-white shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
                          : 'bg-transparent text-[#5A5C64] hover:text-[#1C1D21] hover:bg-black/5'
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-end sm:justify-start">
              <button
                onClick={() => {
                  setGalleryCategory('All Looks');
                  setShowFullGallery(true);
                }}
                className={`font-sans text-[clamp(0.7rem,0.78vw,0.76rem)] font-extrabold tracking-[0.06em] uppercase py-2 px-4.5 rounded-full inline-flex items-center gap-2 cursor-pointer transition-all duration-300 shrink-0 whitespace-nowrap ${showFullGallery
                    ? 'border-[1.5px] border-[#1C1D21] bg-[#1C1D21] text-white'
                    : 'border border-[#1C1D21]/25 bg-white text-[#1C1D21] hover:bg-[#1C1D21] hover:text-white hover:border-[#1C1D21] shadow-sm'
                  }`}
              >
                <span>View All Looks</span>
                <ArrowUpRight size={13} className="text-[#B58C36]" />
              </button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="scale-up" delay={340} duration={1200} className="relative w-full mb-10">

          <button
            onClick={() => handleScroll('left')}
            aria-label="Previous Look"
            className="carousel-side-arrow left absolute left-1 max-lg:-left-2 top-[40%] -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#1C1D21]/15 text-[#1C1D21] flex max-sm:hidden items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-[#1C1D21] hover:text-white hover:border-[#1C1D21] transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => handleScroll('right')}
            aria-label="Next Look"
            className="carousel-side-arrow right absolute right-1 max-lg:-right-2 top-[40%] -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#1C1D21]/15 text-[#1C1D21] flex max-sm:hidden items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-[#1C1D21] hover:text-white hover:border-[#1C1D21] transition-all duration-300"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={sliderRef}
            onScroll={updateIndexFromScroll}
            className="collections-slider-track flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2.5 px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredLooks.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedLook(item)}
                  className="group fashion-slider-card flex-[0_0_calc((100%-40px)/3)] max-[1080px]:flex-[0_0_calc((100%-20px)/2)] max-sm:flex-[0_0_85%] min-w-[min(100%,250px)] snap-start flex flex-col cursor-pointer rounded-2xl bg-white border border-[#DEC29D]/35 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-[#DEC29D] hover:-translate-y-[3px] overflow-hidden transition-all duration-500 box-border"
                >

                  <div className="relative w-full aspect-[3/3.8] overflow-hidden bg-[#EAE1CE]">
                    <img
                      src={item.image}
                      alt={`${item.title} - ${item.subtitle}`}
                      className="slider-card-img w-full h-full object-cover object-[center_12%] block transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    />

                    <div className="absolute top-3 left-3 bg-[#0d0e12]/80 backdrop-blur-sm text-[#DEC29D] font-sans text-[0.68rem] font-extrabold tracking-[0.08em] py-1 px-2.5 rounded-md border border-[#DEC29D]/30 z-[4]">
                      LOOK {item.lookNo}
                    </div>

                    <div className="slider-card-overlay absolute top-3 right-3 bg-white text-[#1C1D21] font-sans text-[0.68rem] font-extrabold tracking-[0.07em] uppercase py-1.5 px-3 rounded-full inline-flex items-center gap-1.5 border border-[#1C1D21]/12 shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-[5]">
                      <Eye size={12} color="#B58C36" />
                      <span>View Details</span>
                    </div>
                  </div>

                  <div className="p-[1.1rem_1.25rem_1.2rem_1.25rem] flex flex-col justify-between flex-1">
                    <div>

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-[0.72rem] font-bold tracking-[0.08em] uppercase text-[#8A6D2C]">
                          {item.category}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full inline-block border border-black/10"
                          style={{ background: item.colorHex }}
                        />
                      </div>

                      <h3 className="font-serif text-[clamp(1.15rem,1.3vw,1.28rem)] font-extrabold text-[#1C1D21] tracking-[0.01em] m-0 mb-1">
                        {item.title}
                      </h3>

                      <p className="font-sans text-[0.84rem] text-[#65676E] m-0 font-medium">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[#F0E8DA] flex items-center justify-between">
                      <span className="font-sans text-[0.74rem] text-[#8E9098]">
                        {item.fabric}
                      </span>
                      <div className="slider-card-explore inline-flex items-center gap-1 font-sans text-[0.76rem] font-bold text-[#1C1D21] group-hover:text-[#8A6D2C] transition-colors duration-300">
                        <span>Explore</span>
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2.5 mt-4">
            {filteredLooks.map((_, idx) => (
              <span
                key={idx}
                className={`h-[7px] rounded-full inline-block transition-all duration-500 ${currentIndex === idx ? 'w-6 bg-[#B58C36]' : 'w-[7px] bg-[#1C1D21]/20'
                  }`}
              />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200} duration={1100} className="collections-horizontal-cta mt-10 bg-gradient-to-br from-[#090A0D] via-[#12141C] to-[#0D0F14] rounded-2xl p-[clamp(1.4rem,3.5vw,2.5rem)_clamp(1.2rem,3.5vw,3rem)] flex flex-col xl:grid xl:grid-cols-[minmax(260px,1.2fr)_minmax(260px,1.4fr)_auto] gap-5 xl:gap-[clamp(1.5rem,2.5vw,3rem)] items-stretch xl:items-center text-white border border-[#DEC29D]/25 relative overflow-hidden box-border">

          <div className="relative z-[2] flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 mb-2 text-[#DEC29D] font-sans text-[0.72rem] font-extrabold tracking-[0.14em] uppercase">
              <TrendingUp size={14} color="#DEC29D" />
              <span>Become Part Of Our</span>
            </div>

            <h3 className="font-serif text-[clamp(1.75rem,2.8vw,2.7rem)] font-extrabold tracking-[0.01em] uppercase text-white leading-[1.08] m-0 mb-3">
              Growth <span className="text-[#DEC29D]">Story</span>
            </h3>

            <div className="inline-flex items-center gap-2 bg-white/5 border border-[#DEC29D]/22 py-1.5 px-3.5 rounded-lg max-w-full">
              <span className="font-sans text-[clamp(0.68rem,0.76vw,0.76rem)] font-semibold text-white/80 leading-snug">
                600+ Stores by 2027 • 2,000 Pan-India Stores by 2029
              </span>
            </div>
          </div>

          <div className="investor-card-middle relative z-[2] border-t border-[#DEC29D]/15 pt-4 xl:border-t-0 xl:border-l xl:pl-[clamp(1rem,2vw,2rem)] xl:pt-0 flex items-center">
            <p className="font-sans text-[clamp(0.85rem,0.92vw,0.98rem)] leading-[1.7] text-white/75 m-0 text-justify [text-justify:inter-word]">
              Partner with Cavree and capitalize on a rapidly expanding luxury retail network backed by robust omnichannel growth.
            </p>
          </div>

          <div className="investor-card-btn-col relative z-[2] flex justify-center xl:justify-end w-full xl:w-auto">
            <button
              type="button"
              onClick={() => navigate('/investment-model')}
              className="investor-cta-btn w-full xl:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#F8E29B] via-[#DEC29D] to-[#AA7C11] text-[#08090C] border-none font-sans text-[clamp(0.78rem,0.85vw,0.85rem)] font-bold tracking-[0.06em] uppercase py-3.5 px-8 rounded-xl text-center no-underline whitespace-nowrap transition-all duration-300 hover:brightness-110 shadow-none cursor-pointer"
            >
              <span>Become An Investor</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </ScrollReveal>
      </div>

      {showFullGallery && (
        <div
          ref={galleryScrollRef}
          data-lenis-prevent="true"
          className="full-screen-gallery-container fixed inset-0 w-full h-full bg-[#FAF6EE] z-[99999] overflow-y-auto overscroll-contain flex flex-col box-border"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          <div className="sticky top-0 z-[100] bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#DEC29D]/40 py-4 sm:py-5 px-[clamp(1rem,4vw,4rem)] flex items-center justify-between gap-4 sm:gap-6 flex-wrap">

            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#B58C36]/10 border border-[#B58C36]/25 py-1 px-3 rounded-full mb-1">
                <Sparkles size={11} color="#9E7E38" />
                <span className="font-sans text-[0.68rem] font-bold tracking-[0.12em] uppercase text-[#9E7E38]">
                  Cavree Atelier Lookbook
                </span>
              </div>

              <h2 className="font-serif text-[clamp(1.35rem,2.2vw,2.2rem)] font-extrabold m-0 text-[#1C1D21] leading-[1.1]">
                Couture <span className="text-[#B58C36] italic">Atelier</span> Anthology
              </h2>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 flex-nowrap ml-auto shrink min-w-0 max-w-full">
              <div className="flex gap-1.5 sm:gap-2 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 shrink min-w-0">
                {CATEGORIES.map((cat) => {
                  const isActive = galleryCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleGalleryCategorySelect(cat)}
                      className={`gallery-filter-btn font-sans text-[clamp(0.7rem,0.76vw,0.76rem)] font-bold tracking-[0.05em] uppercase py-1.5 sm:py-2 px-3 sm:px-4 rounded-full border transition-all duration-300 inline-flex items-center justify-center cursor-pointer shrink-0 whitespace-nowrap ${isActive
                          ? 'border-[1.5px] border-[#1C1D21] bg-[#1C1D21] text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                          : 'border-[#1C1D21]/15 bg-white text-[#4E5057] hover:border-[#1C1D21] hover:text-[#1C1D21] hover:bg-[#FAF6EE]'
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowFullGallery(false)}
                className="fullscreen-x-close-btn bg-white border border-[#1C1D21]/20 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#1C1D21] cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:bg-[#1C1D21] hover:text-white hover:border-[#1C1D21] hover:scale-105 transition-all duration-300 shrink-0"
                title="Close Full Screen"
                aria-label="Close Full Screen"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="py-[clamp(1.5rem,3.5vw,3.5rem)] px-[clamp(1rem,4vw,4.5rem)] max-w-[1600px] w-full mx-auto box-border">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-[clamp(1.2rem,2.5vw,2.2rem)]">
              {galleryFilteredLooks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedLook(item);
                  }}
                  className="group modal-gallery-card bg-white rounded-2xl overflow-hidden border border-[#DEC29D]/40 cursor-pointer shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(181,140,54,0.12),0_4px_12px_rgba(0,0,0,0.06)] hover:border-[#B58C36] hover:-translate-y-1 transition-all duration-400 flex flex-col"
                >

                  <div className="relative w-full aspect-[3/3.8] overflow-hidden bg-[#EAE1CE]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="modal-gallery-img w-full h-full object-cover object-[center_12%] block transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />

                    <div className="absolute top-3 left-3 bg-[#0d0e12]/80 backdrop-blur-sm text-[#DEC29D] font-sans text-[0.66rem] font-extrabold py-1 px-2.5 rounded-md border border-[#DEC29D]/30">
                      LOOK {item.lookNo}
                    </div>

                    <div className="modal-gallery-hover-pill absolute top-3 right-3 bg-white text-[#1C1D21] font-sans text-[0.66rem] font-extrabold tracking-[0.06em] uppercase py-1.5 px-3 rounded-full inline-flex items-center gap-1.5 border border-[#1C1D21]/12 shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Eye size={12} color="#B58C36" />
                      <span>View Details</span>
                    </div>
                  </div>

                  <div className="p-[1.1rem_1.25rem_1.2rem_1.25rem] flex flex-col justify-between flex-1">
                    <div>

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-[0.72rem] font-bold tracking-[0.08em] uppercase text-[#8A6D2C]">
                          {item.category}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full inline-block border border-black/10"
                          style={{ background: item.colorHex }}
                        />
                      </div>

                      <h4 className="font-serif text-[1.25rem] font-extrabold text-[#1C1D21] m-0 mb-1 leading-[1.15]">
                        {item.title}
                      </h4>

                      <p className="font-sans text-[0.84rem] text-[#65676E] m-0 font-medium">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[#F0E8DA] flex items-center justify-between">
                      <span className="font-sans text-[0.74rem] text-[#8E9098]">
                        {item.fabric}
                      </span>
                      <div className="inline-flex items-center gap-1 font-sans text-[0.76rem] font-bold text-[#1C1D21]">
                        <span>Explore</span>
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedLook && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 bg-[#07080C]/90 backdrop-blur-md z-[999999] flex items-center justify-center p-[clamp(0.75rem,2.5vw,2rem)] box-border"
          onClick={() => setSelectedLook(null)}
        >
          <div
            data-lenis-prevent="true"
            className="modal-container-grid bg-[#0D0E13] border border-[#DEC29D]/35 rounded-2xl max-w-[840px] w-full max-h-[90vh] overflow-hidden grid grid-cols-[44%_56%] max-lg:grid-cols-1 max-lg:max-h-[88vh] text-white relative shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setSelectedLook(null)}
              className="modal-close-icon-btn absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/10 border border-white/20 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white cursor-pointer z-20 hover:bg-white/25 hover:scale-105 transition-all duration-300"
              title="Close modal"
            >
              <X size={16} />
            </button>

            <div className="modal-image-col relative bg-[#151720] w-full h-full max-lg:h-[240px] max-sm:h-[180px] overflow-hidden">
              <img
                src={selectedLook.image}
                alt={selectedLook.title}
                className="w-full h-full object-cover object-[center_12%] block"
              />
              <div className="absolute top-3 left-3 bg-[#0d0e12]/85 backdrop-blur-md text-[#DEC29D] font-sans text-[0.7rem] font-extrabold tracking-[0.08em] py-1 px-2.5 rounded-md border border-[#DEC29D]/35">
                LOOK {selectedLook.lookNo}
              </div>
            </div>

            <div className="p-[clamp(1.1rem,2.5vw,2rem)] flex flex-col justify-between max-h-[90vh] overflow-y-auto box-border">
              <div>

                <div className="flex items-center gap-2 mb-2 pr-10">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: selectedLook.colorHex }}
                  />
                  <span className="font-sans text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#DEC29D]">
                    {selectedLook.category}
                  </span>
                </div>

                <h3 className="font-serif text-[clamp(1.35rem,2vw,2rem)] font-extrabold text-white m-0 mb-0.5 leading-[1.15]">
                  {selectedLook.title}
                </h3>

                <p className="font-sans text-[0.84rem] font-semibold text-[#DEC29D] m-0 mb-3">
                  {selectedLook.subtitle}
                </p>

                <p className="font-sans text-[0.82rem] leading-[1.6] text-white/80 m-0 mb-4">
                  {selectedLook.description}
                </p>

                <div className="bg-white/[0.03] border border-[#DEC29D]/20 rounded-xl p-3.5 mb-5 grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-white/50">Fabric:</span>
                    <span className="font-sans font-semibold text-white">{selectedLook.fabric}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-white/50">Silhouette:</span>
                    <span className="font-sans font-semibold text-white">{selectedLook.silhouette}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-white/50">Craftsmanship:</span>
                    <span className="font-sans font-semibold text-[#DEC29D]">{selectedLook.craft}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-white/50">Care:</span>
                    <span className="font-sans font-semibold text-white">{selectedLook.care}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLook(null);
                    navigate('/investment-model');
                  }}
                  className="modal-partner-btn w-full bg-[#DEC29D] text-[#08090C] border border-[#DEC29D]/40 font-sans text-[0.82rem] font-extrabold tracking-[0.07em] uppercase py-3 px-4 rounded-lg text-center no-underline inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white hover:text-[#08090C] hover:border-white cursor-pointer"
                >
                  <span>Partner With Us / Inquire Look</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CavreeCollections;
