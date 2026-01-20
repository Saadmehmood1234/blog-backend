import fs from "fs";
import path from "path";

export function renderTemplate(
  templateName: string,
  variables: Record<string, string>,
) {
  let html = fs.readFileSync(
    path.join(__dirname, `../utils/templates/verify-email.html`),
    "utf-8",
  );

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, value);
  });

  return html;
}
