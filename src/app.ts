import extractToCSV from "./csv-extractor.js";
import * as YokAtlasScrapper from "./scrapper.js";
import { mkdir, readdir, writeFile } from "node:fs/promises";

async function main() {
  try {
    const departments = await measureDuration(
      async () => await YokAtlasScrapper.fetcDepartmentData(),
    );

    await writeOutput("yok-atlas-veriler.json", JSON.stringify(departments));
    await writeOutput("yok-atlas-veriler.csv", extractToCSV(departments));

    console.log("Data written.");
    process.exit(0);
  } catch (error) {
    console.error("Scraping failed:", error);
    process.exit(0);
  }
}

async function writeOutput(file: string, string: string) {
  try {
    await readdir("output");
  } catch {
    await mkdir("output");
  }

  await writeFile(`output/${file}`, string);
}

async function measureDuration<T>(callback: () => T) {
  const startTime = new Date(Date.now());

  const result = await callback();

  const endTime = new Date(Date.now());

  const duration = endTime.getTime() - startTime.getTime();

  console.log(
    `Duration: ${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s ${duration % 1000}ms`,
  );

  return result;
}

void main();
