'use client';

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

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
          background: '#fbf9f6', borderBottom: '2px solid #1a1f3a'
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="t-nav-wordmark">THRIVE <span>CONF</span></div>
              <p style={{ fontSize: 10, color: '#77767e', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>by Thrive Initiatives · Christ Unfolding Ministries</p>
            </div>
            <button onClick={scrollToForm} className="t-btn-navy">Secure Your Spot</button>
          </div>
        </nav>

        <div style={{ paddingTop: 68 }}>

          {/* HERO */}
          <section style={{ background: '#1a1f3a', padding: 'clamp(64px, 10vw, 120px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ marginBottom: 28 }}>
                <span className="t-badge-teal">Free Event · July 25, 2026</span>
              </div>
              <h1 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 'clamp(40px, 6vw, 72px)', color: '#fbf9f6',
                lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20
              }}>
                Discover what it takes to thrive in this AI Era
              </h1>
              <p style={{ fontSize: 'clamp(17px, 2.2vw, 20px)', color: '#c0c4e8', marginBottom: 24, lineHeight: 1.65 }}>
                From business growth to career advancement and faith-driven success.
              </p>
              <p style={{ fontSize: 16, color: '#8286a7', marginBottom: 48, lineHeight: 1.8, maxWidth: 640 }}>
                AI isn't coming to make you jobless. It's already here. And the people winning are the ones who understand it well enough to use it — not fear it or act like it doesn't exist. Learn from the people who are taking advantage of AI to make an impact in their industry.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button onClick={scrollToForm} className="t-btn-cream">Secure Your Seat</button>
                <button onClick={scrollToSpeakers} style={{
                  background: 'transparent', color: '#c0c4e8',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '18px 44px', borderRadius: 4, border: '1px solid #404562',
                  cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                  lineHeight: 1
                }}>Meet Our Speakers</button>
              </div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* EVENT DETAILS */}
          <section style={{ background: '#fbf9f6', padding: '72px 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
              {[
                { label: 'When', title: 'July 25, 2026', sub: '10:00 AM' },
                { label: 'Where', title: 'Christ Unfolding Place', sub: 'Lagos, Nigeria' },
                { label: 'Cost', title: 'Free', sub: 'Register by June 30.' },
              ].map(item => (
                <div key={item.label} style={{ borderLeft: '2px solid #1a1f3a', paddingLeft: 20 }}>
                  <span className="t-label">{item.label}</span>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 19, color: '#1a1f3a', marginBottom: 4 }}>{item.title}</p>
                  <p style={{ color: '#46464d', fontSize: 14 }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="t-divider" />

          {/* WHY ATTEND */}
          <section style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <span className="t-label">Why Attend</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', marginBottom: 16 }}>
                Why should you attend Thrive Conference?
              </h2>
              <p style={{ fontSize: 16, color: '#46464d', lineHeight: 1.8, marginBottom: 48, maxWidth: 640 }}>
                A conference by Thrive Initiatives — an arm of Christ Unfolding Ministries — designed for professionals, business owners, and students who refuse to watch others lead while they just watch.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 20, padding: '28px 0', borderBottom: '1px solid #e8e6e3' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#7c572d', paddingTop: 2 }}>→</span>
                    <div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#1a1f3a', marginBottom: 6 }}>{item.title}</h3>
                      <p style={{ color: '#46464d', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* SPEAKERS */}
          <section id="speakers" style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <span className="t-label">Speakers</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', marginBottom: 56 }}>
                Meet Your Speakers
              </h2>

              {/* Dara */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 160px) 1fr', gap: 40, marginBottom: 56, paddingBottom: 56, borderBottom: '1px solid #c7c5ce' }}>
                <div>
                  <div style={{ background: '#efeeeb', border: '2px solid #1a1f3a', borderRadius: 4, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 44, color: '#7c572d' }}>D</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#77767e', textAlign: 'center', marginTop: 8, letterSpacing: '0.03em' }}>Photo coming soon</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#1a1f3a', marginBottom: 4 }}>Dara Sobaloju</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#7c572d', marginBottom: 24 }}>Built Pewbeam AI</p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 16, fontSize: 15 }}>
                    Started as a tweet: "I want to build a Bible presentation AI for churches." Six months later, Pewbeam was live — listening in real time, matching Bible verses to what's being said, working offline.
                  </p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 20, fontSize: 15 }}>
                    <strong style={{ color: '#1a1f3a' }}>Why he's speaking:</strong> Dara's work demonstrates how AI can solve real problems for communities, blending technical excellence with practical impact. He'll show you how he thinks about building with AI — how he identifies problems, how he ships.
                  </p>
                  <div style={{ borderLeft: '2px solid #7c572d', paddingLeft: 16 }}>
                    <p style={{ color: '#46464d', fontSize: 14, fontStyle: 'italic' }}>
                      "To ensure the Church is not left behind in the AI era." — Dara's mission for Pewbeam
                    </p>
                  </div>
                </div>
              </div>

              {/* Michael */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 160px) 1fr', gap: 40 }}>
                <div>
                  <div style={{ background: '#efeeeb', border: '2px solid #1a1f3a', borderRadius: 4, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 44, color: '#009898' }}>M</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#77767e', textAlign: 'center', marginTop: 8, letterSpacing: '0.03em' }}>Photo coming soon</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#1a1f3a', marginBottom: 4 }}>Micheal Toyinbo</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#7c572d', marginBottom: 24 }}>Director of Expansion, Planning & Strategy · Chowdeck</p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 16, fontSize: 15 }}>
                    Micheal is currently leading growth and strategic planning for Chowdeck across Nigeria and Ghana. He brings expertise in scaling, operations, and navigating complex business environments while maintaining operational excellence.
                  </p>
                  <p style={{ color: '#46464d', lineHeight: 1.75, marginBottom: 20, fontSize: 15 }}>
                    <strong style={{ color: '#1a1f3a' }}>Why he's speaking:</strong> He's not a futurist talking about what AI could do — he's someone actively using it to drive real growth across multiple markets. He'll share what actually moves the needle.
                  </p>
                  <div style={{ borderLeft: '2px solid #009898', paddingLeft: 16 }}>
                    <p style={{ color: '#46464d', fontSize: 14, fontStyle: 'italic' }}>
                      Tactical insights from someone scaling a real business across Nigeria and Ghana with AI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr className="t-divider" />

          {/* WHAT TO EXPECT */}
          <section style={{ background: '#1a1f3a', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <span className="t-label" style={{ color: '#6b6f8a' }}>Programme</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#fbf9f6', letterSpacing: '-0.01em', marginBottom: 56 }}>
                What to Expect
              </h2>
              {[
                { n: '01', title: 'Keynote Addresses', desc: 'Hear directly from AI innovators and growth leaders on what is actually working right now.' },
                { n: '02', title: 'Panel Discussions', desc: 'Real conversations about real challenges — AI adoption, business growth, and navigating the new world of work.' },
                { n: '03', title: 'Networking Breaks', desc: 'Connect with 300+ professionals, entrepreneurs, students and business owners who are serious about thriving.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24, padding: '28px 0', borderBottom: i < 2 ? '1px solid #2d3250' : 'none' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#6b6f8a', letterSpacing: '0.06em', paddingTop: 4 }}>{item.n}</span>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#fbf9f6', marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ color: '#c0c4e8', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="t-divider" />

          {/* READY TO THRIVE CTA */}
          <section style={{ background: '#fbf9f6', padding: 'clamp(64px, 8vw, 96px) 24px', textAlign: 'center' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <span className="t-label" style={{ textAlign: 'center', display: 'block' }}>July 25, 2026</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1f3a', letterSpacing: '-0.02em', marginBottom: 20 }}>
                Ready to Thrive?
              </h2>
              <p style={{ fontSize: 17, color: '#46464d', lineHeight: 1.8, marginBottom: 40 }}>
                Secure your spot now and invest in your growth, career and future.
              </p>
              <button onClick={scrollToForm} className="t-btn-navy-lg">Secure Your Spot</button>
            </div>
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
              <span className="t-label" style={{ textAlign: 'center', display: 'block' }}>Register</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', textAlign: 'center', marginBottom: 12 }}>
                Secure Your Spot
              </h2>
              <p style={{ textAlign: 'center', color: '#46464d', fontSize: 15, marginBottom: 48 }}>
                One morning. Two speakers. Everything changes.
              </p>

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
                    <option value="beginner">Beginner — Just getting started</option>
                    <option value="intermediate">Intermediate — Some experience</option>
                    <option value="advanced">Advanced — Heavy user</option>
                  </select>
                </div>
                <div>
                  <label className="t-label">How familiar are you with Sales & Marketing? *</label>
                  <select name="marketingSalesKnowledge" value={formData.marketingSalesKnowledge} onChange={handleInputChange} className="t-input">
                    <option value="beginner">Beginner — Just getting started</option>
                    <option value="intermediate">Intermediate — Some experience</option>
                    <option value="advanced">Advanced — Expert level</option>
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
                Thrive happens because of people who care. If you want to be part of making this happen — social media, setup, logistics, photography, coordination — we need you.
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
              <span className="t-label" style={{ textAlign: 'center', display: 'block' }}>Volunteer</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: '#1a1f3a', letterSpacing: '-0.01em', textAlign: 'center', marginBottom: 12 }}>
                Volunteer Application
              </h2>
              <p style={{ textAlign: 'center', color: '#46464d', fontSize: 15, marginBottom: 48 }}>
                Help us make Thrive unforgettable.
              </p>
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
                      { value: 'social-media', label: 'Social Media — Live coverage, posts, stories' },
                      { value: 'setup-logistics', label: 'Setup & Logistics — Before/during coordination' },
                      { value: 'photography', label: 'Photography — Capture moments and speakers' },
                      { value: 'day-of', label: 'Day-of Coordination — Registration, seating, flow' },
                      { value: 'other', label: "Other / I'll help however needed" },
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
                      { value: 'event-day', label: 'Event day only (July 18, 11 AM+)' },
                      { value: 'flexible', label: "Flexible — I'll work around my schedule" },
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
          <footer style={{ background: '#030722', padding: '56px 24px', borderTop: '2px solid #1a1f3a' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#fbf9f6', marginBottom: 6, letterSpacing: '-0.01em' }}>
                THRIVE CONFERENCE 2026
              </p>
              <p style={{ color: '#404562', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                Leveraging AI for Business and Career Growth
              </p>
              <div style={{ width: 40, height: 2, background: '#7c572d', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b6f8a', fontSize: 12, letterSpacing: '0.04em', marginBottom: 8 }}>
                Presented by <strong style={{ color: '#8286a7' }}>Thrive Initiatives</strong> · an arm of <strong style={{ color: '#8286a7' }}>Christ Unfolding Ministries</strong>
              </p>
              <p style={{ color: '#46464d', fontSize: 13, letterSpacing: '0.02em' }}>
                Christ Unfolding Place, Lagos · July 25, 2026 · 10:00 AM · Free
              </p>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
