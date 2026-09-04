'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
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

const TRACKS = [
  { value: 'ai-automation', title: 'AI & AI Automation', facilitator: 'Steward David' },
  { value: 'video-editing', title: 'Video Editing & AI Video Content', facilitator: 'Steward Boluwatife' },
  { value: 'copywriting', title: 'Copywriting & Content Writing', facilitator: 'Steward Testimony' },
  { value: 'graphic-design', title: 'Graphic Designing', facilitator: 'Bro Hope' },
  { value: 'ui-ux', title: 'UI/UX Designing', facilitator: 'Bro Julius' },
  { value: 'social-media', title: 'Social Media Management', facilitator: 'Steward Deborah' },
];

export default function SkillsTraining() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    track: '',
    experience: 'beginner',
    videoLink: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubmitted(false);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/skills-training-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong.');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', track: '', experience: 'beginner', videoLink: '' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      document.getElementById('registration-confirmation')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitted]);

  const scrollToForm = () => {
    document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTracks = () => {
    document.getElementById('tracks').scrollIntoView({ behavior: 'smooth' });
  };

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

        .t-btn-navy-lg {
          display: inline-block;
          background: #fecb00;
          color: #17102e;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 18px 44px;
          border-radius: 4px;
          border: 2px solid #fecb00;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-navy-lg:hover { background: #e0b400; border-color: #e0b400; }

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

        select.t-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%23c99400' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }

        .t-check { accent-color: #c99400; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }

        .t-divider { border: none; border-top: 1px solid #322559; margin: 0; }

        .t-nav-wordmark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; color: #fbf9f6; letter-spacing: -0.01em; }
        .t-nav-wordmark span { color: #fecb00; }
        .t-nav-sub { font-size: 10px; color: #8b84b5; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 2px; }
        .t-nav-btn { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; background: #fecb00; color: #17102e; border: 1px solid #fecb00; border-radius: 4px; cursor: pointer; transition: background 0.15s; white-space: nowrap; padding: 12px 28px; }
        .t-nav-btn:hover { background: #e0b400; }
        @media (max-width: 600px) {
          .t-nav-sub { display: none; }
          .t-nav-btn { padding: 10px 14px; font-size: 11px; }
          .t-nav-wordmark { font-size: 17px; }
        }

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
            <div>
              <div className="t-nav-wordmark">THRIVE <span>SKILLS</span></div>
              <p className="t-nav-sub">by Thrive Initiatives · Christ Unfolding Ministries</p>
            </div>
            <button onClick={scrollToForm} className="t-nav-btn">Register Now</button>
          </div>
        </nav>

        <div style={{ paddingTop: 68 }}>

          {/* HERO */}
          <section style={{ background: '#170f30', padding: 'clamp(64px, 10vw, 120px) 24px' }}>
            <motion.div style={{ maxWidth: 800, margin: '0 auto' }} variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
                <span className="t-badge-teal">Free · 6 Weeks · Online · Starts September 20, 2026</span>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 'clamp(40px, 6vw, 72px)', color: '#fbf9f6',
                lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20
              }}>
                Build a digital skill that lets you <span style={{ color: '#fecb00' }}>thrive</span> in this AI era
              </motion.h1>
              <motion.p variants={fadeUp} style={{ fontSize: 'clamp(17px, 2.2vw, 20px)', color: '#c9c3e8', marginBottom: 24, lineHeight: 1.65 }}>
                A 6-week online training across six in-demand digital skill tracks, taught live by practitioners.
              </motion.p>
              <motion.p variants={fadeUp} style={{ fontSize: 16, color: '#9088b8', marginBottom: 48, lineHeight: 1.8, maxWidth: 640 }}>
                Thrive Digital Skills Training picks up where the conversation about AI and career growth leaves off. Pick one track, show up twice a week, and walk away with a real project and a real skill. No experience required to start.
              </motion.p>
              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button onClick={scrollToForm} className="t-btn-navy-lg">Register Now</button>
                <button onClick={scrollToTracks} style={{
                  background: 'transparent', color: '#c9c3e8',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '18px 44px', borderRadius: 4, border: '1px solid #443a75',
                  cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                  lineHeight: 1
                }}>See the Tracks</button>
              </motion.div>
            </motion.div>
          </section>

          <hr className="t-divider" />

          {/* PROGRAM OVERVIEW */}
          <section style={{ background: '#1e1543', padding: '72px 24px' }}>
            <motion.div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}
              variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
              {[
                { label: 'Starts', title: 'Saturday, Sept 20, 2026', sub: 'Ends last week of October' },
                { label: 'Format', title: 'Online · Twice a week', sub: 'Weekends · 2 hrs/session' },
                { label: 'Cost', title: 'Free', sub: 'Open to all skill levels' },
              ].map(item => (
                <motion.div key={item.label} variants={fadeUp} style={{ borderLeft: '2px solid #fecb00', paddingLeft: 20 }}>
                  <span className="t-label">{item.label}</span>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 19, color: '#fbf9f6', marginBottom: 4 }}>{item.title}</p>
                  <p style={{ color: '#c9c3e8', fontSize: 14 }}>{item.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <hr className="t-divider" />

          {/* TRACKS */}
          <section id="tracks" style={{ background: '#170f30', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
                <motion.span variants={fadeUp} className="t-label" style={{ display: 'block' }}>Tracks</motion.span>
                <motion.h2 variants={fadeUp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#fbf9f6', letterSpacing: '-0.01em', marginBottom: 16 }}>
                  Choose Your Track
                </motion.h2>
                <motion.p variants={fadeUp} style={{ fontSize: 16, color: '#c9c3e8', lineHeight: 1.8, marginBottom: 48, maxWidth: 640 }}>
                  Six tracks, each led by a facilitator actively working in that field. Pick the one skill you want to go deep on.
                </motion.p>
              </motion.div>
              <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
                {TRACKS.map((track, i) => (
                  <motion.div key={track.value} variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24, padding: '28px 0', borderBottom: i < TRACKS.length - 1 ? '1px solid #2c2354' : 'none' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#fecb00', letterSpacing: '0.06em', paddingTop: 4 }}>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#fbf9f6' }}>{track.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* PROGRAM STRUCTURE */}
          <section style={{ background: '#1e1543', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <motion.span variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-label" style={{ display: 'block' }}>Structure</motion.span>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#fbf9f6', letterSpacing: '-0.01em', marginBottom: 56 }}>
                What to Expect
              </motion.h2>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
                {[
                  { title: 'Orientation Call', desc: 'A general kickoff call on the first Saturday, September 20, to meet your facilitator and cohort.' },
                  { title: 'Weekly Classes & Assignments', desc: 'Two 2-hour live sessions a week, mostly on weekends, with at least one assignment or project each week.' },
                  { title: 'Final Project', desc: 'One major project applying what you learned, submitted in the last week of training.' },
                  { title: 'Closing Call', desc: 'A general closing call in the last week of October to wrap up the cohort.' },
                ].map((item, i, arr) => (
                  <motion.div key={i} variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 20, padding: '28px 0', borderBottom: i < arr.length - 1 ? '1px solid #3a2f66' : 'none' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#fecb00', paddingTop: 2 }}>→</span>
                    <div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#fbf9f6', marginBottom: 6 }}>{item.title}</h3>
                      <p style={{ color: '#c9c3e8', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* REGISTRATION FORM */}
          <section style={{ background: '#170f30', padding: 'clamp(64px, 8vw, 96px) 24px' }} id="registration-form">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <motion.span variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-label" style={{ textAlign: 'center', display: 'block' }}>Register</motion.span>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#fbf9f6', letterSpacing: '-0.01em', textAlign: 'center', marginBottom: 12 }}>
                Reserve Your Spot
              </motion.h2>
              <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ textAlign: 'center', color: '#c9c3e8', fontSize: 15, marginBottom: 48 }}>
                Pick a track below. We'll follow up with the class link, schedule, and facilitator details.
              </motion.p>

              {submitted && (
                <div id="registration-confirmation" style={{ marginBottom: 32, borderRadius: 4, overflow: 'hidden', textAlign: 'center', border: '2px solid #fecb00' }}>
                  <div style={{ background: '#002626', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <CheckCircle color="#22dcdc" size={22} />
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#22dcdc', margin: 0 }}>You're In!</h3>
                  </div>
                  <div style={{ background: '#fecb00', padding: '36px 32px' }}>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#17102e', letterSpacing: '-0.01em', marginBottom: 10 }}>
                      We'll be in touch
                    </h4>
                    <p style={{ color: '#4a4066', fontSize: 14, lineHeight: 1.6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                      Class link, schedule, and facilitator details for your track will be shared by email or phone closer to September 20.
                    </p>
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
                  <label className="t-label">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="t-input" placeholder="+234 or your country code" />
                </div>
                <div>
                  <label className="t-label">Which skill are you interested in learning? *</label>
                  <select name="track" value={formData.track} onChange={handleInputChange} required className="t-input">
                    <option value="" disabled>Select a skill</option>
                    {TRACKS.map(track => (
                      <option key={track.value} value={track.title}>{track.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="t-label">Your experience level *</label>
                  <select name="experience" value={formData.experience} onChange={handleInputChange} className="t-input">
                    <option value="beginner">Beginner: Just getting started</option>
                    <option value="intermediate">Intermediate: Some experience</option>
                    <option value="advanced">Advanced: Heavy experience</option>
                  </select>
                </div>
                <div>
                  <label className="t-label">Link to a 30-second video telling us why you want to join *</label>
                  <input type="url" name="videoLink" value={formData.videoLink} onChange={handleInputChange} required className="t-input" placeholder="YouTube, Google Drive, Loom, etc." />
                </div>
                <button type="submit" disabled={submitting || submitted} className="t-btn-navy t-btn-full" style={{
                  marginTop: 8,
                  background: submitted ? '#009898' : undefined,
                  borderColor: submitted ? '#009898' : undefined,
                  color: submitted ? '#fbf9f6' : undefined,
                  opacity: submitting ? 0.6 : 1,
                  cursor: (submitting || submitted) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s, border-color 0.3s'
                }}>
                  {submitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Register Now'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#77767e', letterSpacing: '0.02em' }}>
                  Cohort begins Saturday, September 20, 2026.
                </p>
              </form>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ background: '#0c0620', borderTop: '3px solid #fecb00' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px 80px', marginBottom: 56 }}>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#fbf9f6', letterSpacing: '-0.01em', marginBottom: 10 }}>
                    THRIVE DIGITAL SKILLS TRAINING
                  </p>
                  <p style={{ color: '#9088b8', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
                    Six Weeks. Six Tracks. One New Skill.
                  </p>
                  <div style={{ width: 36, height: 2, background: '#fecb00', marginBottom: 24 }} />
                  <p style={{ color: '#9088b8', fontSize: 14, lineHeight: 1.8 }}>
                    Presented by <strong style={{ color: '#c9c3e8' }}>Thrive Initiatives</strong>
                    <br />an arm of <strong style={{ color: '#c9c3e8' }}>Christ Unfolding Ministries</strong>
                  </p>
                </div>

                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fecb00', marginBottom: 14 }}>Program Details</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36, borderLeft: '2px solid #fecb00', paddingLeft: 16 }}>
                    <p style={{ color: '#fbf9f6', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Starts Saturday, September 20, 2026</p>
                    <p style={{ color: '#c9c3e8', fontSize: 14 }}>Online · Twice weekly · Ends last week of October 2026</p>
                    <span style={{ display: 'inline-block', width: 'fit-content', marginTop: 4, background: '#009898', color: '#fbf9f6', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2 }}>Free</span>
                  </div>

                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fecb00', marginBottom: 14 }}>Connect</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <a href="https://x.com/Thrivebycrum" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c9c3e8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      @Thrivebycrum
                    </a>
                    <a href="https://instagram.com/Thrive_initiatives" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c9c3e8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      @Thrive_initiatives
                    </a>
                    <a href="tel:09064846706" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c9c3e8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      09064846706
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #322559', paddingTop: 24, textAlign: 'center' }}>
                <p style={{ color: '#6b628f', fontSize: 12 }}>© 2026 Thrive Initiatives · Christ Unfolding Ministries. All rights reserved.</p>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
