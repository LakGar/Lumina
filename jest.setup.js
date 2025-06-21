// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock environment variables
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/lumina_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.PINECONE_API_KEY = "test-pinecone-key";
process.env.PINECONE_ENVIRONMENT = "us-west1-gcp";
process.env.AWS_ACCESS_KEY_ID = "test-aws-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-aws-secret";
process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "lumina-test-bucket";
process.env.STRIPE_SECRET_KEY = "test-stripe-key";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
