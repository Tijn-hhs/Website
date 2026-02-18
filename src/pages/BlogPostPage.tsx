import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import FeedbackWidget from '../components/FeedbackWidget'
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react'
import { blogPosts, type BlogPost } from '../data/blogPosts'

export default function BlogPostPage() {
  const { postId } = useParams<{ postId: string }>()
  const [blogPost, setBlogPost] = useState<BlogPost | null | undefined>(undefined)

  useEffect(() => {
    // Find the blog post by ID
    if (postId) {
      const post = blogPosts.find((p) => p.id === postId)
      setBlogPost(post || null)
    }
  }, [postId])

  // If no postId provided, redirect to blog overview
  if (!postId) {
    return <Navigate to="/blog" replace />
  }

  // Still loading
  if (blogPost === undefined) {
    return null
  }

  // If post not found, redirect to blog overview
  if (blogPost === null) {
    return <Navigate to="/blog" replace />
  }

  return (
    <>
      <FeedbackWidget />
      <div className="bg-white min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="max-w-4xl mx-auto space-y-8">
          {/* Hero Image */}
          {blogPost.imageUrl && (
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={blogPost.imageUrl}
                alt={blogPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Blog Header */}
          <header className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Blog Post
              </p>
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl leading-tight">
                {blogPost.title}
              </h1>
            </div>

            {/* Blog Meta Information */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                <time dateTime={blogPost.date}>
                  {new Date(blogPost.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-blue-500" />
                <span>{blogPost.author}</span>
              </div>
            </div>
          </header>

          {/* Divider */}
          <hr className="border-slate-200" />

          {/* Blog Content */}
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          {/* Metadata Section */}
          {blogPost.metadata && (
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50 border border-slate-200/70 shadow-sm">
              <div className="flex items-start gap-3">
                <Tag size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Topics
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {blogPost.metadata}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back to Blog Button */}
          <div className="pt-8 pb-12 flex gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:shadow-md"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:shadow-md"
            >
              Home
            </Link>
          </div>
        </article>
        </div>
      </div>
    </>
  )
}
