import assert from "node:assert/strict";
import test, { before } from "node:test";
import { JSDOM } from "jsdom";

import {
  getClipboardTableContent,
  getClipboardTsvTableContent,
} from "../src/components/UEditor/clipboard-tables.ts";

function clipboardData({ html = "", text = "" } = {}) {
  return {
    getData: (type) => {
      if (type === "text/html") return html;
      if (type === "text/plain") return text;
      return "";
    },
  };
}

function cellText(cell) {
  return (cell.content ?? [])
    .map((paragraph) => (paragraph.content ?? []).map((node) => node.text ?? "").join(""))
    .join("\n");
}

before(() => {
  const dom = new JSDOM("");
  globalThis.DOMParser = dom.window.DOMParser;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLTableElement = dom.window.HTMLTableElement;
  globalThis.HTMLTableCellElement = dom.window.HTMLTableCellElement;
  globalThis.Node = dom.window.Node;
});

test("clipboard TSV parser creates schema-valid cells for sparse multiline spreadsheet data", () => {
  const emptyTail = "\t".repeat(32);
  const spreadsheetText = [
    `\tTên minigame\tPose to Hide: Tricky Puzzle${emptyTail}`,
    `\tRef\thttps://play.google.com/store/apps/details?id=com.human.posing.hf&amp;hl=vi${emptyTail}`,
    `\tFigma demo\thttps://www.figma.com/design/maL1GYd2GAGOzkEyDzlQk0/25---Pose-to-Hide--Tricky-Puzzle?node-id=0-1&amp;p=f&amp;t=Afa0lYt0sA4kpf3w-0${emptyTail}`,
    `\tGiới thiệu\tPose to Hide: Tricky Puzzle là một trò chơi vui nhộn, trong đó bạn phải tránh sự chú ý của người canh giữ bằng cách thay đổi dáng pose của nhân vật và đặt vào vị trí thích hợp để hòa vào khung cảnh.${emptyTail}`,
    `\tUSP\t"- Lối chơi vui nhộn và dễ chơi\n- Nhân vật hoạt hình đáng yêu\n- Thử thách trí não hấp dẫn\n- Ghi nhớ và bắt chước để hoàn thành nhiệm vụ"${emptyTail}`,
  ].join("\n");

  const table = getClipboardTsvTableContent(clipboardData({ text: spreadsheetText }));
  assert.equal(table?.type, "table");
  assert.equal(table.content?.length, 5);

  const firstRow = table.content?.[0]?.content ?? [];
  const uspRow = table.content?.[4]?.content ?? [];
  assert.ok(firstRow.length > 30);
  assert.equal(cellText(firstRow[0]), "");
  assert.equal(cellText(firstRow[1]), "Tên minigame");
  assert.equal(cellText(firstRow[2]), "Pose to Hide: Tricky Puzzle");
  assert.equal(cellText(uspRow[1]), "USP");
  assert.equal(uspRow[2]?.content?.length, 4);
  assert.match(cellText(uspRow[2]), /Ghi nhớ và bắt chước/);
  assert.ok(uspRow.slice(3).every((cell) => cell.content?.[0]?.type === "paragraph"));
});

test("clipboard HTML table parser normalizes empty inline cells to paragraph content", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<html><body>",
        "<!--StartFragment-->",
        "<table><tbody><tr><th>Name</th><td><span></span></td><td><br></td></tr></tbody></table>",
        "<!--EndFragment-->",
        "</body></html>",
      ].join(""),
    }),
  );

  assert.equal(table?.type, "table");
  const cells = table.content?.[0]?.content ?? [];
  assert.equal(cells.length, 3);
  assert.equal(cells[0]?.type, "tableHeader");
  assert.equal(cells[1]?.type, "tableCell");
  assert.deepEqual(cells[1]?.content, [{ type: "paragraph" }]);
  assert.deepEqual(cells[2]?.content, [{ type: "paragraph" }]);
});
