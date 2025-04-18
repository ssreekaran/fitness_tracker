import React from 'react';
import './About.css';

const ContactUs: React.FC = () => {
  const [message, setMessage] = React.useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mail client with prefilled body
    const mailto = `mailto:fitness.tracker.00001@gmail.com?subject=User%20Feedback&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  return (
    <div className="about-container">
      <div className="about-content">
        <h1>Contact Us</h1>
        <form onSubmit={handleSend} style={{ margin: '24px 0' }}>
          <label htmlFor="user-message" style={{ fontWeight: 600 }}>Your Comment</label>
          <textarea
            id="user-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Write your comment here..."
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', marginTop: 8, resize: 'vertical', fontSize: 16 }}
            required
          />
          <button
            type="submit"
            style={{ marginTop: 12, padding: '8px 24px', borderRadius: 8, background: '#333', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
        <h4>Email</h4>
        <p>
          For any questions, feedback, or support, please contact us at:
        </p>
        <a href="mailto:fitness.tracker.00001@gmail.com">fitness.tracker.00001@gmail.com</a>
        <p style={{ marginTop: 32 }}>
          We value your input and will do our best to respond as soon as possible!
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
