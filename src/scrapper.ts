import puppeteer from "puppeteer";

export default class YokAtlasScrapper {
  private browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this.browser = browser;
  }

  static async init() {
    return new YokAtlasScrapper(await puppeteer.launch());
  }

  async run(departmentTypes: Set<DepartmentType>) {
    const departments: Department[] = [];

    for (const departmentType of departmentTypes) {
      console.log(`Fetching Department "${departmentType}"`);

      const fetchedDepartments = await this.fetchDepartments(
        `https://yokatlas.yok.gov.tr/tercih-sihirbazi-t4-tablo.php?p=${departmentType}`,
      );

      if (fetchedDepartments && fetchedDepartments.length > 0) {
        const newDepartments: Department[] = fetchedDepartments.map((uni) => {
          return { ...uni, departmentType } as Department;
        });

        departments.push(...newDepartments);
      } else {
        console.log(`"${departmentType}" is empty.`);
      }
    }

    return departments;
  }

  async uninit() {
    await this.browser.close();
  }

  private async fetchDepartments(url: string) {
    const departments: Omit<Department, "departmentType">[] = [];
    const page = await this.browser.newPage();

    await page.goto(url);
    await page.waitForSelector("#mydata_next");
    console.log("Page Loaded");

    const pageNumber = await page.evaluate(fetchPageNumber);

    for (let index = 1; index <= Number(pageNumber); index++) {
      console.log(`${index}/${pageNumber}`);

      const fetchedDepartments = await page.$$eval('#mydata > tbody > [role="row"]', scrapeRows);

      departments.push(...fetchedDepartments);

      try {
        await page.click("#mydata_next");
      } catch {
        console.log("Interrupted. Waiting for the network to be idle...");
        await page.waitForNetworkIdle();
        await page.click("#mydata_next");
      }
    }

    return departments;
  }
}

function scrapeRows(universities: Element[]) {
  return universities.map((university) => {
    const strongData = university.querySelectorAll("strong");
    const fontData = university.querySelectorAll("font");
    const tableData = university.querySelectorAll("td");

    const uni = {
      universityName: strongData[0]?.innerText.trim() ?? "",
      universityType: tableData[5]?.innerText.trim() ?? "",
      city: tableData[4]?.innerText.trim() ?? "",
      departmentCode: university.querySelector("a")?.innerText.trim() ?? "",
      departmentName: `${strongData[1]?.innerText.trim()}${fontData[2] ? ` ${fontData[2].innerText.trim()}` : ""}`,
      scholarship: tableData[6]?.innerText.trim() ?? "",
      placement: fontData[11]?.innerText.trim().replace(",", " ") ?? "",
      base_score: fontData[15]?.innerText.trim().replace(",", ".") ?? "",
    };

    return uni;
  });
}

function fetchPageNumber() {
  const paginationButtons = document.querySelectorAll(
    "li.paginate_button:not(.disabled):nth-last-child(2) a",
  );

  if (paginationButtons.length > 0) {
    return paginationButtons[paginationButtons.length - 1].innerHTML.trim();
  }

  throw new Error("Page number not found.");
}

interface Department extends Record<string, string> {
  universityName: string;
  universityType: string;
  city: string;
  departmentCode: string;
  departmentType: DepartmentType;
  departmentName: string;
  scholarship: string;
  placement: string;
  base_score: string;
}

type DepartmentType = "dil" | "ea" | "söz" | "say";
