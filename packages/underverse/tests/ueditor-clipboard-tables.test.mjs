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
  assert.equal(cells[0]?.attrs?.backgroundColor, "#ffffff");
  assert.equal(cells[1]?.attrs?.backgroundColor, "#ffffff");
  assert.equal(cells[2]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(cells[1]?.content, [{ type: "paragraph" }]);
  assert.deepEqual(cells[2]?.content, [{ type: "paragraph" }]);
});

test("clipboard HTML table parser preserves Excel class and inline cell styles", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<html><head><style><!--",
        ".xlTitle { background:#1F4E79; color:#FFFFFF; border:.5pt solid windowtext; }",
        ".xlWarn { background-color:#FFF2CC; border-bottom:2px dashed #C00000; }",
        "--></style></head><body>",
        "<!--StartFragment-->",
        "<table><tbody>",
        '<tr style="height:24pt"><td class="xlTitle" colspan="3">Ngày 2</td></tr>',
        '<tr><td class="xlWarn" style="background-color:#FCE4D6;width:80px">Cafe</td><td>B</td><td style="border-color:#00f;border-style:solid;border-width:1px">C</td></tr>',
        "</tbody></table>",
        "<!--EndFragment-->",
        "</body></html>",
      ].join(""),
    }),
  );

  assert.equal(table?.type, "table");

  const titleRow = table.content?.[0];
  const titleCell = titleRow?.content?.[0];
  assert.equal(titleRow?.attrs?.rowHeight, 32);
  assert.equal(titleRow?.content?.length, 1);
  assert.equal(titleCell?.attrs?.colspan, 3);
  assert.equal(titleCell?.attrs?.backgroundColor, "#1F4E79");
  assert.equal(titleCell?.attrs?.borderColor, "windowtext");
  assert.equal(titleCell?.attrs?.borderStyle, "solid");
  assert.equal(titleCell?.attrs?.borderWidth, ".5pt");
  assert.deepEqual(titleCell?.content?.[0]?.content?.[0]?.marks, [{ type: "textStyle", attrs: { color: "#FFFFFF" } }]);

  const bodyCells = table.content?.[1]?.content ?? [];
  assert.equal(bodyCells.length, 3);
  assert.equal(bodyCells[0]?.attrs?.backgroundColor, "#FCE4D6");
  assert.equal(bodyCells[1]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(bodyCells[1]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
  ]);
  assert.deepEqual(bodyCells[0]?.attrs?.colwidth, [80]);
  assert.equal(bodyCells[2]?.attrs?.borderColor, "#00f");
  assert.equal(bodyCells[2]?.attrs?.borderStyle, "solid");
  assert.equal(bodyCells[2]?.attrs?.borderWidth, "1px");
});

test("clipboard HTML table parser preserves UEditor formula metadata", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<table><tbody>",
        '<tr><th data-cell-id="A1" data-number-format="text">Name</th><th data-cell-id="B1" data-number-format="number" data-formula="=SUM(B2:B3)" data-computed-value="30">Total</th></tr>',
        '<tr><td data-cell-id="A2">Alpha</td><td data-cell-id="B2" data-number-format="number" data-computed-value="10">10</td></tr>',
        "</tbody></table>",
      ].join(""),
    }),
  );

  assert.equal(table?.type, "table");
  const headerCells = table.content?.[0]?.content ?? [];
  const bodyCells = table.content?.[1]?.content ?? [];
  assert.equal(headerCells[0]?.attrs?.cellId, "A1");
  assert.equal(headerCells[0]?.attrs?.numberFormat, "text");
  assert.equal(headerCells[1]?.attrs?.cellId, "B1");
  assert.equal(headerCells[1]?.attrs?.numberFormat, "number");
  assert.equal(headerCells[1]?.attrs?.formula, "=SUM(B2:B3)");
  assert.equal(headerCells[1]?.attrs?.computedValue, "30");
  assert.equal(bodyCells[1]?.attrs?.cellId, "B2");
  assert.equal(bodyCells[1]?.attrs?.computedValue, "10");
});

test("clipboard HTML table parser preserves rowspans without adding cells inside covered columns", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<table><tbody>",
        '<tr><td rowspan="2" style="background-color:#DDEBF7">Left</td><td>Top</td></tr>',
        "<tr><td>Bottom</td></tr>",
        "</tbody></table>",
      ].join(""),
    }),
  );

  const firstRowCells = table?.content?.[0]?.content ?? [];
  const secondRowCells = table?.content?.[1]?.content ?? [];
  assert.equal(firstRowCells.length, 2);
  assert.equal(secondRowCells.length, 1);
  assert.equal(firstRowCells[0]?.attrs?.rowspan, 2);
  assert.equal(firstRowCells[0]?.attrs?.backgroundColor, "#DDEBF7");
  assert.equal(firstRowCells[1]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(firstRowCells[1]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
  ]);
  assert.equal(secondRowCells[0]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(secondRowCells[0]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
  ]);
  assert.equal(cellText(secondRowCells[0]), "Bottom");
});

test("clipboard HTML table parser applies white background to normalized filler cells", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<table><tbody>",
        '<tr><td style="background-color:#BDD7EE">A</td><td>B</td><td>C</td></tr>',
        "<tr><td>Only one source cell</td></tr>",
        "</tbody></table>",
      ].join(""),
    }),
  );

  const secondRowCells = table?.content?.[1]?.content ?? [];
  assert.equal(secondRowCells.length, 3);
  assert.equal(secondRowCells[0]?.attrs?.backgroundColor, "#ffffff");
  assert.equal(secondRowCells[1]?.attrs?.backgroundColor, "#ffffff");
  assert.equal(secondRowCells[2]?.attrs?.backgroundColor, "#ffffff");
});

test("clipboard HTML table parser preserves inline label colors inside white cells", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<table><tbody><tr>",
        '<td><span style="background-color:#C6E0B4;color:#008000;font-weight:bold">Check-in/Tham quan</span></td>',
        '<td><span style="background-color:#FFE699">Ăn</span></td>',
        "</tr></tbody></table>",
      ].join(""),
    }),
  );

  const cells = table?.content?.[0]?.content ?? [];
  const firstText = cells[0]?.content?.[0]?.content?.[0];
  const secondText = cells[1]?.content?.[0]?.content?.[0];

  assert.equal(cells[0]?.attrs?.backgroundColor, "#ffffff");
  assert.equal(firstText?.text, "Check-in/Tham quan");
  assert.deepEqual(firstText?.marks, [
    { type: "textStyle", attrs: { color: "#008000" } },
    { type: "highlight", attrs: { color: "#C6E0B4" } },
    { type: "bold" },
  ]);
  assert.equal(cells[1]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(secondText?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
    { type: "highlight", attrs: { color: "#FFE699" } },
  ]);
});

test("clipboard HTML table parser maps spreadsheet default text colors to black", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<html><head><style>",
        ".xlDefault { color:windowtext; background:#FFFFFF; }",
        "</style></head><body>",
        '<table><tbody><tr><td class="xlDefault">WindowText</td><td>Implicit black</td></tr></tbody></table>',
        "</body></html>",
      ].join(""),
    }),
  );

  const cells = table?.content?.[0]?.content ?? [];
  assert.deepEqual(cells[0]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
  ]);
  assert.deepEqual(cells[1]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
  ]);
});

test("clipboard HTML table parser fixes light text when the dark label background is missing", () => {
  const table = getClipboardTableContent(
    clipboardData({
      html: [
        "<html><head><style>",
        ".restTextOnly { color:#FFFFFF; }",
        ".restCell { background:#434343; color:#FFFFFF; }",
        ".restLabel { background:#434343; color:#FFFFFF; }",
        "</style></head><body>",
        "<table><tbody><tr>",
        '<td class="restTextOnly">Nghỉ</td>',
        '<td class="restCell">Nghỉ</td>',
        '<td><span class="restLabel">Nghỉ</span></td>',
        "</tr></tbody></table>",
        "</body></html>",
      ].join(""),
    }),
  );

  const cells = table?.content?.[0]?.content ?? [];
  assert.equal(cells[0]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(cells[0]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#000000" } },
  ]);

  assert.equal(cells[1]?.attrs?.backgroundColor, "#434343");
  assert.deepEqual(cells[1]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#FFFFFF" } },
  ]);

  assert.equal(cells[2]?.attrs?.backgroundColor, "#ffffff");
  assert.deepEqual(cells[2]?.content?.[0]?.content?.[0]?.marks, [
    { type: "textStyle", attrs: { color: "#FFFFFF" } },
    { type: "highlight", attrs: { color: "#434343" } },
  ]);
});
