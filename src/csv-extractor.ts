export default function extractToCSV(objects: Record<string, string | undefined>[]) {
  let result = "";
  const keys = Object.keys(objects[0]);
  result = keys.join(",");

  for (const object of objects) {
    const values = Object.values(object);
    const modifiedValues = values.map((v) => {
      if (v === "" || v == null) {
        return '""';
      }

      let result = String(v);
      if (/^\d+,\d+$/.test(result)) {
        result = result.replace(",", ".");
      }

      if (result.includes('"')) {
        result = result.replaceAll('"', '""');
      }
      if (result.includes(" ")) {
        result = `"${result}"`;
      }

      return result;
    });

    const line = Object.values(modifiedValues).join(",");
    result += `\n${line}`;
  }

  return result;
}
