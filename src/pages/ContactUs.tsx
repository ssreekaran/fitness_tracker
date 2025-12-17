import React, { useEffect } from "react";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./ContactUs.css";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Clear status message after 5 seconds when submitStatus changes
  React.useEffect(() => {
    if (!submitStatus) return;

    const timer = setTimeout(() => {
      setSubmitStatus(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [submitStatus]);

  useEffect(() => {
    // Add theme class to the wrapper when component mounts
    const htmlElement = document.documentElement;
    const theme = htmlElement.getAttribute("data-theme") || "light";
    const wrapper = document.querySelector(".contact-page-wrapper");
    if (wrapper) {
      wrapper.setAttribute("data-theme", theme);
    }

    // Set up a mutation observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme" && wrapper) {
          const newTheme = htmlElement.getAttribute("data-theme") || "light";
          wrapper.setAttribute("data-theme", newTheme);
        }
      });
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Open mail client with prefilled body
    const { name, email, subject, message } = formData;
    const mailto = `mailto:fitness.tracker.00001@gmail.com?subject=${encodeURIComponent(
      subject || "Contact Form Submission"
    )}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;

    // Set success message
    setSubmitStatus({
      success: true,
      message: "Your message has been sent! We'll get back to you soon.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    // Open email client
    window.location.href = mailto;
    setIsSubmitting(false);
  };

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-badge">We're Here to Help</div>
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-subtitle">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>
      </section>

      <div className="section">
        <div className="features-grid">
          {/* Contact Information Card */}
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>
              📱
            </div>
            <h3>Contact Information</h3>

            <div className="contact-method">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <div className="contact-details">
                <h4>Email Us</h4>
                <a href="mailto:fitness.tracker.00001@gmail.com">
                  fitness.tracker.00001@gmail.com
                </a>
              </div>
            </div>

            <div className="contact-method">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="contact-details">
                <h4>Location</h4>
                <p>Mississauga, Ontario, Canada</p>
              </div>
            </div>

            <div className="social-links">
              <a
                href="https://www.facebook.com/people/Fitness-Tracker/61581193809977"
                className="social-link"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                title="Visit our Facebook page"
              >
                <FaFacebook />
              </a>
              <a
                href="https://x.com/FitTrack00001"
                className="social-link"
                aria-label="X (formerly Twitter)"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on X"
              >
                <FaXTwitter style={{ fontSize: "1.2rem" }} />
              </a>
              <a
                href="https://www.instagram.com/fitness.tracker.00001"
                className="social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.linkedin.com/company/fitness-tracker-clean"
                className="social-link"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                title="Connect with us on LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://bsky.app/profile/fitness-tracker.bsky.social"
                className="social-link"
                aria-label="Bluesky"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Bluesky"
              >
                <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                  B
                </span>
              </a>
            </div>
          </article>

          {/* Contact Form Card */}
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>
              ✉️
            </div>
            <h3>Send us a Message</h3>

            {submitStatus && (
              <div
                className={`form-status ${
                  submitStatus.success ? "success" : "error"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ marginTop: "1rem", width: "100%" }}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <FaPaperPlane style={{ marginRight: "8px" }} />
                    Send Message
                  </>
                )}
              </button>
            </form>

            <p className="privacy-note">
              <strong>Note:</strong> We value your privacy and will never share
              your information with third parties.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
