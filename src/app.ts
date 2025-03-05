import extractToCSV from "./csv-extractor.js";
import YokAtlasScrapper from "./scrapper.js";
import { mkdir, readdir, writeFile } from "node:fs/promises";

async function main() {
  const scrapper = await YokAtlasScrapper.init();

  try {
    const departments = await measureDuration(async () => {
      return await scrapper.run(new Set(["dil"]));
    });

    await writeOutput(
      "yok-atlas-veriler.json",
      JSON.stringify(departments.sort((a, b) => a.departmentName.localeCompare(b.departmentName))),
    );
    await writeOutput(
      "yok-atlas-veriler.csv",
      extractToCSV(departments.sort((a, b) => a.departmentName.localeCompare(b.departmentName))),
    );
  } catch (error) {
    console.error("Scraping failed:", error);
  } finally {
    await scrapper.uninit();
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
