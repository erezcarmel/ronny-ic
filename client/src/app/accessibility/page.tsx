"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useLocale } from "@/i18n/LocaleProvider";

export default function AccessibilityPage() {
  const { locale } = useLocale();
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    setIsRtl(locale === "he");
  }, [locale]);

  return (
    <MainLayout>
      <div
        className={`container-custom py-24 ${
          isRtl ? "rtl text-right" : "ltr text-left"
        }`}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Accessibility Statement
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            We are committed to ensuring digital accessibility for people with
            disabilities. We are continually improving the user experience for
            everyone and applying the relevant accessibility standards.
          </p>

          <h2>Compliance Status</h2>
          <p>This website is designed to comply with:</p>
          <ul>
            <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
            <li>Israeli Standard 5568 for web accessibility</li>
            <li>Americans with Disabilities Act (ADA) requirements</li>
            <li>Section 508 of the U.S. Rehabilitation Act</li>
          </ul>

          <h2>Accessibility Features</h2>
          <p>Our website includes the following accessibility features:</p>
          <ul>
            <li>Keyboard navigation support for all interactive elements</li>
            <li>ARIA landmarks and roles to identify page regions</li>
            <li>Proper heading structure and semantic HTML</li>
            <li>Text alternatives for non-text content</li>
            <li>Sufficient color contrast ratios</li>
            <li>Resizable text without loss of content or functionality</li>
            <li>Skip to content link</li>
            <li>Form labels and error identification</li>
            <li>
              Multilingual support with RTL (Right-to-Left) text direction
            </li>
            <li>Focus indicators for keyboard navigation</li>
          </ul>

          <h2>Assistive Technologies Supported</h2>
          <p>
            This website is designed to be compatible with the following
            assistive technologies:
          </p>
          <ul>
            <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
            <li>Screen magnifiers</li>
            <li>Speech recognition software</li>
            <li>Keyboard-only navigation</li>
          </ul>

          <h2>Known Limitations</h2>
          <p>
            Despite our efforts to ensure accessibility of this website, there
            may be some limitations:
          </p>
          <ul>
            <li>Some older PDF documents may not be fully accessible</li>
            <li>Some third-party content may not be fully accessible</li>
          </ul>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of this website.
            Please let us know if you encounter accessibility barriers:
          </p>
          <ul>
            <li>Phone: +972 54 123 4567</li>
            <li>E-mail: contact@ronnyic.com</li>
            <li>
              Contact form: <a href="/#contact">Contact Form</a>
            </li>
          </ul>

          <h2>Assessment Methodology</h2>
          <p>Our website was assessed using a combination of:</p>
          <ul>
            <li>Automated testing tools</li>
            <li>Manual testing with assistive technologies</li>
            <li>User testing with people with disabilities</li>
          </ul>

          <p>
            This statement was last updated on{" "}
            {new Date().toLocaleDateString(locale === "he" ? "he-IL" : "en-US")}
            .
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
