import { type Metadata } from "next";
import LandingLayout from "@/components/landing/LandingLayout";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Reflection tips, product updates, and stories from the Lumina team.",
};

export default function BlogPage() {
  return (
    <LandingLayout>
      <BlogContent />
    </LandingLayout>
  );
}
