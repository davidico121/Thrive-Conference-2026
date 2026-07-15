'use client';

import React, { useState } from 'react';
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

export default function ThriveConference() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'student',
    occupation: '',
    inTech: 'no',
    techAreas: [],
    aiKnowledge: 'beginner',
    marketingSalesKnowledge: 'beginner'
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false);
  const [volunteerSubmitting, setVolunteerSubmitting] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubmitted(false);
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        techAreas: checked
          ? [...prev.techAreas, value]
          : prev.techAreas.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong.');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', status: 'student', occupation: '', inTech: 'no', techAreas: [], aiKnowledge: 'beginner', marketingSalesKnowledge: 'beginner' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerSubmitting(true);
    setVolunteerError('');
    const fd = new FormData(e.target);
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('vol-name'),
          email: fd.get('vol-email'),
          phone: fd.get('vol-phone'),
          role: fd.get('volunteer-role'),
          availability: fd.get('availability'),
          experience: fd.get('experience'),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong.');
      setVolunteerSubmitted(true);
    } catch (err) {
      setVolunteerError(err.message);
    } finally {
      setVolunteerSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSpeakers = () => {
    document.getElementById('speakers').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');

        .thrive * { box-sizing: border-box; margin: 0; padding: 0; }
        .thrive { font-family: 'Inter', sans-serif; background: #fbf9f6; color: #1b1c1a; }
        .thrive h1, .thrive h2, .thrive h3, .thrive h4 { font-family: 'Syne', sans-serif; }

        .t-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #77767e;
          margin-bottom: 10px;
        }

        .t-btn-navy {
          display: inline-block;
          background: #1a1f3a;
          color: #fbf9f6;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 12px 28px;
          border-radius: 4px;
          border: 1px solid #1a1f3a;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-navy:hover { background: #030722; border-color: #030722; }

        .t-btn-navy-lg {
          display: inline-block;
          background: #1a1f3a;
          color: #fbf9f6;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 18px 44px;
          border-radius: 4px;
          border: 2px solid #1a1f3a;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-navy-lg:hover { background: #030722; border-color: #030722; }

        .t-btn-cream {
          display: inline-block;
          background: #fbf9f6;
          color: #1a1f3a;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 18px 44px;
          border-radius: 4px;
          border: 1px solid #fbf9f6;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-cream:hover { background: #f5f3f0; border-color: #f5f3f0; }

        .t-btn-gold {
          display: inline-block;
          background: #7c572d;
          color: #fbf9f6;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 12px 28px;
          border-radius: 4px;
          border: 1px solid #7c572d;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-gold:hover { background: #614018; border-color: #614018; }

        .t-btn-gold-lg {
          display: block;
          width: 100%;
          background: #7c572d;
          color: #fbf9f6;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 16px 44px;
          border-radius: 4px;
          border: 1px solid #7c572d;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .t-btn-gold-lg:hover { background: #614018; }

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
          border: 1px solid #1a1f3a;
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

        .t-input-gold {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #7c572d;
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
        .t-input-gold:focus { border-width: 2px; }

        .t-radio { accent-color: #1a1f3a; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
        .t-radio-gold { accent-color: #7c572d; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
        .t-check { accent-color: #1a1f3a; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }

        .t-divider { border: none; border-top: 1px solid #1a1f3a; margin: 0; }

        .t-nav-wordmark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; color: #1a1f3a; letter-spacing: -0.01em; }
        .t-nav-wordmark span { color: #7c572d; }
        .t-nav-sub { font-size: 10px; color: #77767e; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 2px; }
        .t-nav-btn { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; background: #1a1f3a; color: #fbf9f6; border: 1px solid #1a1f3a; border-radius: 4px; cursor: pointer; transition: background 0.15s; white-space: nowrap; padding: 12px 28px; }
        .t-nav-btn:hover { background: #030722; }
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

        .t-speaker-card {
          display: grid;
          grid-template-columns: minmax(120px, 160px) 1fr;
          gap: 40px;
        }
        .t-speaker-card::after { content: ''; display: table; clear: both; }

        @media (max-width: 600px) {
          .t-speaker-card { display: block; }
          .t-speaker-photo { float: left; width: 100px; margin: 0 18px 12px 0; }
          .t-speaker-photo-caption { display: none; }
        }
      `}</style>

      <div className="thrive">

        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: '#fbf9f6', borderBottom: '2px solid #1a1f3a'
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="t-nav-wordmark">THRIVE <span>CONF</span></div>
              <p className="t-nav-sub">by Thrive Initiatives · Christ Unfolding Ministries</p>
            </div>
            <button onClick={scrollToForm} className="t-nav-btn">Secure Your Spot</button>
          </div>
        </nav>

        <div style={{ paddingTop: 68 }}>

          {/* HERO */}
          <section style={{ background: '#1a1f3a', padding: 'clamp(64px, 10vw, 120px) 24px' }}>
            <motion.div style={{ maxWidth: 800, margin: '0 auto' }} variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
                <span className="t-badge-teal">Free Event · July 25, 2026</span>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 'clamp(40px, 6vw, 72px)', color: '#fbf9f6',
                lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20
              }}>
                Discover what it takes to thrive in this AI Era
              </motion.h1>
              <motion.p variants={fadeUp} style={{ fontSize: 'clamp(17px, 2.2vw, 20px)', color: '#c0c4e8', marginBottom: 24, lineHeight: 1.65 }}>
                From business growth to career advancement and faith-driven success.
              </motion.p>
              <motion.p variants={fadeUp} style={{ fontSize: 16, color: '#8286a7', marginBottom: 48, lineHeight: 1.8, maxWidth: 640 }}>
                AI isn't coming to make you jobless. It's already here. The people winning are the ones who understand it well enough to actually use it. Not fear it. Not pretend it doesn't exist. Learn from the people already using AI to make a real impact in their industry.
              </motion.p>
              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button onClick={scrollToForm} className="t-btn-cream">Secure Your Seat</button>
                <button onClick={scrollToSpeakers} style={{
                  background: 'transparent', color: '#c0c4e8',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '18px 44px', borderRadius: 4, border: '1px solid #404562',
                  cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                  lineHeight: 1
                }}>Meet Our Speakers</button>
              </motion.div>
            </motion.div>
          </section>

          <hr className="t-divider" />

          {/* EVENT DETAILS */}
          <section style={{ background: '#fbf9f6', padding: '72px 24px' }}>
            <motion.div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}
              variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
              {[
                { label: 'When', title: 'July 25, 2026', sub: '10:00 AM' },
                { label: 'Where', title: 'Christ Unfolding Place', sub: 'Sherry Supermarket, Oluseyi Bus-Stop, Eleyele-Poly Road, Ibadan' },
                { label: 'Cost', title: 'Free', sub: 'Register by June 30.' },
              ].map(item => (
                <motion.div key={item.label} variants={fadeUp} style={{ borderLeft: '2px solid #1a1f3a', paddingLeft: 20 }}>
                  <span className="t-label">{item.label}</span>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 19, color: '#1a1f3a', marginBottom: 4 }}>{item.title}</p>
                  <p style={{ color: '#46464d', fontSize: 14 }}>{item.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <hr className="t-divider" />

          {/* WHY ATTEND */}
          <section style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
              <motion.span variants={fadeUp} className="t-label" style={{ display: 'block' }}>Why Attend</motion.span>
              <motion.h2 variants={fadeUp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', marginBottom: 16 }}>
                Why should you attend Thrive Conference?
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: 16, color: '#46464d', lineHeight: 1.8, marginBottom: 48, maxWidth: 640 }}>
                A conference by Thrive Initiatives (an arm of Christ Unfolding Ministries), designed for professionals, business owners, and students who are done watching others lead while they sit on the sidelines.
              </motion.p>
              </motion.div>
              <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
                {[
                  {
                    title: 'Learn from Top AI Innovators & Sales Experts',
                    desc: 'Hear directly from innovators who are leveraging AI to build thriving businesses and advance their careers.'
                  },
                  {
                    title: 'Build Your Network',
                    desc: 'Connect with 300+ like-minded professionals, entrepreneurs, students, and business owners.'
                  },
                  {
                    title: 'Invest in Your Most Important Asset',
                    desc: 'Your career and skills are your greatest wealth builder. Spend one day upgrading your knowledge and positioning yourself for the opportunities coming in 2026 and beyond.'
                  },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 20, padding: '28px 0', borderBottom: '1px solid #e8e6e3' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#7c572d', paddingTop: 2 }}>→</span>
                    <div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#1a1f3a', marginBottom: 6 }}>{item.title}</h3>
                      <p style={{ color: '#46464d', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* SPEAKERS */}
          <section id="speakers" style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <motion.span variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-label" style={{ display: 'block' }}>Speakers</motion.span>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', marginBottom: 56 }}>
                Meet Your Speakers
              </motion.h2>

              {/* Dara */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-speaker-card" style={{ marginBottom: 56, paddingBottom: 56, borderBottom: '1px solid #c7c5ce' }}>
                <div className="t-speaker-photo">
                  <div style={{ border: '2px solid #1a1f3a', borderRadius: 4, aspectRatio: '1', overflow: 'hidden' }}>
                    <img src="/dara-sobaloju.jpg" alt="Dara Sobaloju" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#1a1f3a', marginBottom: 4 }}>Dara Sobaloju</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#7c572d', marginBottom: 24 }}>Built Pewbeam AI</p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 16, fontSize: 15 }}>
                    Started as a tweet: "I want to build a Bible presentation AI for churches." Six months later, Pewbeam was live. It listens in real time, matches Bible verses to what's being said, and works offline.
                  </p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 20, fontSize: 15 }}>
                    <strong style={{ color: '#1a1f3a' }}>Why he's speaking:</strong> Dara's work shows how AI can solve real problems for real communities. He'll walk you through how he thinks about building with AI: how he spots problems worth solving and how he actually ships.
                  </p>
                  <div style={{ borderLeft: '2px solid #7c572d', paddingLeft: 16 }}>
                    <p style={{ color: '#46464d', fontSize: 14, fontStyle: 'italic' }}>
                      "To ensure the Church is not left behind in the AI era." This is the mission behind Pewbeam.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Michael */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-speaker-card">
                <div className="t-speaker-photo">
                  <div style={{ border: '2px solid #1a1f3a', borderRadius: 4, aspectRatio: '1', overflow: 'hidden' }}>
                    <img src="/michael-toyinbo.jpg" alt="Micheal Toyinbo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#1a1f3a', marginBottom: 4 }}>Micheal Toyinbo</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#7c572d', marginBottom: 24 }}>Director of Expansion, Planning & Strategy · Chowdeck</p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 16, fontSize: 15 }}>
                    Micheal is currently leading growth and strategic planning for Chowdeck across Nigeria and Ghana. He brings expertise in scaling, operations, and navigating complex business environments while maintaining operational excellence.
                  </p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 20, fontSize: 15 }}>
                    <strong style={{ color: '#1a1f3a' }}>Why he's speaking:</strong> He's not a futurist talking about what AI could do someday. He's actively using it to drive real growth across multiple markets right now. He'll share what actually moves the needle.
                  </p>
                  <div style={{ borderLeft: '2px solid #009898', paddingLeft: 16 }}>
                    <p style={{ color: '#46464d', fontSize: 14, fontStyle: 'italic' }}>
                      Tactical insights from someone scaling a real business across Nigeria and Ghana with AI.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* WHAT TO EXPECT */}
          <section style={{ background: '#1a1f3a', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <motion.span variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-label" style={{ color: '#6b6f8a', display: 'block' }}>Programme</motion.span>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#fbf9f6', letterSpacing: '-0.01em', marginBottom: 56 }}>
                What to Expect
              </motion.h2>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
              {[
                { n: '01', title: 'Keynote Addresses', desc: 'Hear directly from AI innovators and growth leaders on what is actually working right now.' },
                { n: '02', title: 'Panel Discussions', desc: 'Real conversations about real challenges: AI adoption, business growth, and navigating the new world of work.' },
                { n: '03', title: 'Networking Breaks', desc: 'Connect with 300+ professionals, entrepreneurs, students and business owners who are serious about thriving.' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24, padding: '28px 0', borderBottom: i < 2 ? '1px solid #2d3250' : 'none' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#6b6f8a', letterSpacing: '0.06em', paddingTop: 4 }}>{item.n}</span>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#fbf9f6', marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ color: '#c0c4e8', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
              </motion.div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* READY TO THRIVE CTA */}
          <section style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px', textAlign: 'center' }}>
            <motion.div style={{ maxWidth: 640, margin: '0 auto' }} variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
              <motion.span variants={fadeUp} className="t-label" style={{ textAlign: 'center', display: 'block' }}>July 25, 2026</motion.span>
              <motion.h2 variants={fadeUp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1f3a', letterSpacing: '-0.02em', marginBottom: 20 }}>
                Ready to Thrive?
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#46464d', lineHeight: 1.8, marginBottom: 40 }}>
                Secure your spot now and invest in your growth, career and future.
              </motion.p>
              <motion.div variants={fadeUp}>
                <button onClick={scrollToForm} className="t-btn-navy-lg">Secure Your Spot</button>
              </motion.div>
            </motion.div>
          </section>

          {/* URGENCY STRIP */}
          <div style={{ background: '#002626', borderTop: '2px solid #009898', borderBottom: '2px solid #009898', padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#22dcdc', letterSpacing: '0.04em' }}>
              Registration closes June 30, 2026 · Limited spots available
            </p>
            <p style={{ color: '#54f9f9', marginTop: 6, fontSize: 13, opacity: 0.75, letterSpacing: '0.02em' }}>
              Secure your spot now. Spots are filling up.
            </p>
          </div>

          {/* REGISTRATION FORM */}
          <section style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px' }} id="registration-form">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <motion.span variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-label" style={{ textAlign: 'center', display: 'block' }}>Register</motion.span>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', textAlign: 'center', marginBottom: 12 }}>
                Secure Your Spot
              </motion.h2>
              <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ textAlign: 'center', color: '#46464d', fontSize: 15, marginBottom: 48 }}>
                One morning. Two speakers. Everything changes.
              </motion.p>

              {submitted && (
                <div style={{ marginBottom: 32, background: '#002626', border: '2px solid #009898', borderRadius: 4, padding: 32, textAlign: 'center' }}>
                  <CheckCircle color="#22dcdc" size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#22dcdc', marginBottom: 8 }}>You're In!</h3>
                  <p style={{ color: '#54f9f9', fontSize: 15 }}>You're registered. See you July 25.</p>
                </div>
              )}

              {submitError && (
                <div style={{ marginBottom: 32, background: '#fff0f0', border: '2px solid #cc0000', borderRadius: 4, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: '#cc0000', fontSize: 15 }}>{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ border: '2px solid #1a1f3a', borderRadius: 4, padding: 40, background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                  <label className="t-label" style={{ marginBottom: 14 }}>I am a *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    {[
                      { value: 'student', label: 'Student' },
                      { value: 'worker', label: 'Working Professional' },
                      { value: 'entrepreneur', label: 'Entrepreneur' },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="status" value={opt.value} checked={formData.status === opt.value} onChange={handleInputChange} className="t-radio" />
                        <span style={{ color: '#1b1c1a', fontSize: 15 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {(formData.status === 'worker' || formData.status === 'entrepreneur') && (
                  <div>
                    <label className="t-label">Your Role / Occupation *</label>
                    <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className="t-input" placeholder="e.g. Software Engineer, Product Manager, Business Owner" />
                  </div>
                )}
                <div>
                  <label className="t-label" style={{ marginBottom: 14 }}>Are you in tech? *</label>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="inTech" value={opt.value} checked={formData.inTech === opt.value} onChange={handleInputChange} className="t-radio" />
                        <span style={{ color: '#1b1c1a', fontSize: 15 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.inTech === 'yes' && (
                  <div>
                    <label className="t-label" style={{ marginBottom: 14 }}>Which areas interest you?</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['Software Development', 'Data & Analytics', 'AI/Machine Learning', 'Product Management', 'Startup/Founder', 'Other'].map(area => (
                        <label key={area} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                          <input type="checkbox" name="techAreas" value={area} checked={formData.techAreas.includes(area)} onChange={handleInputChange} className="t-check" />
                          <span style={{ color: '#1b1c1a', fontSize: 15 }}>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="t-label">How familiar are you with AI? *</label>
                  <select name="aiKnowledge" value={formData.aiKnowledge} onChange={handleInputChange} className="t-input">
                    <option value="beginner">Beginner: Just getting started</option>
                    <option value="intermediate">Intermediate: Some experience</option>
                    <option value="advanced">Advanced: Heavy user</option>
                  </select>
                </div>
                <div>
                  <label className="t-label">How familiar are you with Sales & Marketing? *</label>
                  <select name="marketingSalesKnowledge" value={formData.marketingSalesKnowledge} onChange={handleInputChange} className="t-input">
                    <option value="beginner">Beginner: Just getting started</option>
                    <option value="intermediate">Intermediate: Some experience</option>
                    <option value="advanced">Advanced: Expert level</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting || submitted} className="t-btn-navy t-btn-full" style={{
                  marginTop: 8,
                  background: submitted ? '#009898' : undefined,
                  borderColor: submitted ? '#009898' : undefined,
                  opacity: submitting ? 0.6 : 1,
                  cursor: (submitting || submitted) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s, border-color 0.3s'
                }}>
                  {submitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Secure Your Spot'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#77767e', letterSpacing: '0.02em' }}>
                  Registration closes June 30, 2026.
                </p>
              </form>
            </div>
          </section>

          <hr className="t-divider" />

          {/* JOIN THE TEAM */}
          <section style={{ background: '#fecb97', padding: 'clamp(64px, 8vw, 96px) 24px', borderTop: '2px solid #7c572d', borderBottom: '2px solid #7c572d' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <span className="t-label" style={{ color: '#614018' }}>Get Involved</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', marginBottom: 20 }}>
                Join the Team
              </h2>
              <p style={{ fontSize: 16, color: '#46464d', lineHeight: 1.8, marginBottom: 48, maxWidth: 600 }}>
                Thrive happens because of people who care. If you want to be part of making this happen (social media, setup, logistics, photography, coordination), we need you.
              </p>
              <div style={{ background: '#ffffff', border: '2px solid #7c572d', borderRadius: 4, padding: 40 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#1a1f3a', marginBottom: 28 }}>Volunteer Roles We Need</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 28 }}>
                  {[
                    { title: 'Social Media', desc: 'Live coverage, stories, real-time posts' },
                    { title: 'Setup & Logistics', desc: 'Before/during event coordination' },
                    { title: 'Photography', desc: 'Capture moments, speakers, attendees' },
                    { title: 'Day-of Coordination', desc: 'Registration, seating, flow management' },
                  ].map(role => (
                    <div key={role.title} style={{ borderLeft: '2px solid #7c572d', paddingLeft: 16 }}>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#1a1f3a', marginBottom: 4, fontSize: 15 }}>{role.title}</p>
                      <p style={{ fontSize: 13, color: '#46464d' }}>{role.desc}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#46464d', marginBottom: 24 }}>No experience necessary. If you can show up and care, that's enough.</p>
                <button onClick={() => document.getElementById('volunteer-form').scrollIntoView({ behavior: 'smooth' })} className="t-btn-gold">
                  Sign Up to Volunteer
                </button>
              </div>
            </div>
          </section>

          {/* VOLUNTEER FORM */}
          <section style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px' }} id="volunteer-form">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <motion.span variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="t-label" style={{ textAlign: 'center', display: 'block' }}>Volunteer</motion.span>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', textAlign: 'center', marginBottom: 12 }}>
                Volunteer Application
              </motion.h2>
              <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} style={{ textAlign: 'center', color: '#46464d', fontSize: 15, marginBottom: 48 }}>
                Help us make Thrive unforgettable.
              </motion.p>
              {volunteerSubmitted && (
                <div style={{ marginBottom: 32, background: '#002626', border: '2px solid #009898', borderRadius: 4, padding: 32, textAlign: 'center' }}>
                  <CheckCircle color="#22dcdc" size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#22dcdc', marginBottom: 8 }}>Application received!</h3>
                  <p style={{ color: '#54f9f9', fontSize: 15 }}>We'll reach out within 2 days. Thank you.</p>
                </div>
              )}

              {volunteerError && (
                <div style={{ marginBottom: 32, background: '#fff0f0', border: '2px solid #cc0000', borderRadius: 4, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: '#cc0000', fontSize: 15 }}>{volunteerError}</p>
                </div>
              )}

              <form
                onSubmit={handleVolunteerSubmit}
                style={{ border: '2px solid #7c572d', borderRadius: 4, padding: 40, background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <div>
                  <label className="t-label">Full Name *</label>
                  <input type="text" name="vol-name" required className="t-input-gold" placeholder="Your name" />
                </div>
                <div>
                  <label className="t-label">Email *</label>
                  <input type="email" name="vol-email" required className="t-input-gold" placeholder="your.email@example.com" />
                </div>
                <div>
                  <label className="t-label">Phone *</label>
                  <input type="tel" name="vol-phone" required className="t-input-gold" placeholder="+234 or your country code" />
                </div>
                <div>
                  <label className="t-label" style={{ marginBottom: 12 }}>Which area interests you? *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { value: 'social-media', label: 'Social Media (live coverage, posts, stories)' },
                      { value: 'setup-logistics', label: 'Setup & Logistics (before and during the event)' },
                      { value: 'photography', label: 'Photography (capture moments and speakers)' },
                      { value: 'day-of', label: 'Day-of Coordination (registration, seating, flow)' },
                      { value: 'other', label: "Other / I'll help however I can" },
                    ].map(role => (
                      <label key={role.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #c7c5ce', borderRadius: 4, cursor: 'pointer' }}>
                        <input type="radio" name="volunteer-role" value={role.value} required className="t-radio-gold" />
                        <span style={{ color: '#1b1c1a', fontSize: 15 }}>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="t-label" style={{ marginBottom: 14 }}>Availability *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { value: 'full-day', label: 'Full day (setup through cleanup)' },
                      { value: 'morning', label: 'Morning (setup + 2-3 hours)' },
                      { value: 'event-day', label: 'Event day only (July 25, 10 AM+)' },
                      { value: 'flexible', label: "Flexible, I'll work around my schedule" },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <input type="radio" name="availability" value={opt.value} required className="t-radio-gold" />
                        <span style={{ color: '#1b1c1a', fontSize: 15 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="t-label">Any relevant experience? (Optional)</label>
                  <textarea name="experience" className="t-input-gold" rows={3} style={{ resize: 'vertical' }}
                    placeholder="e.g. 'I've done event photography,' 'I manage social media for my brand.' Or just say 'I'm eager to help!'"
                  />
                </div>
                <button type="submit" disabled={volunteerSubmitting || volunteerSubmitted} className="t-btn-gold-lg" style={{
                  marginTop: 8,
                  background: volunteerSubmitted ? '#009898' : undefined,
                  borderColor: volunteerSubmitted ? '#009898' : undefined,
                  opacity: volunteerSubmitting ? 0.6 : 1,
                  cursor: (volunteerSubmitting || volunteerSubmitted) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s, border-color 0.3s'
                }}>
                  {volunteerSubmitting ? 'Submitting...' : volunteerSubmitted ? 'Submitted!' : 'Submit Volunteer Application'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#77767e', letterSpacing: '0.02em' }}>
                  We'll reach out within 2 days. Thank you for being part of Thrive.
                </p>
              </form>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ background: '#030722', borderTop: '3px solid #7c572d' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>

              {/* Two-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px 80px', marginBottom: 56 }}>

                {/* Brand column */}
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#fbf9f6', letterSpacing: '-0.01em', marginBottom: 10 }}>
                    THRIVE CONFERENCE 2026
                  </p>
                  <p style={{ color: '#8286a7', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
                    Leveraging AI for Business and Career Growth
                  </p>
                  <div style={{ width: 36, height: 2, background: '#7c572d', marginBottom: 24 }} />
                  <p style={{ color: '#8286a7', fontSize: 14, lineHeight: 1.8 }}>
                    Presented by <strong style={{ color: '#c0c4e8' }}>Thrive Initiatives</strong>
                    <br />an arm of <strong style={{ color: '#c0c4e8' }}>Christ Unfolding Ministries</strong>
                  </p>
                </div>

                {/* Details + Connect column */}
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c572d', marginBottom: 14 }}>Event Details</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36, borderLeft: '2px solid #1a1f3a', paddingLeft: 16 }}>
                    <p style={{ color: '#fbf9f6', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>July 25, 2026 · 10:00 AM</p>
                    <p style={{ color: '#c0c4e8', fontSize: 14 }}>Christ Unfolding Place, Ibadan</p>
                    <p style={{ color: '#8286a7', fontSize: 13, lineHeight: 1.6 }}>Sherry Supermarket, Oluseyi Bus-Stop,<br />Eleyele-Poly Road, Ibadan</p>
                    <span style={{ display: 'inline-block', width: 'fit-content', marginTop: 4, background: '#009898', color: '#fbf9f6', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2 }}>Free Entry</span>
                  </div>

                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c572d', marginBottom: 14 }}>Connect</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <a href="https://x.com/Thrivebycrum" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c0c4e8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'color 0.15s' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      @Thrivebycrum
                    </a>
                    <a href="https://instagram.com/Thrive_initiatives" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c0c4e8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'color 0.15s' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      @Thrive_initiatives
                    </a>
                    <a href="tel:09064846706" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c0c4e8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'color 0.15s' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      09064846706
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div style={{ borderTop: '1px solid #1a1f3a', paddingTop: 24, textAlign: 'center' }}>
                <p style={{ color: '#404562', fontSize: 12 }}>© 2026 Thrive Initiatives · Christ Unfolding Ministries. All rights reserved.</p>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
