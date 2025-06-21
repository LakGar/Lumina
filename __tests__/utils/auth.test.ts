import { validateMembership } from "../../utils/auth";

describe("validateMembership", () => {
  describe("free tier access", () => {
    it("should allow free users to access free features", () => {
      expect(validateMembership("free", "free")).toBe(true);
    });

    it("should deny free users access to pro features", () => {
      expect(validateMembership("free", "pro")).toBe(false);
    });

    it("should deny free users access to premium features", () => {
      expect(validateMembership("free", "premium")).toBe(false);
    });
  });

  describe("pro tier access", () => {
    it("should allow pro users to access free features", () => {
      expect(validateMembership("pro", "free")).toBe(true);
    });

    it("should allow pro users to access pro features", () => {
      expect(validateMembership("pro", "pro")).toBe(true);
    });

    it("should deny pro users access to premium features", () => {
      expect(validateMembership("pro", "premium")).toBe(false);
    });
  });

  describe("premium tier access", () => {
    it("should allow premium users to access free features", () => {
      expect(validateMembership("premium", "free")).toBe(true);
    });

    it("should allow premium users to access pro features", () => {
      expect(validateMembership("premium", "pro")).toBe(true);
    });

    it("should allow premium users to access premium features", () => {
      expect(validateMembership("premium", "premium")).toBe(true);
    });
  });
});
