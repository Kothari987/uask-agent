// src/utils/testDataLoader.ts
import fs from "fs";
import path from "path";

export interface TestCase {
  id: string;
  language: "EN" | "AR";
  category: string;
  description: string;
  prompt: string;
  minResponseLength?: number;
  mustContain?: string[];
  mustNotContain?: string[];
  pairedWith?: string;
  expectedBehavior: Record<string, unknown>;
}

export interface TestData {
  baseUrl: string;
  defaultLanguage: string;
  testCases: TestCase[];
}

export function loadTestData(): TestData {
  const filePath = path.join(__dirname, "../../test-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as TestData;
}
