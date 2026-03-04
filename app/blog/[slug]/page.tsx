import { type Metadata } from "next";
import { notFound } from "next/navigation";
import LandingLayout from "@/components/landing/LandingLayout";
import { BLOG_POSTS } from "../blog-data";
import BlogPostContent from "./BlogPostContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <LandingLayout>
      <BlogPostContent
        slug={post.slug}
        title={post.title}
        excerpt={post.excerpt}
        date={post.date}
        image={post.image}
        imageAlt={post.imageAlt}
        paragraphs={post.paragraphs}
      />
    </LandingLayout>
  );
}
