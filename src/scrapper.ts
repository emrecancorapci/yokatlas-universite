/**
 * Fetches department data from the YÖK-ATLAS website.
 * 
 * > This is a resource heavy function which takes 22-24 seconds.
 * Module is developed thinking that it won't be used frequently.
 * So there is no caching logic exist right now.
 * 
 * > Module heavily relies on YÖK-ATLAS API. Any changes on the API will break this.
 * 
 * @param departmentTypes An array that only can contain [`dil`,`ea`,`söz`,`say`]. Multiple values will be ignored. 
 * @returns 
 */
export async function fetcDepartmentData(
  departmentTypes: Array<DepartmentType> = ["dil", "ea", "söz", "say"],
): Promise<Department[]> {
  const fetchingData = [...new Set(departmentTypes)].flatMap(async (type) => {
    try {
      const { recordsFiltered } = await fetchData(type, 0, 1);
      console.log(recordsFiltered);
      return Array.from({ length: Math.ceil(recordsFiltered / 100) }, (_, page) => ({
        type,
        page,
      }));
    } catch (error) {
      console.error(`Error fetching data count for ${type}:`, error);
      return [];
    }
  });

  const pagesToFetch = (await Promise.all(fetchingData)).flat();
  console.log("Fetching data:", pagesToFetch);

  const data: Department[] = [];
  for (const { type, page } of pagesToFetch) {
    const pageData = await dataHandle(type, page);
    data.push(...pageData);
  }

  return data;
}

async function dataHandle(type: DepartmentType, page: number): Promise<Department[]> {
  try {
    console.log("Data handling", type, page);

    const { data: dataArray } = await fetchData(type, page * 100, 100);

    if (dataArray.length === 0) {
      throw new Error();
    }

    console.log("Data length:", dataArray.length);

    return dataArray.map((data) => formatData(data, type));
  } catch (error) {
    console.error(`Error processing data for ${type}, page ${page}:`, error);

    return await dataHandle(type, page);
  }
}

/**
 * ### Fetches data from the YÖK-ATLAS API.
 * 
 * @param start Default is 0.
 * @param length Default is 100. Max is 100. 
 */
async function fetchData(departmentType: DepartmentType, start = 0, length = 100) {
  const response = await fetch(
    "https://yokatlas.yok.gov.tr/server_side/server_processing-atlas2016-TS-t4.php",
    {
      credentials: "omit",
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-GPC": "1",
        Priority: "u=0",
      },
      referrer: `https://yokatlas.yok.gov.tr/tercih-sihirbazi-t4-tablo.php?p=${departmentType}`,
      body: `draw=2&columns[0][data]=0&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=1&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=2&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=3&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=true&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=4&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&columns[5][data]=5&columns[5][name]=&columns[5][searchable]=true&columns[5][orderable]=true&columns[5][search][value]=&columns[5][search][regex]=false&columns[6][data]=6&columns[6][name]=&columns[6][searchable]=true&columns[6][orderable]=false&columns[6][search][value]=&columns[6][search][regex]=false&columns[7][data]=7&columns[7][name]=&columns[7][searchable]=true&columns[7][orderable]=false&columns[7][search][value]=&columns[7][search][regex]=false&columns[8][data]=8&columns[8][name]=&columns[8][searchable]=true&columns[8][orderable]=false&columns[8][search][value]=&columns[8][search][regex]=false&columns[9][data]=9&columns[9][name]=&columns[9][searchable]=true&columns[9][orderable]=false&columns[9][search][value]=&columns[9][search][regex]=false&columns[10][data]=10&columns[10][name]=&columns[10][searchable]=true&columns[10][orderable]=false&columns[10][search][value]=&columns[10][search][regex]=false&columns[11][data]=11&columns[11][name]=&columns[11][searchable]=true&columns[11][orderable]=true&columns[11][search][value]=&columns[11][search][regex]=false&columns[12][data]=12&columns[12][name]=&columns[12][searchable]=true&columns[12][orderable]=true&columns[12][search][value]=&columns[12][search][regex]=false&columns[13][data]=13&columns[13][name]=&columns[13][searchable]=true&columns[13][orderable]=true&columns[13][search][value]=&columns[13][search][regex]=false&columns[14][data]=14&columns[14][name]=&columns[14][searchable]=true&columns[14][orderable]=false&columns[14][search][value]=&columns[14][search][regex]=false&columns[15][data]=15&columns[15][name]=&columns[15][searchable]=true&columns[15][orderable]=false&columns[15][search][value]=&columns[15][search][regex]=false&columns[16][data]=16&columns[16][name]=&columns[16][searchable]=true&columns[16][orderable]=true&columns[16][search][value]=&columns[16][search][regex]=false&columns[17][data]=17&columns[17][name]=&columns[17][searchable]=true&columns[17][orderable]=true&columns[17][search][value]=&columns[17][search][regex]=false&columns[18][data]=18&columns[18][name]=&columns[18][searchable]=true&columns[18][orderable]=true&columns[18][search][value]=&columns[18][search][regex]=false&columns[19][data]=19&columns[19][name]=&columns[19][searchable]=true&columns[19][orderable]=true&columns[19][search][value]=&columns[19][search][regex]=false&columns[20][data]=20&columns[20][name]=&columns[20][searchable]=true&columns[20][orderable]=true&columns[20][search][value]=&columns[20][search][regex]=false&columns[21][data]=21&columns[21][name]=&columns[21][searchable]=true&columns[21][orderable]=true&columns[21][search][value]=&columns[21][search][regex]=false&columns[22][data]=22&columns[22][name]=&columns[22][searchable]=true&columns[22][orderable]=true&columns[22][search][value]=&columns[22][search][regex]=false&columns[23][data]=23&columns[23][name]=&columns[23][searchable]=true&columns[23][orderable]=true&columns[23][search][value]=&columns[23][search][regex]=false&columns[24][data]=24&columns[24][name]=&columns[24][searchable]=true&columns[24][orderable]=true&columns[24][search][value]=&columns[24][search][regex]=false&columns[25][data]=25&columns[25][name]=&columns[25][searchable]=true&columns[25][orderable]=true&columns[25][search][value]=&columns[25][search][regex]=false&columns[26][data]=26&columns[26][name]=&columns[26][searchable]=true&columns[26][orderable]=true&columns[26][search][value]=&columns[26][search][regex]=false&columns[27][data]=27&columns[27][name]=&columns[27][searchable]=true&columns[27][orderable]=true&columns[27][search][value]=&columns[27][search][regex]=false&columns[28][data]=28&columns[28][name]=&columns[28][searchable]=true&columns[28][orderable]=true&columns[28][search][value]=&columns[28][search][regex]=false&columns[29][data]=29&columns[29][name]=&columns[29][searchable]=true&columns[29][orderable]=true&columns[29][search][value]=&columns[29][search][regex]=false&columns[30][data]=30&columns[30][name]=&columns[30][searchable]=true&columns[30][orderable]=true&columns[30][search][value]=&columns[30][search][regex]=false&columns[31][data]=31&columns[31][name]=&columns[31][searchable]=true&columns[31][orderable]=true&columns[31][search][value]=&columns[31][search][regex]=false&columns[32][data]=32&columns[32][name]=&columns[32][searchable]=true&columns[32][orderable]=true&columns[32][search][value]=&columns[32][search][regex]=false&columns[33][data]=33&columns[33][name]=&columns[33][searchable]=true&columns[33][orderable]=true&columns[33][search][value]=&columns[33][search][regex]=false&columns[34][data]=34&columns[34][name]=&columns[34][searchable]=true&columns[34][orderable]=true&columns[34][search][value]=&columns[34][search][regex]=false&columns[35][data]=35&columns[35][name]=&columns[35][searchable]=true&columns[35][orderable]=true&columns[35][search][value]=&columns[35][search][regex]=false&columns[36][data]=36&columns[36][name]=&columns[36][searchable]=true&columns[36][orderable]=true&columns[36][search][value]=&columns[36][search][regex]=false&columns[37][data]=37&columns[37][name]=&columns[37][searchable]=true&columns[37][orderable]=true&columns[37][search][value]=&columns[37][search][regex]=false&columns[38][data]=38&columns[38][name]=&columns[38][searchable]=true&columns[38][orderable]=true&columns[38][search][value]=&columns[38][search][regex]=false&columns[39][data]=39&columns[39][name]=&columns[39][searchable]=true&columns[39][orderable]=true&columns[39][search][value]=&columns[39][search][regex]=false&columns[40][data]=40&columns[40][name]=&columns[40][searchable]=true&columns[40][orderable]=true&columns[40][search][value]=&columns[40][search][regex]=false&columns[41][data]=41&columns[41][name]=&columns[41][searchable]=true&columns[41][orderable]=true&columns[41][search][value]=&columns[41][search][regex]=false&columns[42][data]=42&columns[42][name]=&columns[42][searchable]=true&columns[42][orderable]=true&columns[42][search][value]=&columns[42][search][regex]=false&columns[43][data]=43&columns[43][name]=&columns[43][searchable]=true&columns[43][orderable]=true&columns[43][search][value]=&columns[43][search][regex]=false&columns[44][data]=44&columns[44][name]=&columns[44][searchable]=true&columns[44][orderable]=true&columns[44][search][value]=&columns[44][search][regex]=false&order[0][column]=37&order[0][dir]=desc&order[1][column]=41&order[1][dir]=asc&order[2][column]=42&order[2][dir]=asc&start=${start}&length=${length}&search[value]=&search[regex]=false&puan_turu=${departmentType}&ust_bs=&alt_bs=&yeniler=1`,
      method: "POST",
      mode: "cors",
    },
  );

  const { recordsFiltered, data } = (await response.json()) as FetchResponse;

  return { data, recordsFiltered };
}

function formatData(data: Array<string>, departmentType: DepartmentType): Department {
  return {
    universityName: data[41].trimEnd(),
    universityType: data[7],
    city: data[6].trimEnd(),
    departmentCode: data[2].substring(data[2].indexOf(">") + 1, data[2].substring(2).indexOf("<")),
    departmentType,
    departmentName: `${data[42].trimEnd()} ${data[5].trimEnd()}`,
    scholarshipType: data[8],
    minimumPlacement: data[44],
    baseScore: data[37],
  };
}

interface FetchResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: Array<Array<string>>;
}

interface Department extends Record<string, string> {
  universityName: string;
  universityType: string;
  city: string;
  departmentCode: string;
  departmentType: DepartmentType;
  departmentName: string;
  scholarshipType: string;
  minimumPlacement: string;
  baseScore: string;
}

type DepartmentType = "dil" | "ea" | "söz" | "say";
