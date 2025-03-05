import puppeteer from "puppeteer";

export default class YokAtlasScrapper {
  private browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this.browser = browser;
  }

  static async init() {
    return new YokAtlasScrapper(await puppeteer.launch());
  }

  async uninit() {
    await this.browser.close();
  }

  async run(departmentTypes: Set<DepartmentType>): Promise<Department[]> {
    const departmentPromises = [...departmentTypes].map(async (departmentType) => {
      const page = await this.browser.newPage();

      try {
        console.log(`Fetching Department "${departmentType}"`);

        const departments = await this.fetchDepartments(
          page,
          `https://yokatlas.yok.gov.tr/tercih-sihirbazi-t4-tablo.php?p=${departmentType}`,
        );

        return departments.map((d) => ({ ...d, departmentType }) as Department);
      } catch (error) {
        console.error(`Error fetching ${departmentType}:`, error);
        return [];
      } finally {
        await page.close();
      }
    });

    const departmentResults = await Promise.all(departmentPromises);
    return departmentResults.flat();
  }

  private async fetchDepartments(page: puppeteer.Page, url: string) {
    const departments: Omit<Department, "departmentType">[] = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#mydata_next");

    const pageNumber = await page.evaluate(fetchPageNumber);

    for (let index = 1; index <= Number(pageNumber); index++) {
      console.log(`${index}/${pageNumber}`);

      const fetchedDepartments = await page.$$eval('#mydata > tbody > [role="row"]', scrapeRows);
      departments.push(...fetchedDepartments);

      await this.goToNextPage(page);
    }

    return departments;
  }

  private async goToNextPage(page: puppeteer.Page) {
    await Promise.all([
      page.click("#mydata_next"),
      page.waitForNetworkIdle(), // Ensure no ongoing network requests
    ]);
  }
}

function scrapeRows(universities: Element[]) {
  return universities.map((university) => {
    const strongData = university.querySelectorAll("strong");
    const fontData = university.querySelectorAll("font");
    const tableData = university.querySelectorAll("td");

    return {
      universityName: strongData[0]?.innerText.trim() ?? "",
      universityType: tableData[5]?.innerText.trim() ?? "",
      city: tableData[4]?.innerText.trim() ?? "",
      departmentCode: university.querySelector("a")?.innerText.trim() ?? "",
      departmentName: `${strongData[1]?.innerText.trim()}${fontData[2] ? ` ${fontData[2].innerText.trim()}` : ""}`,
      scholarship: tableData[6]?.innerText.trim() ?? "",
      placement: fontData[11]?.innerText.trim().replace(",", " ") ?? "",
      base_score: fontData[15]?.innerText.trim().replace(",", ".") ?? "",
    };
  });
}

function fetchPageNumber() {
  const paginationButtons = document.querySelectorAll(
    "li.paginate_button:not(.disabled):nth-last-child(2) a",
  );

  if (paginationButtons.length > 0) {
    return Number(paginationButtons[paginationButtons.length - 1].textContent?.trim()) || 1;
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
