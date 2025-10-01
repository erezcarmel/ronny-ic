"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLocale } from "@/i18n/LocaleProvider";
import { useState, useRef, useEffect } from "react";
import apiService from "@/lib/utils/api";

interface AboutProps {
  title?: string;
  content?: string;
  imageUrl?: string;
}

interface SectionContent {
  id: string;
  language: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  contents: SectionContent[];
}

export default function About({ title, content, imageUrl }: AboutProps) {
  const t = useTranslations("about");
  const { locale } = useLocale();
  const isRtl = locale === "he";

  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation when section comes into view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Fetch section data from API
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        const data = await apiService.sections.getByType("about", locale);
        setSectionData(data);
      } catch (error) {
        console.error("Error fetching About section data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [locale]);

  // Get content from section data or fallback to props
  const sectionContent = sectionData?.contents?.[0]?.content || content;
  const sectionImage = sectionData?.contents?.[0]?.imageUrl || imageUrl;

  // Process image URL to ensure it works correctly in all environments
  // Use local image from public folder as fallback
  const localImagePath = "/images/ronny.jpg";

  const processedImageUrl = sectionImage
    ? sectionImage.startsWith("blob:")
      ? // For blob URLs, use local image instead
        localImagePath
      : sectionImage
    : localImagePath;

  return (
    <section
      id="about"
      className="about-section pb-8 bg-white dark:bg-gray-900"
    >
      <div className="container-custom">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
            transition={{ duration: 0.6 }}
            className={`${isRtl ? "rtl" : "ltr"}`}
          >
            <div className="flex flex-col md:flex-row gap-8 items-stretch min-h-[400px] max-w-screen-lg mx-auto">
              <div className={`${isRtl ? "order-2 md:order-1" : "order-2 md:order-1"} flex-1`}>
                <div className="max-w-none h-full text-sm pt-8">
                  {sectionContent && (
                    <div dangerouslySetInnerHTML={{ __html: sectionContent }} />
                  )}
                </div>
              </div>

              <div
                className={`rounded-lg overflow-hidden shadow-lg h-full max-w-[300px] flex items-center justify-center align-middle mt-6 my-0 mx-auto ${
                  isRtl ? "order-1 md:order-2" : "order-1 md:order-2"
                }`}
              >
                <Image
                  src={processedImageUrl}
                  alt="About me"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover md:min-h-[440px]"
                  priority
                  unoptimized={!processedImageUrl.startsWith("/")} // Only optimize local images
                  style={{ maxWidth: "300px", height: "100%" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
