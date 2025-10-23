import React from "react";
import "./LegalPages.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page-content">
      <div className="legal-container">
        <h1>Privacy Policy</h1>

        <p>
          This privacy policy applies to the Fitness Tracker website and mobile
          application (hereby referred to as "Service") operated by Sarmilan
          Sreekaran (hereby referred to as "Service Provider") as a Free
          service. This service is intended for use "AS IS".
        </p>

        <h2>Information Collection and Use</h2>
        <p>
          The Service collects information when you visit our website or use our
          mobile application. This information may include:
        </p>
        <ul>
          <li>Your device's Internet Protocol address (e.g., IP address)</li>
          <li>
            Pages of our Service that you visit, the time and date of your
            visit, the time spent on those pages
          </li>
          <li>The time spent on our Service</li>
          <li>The operating system you use on your device</li>
          <li>
            Information you provide when registering an account (name, email,
            etc.)
          </li>
          <li>Fitness and health data you choose to input</li>
        </ul>

        <div>
          <p>
            The Service collects your device's location, which helps us provide
            features such as:
          </p>
          <ul>
            <li>Personalized content and relevant recommendations</li>
            <li>Location-based services and features</li>
            <li>Analytics to improve our Service</li>
          </ul>
        </div>

        <p>
          The Service Provider may use the information you provide to contact
          you with important information, required notices, and marketing
          promotions.
        </p>

        <h2>Data Security</h2>
        <p>
          We value your trust in providing us your personal information, and we
          strive to use commercially acceptable means of protecting it. However,
          no method of transmission over the internet or method of electronic
          storage is 100% secure, and we cannot guarantee its absolute security.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          Please note that the Service utilizes third-party services that have
          their own Privacy Policy. Below are the links to the Privacy Policy of
          the third-party service providers used by the Service:
        </p>
        <ul>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Play Services
            </a>
          </li>
          <li>
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics for Firebase
            </a>
          </li>
          <li>
            <a
              href="https://firebase.google.com/terms/crashlytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firebase Crashlytics
            </a>
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Our website uses "cookies" to collect information and improve our
          Service. You have the option to either accept or refuse these cookies
          and know when a cookie is being sent to your device.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our Service does not address anyone under the age of 13. We do not
          knowingly collect personally identifiable information from children
          under 13. If you are a parent or guardian and you are aware that your
          child has provided us with personal information, please contact us so
          that we can take necessary actions.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. Thus, you are
          advised to review this page periodically for any changes. We will
          notify you of any changes by posting the new Privacy Policy on this
          page. These changes are effective immediately after they are posted on
          this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions or suggestions about our Privacy Policy, do
          not hesitate to contact us at fitness.tracker.00001@gmail.com.
        </p>

        <p className="last-updated">
          This privacy policy is effective as of 2025-08-27
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
