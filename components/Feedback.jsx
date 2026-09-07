'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const vp = { once: true, margin: '-60px' };

const SESSIONS = [
  'Olapade Dipo — The Legal Side of AI for Business and Career Growth',
  'Michael Toyinbo — Using AI to Drive Real Growth Across Multiple Markets',
  'Dara Sobaloju — Building with AI: How to Spot Problems Worth Solving',
  'Panel Session',
];

const HEAR_ABOUT_OPTIONS = [
  'Social Media',
  'Friend or Colleague',
  'Church / Ministry Announcement',
  'Email Newsletter',
  'Website',
  'Flyer or Poster',
  'Other',
];

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    session: '',
    feedback: '',
    improve: '',
    hearAbout: '',
    hearAboutOther: '',
    interested2027: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubmitted(false);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRating = (value) => {
    setSubmitted(false);
    setFormData(prev => ({ ...prev, rating: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong.');
      setSubmitted(true);
      setFormData({ name: '', email: '', rating: 0, session: '', feedback: '', improve: '', hearAbout: '', hearAboutOther: '', interested2027: '' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      document.getElementById('feedback-confirmation')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitted]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');

        .thrive * { box-sizing: border-box; margin: 0; padding: 0; }
        .thrive { font-family: 'Inter', sans-serif; background: #170f30; color: #e6e2f5; }
        .thrive h1, .thrive h2, .thrive h3, .thrive h4 { font-family: 'Syne', sans-serif; }

        .t-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8b84b5;
          margin-bottom: 10px;
        }

        .t-form-light .t-label { color: #77767e; }

        .t-btn-navy {
          display: inline-block;
          background: #fecb00;
          color: #17102e;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 12px 28px;
          border-radius: 4px;
          border: 1px solid #fecb00;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-navy:hover { background: #e0b400; border-color: #e0b400; }

        .t-btn-full {
          width: 100%;
          padding: 16px;
          font-size: 15px;
          display: block;
          text-align: center;
        }

        .t-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #fecb00;
          border-radius: 4px;
          background: #ffffff;
          color: #1b1c1a;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          outline: none;
          transition: border-width 0.1s;
          appearance: none;
          -webkit-appearance: none;
        }
        .t-input:focus { border-width: 2px; }

        textarea.t-input { resize: vertical; min-height: 96px; font-family: 'Inter', sans-serif; }

        select.t-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%23c99400' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }

        .t-divider { border: none; border-top: 1px solid #322559; margin: 0; }

        .t-nav-wordmark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; color: #fbf9f6; letter-spacing: -0.01em; }
        .t-nav-wordmark span { color: #fecb00; }
        .t-nav-sub { font-size: 10px; color: #8b84b5; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 2px; }

        .t-star-btn { background: none; border: none; padding: 4px; cursor: pointer; line-height: 0; }

        .t-badge-teal {
          display: inline-block;
          background: #009898;
          color: #fbf9f6;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 2px;
        }
      `}</style>

      <div className="thrive">

        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: '#12092a', borderBottom: '2px solid #fecb00'
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <div className="t-nav-wordmark">THRIVE <span>CONFERENCE</span></div>
              <p className="t-nav-sub">by Thrive Initiatives · Christ Unfolding Ministries</p>
            </a>
          </div>
        </nav>

        <div style={{ paddingTop: 68 }}>

          {/* HERO */}
          <section style={{ background: '#170f30', padding: 'clamp(64px, 10vw, 96px) 24px 48px' }}>
            <motion.div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }} variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
                <span className="t-badge-teal">We'd Love Your Feedback</span>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 'clamp(32px, 5vw, 48px)', color: '#fbf9f6',
                lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16
              }}>
                Tell Us About Your Experience
              </motion.h1>
              <motion.p variants={fadeUp} style={{ fontSize: 16, color: '#c9c3e8', lineHeight: 1.7 }}>
                Thank you for attending the Thrive Conference. A couple of minutes of your feedback helps us make the next one even better.
              </motion.p>
            </motion.div>
          </section>

          <hr className="t-divider" />

          {/* FEEDBACK FORM */}
          <section style={{ background: '#170f30', padding: 'clamp(48px, 8vw, 80px) 24px' }} id="feedback-form">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>

              {submitted && (
                <div id="feedback-confirmation" style={{ marginBottom: 32, borderRadius: 4, overflow: 'hidden', textAlign: 'center', border: '2px solid #fecb00' }}>
                  <div style={{ background: '#002626', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <CheckCircle color="#22dcdc" size={22} />
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#22dcdc', margin: 0 }}>Thank You!</h3>
                  </div>
                  <div style={{ background: '#fecb00', padding: '36px 32px' }}>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#17102e', letterSpacing: '-0.01em', marginBottom: 10 }}>
                      Feedback Received
                    </h4>
                    <p style={{ color: '#4a4066', fontSize: 14, lineHeight: 1.6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', marginBottom: 24 }}>
                      We really appreciate you taking the time. See you at the next one!
                    </p>
                    <div style={{ borderTop: '1px solid rgba(23, 16, 46, 0.15)', paddingTop: 24 }}>
                      <p style={{ color: '#17102e', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
                        Have you registered for the Thrive Digital Skills Training?
                      </p>
                      <a
                        href="https://thrive.crumglobal.org/skills-training"
                        className="t-btn-navy"
                        style={{ background: '#17102e', borderColor: '#17102e', color: '#fecb00', textDecoration: 'none' }}
                      >
                        Register Now
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div style={{ marginBottom: 32, background: '#fff0f0', border: '2px solid #cc0000', borderRadius: 4, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: '#cc0000', fontSize: 15 }}>{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="t-form-light" style={{ border: '2px solid #fecb00', borderRadius: 4, padding: 40, background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label className="t-label">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="t-input" placeholder="Your name" />
                </div>
                <div>
                  <label className="t-label">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="t-input" placeholder="your.email@example.com" />
                </div>
                <div>
                  <label className="t-label">Rate the Conference *</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        className="t-star-btn"
                        onClick={() => handleRating(n)}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={30}
                          color="#c99400"
                          fill={n <= formData.rating ? '#fecb00' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="t-label">Which session did you enjoy most? *</label>
                  <select name="session" value={formData.session} onChange={handleInputChange} required className="t-input">
                    <option value="" disabled>Select a session</option>
                    {SESSIONS.map(session => (
                      <option key={session} value={session}>{session}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="t-label">Any other feedback?</label>
                  <textarea name="feedback" value={formData.feedback} onChange={handleInputChange} className="t-input" placeholder="What stood out to you?" rows={3} />
                </div>
                <div>
                  <label className="t-label">What could we improve?</label>
                  <textarea name="improve" value={formData.improve} onChange={handleInputChange} className="t-input" placeholder="Be honest, we can take it" rows={3} />
                </div>
                <div>
                  <label className="t-label">How did you get to know about Thrive Conference?</label>
                  <select name="hearAbout" value={formData.hearAbout} onChange={handleInputChange} className="t-input">
                    <option value="" disabled>Select an option</option>
                    {HEAR_ABOUT_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {formData.hearAbout === 'Other' && (
                    <input
                      type="text"
                      name="hearAboutOther"
                      value={formData.hearAboutOther}
                      onChange={handleInputChange}
                      className="t-input"
                      placeholder="Please specify"
                      style={{ marginTop: 10 }}
                    />
                  )}
                </div>
                <div>
                  <label className="t-label">Would you like to be a part of Thrive Conference 2027?</label>
                  <select name="interested2027" value={formData.interested2027} onChange={handleInputChange} className="t-input">
                    <option value="" disabled>Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Maybe">Maybe</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting || submitted || !formData.rating}
                  className="t-btn-navy t-btn-full"
                  style={{
                    marginTop: 8,
                    background: submitted ? '#009898' : undefined,
                    borderColor: submitted ? '#009898' : undefined,
                    color: submitted ? '#fbf9f6' : undefined,
                    opacity: (submitting || !formData.rating) ? 0.6 : 1,
                    cursor: (submitting || submitted || !formData.rating) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s, border-color 0.3s'
                  }}
                >
                  {submitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ background: '#0c0620', borderTop: '3px solid #fecb00' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
              <p style={{ textAlign: 'center', color: '#6b628f', fontSize: 12 }}>© 2026 Thrive Initiatives · Christ Unfolding Ministries. All rights reserved.</p>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
