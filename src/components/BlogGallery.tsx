import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { blogPosts } from '../data/blogPosts'

export default function BlogGallery() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const scrollAmount = 400
    const newScrollLeft = direction === 'left' 
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Student Life Blog
            </h2>
            <p className="text-lg text-slate-600">
              Tips, stories, and insights for international students
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!showLeftArrow}
              className={`p-2 rounded-full border ${
                showLeftArrow 
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              } transition-all duration-200`}
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!showRightArrow}
              className={`p-2 rounded-full border ${
                showRightArrow 
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              } transition-all duration-200`}
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Blog Gallery */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group flex-shrink-0 w-[350px] md:w-[400px] rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 overflow-hidden snap-start"
            >
              {/* Hero Image */}
              {post.imageUrl && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              
              {/* Post Content */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" />
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors group-hover:gap-3 duration-200">
                  Read Article
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="mt-4 text-center md:hidden">
          <p className="text-sm text-slate-500">
            ← Scroll to see more posts →
          </p>
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200"
          >
            View All Blog Posts
          </Link>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
