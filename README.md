# 瑟瓦納：森林的抉擇

一款能在 GitHub Pages 免費執行的森林探索 RPG。攤開一本巡林筆記，尋找六何線索、展開回合制戰鬥，並在選擇、理由與結果之間寫下自己的旅程。

**版本：0.1.0** · [開始遊戲](https://riverchuang.github.io/savana-rpg/) · [GitHub Repository](https://github.com/RiverChuang/savana-rpg)

> 本版是明確標示的 **Game Fiction 原創環境故事**。原教案及鄒族文化來源尚未提供，因此沒有把待確認內容當作文化事實。請先閱讀 [文化待審清單](docs/CULTURE_REVIEW.md)。

## 可以玩什麼

- 八段完整主線：序章、森林的警告、大公鹿的出現、生命的十字路口、森林的反撲、葛藤葉的智慧、受傷的森林、敬畏的誓言。
- 九個環境支線，完成後逐格點亮共好九宮格。
- 原創 SVG 森林地圖、NPC 對話、已解鎖地點回訪，以及可移動的旅人。
- 六種回合制戰鬥指令：攻擊、防禦、思考、技能、道具、逃跑。
- EXP、最高 Lv.10、能力成長、裝備、補給、三個技能、Boss 與五個成就。
- WHO / WHERE / WHEN / WHAT / WHY / HOW 探索筆記。
- 三次「選擇 → 理由 → 結果」思辨紀錄，與一段玩家自行撰寫的個人環境承諾。
- 自動／手動存檔，包含未結束的戰鬥、對話及抉擇；免費休息、戰敗恢復與遭遇練習避免卡關。

正常戰鬥不需要回答文化問題。大公鹿不是戰鬥敵人；所有敵人都有 `fictional: true`。初次遊玩約 15–30 分鐘。

## 本機執行

安裝 Node.js 22 以上（建議 Node.js 24），於專案根目錄執行：

```sh
node scripts/serve.mjs
```

開啟 <http://127.0.0.1:4173/savana-rpg/>。ES Modules 需要 HTTP 伺服器，請不要直接以 `file://` 開啟 HTML。

本專案沒有 npm 執行期或開發套件依賴，**不需要 npm install**。有 npm 或 pnpm 時，也可用 `npm run dev`／`pnpm dev`。

```sh
node --test                 # 核心規則、完整主線、存檔與例外情境
node scripts/check.mjs      # 所有 JS 語法、模組與內容引用
node scripts/build.mjs      # 產出 dist/
node scripts/serve.mjs --dist
```

需要其他埠時設定環境變數 `PORT`；Windows PowerShell 範例：`$env:PORT = '4174'`。

## 操作與存檔

點擊地圖標記即可互動；鍵盤使用 WASD／方向鍵移動、E 互動，Tab／Enter 可操作按鈕。完成右側主線目標後，「繼續旅程」才會開放。「探索足跡」可回訪已解鎖地點。

先到背包裝備旅人手杖。防禦減傷並回復少量生命；敵人每三回合發動強擊；技能顯示剩餘冷卻回合。「思考」使用你已找到的線索揭露弱點，並非普通攻擊。

進度存在目前瀏覽器的 `localStorage`，鍵為 `savana-rpg:save:v1`；不會上傳，也不會跨裝置或跨網址同步。每次有效操作自動存檔，也可按右上角儲存。私人瀏覽／儲存限制會顯示存檔失敗；損壞或不支援的存檔不會被直接採用。設定選單可讀檔、減少動畫，以及經確認後清除遊戲存檔。

## 技術架構

HTML5、CSS3、原生 JavaScript ES Modules，無框架、後端、玩家帳號、追蹤器、CDN、付費 API 或 OpenAI API。所有插畫由本專案以 SVG／CSS 原創，字型為系統字型。

引擎與故事資料分離；`Game` 接收 `data/index.js` 的內容集合並協調各系統。`QuestSystem` 依通用事件累積進度，完成獎勵只領一次；`BattleSystem` 只處理能力、技能、敵人、物品及線索，不知道故事章節 ID。

```text
src/
  engine/       Game、GameState、內容驗證
  systems/      Save、Battle、Level、Experience、Quest、Dialogue、Map、NPC、
                Inventory、Equipment、Skill、Event、Story、Achievement、
                CultureSource、Clue、Reflection、EnvironmentGrid、Pledge
  scenes/       原創森林地圖呈現
  ui/           畫面、選單、表單、鍵盤與圖示
data/
  stories/      章節與故事設定
  quests/       主線與支線任務
  npcs/         原創 NPC
  locations/    地點、互動標記與座標
  enemies/      原創敵人
  items/        道具與裝備
  skills/       技能
  dialogue/     對話、線索、抉擇
  culture/      來源、授權與審閱狀態
assets/         原創角色、敵人、背景與圖示；audio/ 目前無音效
scripts/        本機伺服器、檢查、建置、正式網址資源驗證
tests/          Node.js 原生測試
docs/           設計、架構、文化、來源、擴充及驗證證據
.github/workflows/deploy-pages.yml
```

更多架構說明見 [ARCHITECTURE](docs/ARCHITECTURE.md)，規則與美術方向見 [GAME_DESIGN](docs/GAME_DESIGN.md)。

## 加入新故事與內容

請閱讀 [擴充指南與資料欄位](docs/EXTENDING.md)。第二個故事可新增 `data/stories/story02.js`、相應的 quests、NPC、locations、dialogue，然後在 **資料註冊處 `data/index.js`** 匯入並合併。不必修改 BattleSystem 或 QuestSystem 核心。

- **主線**：新增 `type: 'main'` 的 quest，以 `prerequisites` 串接前置任務，以 `unlockConditions` 的 chapter 限制解鎖；在章節資料指定 `quest`。
- **支線**：新增 `type: 'side'` 的 quest，地圖加入 `kind: 'side'` 標記，以 `action` 事件匹配目標；`grid` 和 `gridLabel` 指定九宮格位置與文字。
- **NPC**：在 `data/npcs/` 加入角色、地點和 dialogue ID；在對話資料加入 `speaker`、`role`、`lines`，地圖加入對話標記。
- **敵人**：在 `data/enemies/` 加入數值、獎勵、線索弱點和 `fictional: true`，加入原創 SVG；在地圖加入 `kind: 'enemy'`。不得把文化人物或重要象徵作為刷 EXP 敵人。
- **物品**：新增 `consumable` 與 `heal`，或 `equipment` 與 `slot: 'weapon'/'charm'`、能力加成，透過獎勵發放。
- **文化來源**：在 `data/culture/` 建立完整來源紀錄。只有 `status: 'verified'`、`confirmed: true`、`license: 'approved'` 且附來源與審閱者的條目才會通過 CultureSourceSystem。沒有資料就保留 TODO_CULTURE_REVIEW，不得猜測。

## 文化內容與 Game Fiction

真實文化內容必須有來源、授權和審閱證據；目前已確認文化來源為 **0**。遊戲沒有自行創造鄒族語、讀音、祭儀、神話人物或禁忌，沒有把角色行為說成族群性格，也沒有使用「迷信」簡化傳統禁忌。

大公鹿、葛藤葉與敬畏誓言的章名來自使用者規格，原教案脈絡保留待審。現有對話、觀察、敵人與玩家誓言是明確標示的原創設計，不能當作文化教學的史實依據。

來源明細見 [CONTENT_SOURCES](docs/CONTENT_SOURCES.md)，待審項目見 [CULTURE_REVIEW](docs/CULTURE_REVIEW.md)。未授權的第三方教案／媒體不會因程式採 MIT 而獲得授權。

## GitHub Pages

Repository：<https://github.com/RiverChuang/savana-rpg>  
正式遊戲：<https://riverchuang.github.io/savana-rpg/>

`.github/workflows/deploy-pages.yml` 在推送 main 時執行完整測試、靜態檢查、建置及部署，也支援手動 `workflow_dispatch`。PR 只測試與建置，不部署。

採用 GitHub 官方 checkout、setup-node、configure-pages、upload-pages-artifact、deploy-pages actions；Pages 設定為 `build_type: workflow`。只有 `index.html`、`styles.css`、`src/`、`data/`、`assets/` 與 `.nojekyll` 進入部署產物；`.tools/`、Git 資料、測試及工作文件不會發布。

部署設定與故障排除見 [DEPLOYMENT](docs/DEPLOYMENT.md)。正式網址所有執行期資源可用下列指令驗證：

```sh
node scripts/verify-http.mjs https://riverchuang.github.io/savana-rpg/
```

## Development workflow

先讀 [AGENTS.md](AGENTS.md) → 依資料或系統責任修改 → 跑完整測試、check、build → 瀏覽器檢查受影響流程與手機版 → Conventional Commit → 推送 main → 確認 Pages workflow 與正式網址。

[GOALS](GOALS.md)、[BUILD_PLAN](BUILD_PLAN.md)、[TEST_PLAN](TEST_PLAN.md)、[CHANGELOG](CHANGELOG.md) 與 [實際驗證紀錄](docs/VALIDATION.md) 是本 repository 的工程紀錄。

## License / asset attribution

原創程式、文本及 SVG／CSS 圖形採 [MIT License](LICENSE)。沒有第三方插畫、音效、外部字型或 YouTube 素材。文化知識及尚未提供的教案原文不在此授權範圍內。來源／授權不明的素材必須標記 NEEDS_LICENSE_REVIEW 並保持不收錄。
