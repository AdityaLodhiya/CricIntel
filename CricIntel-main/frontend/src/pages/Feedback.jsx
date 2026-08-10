import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const Feedback = () => {
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    category: 'General',
    subject: '',
    rating: 0,
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const categories = [
    'General', 'Bug Report', 'Feature Request', 'Prediction Accuracy', 'UI/UX'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.rating === 0) {
      alert('Please select a rating before submitting.')
      return
    }

    setSubmitted(true)

    setFormData({
      category: 'General',
      subject: '',
      rating: 0,
      message: ''
    })

    setTimeout(() => {
      setSubmitted(false)
    }, 4000)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRating = (num) => {
    setFormData({ ...formData, rating: num })
  }

  return (
    <div className="pb-20 font-inter space-y-8">

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-space font-black text-white mb-2 tracking-tight">Share Your Feedback</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl">Help us improve CricIntel.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="p-8 border border-white/10 rounded-2xl bg-white/5">

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <h3 className="text-2xl font-space font-black text-white">Thank You!</h3>
              <p className="text-gray-400 max-w-sm">
                Your feedback has been submitted successfully...
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-4 py-2 text-sm font-bold text-black bg-primary rounded-xl hover:opacity-90 transition-opacity"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feedback Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {categories.map((cat, i) => (
                      <option key={i} value={cat} className="bg-[#0A0B10]">{cat}</option>
                    ))}
                  </select>
                </div>


                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief summary..."
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>


              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Overall Experience Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRating(num)}
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all border ${formData.rating === num
                        ? 'bg-secondary border-secondary text-black'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <Star size={13} className={`mb-1 ${formData.rating >= num ? 'fill-current' : ''}`} />
                      <span className="text-[10px] font-bold">{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detailed Feedback</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={`Hi ${user?.first_name || 'there'}, what would you like to tell us?`}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 min-h-[140px] resize-y transition-colors"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button type="submit" className="px-8 py-2 bg-primary text-black text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Feedback
