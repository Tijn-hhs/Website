import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { blogPosts } from '../data/blogPosts'

export default function BlogOverviewPage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
        <section className="space-y-8">
          {/* Header */}
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Our Blog
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Blog Posts
            </h1>
            <p className="text-base text-slate-600">
              Insights, tips, and stories about international student life
            </p>
          </header>

          {/* Back to Dashboard Link */}
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/dashboard/blog/${post.id}`}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 overflow-hidden block"
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
                  <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>

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

          {/* Empty State (if no posts) */}
          {blogPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No blog posts available yet. Check back soon!</p>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  )
}
